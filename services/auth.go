package services

import (
	"errors"
	"log"

	"craftiverse.co.in/fileVault/backend/dto"
	"craftiverse.co.in/fileVault/backend/repos"
	"craftiverse.co.in/fileVault/backend/utils"
)

type AuthService struct {
	repo *repos.AuthRepo
}

func NewAuthService() *AuthService {
	db, err := utils.ConnectPostgres()
	if err != nil {
		log.Fatalf("Failed to connect to DB: %v", err)
	}
	repo := repos.NewAuthRepo(db)
	return &AuthService{repo: repo}
}

func (s *AuthService) RegisterUser(req dto.RegisterRequest) (dto.RegisterResponse, error) {
	exists, err := s.repo.IsUsernameTaken(req.Username)
	if err != nil {
		return dto.RegisterResponse{}, errors.New("failed to check username availability")
	}
	if exists {
		return dto.RegisterResponse{}, errors.New("username already taken")
	}
	userID, username, email, message, err := s.repo.RegisterUser(req.Username, req.Email, req.Password)
	if err != nil {
		return dto.RegisterResponse{}, err
	}
	log.Printf("Registered new user: ID=%s, Username=%s, Email=%s, Message=%s", userID, username, email, message)
	return dto.RegisterResponse{
		Username: username,
		Email:    email,
	}, nil
}

func (s *AuthService) LoginUser(req dto.LoginRequest) (dto.LoginResponse, error) {
	userID, hashedPassword, err := s.repo.GetUserByEmail(req.Email)
	if err != nil {
		return dto.LoginResponse{}, errors.New("invalid credentials")
	}
	if err := s.repo.VerifyPassword(hashedPassword, req.Password); err != nil {
		return dto.LoginResponse{}, errors.New("invalid credentials")
	}
	token, err := utils.GenerateJWT(userID, req.Email)
	if err != nil {
		return dto.LoginResponse{}, errors.New("failed to generate token")
	}
	return dto.LoginResponse{Token: token}, nil
}
