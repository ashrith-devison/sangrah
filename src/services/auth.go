package services

import (
	"errors"

	"go.uber.org/zap"

	"backend/src/dto"
	"backend/src/repos"
	servicescat "backend/src/services-cat"
	"backend/src/utils"
)

// Compile-time assertion: AuthService implements AuthServiceInterface
var _ servicescat.AuthServiceInterface = (*AuthService)(nil)

type AuthService struct {
	repo *repos.AuthRepo
}

func NewAuthService() *AuthService {
	db, err := utils.ConnectPostgres()
	if err != nil {
		panic("Failed to connect to DB: " + err.Error())
	}
	repo := repos.NewAuthRepo(db)
	return &AuthService{repo: repo}
}

func (s *AuthService) RegisterUser(req dto.RegisterRequest, logger *zap.Logger, requestID string) (dto.RegisterResponse, error) {
	exists, err := s.repo.IsUsernameTaken(req.Username)
	if err != nil {
		logger.Error("Failed to check username availability", zap.String("requestID", requestID), zap.Error(err))
		return dto.RegisterResponse{}, errors.New("failed to check username availability")
	}
	if exists {
		logger.Warn("Username already taken", zap.String("requestID", requestID), zap.String("username", req.Username))
		return dto.RegisterResponse{}, errors.New("username already taken")
	}
	userID, username, email, message, err := s.repo.RegisterUser(req.Username, req.Email, req.Password)
	if err != nil {
		// Check for duplicate email error
		if err.Error() == "failed to register user" {
			logger.Warn("Email already registered", zap.String("requestID", requestID), zap.String("email", req.Email))
			return dto.RegisterResponse{}, errors.New("email already registered")
		}
		logger.Error("Failed to register user", zap.String("requestID", requestID), zap.Error(err))
		return dto.RegisterResponse{}, err
	}
	logger.Info("Registered new user", zap.String("requestID", requestID), zap.String("userID", userID), zap.String("username", username), zap.String("email", email), zap.String("message", message))
	return dto.RegisterResponse{
		Username: username,
		Email:    email,
	}, nil
}

func (s *AuthService) LoginUser(req dto.LoginRequest, logger *zap.Logger, requestID string) (dto.LoginResponse, error) {
	userID, hashedPassword, err := s.repo.GetUserByEmail(req.Email)
	if err != nil {
		logger.Error("Invalid credentials (user not found)", zap.String("requestID", requestID), zap.Error(err))
		return dto.LoginResponse{}, errors.New("invalid credentials")
	}
	if err := s.repo.VerifyPassword(hashedPassword, req.Password); err != nil {
		logger.Error("Invalid credentials (password)", zap.String("requestID", requestID), zap.Error(err))
		return dto.LoginResponse{}, errors.New("invalid credentials")
	}
	token, err := utils.GenerateJWT(userID, req.Email)
	if err != nil {
		logger.Error("Failed to generate token", zap.String("requestID", requestID), zap.Error(err))
		return dto.LoginResponse{}, errors.New("failed to generate token")
	}
	logger.Info("Login successful", zap.String("requestID", requestID), zap.String("userID", userID), zap.String("email", req.Email))
	return dto.LoginResponse{Token: token}, nil
}
