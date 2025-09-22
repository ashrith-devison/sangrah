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
	if req.FileId == "" {
		utils.WriteAPIError(w, http.StatusBadRequest, "Missing required fields", "fileId required")
		return
	}
	// Extract JWT token from Authorization header
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		utils.WriteAPIError(w, http.StatusUnauthorized, "Missing Authorization header", "No token provided")
		return
	}
	tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
	claims, err := utils.ValidateJWT(tokenStr)
	if err != nil {
		utils.WriteAPIError(w, http.StatusUnauthorized, "Invalid token", err.Error())
		return
	}
	username, ok := claims["user_id"].(string)
	if !ok || username == "" {
		utils.WriteAPIError(w, http.StatusUnauthorized, "Invalid token claims", "Username not found in token")
		return
	}
	req.Username = username
	// Use service layer for deletion
	userFileCrudService := servicesImpl.NewUserFileCrudService()
	err = userFileCrudService.DeleteFile(req)
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
	if req.Filename == "" {
		utils.WriteAPIError(w, http.StatusBadRequest, "Missing required fields", "filename required")
		return
	}
	// Extract JWT token from Authorization header
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		utils.WriteAPIError(w, http.StatusUnauthorized, "Missing Authorization header", "No token provided")
		return
	}
	tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
	claims, err := utils.ValidateJWT(tokenStr)
	if err != nil {
		utils.WriteAPIError(w, http.StatusUnauthorized, "Invalid token", err.Error())
		return
	}
	username, ok := claims["user_id"].(string)
	if !ok || username == "" {
		utils.WriteAPIError(w, http.StatusUnauthorized, "Invalid token claims", "Username not found in token")
		return
	}
	req.Username = username
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
// @Param renameRequest body dto.FileRenameRequest true "Rename file payload. Required: filename, newName, username."
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
	if req.Filename == "" || req.NewName == "" || req.Username == "" {
		utils.WriteAPIError(w, http.StatusBadRequest, "Missing required fields", "filename, newName, username required")
		return
	}
	// Reject if newName does not have an extension
	if !strings.Contains(req.NewName, ".") || strings.HasPrefix(req.NewName, ".") || strings.HasSuffix(req.NewName, ".") {
		utils.WriteAPIError(w, http.StatusBadRequest, "Invalid new filename", "New filename must include a valid extension")
		return
	}
	db, err := utils.ConnectPostgres()
	if err != nil {
		utils.WriteAPIError(w, http.StatusInternalServerError, "Failed to connect to DB", err.Error())
		return
	}
	defer db.Close()
	fileCrudRepo := repos.FileCrudRepo{Db: db}
	err = fileCrudRepo.RenameFileByFilename(req.Username, req.Filename, req.NewName)
	if err != nil {
		if err == sql.ErrNoRows {
			utils.WriteAPIError(w, http.StatusNotFound, "File not found or not owned", "File not found or not owned by user")
		} else {
			utils.WriteAPIError(w, http.StatusInternalServerError, "Failed to rename file", err.Error())
		}
		return
	}
	utils.WriteAPIResponse(w, http.StatusOK, "File renamed successfully", map[string]interface{}{"filename": req.Filename, "newName": req.NewName})
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
	username, ok := utils.GetUsernameFromContext(r.Context())
	if !ok || username == "" {
		utils.WriteAPIError(w, http.StatusUnauthorized, "Unauthorized", "Username not found in token/context")
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
					return "/"
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
// @Summary Upload one or more files with metadata
// @Description Accepts multiple files and metadata, saves all to database. Supports optional folder path.
// @Tags file
// @Accept multipart/form-data
// @Produce json
// @Param file formData file true "Files to upload (multiple allowed)"
// @Param uploader formData string true "Uploader (username)"
// @Param path formData string false "Folder path (optional, defaults to /home)"
// @Success 201 {object} utils.APIResponse "Files and metadata uploaded"
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

	files := r.MultipartForm.File["file"]
	if len(files) == 0 {
		logger.Error("No files found in request", zap.String("requestID", requestID))
		utils.WriteAPIError(w, http.StatusBadRequest, "No files found in request", "No files uploaded")
		return
	}
	cfg, err := config.LoadConfig()
	if err != nil {
		utils.WriteAPIError(w, http.StatusInternalServerError, "Failed to load config", err.Error())
		return
	}
	username := r.FormValue("username")
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
	var uploadedFiles []map[string]interface{}
	for _, handler := range files {
		file, err := handler.Open()
		if err != nil {
			logger.Error("File open error", zap.String("requestID", requestID), zap.String("filename", handler.Filename), zap.Error(err))
			continue
		}
		defer file.Close()
		if usedMB+float64(handler.Size)/(1024*1024) > float64(cfg.StorageQuotaMB) {
			logger.Error("Storage quota exceeded", zap.String("requestID", requestID), zap.String("filename", handler.Filename))
			uploadedFiles = append(uploadedFiles, map[string]interface{}{
				"filename": handler.Filename,
				"error":    "Storage quota exceeded",
			})
			continue
		}
		filename, mimetype, hash, savedPath, err := servicesImpl.CoreUpload(file, handler.Filename, r)
		if err != nil {
			logger.Error("Failed to upload file", zap.String("requestID", requestID), zap.String("filename", handler.Filename), zap.Error(err))
			uploadedFiles = append(uploadedFiles, map[string]interface{}{
				"filename": handler.Filename,
				"error":    err.Error(),
			})
			continue
		}
		log.Print(uploader)
		err = fileService.StoreFileMetadata(filename, mimetype, hash, savedPath, uploader)
		if err != nil {
			logger.Error("Failed to save file metadata", zap.String("requestID", requestID), zap.Error(err))
			uploadedFiles = append(uploadedFiles, map[string]interface{}{
				"filename": handler.Filename,
				"error":    err.Error(),
			})
			continue
		}
		// Insert corrected filename into user_files
		originalExt := filepath.Ext(handler.Filename)
		correctedFilename := handler.Filename
		if originalExt != "" && filename != hash {
			correctExt := filepath.Ext(filename)
			if correctExt != "" && correctExt != originalExt {
				correctedFilename = strings.TrimSuffix(handler.Filename, originalExt) + correctExt
			}
		}
		userFileCrudService := servicesImpl.NewUserFileCrudService()
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
		err = userFileCrudService.InsertUserFileWithPath(username, hash, correctedFilename, "owner", folderPath)
		if err != nil {
			logger.Error("Failed to insert user_file with path", zap.String("requestID", requestID), zap.Error(err))
			uploadedFiles = append(uploadedFiles, map[string]interface{}{
				"filename": handler.Filename,
				"error":    err.Error(),
			})
			continue
		}
		logger.Info("File and metadata uploaded", zap.String("requestID", requestID), zap.String("filename", handler.Filename), zap.String("sha256", hash), zap.String("uploader", uploader))
		uploadedFiles = append(uploadedFiles, map[string]interface{}{
			"message":  "File and metadata uploaded successfully.",
			"filename": correctedFilename,
			"sha256":   hash,
		})
	}
	utils.WriteAPIResponse(w, http.StatusCreated, "Files and metadata processed", uploadedFiles)
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
// @Summary Upload one or more files
// @Description Upload multiple files. Each file is processed and returns status for each.
// @Tags file
// @Accept multipart/form-data
// @Produce json
// @Param file formData file true "Files to upload (multiple allowed)"
// @Param username formData string true "Uploader (username)"
// @Success 201 {object} utils.APIResponse "Files processed"
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
	files := r.MultipartForm.File["file"]
	if len(files) == 0 {
		logger.Error("No files found in request", zap.String("requestID", requestID), zap.String("remoteAddr", r.RemoteAddr))
		utils.WriteAPIError(w, http.StatusBadRequest, "No files found in request", "No files uploaded")
		return
	}
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
	var uploadedFiles []map[string]interface{}
	for _, handler := range files {
		file, err := handler.Open()
		if err != nil {
			logger.Error("File open error", zap.String("requestID", requestID), zap.String("filename", handler.Filename), zap.Error(err))
			continue
		}
		defer file.Close()
		if usedMB+float64(handler.Size)/(1024*1024) > float64(cfg.StorageQuotaMB) {
			logger.Error("Storage quota exceeded", zap.String("requestID", requestID), zap.String("filename", handler.Filename))
			uploadedFiles = append(uploadedFiles, map[string]interface{}{
				"filename": handler.Filename,
				"error":    "Storage quota exceeded",
			})
			continue
		}
		filename, mimetype, hash, savedPath, err := servicesImpl.CoreUpload(file, handler.Filename, r)
		if err != nil {
			logger.Error("Failed to upload file", zap.String("requestID", requestID), zap.String("filename", handler.Filename), zap.Error(err))
			uploadedFiles = append(uploadedFiles, map[string]interface{}{
				"filename": handler.Filename,
				"error":    err.Error(),
			})
			continue
		}
		isDuplicate, _ := fileService.CheckDuplicate(hash)
		if isDuplicate {
			copyFilename, copyErr := fileCrudRepo.GetNextCopyFilename(username, handler.Filename)
			if copyErr != nil {
				uploadedFiles = append(uploadedFiles, map[string]interface{}{
					"filename": handler.Filename,
					"error":    copyErr.Error(),
				})
				continue
			}
			_ = fileCrudRepo.InsertUserFile(username, hash, copyFilename, "owner")
			uploadedFiles = append(uploadedFiles, map[string]interface{}{
				"message":  "Duplicate file uploaded as copy.",
				"filename": copyFilename,
				"sha256":   hash,
			})
			continue
		}
		fileService.StoreFileMetadata(filename, mimetype, hash, savedPath, "")
		uploadedFiles = append(uploadedFiles, map[string]interface{}{
			"message":  "File uploaded successfully.",
			"filename": filename,
			"sha256":   hash,
		})
	}
	utils.WriteAPIResponse(w, http.StatusCreated, "Files processed", uploadedFiles)
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
