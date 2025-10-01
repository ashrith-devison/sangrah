package utils

import (
	"fmt"
	"mime"
	"net/http"
	"path/filepath"
)

// ValidateMimeType checks if the detected MIME type matches the file extension.
// Returns error if mismatch.
func ValidateMimeType(filename string, fileContent []byte) error {
	ext := filepath.Ext(filename)
	fmt.Printf("[DEBUG] Actual file extension from filename: %s\n", ext)
	if ext == "" {
		return fmt.Errorf("file has no extension")
	}
	detectedMime := http.DetectContentType(fileContent)
	mimeFromExt := mime.TypeByExtension(ext)
	if mimeFromExt == "" {
		return fmt.Errorf("unknown MIME type for extension: %s", ext)
	}
	// Debug logging
	fmt.Printf("[DEBUG] Detected MIME: %s, Expected MIME: %s for extension: %s\n", detectedMime, mimeFromExt, ext)
	// Print first 16 bytes as hex for deeper inspection
	maxBytes := 16
	if len(fileContent) < maxBytes {
		maxBytes = len(fileContent)
	}
	fmt.Printf("[DEBUG] First %d bytes: % x\n", maxBytes, fileContent[:maxBytes])
	if detectedMime != mimeFromExt {
		return fmt.Errorf("MIME type mismatch: file content is %s but extension is %s", detectedMime, ext)
	}
	return nil
}
