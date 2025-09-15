package dto

// RegisterRequest represents the payload for user registration.
type RegisterRequest struct {
	Username string `json:"username"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

// RegisterResponse represents the response after successful registration.
type RegisterResponse struct {
	Username string `json:"username,omitempty"`
	Email    string `json:"email,omitempty"`
}

// LoginRequest represents the payload for user login.
type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// LoginResponse represents the response after successful login.
type LoginResponse struct {
	Token string `json:"token"`
}
