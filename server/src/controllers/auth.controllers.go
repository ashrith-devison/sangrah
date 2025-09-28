package controllers

import (
	"encoding/json"
	"io"
	"net/http"

	"github.com/google/uuid"
	"go.uber.org/zap"

	"backend/src/dto"
	"backend/src/servicesImpl"
	"backend/src/utils"
)

// AuthServiceUnavailable returns true if authService is not initialized
func AuthServiceUnavailable() bool {
	return authService == nil
}

var authService *servicesImpl.AuthService

func InitAuthService() {
	authService = servicesImpl.NewAuthService()
}

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
		logger.Error("Invalid request payload", zap.String("requestID", requestID), zap.Error(decodeErr), zap.String("rawBody", string(rawBody)))
		utils.WriteAPIError(w, http.StatusBadRequest, "Invalid request payload", decodeErr.Error())
		return
	}
	resp, err := authService.RegisterUser(req, logger, requestID)
	if err != nil {
		logger.Error("Registration failed", zap.String("requestID", requestID), zap.Error(err))
		if err.Error() == "email already registered" || err.Error() == "username already taken" {
			utils.WriteAPIError(w, http.StatusConflict, err.Error(), err.Error())
			return
		}
		utils.WriteAPIError(w, http.StatusInternalServerError, "Registration failed", err.Error())
		return
	}
	logger.Info("User registered successfully", zap.String("requestID", requestID), zap.String("username", req.Username))
	utils.WriteAPIResponse(w, http.StatusCreated, "User registered successfully", resp)
}

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
		logger.Error("Invalid login payload", zap.String("requestID", requestID), zap.Error(err))
		utils.WriteAPIError(w, http.StatusBadRequest, "Invalid request payload", err.Error())
		return
	}
	resp, err := authService.LoginUser(req, logger, requestID)
	if err != nil {
		logger.Error("Login failed", zap.String("requestID", requestID), zap.Error(err))
		utils.WriteAPIError(w, http.StatusUnauthorized, "Login failed", err.Error())
		return
	}
	logger.Info("Login successful", zap.String("requestID", requestID), zap.String("email", req.Email))
	utils.WriteAPIResponse(w, http.StatusOK, "Login successful", resp)
}
