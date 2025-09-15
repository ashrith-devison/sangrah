package controllers

import (
	"encoding/json"
	"net/http"

	"github.com/google/uuid"
	"go.uber.org/zap"

	"backend/src/dto"
	"backend/src/services"
	"backend/src/utils"
)

// AuthServiceUnavailable returns true if authService is not initialized
func AuthServiceUnavailable() bool {
	return authService == nil
}

var authService *services.AuthService

var logger *zap.Logger

func InitLogger(l *zap.Logger) {
	logger = l
}

func InitAuthService() {
	authService = services.NewAuthService()
}

func RegisterHandler(w http.ResponseWriter, r *http.Request) {
	requestID := r.Header.Get("X-Request-ID")
	if requestID == "" {
		requestID = uuid.New().String()
	}
	var req dto.RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		logger.Error("Invalid request payload", zap.String("requestID", requestID), zap.Error(err))
		utils.WriteAPIError(w, http.StatusBadRequest, "Invalid request payload", err.Error())
		return
	}
	resp, err := authService.RegisterUser(req, logger, requestID)
	if err != nil {
		logger.Error("Registration failed", zap.String("requestID", requestID), zap.Error(err))
		if err.Error() == "email already registered" {
			utils.WriteAPIError(w, http.StatusConflict, "Email already registered", err.Error())
			return
		}
		utils.WriteAPIError(w, http.StatusInternalServerError, "Registration failed", err.Error())
		return
	}
	logger.Info("User registered successfully", zap.String("requestID", requestID), zap.String("username", req.Username))
	utils.WriteAPIResponse(w, http.StatusCreated, "User registered successfully", resp)
}

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
