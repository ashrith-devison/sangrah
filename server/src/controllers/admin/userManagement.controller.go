package admin

import (
	"backend/src/dto"
	"backend/src/utils"
	"encoding/json"
	"net/http"

	"go.uber.org/zap"
)

// GetAllUsersHandler returns all user details for admin
// @Summary Get all users
// @Description Returns all user details (admin only)
// @Tags admin
// @Produce json
// @Success 200 {array} map[string]interface{} "List of users"
// @Failure 500 {object} utils.APIError "Internal server error"
// @Router /api/v1/admin/users [get]
func GetAllUsersHandler(w http.ResponseWriter, r *http.Request) {
	users, err := AdminService.GetAllUsers()
	if err != nil {
		AdminLogger.Error("Failed to fetch users", zap.Error(err))
		utils.WriteAPIError(w, http.StatusInternalServerError, "Failed to fetch users", err.Error())
		return
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
	response, err := AdminService.GenerateUserToken(payload.Username)
	if err != nil {
		AdminLogger.Error("Failed to generate token", zap.Error(err))
		utils.WriteAPIError(w, http.StatusInternalServerError, "Failed to generate token", err.Error())
		return
	}
	utils.WriteAPIResponse(w, http.StatusOK, "Token generated", response)
}
