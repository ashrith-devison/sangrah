package repos

import (
	"database/sql"
	"errors"

	"craftiverse.co.in/fileVault/backend/utils"
	"golang.org/x/crypto/bcrypt"
)

type AuthRepo struct {
	db *sql.DB
}

func NewAuthRepo(db *sql.DB) *AuthRepo {
	return &AuthRepo{db: db}
}

func (r *AuthRepo) IsUsernameTaken(username string) (bool, error) {
	var exists bool
	err := utils.QueryRow(r.db, "SELECT EXISTS(SELECT 1 FROM users WHERE username = $1)", []interface{}{&exists}, username)
	return exists, err
}

func (r *AuthRepo) RegisterUser(username, email, password string) (string, string, string, string, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", "", "", "", errors.New("failed to hash password")
	}
	query := `INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id`
	var userID string
	err = utils.QueryRow(r.db, query, []interface{}{&userID}, username, email, string(hashedPassword))
	if err != nil {
		return "", "", "", "", errors.New("failed to register user")
	}
	return userID, username, email, "User registered successfully", nil
}

func (r *AuthRepo) GetUserByEmail(email string) (string, string, error) {
	query := `SELECT id, password FROM users WHERE email = $1`
	var userID, hashedPassword string
	err := utils.QueryRow(r.db, query, []interface{}{&userID, &hashedPassword}, email)
	if err != nil {
		return "", "", err
	}
	return userID, hashedPassword, nil
}

func (r *AuthRepo) VerifyPassword(hashedPassword, password string) error {
	return bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
}
