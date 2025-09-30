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
	if ext == "" {
		return fmt.Errorf("file has no extension")
	}
	detectedMime := http.DetectContentType(fileContent)
	mimeFromExt := mime.TypeByExtension(ext)
	if mimeFromExt == "" {
		return fmt.Errorf("unknown MIME type for extension: %s", ext)
	}
	majorDetected := detectedMime
	majorExt := mimeFromExt
	if majorDetected != majorExt {
		return fmt.Errorf("MIME type mismatch: file content is %s but extension is %s", majorDetected, ext)
	}
	return nil
}
