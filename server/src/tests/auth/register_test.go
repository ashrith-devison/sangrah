package auth

import (
	"bytes"
	"encoding/json"
	"errors"
	"io/ioutil"
	"net/http"
	"net/http/httptest"
	"testing"

	authcontroller "backend/src/controllers/auth"
	"backend/src/dto"

	"go.uber.org/zap"
)

func TestRegisterHandler(t *testing.T) {
	tests := []struct {
		name       string
		body       interface{}
		mockFunc   func(req dto.RegisterRequest, logger *zap.Logger, requestID string) (dto.RegisterResponse, error)
		header     map[string]string
		wantStatus int
		wantBody   string // substring to check in response body
	}{
		{
			name: "Valid registration",
			body: dto.RegisterRequest{Username: "user1", Email: "user1@gmail.com", Password: "password"},
			mockFunc: func(req dto.RegisterRequest, logger *zap.Logger, requestID string) (dto.RegisterResponse, error) {
				return dto.RegisterResponse{Username: req.Username, Email: req.Email, Token: "token"}, nil
			},
			wantStatus: http.StatusCreated,
			wantBody:   "User registered successfully",
		},
		{
			name:       "Invalid JSON payload",
			body:       "not-json",
			mockFunc:   nil,
			wantStatus: http.StatusBadRequest,
			wantBody:   "Invalid request payload",
		},
		{
			name:       "Missing username field",
			body:       map[string]string{"email": "user2@gmail.com", "password": "password"},
			mockFunc:   nil,
			wantStatus: http.StatusBadRequest,
			wantBody:   "Invalid request payload",
		},
		{
			name:       "Missing email field",
			body:       map[string]string{"username": "user2", "password": "password"},
			mockFunc:   nil,
			wantStatus: http.StatusBadRequest,
			wantBody:   "Invalid request payload",
		},
		{
			name:       "Missing password field",
			body:       map[string]string{"username": "user2", "email": "user2@gmail.com"},
			mockFunc:   nil,
			wantStatus: http.StatusBadRequest,
			wantBody:   "Invalid request payload",
		},
		{
			name: "Username already taken",
			body: dto.RegisterRequest{Username: "user1", Email: "user1@gmail.com", Password: "password"},
			mockFunc: func(req dto.RegisterRequest, logger *zap.Logger, requestID string) (dto.RegisterResponse, error) {
				return dto.RegisterResponse{}, errors.New("username already taken")
			},
			wantStatus: http.StatusConflict,
			wantBody:   "username already taken",
		},
		{
			name: "Email already registered",
			body: dto.RegisterRequest{Username: "user2", Email: "user1@gmail.com", Password: "password"},
			mockFunc: func(req dto.RegisterRequest, logger *zap.Logger, requestID string) (dto.RegisterResponse, error) {
				return dto.RegisterResponse{}, errors.New("email already registered")
			},
			wantStatus: http.StatusConflict,
			wantBody:   "email already registered",
		},
		{
			name: "Registration fails (internal error)",
			body: dto.RegisterRequest{Username: "user3", Email: "user3@gmail.com", Password: "password"},
			mockFunc: func(req dto.RegisterRequest, logger *zap.Logger, requestID string) (dto.RegisterResponse, error) {
				return dto.RegisterResponse{}, errors.New("internal error")
			},
			wantStatus: http.StatusInternalServerError,
			wantBody:   "Registration failed",
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			if tc.mockFunc != nil {
				authcontroller.AuthService = &mockAuthService{registerFunc: tc.mockFunc}
			} else {
				authcontroller.AuthService = &mockAuthService{}
			}
			var req *http.Request
			switch v := tc.body.(type) {
			case string:
				req = httptest.NewRequest(http.MethodPost, "/api/v1/auth/register", bytes.NewReader([]byte(v)))
			case map[string]string:
				b, _ := json.Marshal(v)
				req = httptest.NewRequest(http.MethodPost, "/api/v1/auth/register", bytes.NewReader(b))
			default:
				b, _ := json.Marshal(v)
				req = httptest.NewRequest(http.MethodPost, "/api/v1/auth/register", bytes.NewReader(b))
			}
			if tc.header != nil {
				for k, v := range tc.header {
					req.Header.Set(k, v)
				}
			}
			rw := httptest.NewRecorder()
			authcontroller.RegisterHandler(rw, req)
			if rw.Code != tc.wantStatus {
				t.Errorf("%s: expected status %d, got %d", tc.name, tc.wantStatus, rw.Code)
			}
			if tc.wantBody != "" {
				bodyBytes, _ := ioutil.ReadAll(rw.Body)
				if !bytes.Contains(bodyBytes, []byte(tc.wantBody)) {
					t.Errorf("%s: response body does not contain expected substring: %q\nBody: %s", tc.name, tc.wantBody, string(bodyBytes))
				}
			}
			authcontroller.AuthService = nil
		})
	}
}
