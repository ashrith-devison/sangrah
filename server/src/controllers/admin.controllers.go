package controllers

import (
	"backend/src/config"
	"backend/src/dto"
	"backend/src/services"
	"backend/src/servicesImpl"
	"backend/src/utils"
	"encoding/json"
	"net/http"
)

var adminService services.AdminServiceInterface
var userFileCrudService services.FileCrudServiceInterface

func InitAdminService(cfg *config.Config) {
	userFileCrudService = servicesImpl.NewUserFileCrudService(cfg)
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

// GetAllUsersHandler returns all user details for admin
// @Summary Get all users
// @Description Returns all user details (admin only)
// @Tags admin
// @Produce json
// @Success 200 {array} map[string]interface{} "List of users"
// @Failure 500 {object} utils.APIError "Internal server error"
// @Router /api/v1/admin/users [get]
func GetAllUsersHandler(w http.ResponseWriter, r *http.Request) {
	db, err := utils.ConnectPostgres()
	if err != nil {
		utils.WriteAPIError(w, http.StatusInternalServerError, "Failed to connect to DB", err.Error())
		return
	}
	defer db.Close()
	rows, err := db.Query("SELECT id, username, email, is_admin, created_at FROM users")
	if err != nil {
		utils.WriteAPIError(w, http.StatusInternalServerError, "Failed to fetch users", err.Error())
		return
	}
	defer rows.Close()
	var users []map[string]interface{}
	for rows.Next() {
		var id int
		var username, email string
		var isAdmin bool
		var createdAt string
		if err := rows.Scan(&id, &username, &email, &isAdmin, &createdAt); err != nil {
			utils.WriteAPIError(w, http.StatusInternalServerError, "Failed to scan row", err.Error())
			return
		}
		users = append(users, map[string]interface{}{
			"id":        id,
			"username":  username,
			"email":     email,
			"isAdmin":   isAdmin,
			"createdAt": createdAt,
		})
	}
	utils.WriteAPIResponse(w, http.StatusOK, "Users fetched", users)
}

// GenerateUserTokenHandler allows admin to generate a JWT token for any user
// @Summary Generate JWT for user
// @Description Admin-only: generate JWT token for a user (login as user)
// @Tags admin
// @Accept json
// @Produce json
// @Param payload body dto.AdminGenerateTokenRequest true "Payload with username"
// @Success 200 {object} dto.AdminGenerateTokenResponse "JWT token for user"
// @Failure 400 {object} utils.APIError "Missing username"
// @Failure 404 {object} utils.APIError "User not found"
// @Failure 500 {object} utils.APIError "Internal server error"
// @Router /api/v1/admin/generate-token [post]
func GenerateUserTokenHandler(w http.ResponseWriter, r *http.Request) {
	var payload dto.AdminGenerateTokenRequest
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil || payload.Username == "" {
		utils.WriteAPIError(w, http.StatusBadRequest, "Missing username", "Username required")
		return
	}
	db, err := utils.ConnectPostgres()
	if err != nil {
		utils.WriteAPIError(w, http.StatusInternalServerError, "Failed to connect to DB", err.Error())
		return
	}
	defer db.Close()
	var email string
	var isAdmin bool
	err = db.QueryRow("SELECT email, is_admin FROM users WHERE username = $1", payload.Username).Scan(&email, &isAdmin)
	if err != nil {
		utils.WriteAPIError(w, http.StatusNotFound, "User not found", err.Error())
		return
	}
	token, err := utils.GenerateJWT(payload.Username, email, isAdmin)
	if err != nil {
		utils.WriteAPIError(w, http.StatusInternalServerError, "Failed to generate token", err.Error())
		return
	}
	response := dto.AdminGenerateTokenResponse{Token: token, Username: payload.Username}
	utils.WriteAPIResponse(w, http.StatusOK, "Token generated", response)
}
