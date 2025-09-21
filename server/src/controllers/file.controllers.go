package controllers

import (
	"backend/src/config"
	"backend/src/dto"
	"backend/src/repos"
	"backend/src/services"
	servicesImpl "backend/src/servicesImpl"
	"backend/src/utils"
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"go.uber.org/zap"
)

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
	publicShareService := servicesImpl.NewPublicShareService()
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
	publicShareService := servicesImpl.NewPublicShareService()
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

// DeleteFileHandler deletes a file owned by the user with strict rules
// @Summary Delete a file
// @Description Deletes a file owned by the user. Only the uploader can delete. Deduplication respected.
// @Tags file
// @Accept json
// @Produce json
// @Param deleteRequest body dto.DeleteFileRequest true "Delete file payload (fileId, username)"
// @Success 200 {object} utils.APIResponse "File deleted successfully"
// @Failure 400 {object} utils.APIError "Invalid request"
// @Failure 404 {object} utils.APIError "File not found or not owned"
// @Failure 500 {object} utils.APIError "Internal server error"
// @Router /api/v1/file/delete [post]
func DeleteFileHandler(w http.ResponseWriter, r *http.Request) {
	var req dto.DeleteFileRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.WriteAPIError(w, http.StatusBadRequest, "Invalid request payload", err.Error())
		return
	}
	if req.FileId == "" || req.Username == "" {
		utils.WriteAPIError(w, http.StatusBadRequest, "Missing required fields", "fileId, username required")
		return
	}
	// Use service layer for deletion
	userFileCrudService := servicesImpl.NewUserFileCrudService()
	err := userFileCrudService.DeleteFile(req)
	if err != nil {
		if err == sql.ErrNoRows {
			utils.WriteAPIError(w, http.StatusNotFound, "File not found or not owned", "File not found or not owned by user")
		} else {
			utils.WriteAPIError(w, http.StatusInternalServerError, "Failed to delete file", err.Error())
		}
		return
	}
	utils.WriteAPIResponse(w, http.StatusOK, "File deleted successfully", map[string]interface{}{"fileId": req.FileId})
}

// DeleteFileByFilenameHandler deletes a file for a user by filename (supports copy logic)
// @Summary Delete a file by filename
// @Description Deletes a file for a user by filename. Supports deletion of duplicate files uploaded as copies.
// @Tags file
// @Accept json
// @Produce json
// @Param deleteRequest body dto.DeleteFileByFilenameRequest true "Delete file by filename payload (filename, username)"
// @Success 200 {object} utils.APIResponse "File deleted successfully"
// @Failure 400 {object} utils.APIError "Invalid request"
// @Failure 404 {object} utils.APIError "File not found or not owned"
// @Failure 500 {object} utils.APIError "Internal server error"
// @Router /api/v1/file/delete-filename [post]
func DeleteFileByFilenameHandler(w http.ResponseWriter, r *http.Request) {
	var req dto.DeleteFileByFilenameRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.WriteAPIError(w, http.StatusBadRequest, "Invalid request payload", err.Error())
		return
	}
	if req.Filename == "" || req.Username == "" {
		utils.WriteAPIError(w, http.StatusBadRequest, "Missing required fields", "filename, username required")
		return
	}
	db, err := utils.ConnectPostgres()
	if err != nil {
		utils.WriteAPIError(w, http.StatusInternalServerError, "Failed to connect to DB", err.Error())
		return
	}
	defer db.Close()
	fileCrudRepo := repos.FileCrudRepo{Db: db}
	err = fileCrudRepo.DeleteFileByFilename(req.Username, req.Filename)
	if err != nil {
		if err == sql.ErrNoRows {
			utils.WriteAPIError(w, http.StatusNotFound, "File not found or not owned", "File not found or not owned by user")
		} else {
			utils.WriteAPIError(w, http.StatusInternalServerError, "Failed to delete file", err.Error())
		}
		return
	}
	utils.WriteAPIResponse(w, http.StatusOK, "File deleted successfully", map[string]interface{}{"filename": req.Filename})
}

