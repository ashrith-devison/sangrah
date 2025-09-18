package controllers

import (
	"backend/src/dto"
	"backend/src/services"
	"backend/src/servicesImpl"
	"backend/src/utils"
	"encoding/json"
	"net/http"
)

var adminService services.AdminServiceInterface
var userFileCrudService services.FileCrudServiceInterface

func InitAdminService() {
	userFileCrudService = servicesImpl.NewUserFileCrudService()
	adminService = servicesImpl.NewAdminService(nil, fileService, fileShareService, userFileCrudService)
}

// AdminUploadFileHandler allows admins to upload files
// @Summary Admin upload file
// @Description Allows admins to upload files on behalf of users
// @Tags admin
// @Accept multipart/form-data
// @Produce json
// @Param file formData file true "File to upload"
// @Param uploader formData string true "Uploader (username)"
// @Success 200 {object} map[string]interface{}
// @Security BearerAuth
// @Router /api/v1/admin/upload [post]
func AdminUploadFileHandler(w http.ResponseWriter, r *http.Request) {
	err := r.ParseMultipartForm(10 << 20)
	if err != nil {
		utils.WriteAPIError(w, http.StatusBadRequest, "Failed to parse form", err.Error())
		return
	}

	uploader := r.FormValue("uploader")
	if uploader == "" {
		utils.WriteAPIError(w, http.StatusBadRequest, "Missing uploader", "uploader (username) required")
		return
	}

	file, handler, err := r.FormFile("file")
	if err != nil {
		utils.WriteAPIError(w, http.StatusBadRequest, "File not found in request", err.Error())
		return
	}
	defer file.Close()

	// Use CoreUpload for modular upload logic
	filename, mimetype, hash, savedPath, err := servicesImpl.CoreUpload(file, handler.Filename, r)
	if err != nil {
		utils.WriteAPIError(w, http.StatusInternalServerError, "Failed to upload file", err.Error())
		return
	}

	err = adminService.UploadFile(dto.AdminFileUploadRequest{
		Filename: filename,
		Uploader: uploader,
		Hash:     hash,
		Path:     savedPath,
		MIMEType: mimetype,
	})
	if err != nil {
		utils.WriteAPIError(w, http.StatusInternalServerError, "Upload failed", err.Error())
		return
	}
	utils.WriteAPIResponse(w, http.StatusOK, "File uploaded", map[string]interface{}{
		"sha256": hash,
		"path":   savedPath,
	})
}

// AdminShareFileHandler allows admins to share files
// @Summary Admin share file
// @Description Allows admins to share files with users
// @Tags admin
// @Accept json
// @Produce json
// @Param request body dto.AdminShareRequest true "File share details"
// @Success 200 {object} dto.FileShareResponse
// @Security BearerAuth
// @Router /api/v1/admin/share [post]
func AdminShareFileHandler(w http.ResponseWriter, r *http.Request) {
	var req dto.AdminShareRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.WriteAPIError(w, http.StatusBadRequest, "Invalid request", err.Error())
		return
	}
	response, err := adminService.ShareFile(req)
	if err != nil {
		utils.WriteAPIError(w, http.StatusInternalServerError, "Share failed", err.Error())
		return
	}
	utils.WriteAPIResponse(w, http.StatusOK, response.Message, response)
}

// AdminListFilesHandler lists all files with uploader details
// @Summary List all files
// @Description Retrieves all files with uploader details (admin only)
// @Tags admin
// @Produce json
// @Success 200 {object} dto.AdminFileListResponse
// @Security BearerAuth
// @Router /api/v1/admin/files [get]
func AdminListFilesHandler(w http.ResponseWriter, r *http.Request) {
	files, err := adminService.GetAllFiles()
	if err != nil {
		utils.WriteAPIError(w, http.StatusInternalServerError, "Failed to fetch files", err.Error())
		return
	}
	utils.WriteAPIResponse(w, http.StatusOK, "Files fetched", files)
}

// AdminStatsHandler provides usage stats (download counts, etc.)
// @Summary Get usage stats
// @Description Retrieves overall usage statistics (admin only)
// @Tags admin
// @Produce json
// @Success 200 {object} dto.AdminStatsResponse
// @Security BearerAuth
// @Router /api/v1/admin/stats [get]
func AdminStatsHandler(w http.ResponseWriter, r *http.Request) {
	stats, err := adminService.GetUsageStats()
	if err != nil {
		utils.WriteAPIError(w, http.StatusInternalServerError, "Failed to fetch stats", err.Error())
		return
	}
	utils.WriteAPIResponse(w, http.StatusOK, "Stats fetched", stats)
}
