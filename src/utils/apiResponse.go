package utils

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

// APIResponse is a standard response wrapper for successful API responses.
type APIResponse struct {
	Status  string      `json:"status" example:"success"`
	Message string      `json:"message" example:"Operation completed successfully"`
	Data    interface{} `json:"data,omitempty"`
}

// WriteAPIResponse writes a success response to the http.ResponseWriter with status code.
func WriteAPIResponse(w http.ResponseWriter, statusCode int, message string, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	resp := APIResponse{
		Status:  "success",
		Message: message,
		Data:    data,
	}
	json.NewEncoder(w).Encode(resp)
}

func GeneratePublicToken(fileId, username string) string {
	b := make([]byte, 16)
	_, _ = rand.Read(b)
	ts := time.Now().UnixNano()
	return hex.EncodeToString(b) + fileId + username + fmt.Sprintf("%d", ts)
}