// RenameFileHandler renames a file owned by the user
// @Summary Rename a file
// @Description Renames a file owned by the user
// @Tags file
// @Accept json
// @Produce json
// @Param renameRequest body dto.FileRenameRequest true "Rename file payload"
// @Success 200 {object} utils.APIResponse "File renamed successfully"
// @Failure 400 {object} utils.APIError "Invalid request"
// @Failure 404 {object} utils.APIError "File not found or not owned"
// @Failure 500 {object} utils.APIError "Internal server error"
// @Router /api/v1/file/rename [post]
func RenameFileHandler(w http.ResponseWriter, r *http.Request) {
	var req dto.FileRenameRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.WriteAPIError(w, http.StatusBadRequest, "Invalid request payload", err.Error())
		return
	}
	if req.FileID == "" || req.NewName == "" || req.Username == "" {
		utils.WriteAPIError(w, http.StatusBadRequest, "Missing required fields", "fileId, newName, username required")
		return
	}
	db, err := utils.ConnectPostgres()
	if err != nil {
		utils.WriteAPIError(w, http.StatusInternalServerError, "Failed to connect to DB", err.Error())
		return
	}
	defer db.Close()
	fileCrudRepo := repos.FileCrudRepo{Db: db}
	err = fileCrudRepo.RenameFile(req.FileID, req.NewName, req.Username)
	if err != nil {
		if err == sql.ErrNoRows {
			utils.WriteAPIError(w, http.StatusNotFound, "File not found or not owned", "File not found or not owned by user")
		} else {
			utils.WriteAPIError(w, http.StatusInternalServerError, "Failed to rename file", err.Error())
		}
		return
	}
	utils.WriteAPIResponse(w, http.StatusOK, "File renamed successfully", map[string]interface{}{"fileId": req.FileID, "newName": req.NewName})
}

// OwnedFilesHandler returns files owned by the user (permission = 'owner')
// @Summary List files owned by user
// @Description Returns files where the user has 'owner' permission
// @Tags file
// @Produce json
// @Param username query string true "Username to list owned files for"
// @Success 200 {array} dto.UserFile "List of owned files"
// @Failure 400 {object} utils.APIError "Missing username"
// @Failure 500 {object} utils.APIError "Internal server error"
// @Router /api/v1/file/owned [get]
func OwnedFilesHandler(w http.ResponseWriter, r *http.Request) {
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
	fileCrudRepo := repos.FileCrudRepo{Db: db}
	rows, err := fileCrudRepo.Db.Query(`SELECT id, username, file_id, filename, permission, path FROM user_files WHERE username = $1 AND permission = 'owner'`, username)
	if err != nil {
		utils.WriteAPIError(w, http.StatusInternalServerError, "Failed to fetch owned files", err.Error())
		return
	}
	defer rows.Close()
	var files []map[string]interface{}
	for rows.Next() {
		var id int
		var uname, fileId, filename, permission string
		var path sql.NullString
		if err := rows.Scan(&id, &uname, &fileId, &filename, &permission, &path); err != nil {
			utils.WriteAPIError(w, http.StatusInternalServerError, "Failed to scan row", err.Error())
			return
		}
		files = append(files, map[string]interface{}{
			"id":         id,
			"username":   uname,
			"fileId":     fileId,
			"filename":   filename,
			"permission": permission,
			"path": func() string {
				if path.Valid {
					return path.String
				} else {
					return "/home"
				}
			}(),
		})
	}
	utils.WriteAPIResponse(w, http.StatusOK, "Owned files fetched", files)
}

