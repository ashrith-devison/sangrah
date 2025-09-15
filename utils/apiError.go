package utils

import (
	"encoding/json"
	"net/http"
)

// APIError is a standard error response wrapper for API errors.
type APIError struct {
	Status  string `json:"status" example:"error"`
	Message string `json:"message" example:"An error occurred"`
	Error   string `json:"error,omitempty"`
}

// WriteAPIError writes an error response to the http.ResponseWriter with status code.
func WriteAPIError(w http.ResponseWriter, statusCode int, message, err string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	resp := APIError{
		Status:  "error",
		Message: message,
		Error:   err,
	}
	json.NewEncoder(w).Encode(resp)
}
