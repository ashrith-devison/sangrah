package auth

import (
	"backend/src/dto"
	"backend/src/utils"
	"encoding/json"
	"io"
	"net/http"

	"github.com/google/uuid"
	"go.uber.org/zap"
)

// RegisterHandler handles user registration
// @Summary Register a new user
// @Description Registers a new user with username, email, and password
// @Tags auth
// @Accept json
// @Produce json
// @Param registerRequest body dto.RegisterRequest true "User registration payload"
// @Success 201 {object} utils.APIResponse "User registered successfully"
// @Failure 400 {object} utils.APIError "Invalid request payload"
// @Failure 409 {object} utils.APIError "Email already registered"
// @Failure 500 {object} utils.APIError "Registration failed"
// @Router /api/v1/auth/register [post]
func RegisterHandler(w http.ResponseWriter, r *http.Request) {
	requestID := r.Header.Get("X-Request-ID")
	if requestID == "" {
		requestID = uuid.New().String()
	}
	var req dto.RegisterRequest
	decodeErr := json.NewDecoder(r.Body).Decode(&req)
	if decodeErr != nil {
		rawBody, _ := io.ReadAll(r.Body)
		AuthLogger.Error("Invalid request payload", zap.String("requestID", requestID), zap.Error(decodeErr), zap.String("rawBody", string(rawBody)))
		utils.WriteAPIError(w, http.StatusBadRequest, "Invalid request payload", decodeErr.Error())
		return
	}
	resp, err := AuthService.RegisterUser(req, AuthLogger, requestID)
	if err != nil {
		AuthLogger.Error("Registration failed", zap.String("requestID", requestID), zap.Error(err))
		if err.Error() == "email already registered" || err.Error() == "username already taken" {
			utils.WriteAPIError(w, http.StatusConflict, err.Error(), err.Error())
			return
		}
		utils.WriteAPIError(w, http.StatusInternalServerError, "Registration failed", err.Error())
		return
	}
	AuthLogger.Info("User registered successfully", zap.String("requestID", requestID), zap.String("username", req.Username))
	utils.WriteAPIResponse(w, http.StatusCreated, "User registered successfully", resp)
}
