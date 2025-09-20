package controllers

import (
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

// PublicShareHandler shares a file or folder publicly, generating a public link
// @Summary Share file or folder publicly
// @Description Generates a public link for a file or folder, accessible to anyone with the link
// @Tags file
// @Accept json
// @Produce json
// @Param shareRequest body dto.PublicShareRequest true "Public share payload (fileId/folderId, isFolder, username)"
// @Success 200 {object} dto.PublicShareResponse "Public share link generated"
// @Failure 400 {object} utils.APIError "Invalid request"
// @Failure 404 {object} utils.APIError "File/Folder not found or not owned"
// @Failure 500 {object} utils.APIError "Internal server error"
// @Router /api/v1/file/public-share [post]
func PublicShareHandler(w http.ResponseWriter, r *http.Request) {
	var req dto.PublicShareRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.WriteAPIError(w, http.StatusBadRequest, "Invalid request payload", err.Error())
		return
	}
	if req.FileId == "" || req.Username == "" {
		utils.WriteAPIError(w, http.StatusBadRequest, "Missing required fields", "fileId/folderId, username required")
		return
	}
	// Call service to generate public token and persist mapping
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
	rows, err := fileCrudRepo.Db.Query(`SELECT id, username, file_id, filename, permission FROM user_files WHERE username = $1 AND permission = 'owner'`, username)
	if err != nil {
		utils.WriteAPIError(w, http.StatusInternalServerError, "Failed to fetch owned files", err.Error())
		return
	}
	defer rows.Close()
	var files []map[string]interface{}
	for rows.Next() {
		var id int
		var uname, fileId, filename, permission string
		if err := rows.Scan(&id, &uname, &fileId, &filename, &permission); err != nil {
			utils.WriteAPIError(w, http.StatusInternalServerError, "Failed to scan row", err.Error())
			return
		}
		files = append(files, map[string]interface{}{
			"id":         id,
			"username":   uname,
			"fileId":     fileId,
			"filename":   filename,
			"permission": permission,
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
// @Description Accepts file and metadata, saves both to database
// @Tags file
// @Accept multipart/form-data
// @Produce json
// @Param file formData file true "File to upload"
// @Param uploader formData string true "Uploader (username)"
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
	db, dbErr := utils.ConnectPostgres()
	if dbErr == nil {
		defer db.Close()
		fileCrudRepo := repos.FileCrudRepo{Db: db}
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
		_ = fileCrudRepo.InsertUserFile(uploader, hash, correctedFilename, "owner")
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

	// Use CoreUpload for modular upload logic (deduplication, metadata, and saving)
	filename, mimetype, hash, savedPath, err := servicesImpl.CoreUpload(file, handler.Filename, r)
	if err != nil {
		logger.Error("Failed to upload file", zap.String("requestID", requestID), zap.String("remoteAddr", r.RemoteAddr), zap.Error(err))
		utils.WriteAPIError(w, http.StatusInternalServerError, "Failed to upload file", err.Error())
		return
	}
	isDuplicate, refID := fileService.CheckDuplicate(hash)
	if isDuplicate {
		logger.Info("Duplicate file detected", zap.String("requestID", requestID), zap.String("remoteAddr", r.RemoteAddr), zap.String("sha256", hash))
		resp := map[string]interface{}{
			"message":      "Duplicate file detected. Reference stored.",
			"reference_id": refID,
			"sha256":       hash,
		}
		utils.WriteAPIResponse(w, http.StatusOK, "Duplicate file", resp)
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
