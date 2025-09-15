package controllers

import (
	"backend/src/services"
	servicesImpl "backend/src/servicesImpl"
	"backend/src/utils"
	"crypto/sha256"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
)

var fileService services.FileServiceInterface = &servicesImpl.FileService{}

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
	utils.Info("[DOWNLOAD] Request from %s for file path: %s", r.RemoteAddr, path)
	if path == "" {
		utils.Warn("[DOWNLOAD] Missing file path from %s", r.RemoteAddr)
		utils.WriteAPIError(w, http.StatusBadRequest, "Missing file path", "No path provided")
		return
	}
	cleanPath := filepath.Clean(path)
	if strings.Contains(cleanPath, "..") {
		utils.Warn("[DOWNLOAD] Path traversal attempt from %s: %s", r.RemoteAddr, path)
		utils.WriteAPIError(w, http.StatusBadRequest, "Invalid file path", "Path traversal detected")
		return
	}
	absPath := filepath.Join("storage", cleanPath)
	fileMeta, err := fileService.GetFileByPath(absPath)
	if err != nil {
		utils.Error("[DOWNLOAD] File not found for %s: %s", r.RemoteAddr, absPath)
		utils.WriteAPIError(w, http.StatusNotFound, "File not found", err.Error())
		return
	}
	file, err := os.Open(fileMeta.Path)
	if err != nil {
		utils.Error("[DOWNLOAD] Failed to open file for %s: %s, error: %v", r.RemoteAddr, fileMeta.Path, err)
		utils.WriteAPIError(w, http.StatusInternalServerError, "Failed to open file", err.Error())
		return
	}
	defer file.Close()
	utils.Info("[DOWNLOAD] Serving file to %s: %s", r.RemoteAddr, fileMeta.Path)
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
	utils.Info("[VIEW] Request from %s for file path: %s", r.RemoteAddr, path)
	if path == "" {
		utils.Warn("[VIEW] Missing file path from %s", r.RemoteAddr)
		utils.WriteAPIError(w, http.StatusBadRequest, "Missing file path", "No path provided")
		return
	}
	cleanPath := filepath.Clean(path)
	if strings.Contains(cleanPath, "..") {
		utils.Warn("[VIEW] Path traversal attempt from %s: %s", r.RemoteAddr, path)
		utils.WriteAPIError(w, http.StatusBadRequest, "Invalid file path", "Path traversal detected")
		return
	}
	absPath := filepath.Join("storage", cleanPath)
	fileMeta, err := fileService.GetFileByPath(absPath)
	if err != nil {
		utils.Error("[VIEW] File not found for %s: %s", r.RemoteAddr, absPath)
		utils.WriteAPIError(w, http.StatusNotFound, "File not found", err.Error())
		return
	}
	file, err := os.Open(fileMeta.Path)
	if err != nil {
		utils.Error("[VIEW] Failed to open file for %s: %s, error: %v", r.RemoteAddr, fileMeta.Path, err)
		utils.WriteAPIError(w, http.StatusInternalServerError, "Failed to open file", err.Error())
		return
	}
	defer file.Close()
	utils.Info("[VIEW] Serving file to %s: %s", r.RemoteAddr, fileMeta.Path)
	buffer := make([]byte, 512)
	n, _ := file.Read(buffer)
	contentType := http.DetectContentType(buffer[:n])
	w.Header().Set("Content-Disposition", "inline; filename="+filepath.Base(cleanPath))
	w.Header().Set("Content-Type", contentType)
	file.Seek(0, io.SeekStart)
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
	utils.Info("[UPLOAD] Request from %s", r.RemoteAddr)
	err := r.ParseMultipartForm(10 << 20)
	if err != nil {
		utils.Warn("[UPLOAD] Failed to parse form from %s: %v", r.RemoteAddr, err)
		utils.WriteAPIError(w, http.StatusBadRequest, "Failed to parse form", err.Error())
		return
	}
	file, handler, err := r.FormFile("file")
	if err != nil {
		utils.Warn("[UPLOAD] File not found in request from %s: %v", r.RemoteAddr, err)
		utils.WriteAPIError(w, http.StatusBadRequest, "File not found in request", err.Error())
		return
	}
	defer file.Close()
	buffer := make([]byte, 512)
	_, err = file.Read(buffer)
	if err != nil && err != io.EOF {
		utils.Error("[UPLOAD] Failed to read file from %s: %v", r.RemoteAddr, err)
		utils.WriteAPIError(w, http.StatusInternalServerError, "Failed to read file", err.Error())
		return
	}
	filetype := http.DetectContentType(buffer)
	declaredType := handler.Header.Get("Content-Type")
	if !strings.HasPrefix(filetype, strings.Split(declaredType, "/")[0]) {
		utils.Warn("[UPLOAD] MIME type mismatch from %s: declared=%s, actual=%s", r.RemoteAddr, declaredType, filetype)
		utils.WriteAPIError(w, http.StatusBadRequest, "MIME type mismatch", fmt.Sprintf("Declared: %s, Actual: %s", declaredType, filetype))
		return
	}
	if seeker, ok := file.(io.Seeker); ok {
		seeker.Seek(0, io.SeekStart)
	}
	hash := sha256.New()
	if seeker, ok := file.(io.Seeker); ok {
		seeker.Seek(0, io.SeekStart)
	}
	_, err = io.Copy(hash, file)
	if err != nil {
		utils.Error("[UPLOAD] Failed to hash file from %s: %v", r.RemoteAddr, err)
		utils.WriteAPIError(w, http.StatusInternalServerError, "Failed to hash file", err.Error())
		return
	}
	hashSum := fmt.Sprintf("%x", hash.Sum(nil))
	if seeker, ok := file.(io.Seeker); ok {
		seeker.Seek(0, io.SeekStart)
	}
	isDuplicate, refID := fileService.CheckDuplicate(hashSum)
	if isDuplicate {
		utils.Info("[UPLOAD] Duplicate file detected from %s: sha256=%s", r.RemoteAddr, hashSum)
		resp := map[string]interface{}{
			"message":      "Duplicate file detected. Reference stored.",
			"reference_id": refID,
			"sha256":       hashSum,
		}
		utils.WriteAPIResponse(w, http.StatusOK, "Duplicate file", resp)
		return
	}
	filePath := filepath.Join("storage", hashSum+"_"+handler.Filename)
	out, err := os.Create(filePath)
	if err != nil {
		utils.Error("[UPLOAD] Failed to save file from %s: %v", r.RemoteAddr, err)
		utils.WriteAPIError(w, http.StatusInternalServerError, "Failed to save file", err.Error())
		return
	}
	defer out.Close()
	_, err = io.Copy(out, file)
	if err != nil {
		utils.Error("[UPLOAD] Failed to write file from %s: %v", r.RemoteAddr, err)
		utils.WriteAPIError(w, http.StatusInternalServerError, "Failed to write file", err.Error())
		return
	}
	utils.Info("[UPLOAD] File uploaded successfully from %s: %s", r.RemoteAddr, filePath)
	fileService.StoreFileMetadata(handler.Filename, filetype, hashSum, filePath, r)
	resp := map[string]interface{}{
		"message": "File uploaded successfully.",
		"sha256":  hashSum,
	}
	utils.WriteAPIResponse(w, http.StatusCreated, "File uploaded", resp)
}
