package auth

import (
	"backend/src/config"
	"backend/src/services"
	"backend/src/servicesImpl"

	"go.uber.org/zap"
)

var AuthService services.AuthServiceInterface
var AuthLogger = zap.NewNop() // Replace with actual logger initialization

func AuthServiceUnavailable() bool {
	return AuthService == nil
}

func InitAuthService(cfg *config.Config) {
	AuthService = servicesImpl.NewAuthService(cfg)
}
