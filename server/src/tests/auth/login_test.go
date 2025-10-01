package auth

import (
	"bytes"
	"encoding/json"
	"errors"
	"io/ioutil"
	"net/http"
	"net/http/httptest"
	"testing"

	"go.uber.org/zap"

	authcontroller "backend/src/controllers/auth"
	"backend/src/dto"
)

func TestLoginHandler(t *testing.T) {
	tests := []struct {
		name       string
		body       interface{}
		mockFunc   func(req dto.LoginRequest, logger *zap.Logger, requestID string) (dto.LoginResponse, error)
		header     map[string]string
		wantStatus int
		wantBody   string // Optional: substring to check in response body
	}{
		{
			name: "Valid login (user)",
			body: dto.LoginRequest{Email: "user@gmail.com", Password: "password"},
			mockFunc: func(req dto.LoginRequest, logger *zap.Logger, requestID string) (dto.LoginResponse, error) {
				return dto.LoginResponse{Username: "user", Email: req.Email, Token: "token", Role: "user"}, nil
			},
			wantStatus: http.StatusOK,
			wantBody:   "\"username\":\"user\"",
		},
		{
			name: "Valid login (admin)",
			body: dto.LoginRequest{Email: "admin@gmail.com", Password: "adminpass"},
			mockFunc: func(req dto.LoginRequest, logger *zap.Logger, requestID string) (dto.LoginResponse, error) {
				return dto.LoginResponse{Username: "admin", Email: req.Email, Token: "admintoken", Role: "admin"}, nil
			},
			wantStatus: http.StatusOK,
			wantBody:   "\"role\":\"admin\"",
		},
		{
			name:       "Invalid JSON payload",
			body:       "not-json",
			mockFunc:   nil,
			wantStatus: http.StatusBadRequest,
			wantBody:   "Invalid request payload",
		},
		{
			name:       "Missing email field",
			body:       map[string]string{"password": "password"},
			mockFunc:   nil,
			wantStatus: http.StatusBadRequest,
			wantBody:   "Email and password are required",
		},
		{
			name:       "Missing password field",
			body:       map[string]string{"email": "user@gmail.com"},
			mockFunc:   nil,
			wantStatus: http.StatusBadRequest,
			wantBody:   "Email and password are required",
		},
		{
			name: "Empty email and password",
			body: dto.LoginRequest{Email: "", Password: ""},
			mockFunc: func(req dto.LoginRequest, logger *zap.Logger, requestID string) (dto.LoginResponse, error) {
				return dto.LoginResponse{}, errors.New("invalid credentials")
			},
			wantStatus: http.StatusBadRequest,
			wantBody:   "Email and password are required",
		},
		{
			name: "Login fails (invalid credentials)",
			body: dto.LoginRequest{Email: "fail@gmail.com", Password: "badpass"},
			mockFunc: func(req dto.LoginRequest, logger *zap.Logger, requestID string) (dto.LoginResponse, error) {
				return dto.LoginResponse{}, errors.New("invalid credentials")
			},
			wantStatus: http.StatusUnauthorized,
			wantBody:   "Login failed",
		},
		{
			name: "Login fails (internal error)",
			body: dto.LoginRequest{Email: "err@gmail.com", Password: "pass"},
			mockFunc: func(req dto.LoginRequest, logger *zap.Logger, requestID string) (dto.LoginResponse, error) {
				return dto.LoginResponse{}, errors.New("internal error")
			},
			wantStatus: http.StatusUnauthorized,
			wantBody:   "Login failed",
		},
		{
			name: "Login returns malformed response",
			body: dto.LoginRequest{Email: "malformed@gmail.com", Password: "pass"},
			mockFunc: func(req dto.LoginRequest, logger *zap.Logger, requestID string) (dto.LoginResponse, error) {
				return dto.LoginResponse{}, nil // empty response
			},
			wantStatus: http.StatusOK,
			wantBody:   "success",
		},
		{
			name: "Request with X-Request-ID header",
			body: dto.LoginRequest{Email: "user2@gmail.com", Password: "password2"},
			mockFunc: func(req dto.LoginRequest, logger *zap.Logger, requestID string) (dto.LoginResponse, error) {
				return dto.LoginResponse{Username: "user2", Email: req.Email, Token: "token2", Role: "user"}, nil
			},
			header:     map[string]string{"X-Request-ID": "test-req-id"},
			wantStatus: http.StatusOK,
			wantBody:   "user2",
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			if tc.mockFunc != nil {
				authcontroller.AuthService = &mockAuthService{loginFunc: tc.mockFunc}
			}
			var req *http.Request
			switch v := tc.body.(type) {
			case string:
				req = httptest.NewRequest(http.MethodPost, "/api/v1/auth/login", bytes.NewReader([]byte(v)))
			case map[string]string:
				b, _ := json.Marshal(v)
				req = httptest.NewRequest(http.MethodPost, "/api/v1/auth/login", bytes.NewReader(b))
			default:
				b, _ := json.Marshal(v)
				req = httptest.NewRequest(http.MethodPost, "/api/v1/auth/login", bytes.NewReader(b))
			}
			if tc.header != nil {
				for k, v := range tc.header {
					req.Header.Set(k, v)
				}
			}
			rw := httptest.NewRecorder()
			authcontroller.LoginHandler(rw, req)
			if rw.Code != tc.wantStatus {
				t.Errorf("%s: expected status %d, got %d", tc.name, tc.wantStatus, rw.Code)
			}
			if tc.wantBody != "" {
				bodyBytes, _ := ioutil.ReadAll(rw.Body)
				if !bytes.Contains(bodyBytes, []byte(tc.wantBody)) {
					t.Errorf("%s: response body does not contain expected substring: %q\nBody: %s", tc.name, tc.wantBody, string(bodyBytes))
				}
			}
			// Reset global after each test
			authcontroller.AuthService = nil
		})
	}
}