// AnalyticsHandler serves analytics about file storage and uploads
// @Summary File storage analytics
// @Description Returns analytics: user count, file count, deduplication savings, etc.
// @Tags analytics
// @Produce json
// @Success 200 {object} utils.APIResponse "Analytics data"
// @Router /api/v1/file/storage/analytics [get]
func AnalyticsHandler(w http.ResponseWriter, r *http.Request) {
	db, err := utils.ConnectPostgres()
	if err != nil {
		utils.WriteAPIError(w, http.StatusInternalServerError, "Failed to connect to DB", err.Error())
		return
	}
	defer db.Close()
	fileCrudRepo := repos.FileCrudRepo{Db: db}
	fileRepo := repos.NewFileRepo(db)
	logicalFiles, uniqueUploaders, err := fileCrudRepo.GetLogicalFilesAndUniqueUploaders()
	if err != nil {
		utils.WriteAPIError(w, http.StatusInternalServerError, "Failed to fetch logical files and uploaders", err.Error())
		return
	}
	totalStorageBytes, spaceSavedBytes, err := fileRepo.GetDeduplicationStats()
	if err != nil {
		utils.WriteAPIError(w, http.StatusInternalServerError, "Failed to fetch deduplication stats", err.Error())
		return
	}
	// Physical file count and size from storage dir
	storageDir := "storage"
	physicalFiles := 0
	physicalSize := float64(0)
	entries, err := os.ReadDir(storageDir)
	if err == nil {
		for _, entry := range entries {
			if !entry.IsDir() {
				physicalFiles++
				info, err := entry.Info()
				if err == nil {
					physicalSize += float64(info.Size())
				}
			}
		}
	}
	analytics := map[string]interface{}{
		"unique_uploaders":                     uniqueUploaders,
		"logical_files":                        logicalFiles,
		"physical_files":                       physicalFiles,
		"total_storage_bytes":                  totalStorageBytes,
		"total_physical_space_occupied(in Mb)": physicalSize / (1024 * 1024),
		"space_saved_bytes":                    spaceSavedBytes,
		"space_saved_mb":                       spaceSavedBytes / (1024 * 1024),
	}
	utils.WriteAPIResponse(w, http.StatusOK, "Storage analytics", analytics)
}

var fileService services.FileServiceInterface = &servicesImpl.FileService{}

