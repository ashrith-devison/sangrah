package repos

import (
	"database/sql"
	"errors"

	"backend/src/utils"

	"golang.org/x/crypto/bcrypt"
)

type AuthRepo struct {
	db *sql.DB
}

type AuthRepository interface {
	IsUsernameTaken(username string) (bool, error)
	RegisterUser(username, email, password string) (string, string, string, error)
	GetUserByEmail(email string) (string, string, string, error) // userID, hashedPassword, is_admin
	VerifyPassword(hashedPassword, password string) error
}

func NewAuthRepo(db *sql.DB) *AuthRepo {
	return &AuthRepo{db: db}
}

func (r *AuthRepo) IsUsernameTaken(username string) (bool, error) {
	var exists bool
	err := utils.QueryRow(r.db, "SELECT EXISTS(SELECT 1 FROM users WHERE username = $1)", []interface{}{&exists}, username)
	return exists, err
}

func (r *AuthRepo) RegisterUser(username, email, password string) (string, string, string, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", "", "", errors.New("failed to hash password")
	}
	isAdmin := false
	if email == "admin@example.com" { // Hardcode admin for demo
		isAdmin = true
	}
	query := `INSERT INTO users (username, email, password, is_admin) VALUES ($1, $2, $3, $4)`
	_, err = r.db.Exec(query, username, email, string(hashedPassword), isAdmin)
	if err != nil {
		return "", "", "", errors.New("failed to register user")
	}
	return username, username, email, nil
}

func (r *AuthRepo) GetUserByEmail(email string) (string, string, string, error) {
	query := `SELECT username, password, is_admin FROM users WHERE email = $1`
	var username, hashedPassword string
	var isAdmin string
	err := utils.QueryRow(r.db, query, []interface{}{&username, &hashedPassword, &isAdmin}, email)
	if err != nil {
		return "", "", "", err
	}
	return username, hashedPassword, isAdmin, nil
}

func (r *AuthRepo) VerifyPassword(hashedPassword, password string) error {
	return bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
}
