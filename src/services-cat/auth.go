package servicescat

import (
	"backend/src/dto"

	"go.uber.org/zap"
)

type AuthServiceInterface interface {
	RegisterUser(req dto.RegisterRequest, logger *zap.Logger, requestID string) (dto.RegisterResponse, error)
	LoginUser(req dto.LoginRequest, logger *zap.Logger, requestID string) (dto.LoginResponse, error)
}