// FileMetaUploadHandler handles file upload with metadata
// @Summary Upload file with metadata
// @Description Accepts file and metadata, saves both to database. Supports optional folder path.
// @Tags file
// @Accept multipart/form-data
// @Produce json
// @Param file formData file true "File to upload"
// @Param uploader formData string true "Uploader (username)"
// @Param path formData string false "Folder path (optional, defaults to /home)"
// @Success 201 {object} utils.APIResponse "File and metadata uploaded"
// @Failure 400 {object} utils.APIError "Bad request"
// @Failure 500 {object} utils.APIError "Internal server error"
// @Router /api/v1/file/upload-meta [post]
func FileMetaUploadHandler(w http.ResponseWriter, r *http.Request) {
	requestID := r.Header.Get("X-Request-ID")
	if requestID == "" {
		requestID = "filemeta-" + fmt.Sprintf("%d", os.Getpid())
	}
	logger.Info("[UPLOAD-META] Request", zap.String("requestID", requestID), zap.String("remoteAddr", r.RemoteAddr))
	err := r.ParseMultipartForm(10 << 20)
	if err != nil {
		logger.Error("Failed to parse form", zap.String("requestID", requestID), zap.Error(err))
		utils.WriteAPIError(w, http.StatusBadRequest, "Failed to parse form", err.Error())
		return
	}

	uploader := r.FormValue("uploader")
	if uploader == "" {
		logger.Error("Missing uploader", zap.String("requestID", requestID))
		utils.WriteAPIError(w, http.StatusBadRequest, "Missing uploader", "uploader (username) required")
		return
	}

	file, handler, err := r.FormFile("file")
	if err != nil {
		logger.Error("File not found in request", zap.String("requestID", requestID), zap.Error(err))
		utils.WriteAPIError(w, http.StatusBadRequest, "File not found in request", err.Error())
		return
	}
	defer file.Close()

	// --- STORAGE QUOTA ENFORCEMENT ---
	cfg, err := config.LoadConfig()
	if err != nil {
		utils.WriteAPIError(w, http.StatusInternalServerError, "Failed to load config", err.Error())
		return
	}
	username := r.FormValue("username")
	// Use uploader for quota check if username is missing
	if username == "" {
		username = uploader
	}
	if username == "" {
		logger.Error("Missing username", zap.String("requestID", requestID))
		utils.WriteAPIError(w, http.StatusBadRequest, "Missing username", "Username required for quota check")
		return
	}
	db, err := utils.ConnectPostgres()
	if err != nil {
		utils.WriteAPIError(w, http.StatusInternalServerError, "Failed to connect to DB", err.Error())
		return
	}
	defer db.Close()
	fileCrudRepo := repos.FileCrudRepo{Db: db}
	usedMB, err := fileCrudRepo.GetUserStorageUsedMB(username)
	if err != nil {
		utils.WriteAPIError(w, http.StatusInternalServerError, "Failed to get storage usage", err.Error())
		return
	}
	if usedMB+float64(handler.Size)/(1024*1024) > float64(cfg.StorageQuotaMB) {
		utils.WriteAPIError(w, http.StatusForbidden, "Storage quota exceeded", "User quota: "+fmt.Sprintf("%.2f", float64(cfg.StorageQuotaMB))+" MB, Used: "+fmt.Sprintf("%.2f", usedMB+float64(handler.Size)/(1024*1024))+" MB")
		return
	}
	// --- END STORAGE QUOTA ENFORCEMENT ---

	// Use CoreUpload for modular upload logic (deduplication, metadata, and saving)
	filename, mimetype, hash, savedPath, err := servicesImpl.CoreUpload(file, handler.Filename, r)
	if err != nil {
		logger.Error("Failed to upload file", zap.String("requestID", requestID), zap.Error(err))
		utils.WriteAPIError(w, http.StatusInternalServerError, "Failed to upload file", err.Error())
		return
	}
	log.Print(uploader)
	err = fileService.StoreFileMetadata(filename, mimetype, hash, savedPath, uploader)
	if err != nil {
		logger.Error("Failed to save file metadata", zap.String("requestID", requestID), zap.Error(err))
		if err == sql.ErrNoRows {
			utils.WriteAPIError(w, http.StatusBadRequest, "Uploader does not exist", "Uploader must be a registered user")
		} else {
			utils.WriteAPIError(w, http.StatusInternalServerError, "Failed to save file metadata", err.Error())
		}
		return
	}
	// Insert corrected filename into user_files
	// Correct the extension based on MIME
	originalExt := filepath.Ext(handler.Filename)
	correctedFilename := handler.Filename
	if originalExt != "" && filename != hash {
		// filename is hashSum + ext, so ext is the correct extension
		correctExt := filepath.Ext(filename)
		if correctExt != "" && correctExt != originalExt {
			correctedFilename = strings.TrimSuffix(handler.Filename, originalExt) + correctExt
		}
	}
	// Use service for DB interaction
	userFileCrudService := servicesImpl.NewUserFileCrudService()
	// Check if user already has this file_id
	db, dbErr := utils.ConnectPostgres()
	var dummy int
	if dbErr == nil {
		defer db.Close()
		row := db.QueryRow("SELECT 1 FROM user_files WHERE username = $1 AND file_id = $2", username, hash)
		if row.Scan(&dummy) == nil {
			correctedFilename, _ = userFileCrudService.Repo.GetNextCopyFilename(username, handler.Filename)
		}
	}
	folderPath := r.FormValue("path")
	if folderPath == "" {
		folderPath = "/home"
	}
	// Add InsertUserFileWithPath to service/repo
	err = userFileCrudService.InsertUserFileWithPath(username, hash, correctedFilename, "owner", folderPath)
	if err != nil {
		logger.Error("Failed to insert user_file with path", zap.String("requestID", requestID), zap.Error(err))
	}
	logger.Info("File and metadata uploaded", zap.String("requestID", requestID), zap.String("filename", handler.Filename), zap.String("sha256", hash), zap.String("uploader", uploader))

	resp := map[string]interface{}{
		"message": "File and metadata uploaded successfully.",
		"sha256":  hash,
	}
	utils.WriteAPIResponse(w, http.StatusCreated, "File and metadata uploaded", resp)
}

