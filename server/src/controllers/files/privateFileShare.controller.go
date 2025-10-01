package files

import (
	"backend/src/dto"
	"backend/src/utils"
	"database/sql"
	"encoding/json"
	"net/http"

	"go.uber.org/zap"
)

// Use shared FileShareService and logger from init.go

// SharedWithMeHandler returns files shared with the user by others
// @Summary List files shared with user
// @Description Returns files where shared_with = username and permission != 'owner'
// @Tags file
// @Produce json
// @Param username query string true "Username to list files shared with"
// @Success 200 {array} dto.SharedFileInfo "List of files shared with user"
// @Failure 400 {object} utils.APIError "Missing username"
// @Failure 500 {object} utils.APIError "Internal server error"
// @Router /api/v1/file/shared-with-me [get]
func SharedWithMeHandler(w http.ResponseWriter, r *http.Request) {
	username := r.URL.Query().Get("username")
	if username == "" {
		utils.WriteAPIError(w, http.StatusBadRequest, "Missing username", "Username required")
		return
	}
	files, err := FileShareService.GetFilesSharedWith(username)
	if err != nil {
		FileLogger.Error("Failed to fetch shared files", zap.Error(err))
		utils.WriteAPIError(w, http.StatusInternalServerError, "Failed to fetch shared files", err.Error())
		return
	}
	utils.WriteAPIResponse(w, http.StatusOK, "Files shared with user fetched", files)
}

// ShareFileHandler handles sharing a file with another user
// @Summary Share a file with another user
// @Description Shares a file with a recipient, granting permission
// @Tags file-share
// @Accept json
// @Produce json
// @Param shareRequest body dto.FileShareRequest true "File share payload"
// @Success 200 {object} dto.FileShareResponse "File shared successfully"
// @Failure 400 {object} dto.FileShareResponse "Invalid request"
// @Failure 500 {object} dto.FileShareResponse "Internal server error"
// @Router /api/v1/file/share [post]
// Injectable DB getter for testability
var GetDBForPrivateFileShare = utils.GetDB

func ShareFileHandler(w http.ResponseWriter, r *http.Request) {
	var req dto.FileShareRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		FileLogger.Error("Invalid share request", zap.Error(err))
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(dto.FileShareResponse{Success: false, Message: "Invalid request"})
		return
	}

	// Only allow sharing with 'read' permission
	if req.Permission != "read" {
		FileLogger.Error("Only read permission can be shared")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(dto.FileShareResponse{Success: false, Message: "Only read permission can be shared"})
		return
	}

	// Check if the user is the owner of the file (by username and filename)
	db := GetDBForPrivateFileShare()
	var owner string
	err := db.QueryRow(`SELECT username FROM user_files WHERE username = $1 AND file_id = $2 AND permission = 'owner'`, req.Owner, req.FileID).Scan(&owner)
	if err == sql.ErrNoRows || owner != req.Owner {
		FileLogger.Error("Only the owner can share the file")
		w.WriteHeader(http.StatusForbidden)
		json.NewEncoder(w).Encode(dto.FileShareResponse{Success: false, Message: "Only the owner can share the file"})
		return
	} else if err != nil {
		FileLogger.Error("Database error", zap.Error(err))
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(dto.FileShareResponse{Success: false, Message: "Database error"})
		return
	}

	// Check if recipient is a registered user using repo
	recipientExists, err := FileCrudService.UserExists(req.Recipient)
	if err != nil {
		FileLogger.Error("Database error while checking recipient", zap.Error(err))
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(dto.FileShareResponse{Success: false, Message: "Database error"})
		return
	}
	if !recipientExists {
		FileLogger.Error("Recipient user does not exist")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(dto.FileShareResponse{Success: false, Message: "Recipient user does not exist"})
		return
	}

	// Check if file is already shared with the recipient using service/repo
	alreadyShared, err := FileShareService.IsFileAlreadyShared(req.FileID, req.Recipient, req.Owner)
	if err != nil {
		FileLogger.Error("Database error while checking existing share", zap.Error(err))
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(dto.FileShareResponse{Success: false, Message: "Database error"})
		return
	}
	if alreadyShared {
		FileLogger.Error("File already shared with this recipient")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(dto.FileShareResponse{Success: false, Message: "File already shared with this recipient"})
		return
	}

	resp, err := FileShareService.ShareFile(req)
	if err != nil {
		FileLogger.Error("Share file failed", zap.Error(err))
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(resp)
		return
	}
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(resp)
}

// ListSharedFilesHandler lists files shared with/by a user
// @Summary List files shared with/by a user
// @Description Lists files shared with or by the specified username
// @Tags file-share
// @Produce json
// @Param username query string true "Username to list shared files for"
// @Success 200 {array} dto.UserFile "List of shared files"
// @Failure 500 {object} dto.FileShareResponse "Internal server error"
// @Router /api/v1/file/shared/list [get]
func ListSharedFilesHandler(w http.ResponseWriter, r *http.Request) {
	username := r.URL.Query().Get("username")
	files, err := FileShareService.ListSharedFiles(username)
	if err != nil {
		FileLogger.Error("List shared files failed", zap.Error(err))
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode([]dto.UserFile{})
		return
	}
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(files)
}

// RevokeFileShareHandler revokes sharing of a file
// @Summary Revoke sharing of a file
// @Description Revokes sharing of a file for a recipient
// @Tags file-share
// @Accept json
// @Produce json
// @Param revokeRequest body dto.FileShareRequest true "Revoke share payload"
// @Success 200 {object} dto.FileShareResponse "File share revoked"
// @Failure 400 {object} dto.FileShareResponse "Invalid request"
// @Failure 500 {object} dto.FileShareResponse "Internal server error"
// @Router /api/v1/file/share/revoke [post]
func RevokeFileShareHandler(w http.ResponseWriter, r *http.Request) {
	var req dto.FileShareRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		FileLogger.Error("Invalid revoke request", zap.Error(err))
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(dto.FileShareResponse{Success: false, Message: "Invalid request"})
		return
	}
	err := FileShareService.RevokeFileShare(req.Owner, req.FileID, req.Recipient)
	if err != nil {
		FileLogger.Error("Revoke file share failed", zap.Error(err))
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(dto.FileShareResponse{Success: false, Message: err.Error()})
		return
	}
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(dto.FileShareResponse{Success: true, Message: "File share revoked"})
}

// SharedByYouHandler returns files the user has shared with others
// @Summary List files shared by the user
// @Description Returns files where shared_by = username and permission != 'owner'
// @Tags file
// @Produce json
// @Param username query string true "Username to list files shared by"
// @Success 200 {array} dto.SharedFileInfo "List of files shared by user"
// @Failure 400 {object} utils.APIError "Missing username"
// @Failure 500 {object} utils.APIError "Internal server error"
// @Router /api/v1/file/shared-by-me [get]
func SharedByYouHandler(w http.ResponseWriter, r *http.Request) {
	username := r.URL.Query().Get("username")
	if username == "" {
		utils.WriteAPIError(w, http.StatusBadRequest, "Missing username", "Username required")
		return
	}
	files, err := FileShareService.GetFilesSharedBy(username)
	if err != nil {
		FileLogger.Error("Failed to fetch shared files", zap.Error(err))
		utils.WriteAPIError(w, http.StatusInternalServerError, "Failed to fetch shared files", err.Error())
		return
	}
	utils.WriteAPIResponse(w, http.StatusOK, "Files shared by user fetched", files)
}
