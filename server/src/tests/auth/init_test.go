package auth

import (
	"go.uber.org/zap"

	"backend/src/dto"
)

type mockAuthService struct {
	loginFunc    func(req dto.LoginRequest, logger *zap.Logger, requestID string) (dto.LoginResponse, error)
	registerFunc func(req dto.RegisterRequest, logger *zap.Logger, requestID string) (dto.RegisterResponse, error)
}

func (m *mockAuthService) RegisterUser(req dto.RegisterRequest, logger *zap.Logger, requestID string) (dto.RegisterResponse, error) {
	if m.registerFunc != nil {
		return m.registerFunc(req, logger, requestID)
	}
	return dto.RegisterResponse{}, nil
}
func (m *mockAuthService) LoginUser(req dto.LoginRequest, logger *zap.Logger, requestID string) (dto.LoginResponse, error) {
	if m.loginFunc != nil {
		return m.loginFunc(req, logger, requestID)
	}
	return dto.LoginResponse{}, nil
}
