package auth

import (
	"backend/src/dto"
	"backend/src/utils"
	"encoding/json"
	"net/http"

	"github.com/google/uuid"
	"go.uber.org/zap"
)

// LoginHandler handles user login
// @Summary Login user
// @Description Authenticates user and returns JWT token
// @Tags auth
// @Accept json
// @Produce json
// @Param loginRequest body dto.LoginRequest true "User login payload"
// @Success 200 {object} dto.LoginResponse "Login successful (returns username, email, token, role)"
// @Failure 400 {object} utils.APIError "Invalid login payload"
// @Failure 401 {object} utils.APIError "Login failed"
// @Router /api/v1/auth/login [post]
func LoginHandler(w http.ResponseWriter, r *http.Request) {
	requestID := r.Header.Get("X-Request-ID")
	if requestID == "" {
		requestID = uuid.New().String()
	}
	var req dto.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		AuthLogger.Error("Invalid login payload", zap.String("requestID", requestID), zap.Error(err))
		utils.WriteAPIError(w, http.StatusBadRequest, "Invalid request payload", err.Error())
		return
	}
	// Validate required fields
	if req.Email == "" || req.Password == "" {
		AuthLogger.Error("Missing email or password", zap.String("requestID", requestID))
		utils.WriteAPIError(w, http.StatusBadRequest, "Email and password are required", "")
		return
	}
	resp, err := AuthService.LoginUser(req, AuthLogger, requestID)
	if err != nil {
		AuthLogger.Error("Login failed", zap.String("requestID", requestID), zap.Error(err))
		utils.WriteAPIError(w, http.StatusUnauthorized, "Login failed", err.Error())
		return
	}
	AuthLogger.Info("Login successful", zap.String("requestID", requestID), zap.String("email", req.Email))
	utils.WriteAPIResponse(w, http.StatusOK, "Login successful", resp)
}
