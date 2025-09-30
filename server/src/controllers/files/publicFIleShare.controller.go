package files

import (
	"backend/src/config"
	"backend/src/dto"
	"backend/src/servicesImpl"
	"backend/src/utils"
	"database/sql"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"path/filepath"
)

// PublicAccessHandler serves a file or folder for public access via token
// @Summary Access shared file/folder via public link
// @Description Serves a file or folder for public access using a token
// @Tags file
// @Produce */*
// @Param token query string true "Public share token"
// @Success 200 {file} file "File/Folder served for viewing"
// @Failure 400 {object} utils.APIError "Missing or invalid token"
// @Failure 404 {object} utils.APIError "File/Folder not found"
// @Router /api/v1/file/path/view [get]
func PublicAccessHandler(w http.ResponseWriter, r *http.Request) {
	token := r.URL.Query().Get("token")
	if token == "" {
		utils.WriteAPIError(w, http.StatusBadRequest, "Missing token", "No token provided")
		return
	}
	cfg, err := config.LoadConfig()
	if err != nil {
		utils.WriteAPIError(w, http.StatusInternalServerError, "Failed to load config", err.Error())
		return
	}
	publicShareService := servicesImpl.NewPublicShareService(cfg)
	fileMeta, err := publicShareService.ResolveToken(token)
	if err != nil {
		if err == sql.ErrNoRows {
			utils.WriteAPIError(w, http.StatusNotFound, "File/Folder not found", "Invalid or expired token")
		} else {
			utils.WriteAPIError(w, http.StatusInternalServerError, "Failed to resolve token", err.Error())
		}
		return
	}
	log.Print(fileMeta)
	// Use storage service for file retrieval
	storageService := servicesImpl.NewStorageService("storage")
	file, err := storageService.GetFile(filepath.Base(fileMeta.Path))
	if err != nil {
		log.Printf("[PublicAccessHandler] Failed to open file: %s, error: %v", fileMeta.Path, err)
		utils.WriteAPIError(w, http.StatusInternalServerError, "Failed to open file", err.Error())
		return
	}
	defer file.Close()
	w.Header().Set("Content-Disposition", "inline; filename="+filepath.Base(fileMeta.Path))
	w.Header().Set("Content-Type", fileMeta.MIMEType)
	io.Copy(w, file)
}

// PublicShareHandler shares a file or folder publicly, generating a public link
// @Summary Share file publicly by filename
// @Description Generates a public link for a file, accessible to anyone with the link. Accepts filename and username in request body.
// @Tags file
// @Accept json
// @Produce json
// @Param payload body dto.PublicShareByFilenameRequest true "Public share payload (filename, username)"
// @example { "filename": "string", "username": "string" }
// @Success 200 {object} dto.PublicShareResponse "Public share link generated"
// @Failure 400 {object} utils.APIError "Invalid request"
// @Failure 404 {object} utils.APIError "File not found or not owned"
// @Failure 500 {object} utils.APIError "Internal server error"
// @Router /api/v1/file/public-share [post]
func PublicShareHandler(w http.ResponseWriter, r *http.Request) {
	var payload struct {
		Filename string `json:"filename"`
		Username string `json:"username"`
	}
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		utils.WriteAPIError(w, http.StatusBadRequest, "Invalid request payload", err.Error())
		return
	}
	if payload.Filename == "" || payload.Username == "" {
		utils.WriteAPIError(w, http.StatusBadRequest, "Missing required fields", "filename, username required")
		return
	}
	db, err := utils.ConnectPostgres()
	if err != nil {
		utils.WriteAPIError(w, http.StatusInternalServerError, "Failed to connect to DB", err.Error())
		return
	}
	defer db.Close()
	var fileId string
	err = db.QueryRow("SELECT file_id FROM user_files WHERE username = $1 AND filename = $2 AND permission = 'owner'", payload.Username, payload.Filename).Scan(&fileId)
	if err != nil {
		utils.WriteAPIError(w, http.StatusNotFound, "File not found or not owned", "File not found or not owned by user")
		return
	}
	req := dto.PublicShareRequest{FileId: fileId, Username: payload.Username}
	cfg, err := config.LoadConfig()
	if err != nil {
		utils.WriteAPIError(w, http.StatusInternalServerError, "Failed to load config", err.Error())
		return
	}
	publicShareService := servicesImpl.NewPublicShareService(cfg)
	resp, err := publicShareService.SharePublicly(req)
	if err != nil {
		if err == sql.ErrNoRows {
			utils.WriteAPIError(w, http.StatusNotFound, "File/Folder not found or not owned", "File/Folder not found or not owned by user")
		} else {
			utils.WriteAPIError(w, http.StatusInternalServerError, "Failed to share publicly", err.Error())
		}
		return
	}
	utils.WriteAPIResponse(w, http.StatusOK, "Public share link generated", resp)
}
