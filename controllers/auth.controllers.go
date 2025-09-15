package controllers

import (
	"encoding/json"
	"net/http"

	"craftiverse.co.in/fileVault/backend/dto"
	"craftiverse.co.in/fileVault/backend/services"
	"craftiverse.co.in/fileVault/backend/utils"
)

// AuthServiceUnavailable returns true if authService is not initialized
func AuthServiceUnavailable() bool {
	return authService == nil
}

var authService *services.AuthService

func InitAuthService() {
	authService = services.NewAuthService()
}

// RegisterHandler godoc
//
// @Summary      Register a new user
// @Description  Registers a new user with username, email, and password
//
// @Tags         auth
// @Accept       json
// @Produce      json
//
// @Param        registerRequest body dto.RegisterRequest true "Register Request"
// @Success      201 {object} dto.RegisterResponse
// @Failure      400 {string} string "Invalid request payload"
// @Failure      500 {string} string "Internal server error"
// @Router       /api/v1/auth/register [post]
func RegisterHandler(w http.ResponseWriter, r *http.Request) {
	var req dto.RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.WriteAPIError(w, http.StatusBadRequest, "Invalid request payload", err.Error())
		return
	}

	resp, err := authService.RegisterUser(req)
	if err != nil {
		utils.WriteAPIError(w, http.StatusInternalServerError, "Registration failed", err.Error())
		return
	}

	utils.WriteAPIResponse(w, http.StatusCreated, "User registered successfully", resp)
}

// LoginHandler godoc
//
// @Summary      Login user
// @Description  Authenticates user and returns JWT token
//
// @Tags         auth
// @Accept       json
// @Produce      json
//
// @Param        loginRequest body dto.LoginRequest true "Login Request"
// @Success      200 {object} dto.LoginResponse
// @Failure      400 {string} string "Invalid request payload"
// @Failure      401 {string} string "Unauthorized"
// @Router       /api/v1/auth/login [post]
func LoginHandler(w http.ResponseWriter, r *http.Request) {
	var req dto.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.WriteAPIError(w, http.StatusBadRequest, "Invalid request payload", err.Error())
		return
	}

	resp, err := authService.LoginUser(req)
	if err != nil {
		utils.WriteAPIError(w, http.StatusUnauthorized, "Login failed", err.Error())
		return
	}

	utils.WriteAPIResponse(w, http.StatusOK, "Login successful", resp)
}