// @Summary Get file by path
// @Description Serves a file from storage by its path
// @Tags file
// @Produce application/octet-stream
// @Param path query string true "File path relative to storage/"
// @Success 200 {file} file "File served successfully"
// @Failure 400 {object} utils.APIError "Bad request"
// @Failure 404 {object} utils.APIError "File not found"
// @Router /api/v1/file/path/download [get]
func ServeFileByPathHandler(w http.ResponseWriter, r *http.Request) {
	path := r.URL.Query().Get("path")
	requestID := r.Header.Get("X-Request-ID")
	if requestID == "" {
		requestID = "file-download-" + fmt.Sprintf("%d", os.Getpid())
	}
	logger.Info("[DOWNLOAD] Request", zap.String("requestID", requestID), zap.String("remoteAddr", r.RemoteAddr), zap.String("path", path))
	if path == "" {
		logger.Error("Missing file path", zap.String("requestID", requestID), zap.String("remoteAddr", r.RemoteAddr))
		utils.WriteAPIError(w, http.StatusBadRequest, "Missing file path", "No path provided")
		return
	}
	cleanPath := filepath.Clean(path)
	if strings.Contains(cleanPath, "..") {
		logger.Error("Path traversal attempt", zap.String("requestID", requestID), zap.String("remoteAddr", r.RemoteAddr), zap.String("path", path))
		utils.WriteAPIError(w, http.StatusBadRequest, "Invalid file path", "Path traversal detected")
		return
	}
	absPath := filepath.Join("storage", cleanPath)
	fileMeta, err := fileService.GetFileByPath(absPath)
	if err != nil {
		logger.Error("File not found", zap.String("requestID", requestID), zap.String("remoteAddr", r.RemoteAddr), zap.String("path", absPath), zap.Error(err))
		utils.WriteAPIError(w, http.StatusNotFound, "File not found", err.Error())
		return
	}
	file, err := os.Open(fileMeta.Path)
	if err != nil {
		logger.Error("Failed to open file", zap.String("requestID", requestID), zap.String("remoteAddr", r.RemoteAddr), zap.String("path", fileMeta.Path), zap.Error(err))
		utils.WriteAPIError(w, http.StatusInternalServerError, "Failed to open file", err.Error())
		return
	}
	defer file.Close()
	logger.Info("Serving file", zap.String("requestID", requestID), zap.String("remoteAddr", r.RemoteAddr), zap.String("path", fileMeta.Path))
	w.Header().Set("Content-Disposition", "attachment; filename="+filepath.Base(cleanPath))
	w.Header().Set("Content-Type", "application/octet-stream")
	io.Copy(w, file)
}

