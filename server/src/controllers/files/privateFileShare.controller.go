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
// @Success 200 {array} dto.UserFile "List of files shared with user"
// @Failure 400 {object} utils.APIError "Missing username"
// @Failure 500 {object} utils.APIError "Internal server error"
// @Router /api/v1/file/shared-with-me [get]
func SharedWithMeHandler(w http.ResponseWriter, r *http.Request) {
	username := r.URL.Query().Get("username")
	if username == "" {
		utils.WriteAPIError(w, http.StatusBadRequest, "Missing username", "Username required")
		return
	}
	db, err := utils.ConnectPostgres()
	if err != nil {
		utils.WriteAPIError(w, http.StatusInternalServerError, "Failed to connect to DB", err.Error())
		return
	}
	defer db.Close()
	rows, err := db.Query(`SELECT id, username, file_id, filename, path, permission, shared_with, shared_by, is_public, download_count, created_at FROM user_files WHERE username = $1 AND shared_by != '' AND permission != 'owner'`, username)
	if err != nil {
		utils.WriteAPIError(w, http.StatusInternalServerError, "Failed to fetch shared files", err.Error())
		return
	}
	defer rows.Close()
	var files []map[string]interface{}
	for rows.Next() {
		var id int
		var uname, fileId, filename, permission, sharedWith, sharedBy string
		var path sql.NullString
		var isPublic bool
		var downloadCount int
		var createdAt string
		if err := rows.Scan(&id, &uname, &fileId, &filename, &path, &permission, &sharedWith, &sharedBy, &isPublic, &downloadCount, &createdAt); err != nil {
			utils.WriteAPIError(w, http.StatusInternalServerError, "Failed to scan row", err.Error())
			return
		}
		files = append(files, map[string]interface{}{
			"id":       id,
			"username": uname,
			"fileId":   fileId,
			"filename": filename,
			"path": func() string {
				if path.Valid {
					return path.String
				}
				return ""
			}(),
			"permission":    permission,
			"sharedWith":    sharedWith,
			"sharedBy":      sharedBy,
			"isPublic":      isPublic,
			"downloadCount": downloadCount,
			"createdAt":     createdAt,
		})
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
func ShareFileHandler(w http.ResponseWriter, r *http.Request) {
	var req dto.FileShareRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		FileLogger.Error("Invalid share request", zap.Error(err))
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(dto.FileShareResponse{Success: false, Message: "Invalid request"})
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
