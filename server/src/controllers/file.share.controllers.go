package controllers

import (
	"backend/src/dto"
	servicesImpl "backend/src/servicesImpl"
	"encoding/json"
	"net/http"

	"backend/src/config"

	"go.uber.org/zap"
)

var fileShareService *servicesImpl.FileShareService

func InitFileShareService(cfg *config.Config) {
	fileShareService = servicesImpl.NewFileShareService(cfg)
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
		logger.Error("Invalid share request", zap.Error(err))
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(dto.FileShareResponse{Success: false, Message: "Invalid request"})
		return
	}
	resp, err := fileShareService.ShareFile(req)
	if err != nil {
		logger.Error("Share file failed", zap.Error(err))
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
	files, err := fileShareService.ListSharedFiles(username)
	if err != nil {
		logger.Error("List shared files failed", zap.Error(err))
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
		logger.Error("Invalid revoke request", zap.Error(err))
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(dto.FileShareResponse{Success: false, Message: "Invalid request"})
		return
	}
	err := fileShareService.RevokeFileShare(req.Owner, req.FileID, req.Recipient)
	if err != nil {
		logger.Error("Revoke file share failed", zap.Error(err))
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(dto.FileShareResponse{Success: false, Message: err.Error()})
		return
	}
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(dto.FileShareResponse{Success: true, Message: "File share revoked"})
}