// ServeFileByPathViewHandler serves a file for browser viewing (inline)
// @Summary View file by path
// @Description Serves a file from storage by its path for browser viewing
// @Tags file
// @Produce */*
// @Param path query string true "File path relative to storage/"
// @Success 200 {file} file "File served for viewing"
// @Failure 400 {object} utils.APIError "Bad request"
// @Failure 404 {object} utils.APIError "File not found"
// @Router /api/v1/file/path/view [get]
func ServeFileByPathViewHandler(w http.ResponseWriter, r *http.Request) {
	path := r.URL.Query().Get("path")
	requestID := r.Header.Get("X-Request-ID")
	if requestID == "" {
		requestID = "file-view-" + fmt.Sprintf("%d", os.Getpid())
	}
	logger.Info("[VIEW] Request", zap.String("requestID", requestID), zap.String("remoteAddr", r.RemoteAddr), zap.String("path", path))
	if path == "" {
		logger.Error("Missing file path", zap.String("requestID", requestID), zap.String("remoteAddr", r.RemoteAddr))
		utils.WriteAPIError(w, http.StatusBadRequest, "Missing file path", "No path provided")
		return
	}

	cleanPath := filepath.Clean(path)
	if strings.Contains(cleanPath, "..") {
		logger.Error("Path traversal attempt", zap.String("requestID", requestID), zap.String("remoteAddr", r.RemoteAddr), zap.String("path", path))
		utils.WriteAPIError(w, http.StatusBadRequest, "Invalid file path", "Path traversal detected")
		return
	}
	absPath := filepath.Join("storage", cleanPath)
	fileMeta, err := fileService.GetFileByPath(absPath)
	if err != nil {
		logger.Error("File not found", zap.String("requestID", requestID), zap.String("remoteAddr", r.RemoteAddr), zap.String("path", absPath), zap.Error(err))
		utils.WriteAPIError(w, http.StatusNotFound, "File not found", err.Error())
		return
	}
	// Use StorageService for file retrieval
	storageService := servicesImpl.NewStorageService("storage")
	file, err := storageService.GetFile(filepath.Base(fileMeta.Path))
	if err != nil {
		logger.Error("Failed to open file", zap.String("requestID", requestID), zap.String("remoteAddr", r.RemoteAddr), zap.String("path", fileMeta.Path), zap.Error(err))
		utils.WriteAPIError(w, http.StatusInternalServerError, "Failed to open file", err.Error())
		return
	}
	defer file.Close()
	logger.Info("Serving file", zap.String("requestID", requestID), zap.String("remoteAddr", r.RemoteAddr), zap.String("path", fileMeta.Path))
	buffer := make([]byte, 512)
	n, _ := file.Read(buffer)
	contentType := http.DetectContentType(buffer[:n])
	w.Header().Set("Content-Disposition", "inline; filename="+filepath.Base(cleanPath))
	w.Header().Set("Content-Type", contentType)
	if seeker, ok := file.(io.Seeker); ok {
		seeker.Seek(0, io.SeekStart)
	}
	io.Copy(w, file)
}

// FileUploadHandler handles file uploads with MIME type validation and deduplication
// @Summary Upload a file
// @Description Uploads a file, validates MIME type, and deduplicates using SHA-256 hash. Returns reference if duplicate.
// @Tags file
// @Accept multipart/form-data
// @Produce json
// @Param file formData file true "File to upload"
// @Success 201 {object} utils.APIResponse "File uploaded successfully"
// @Success 200 {object} utils.APIResponse "Duplicate file detected"
// @Failure 400 {object} utils.APIError "Bad request or MIME type mismatch"
// @Failure 500 {object} utils.APIError "Internal server error"
// @Router /api/v1/file/upload [post]
func FileUploadHandler(w http.ResponseWriter, r *http.Request) {
	requestID := r.Header.Get("X-Request-ID")
	if requestID == "" {
		requestID = "file-upload-" + fmt.Sprintf("%d", os.Getpid())
	}
	logger.Info("[UPLOAD] Request", zap.String("requestID", requestID), zap.String("remoteAddr", r.RemoteAddr))
	err := r.ParseMultipartForm(10 << 20)
	if err != nil {
		logger.Error("Failed to parse form", zap.String("requestID", requestID), zap.String("remoteAddr", r.RemoteAddr), zap.Error(err))
		utils.WriteAPIError(w, http.StatusBadRequest, "Failed to parse form", err.Error())
		return
	}
	file, handler, err := r.FormFile("file")
	if err != nil {
		logger.Error("File not found in request", zap.String("requestID", requestID), zap.String("remoteAddr", r.RemoteAddr), zap.Error(err))
		utils.WriteAPIError(w, http.StatusBadRequest, "File not found in request", err.Error())
		return
	}
	defer file.Close()

	// --- STORAGE QUOTA ENFORCEMENT ---
	cfg, err := config.LoadConfig()
	if err != nil {
		utils.WriteAPIError(w, http.StatusInternalServerError, "Failed to load config", err.Error())
		return
	}
	username := r.FormValue("username")
	if username == "" {
		utils.WriteAPIError(w, http.StatusBadRequest, "Missing username", "Username required for quota check")
		return
	}
	db, err := utils.ConnectPostgres()
	if err != nil {
		utils.WriteAPIError(w, http.StatusInternalServerError, "Failed to connect to DB", err.Error())
		return
	}
	defer db.Close()
	fileCrudRepo := repos.FileCrudRepo{Db: db}
	usedMB, err := fileCrudRepo.GetUserStorageUsedMB(username)
	if err != nil {
		utils.WriteAPIError(w, http.StatusInternalServerError, "Failed to get storage usage", err.Error())
		return
	}
	if usedMB+float64(handler.Size)/(1024*1024) > float64(cfg.StorageQuotaMB) {
		utils.WriteAPIError(w, http.StatusForbidden, "Storage quota exceeded", "User quota: "+fmt.Sprintf("%.2f", float64(cfg.StorageQuotaMB))+" MB, Used: "+fmt.Sprintf("%.2f", usedMB+float64(handler.Size)/(1024*1024))+" MB")
		return
	}
	// --- END STORAGE QUOTA ENFORCEMENT ---

	// Use CoreUpload for modular upload logic (deduplication, metadata, and saving)
	filename, mimetype, hash, savedPath, err := servicesImpl.CoreUpload(file, handler.Filename, r)
	if err != nil {
		logger.Error("Failed to upload file", zap.String("requestID", requestID), zap.String("remoteAddr", r.RemoteAddr), zap.Error(err))
		utils.WriteAPIError(w, http.StatusInternalServerError, "Failed to upload file", err.Error())
		return
	}
	isDuplicate, _ := fileService.CheckDuplicate(hash)
	if isDuplicate {
		logger.Info("Duplicate file detected", zap.String("requestID", requestID), zap.String("remoteAddr", r.RemoteAddr), zap.String("sha256", hash))
		// Generate next copy filename for this user
		copyFilename, copyErr := fileCrudRepo.GetNextCopyFilename(username, handler.Filename)
		if copyErr != nil {
			utils.WriteAPIError(w, http.StatusInternalServerError, "Failed to generate copy filename", copyErr.Error())
			return
		}
		_ = fileCrudRepo.InsertUserFile(username, hash, copyFilename, "owner")
		resp := map[string]interface{}{
			"message":  "Duplicate file uploaded as copy.",
			"filename": copyFilename,
			"sha256":   hash,
		}
		utils.WriteAPIResponse(w, http.StatusCreated, "Duplicate file uploaded as copy", resp)
		return
	}
	fileService.StoreFileMetadata(filename, mimetype, hash, savedPath, "")
	logger.Info("File uploaded successfully", zap.String("requestID", requestID), zap.String("remoteAddr", r.RemoteAddr), zap.String("filePath", savedPath))
	resp := map[string]interface{}{
		"message": "File uploaded successfully.",
		"sha256":  hash,
	}
	utils.WriteAPIResponse(w, http.StatusCreated, "File uploaded", resp)
}

// GetUserStorageQuotaHandler returns the storage quota used by a user
// @Summary Get user storage quota used
// @Description Returns the storage quota used by the user in MB
// @Tags file
// @Produce json
// @Param username query string true "Username to check storage quota for"
// @Success 200 {object} map[string]interface{} "Storage quota used"
// @Failure 400 {object} utils.APIError "Missing username"
// @Failure 500 {object} utils.APIError "Internal server error"
// @Router /api/v1/file/storage-quota [get]
func GetUserStorageQuotaHandler(w http.ResponseWriter, r *http.Request) {
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
	fileCrudRepo := repos.FileCrudRepo{Db: db}
	usedMB, err := fileCrudRepo.GetUserStorageUsedMB(username)
	if err != nil {
		utils.WriteAPIError(w, http.StatusInternalServerError, "Failed to get storage usage", err.Error())
		return
	}
	utils.WriteAPIResponse(w, http.StatusOK, "User storage quota fetched", map[string]interface{}{
		"username": username,
		"usedMB":   usedMB,
	})
}
