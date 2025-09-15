package servicesImpl

import (
	"backend/src/services"
	"net/http"
	"os"
	"path/filepath"
)

// FileService implements services.FileServiceInterface
type FileService struct{}

func (fs *FileService) CheckDuplicate(hash string) (bool, string) {
	return CheckDuplicate(hash)
}

func (fs *FileService) StoreFileMetadata(filename, mimetype, hash, path string, r *http.Request) {
	StoreFileMetadata(filename, mimetype, hash, path, r)
}

func (fs *FileService) GetFileByPath(path string) (services.FileMeta, error) {
	// Accept both hash_path and direct path
	for _, meta := range fileMetadata {
		if meta.Path == path || filepath.Base(meta.Path) == filepath.Base(path) {
			return meta, nil
		}
	}
	// If not found, fallback to direct file existence
	if _, err := os.Stat(path); err == nil {
		// Return minimal meta if file exists but not tracked
		return services.FileMeta{Path: path, Filename: filepath.Base(path)}, nil
	}
	return services.FileMeta{}, http.ErrMissingFile
}

var fileHashes = make(map[string]string) // hash -> referenceID
var fileMetadata = make(map[string]services.FileMeta)

// FileMetadata returns all file metadata
func FileMetadata() map[string]services.FileMeta {
	return fileMetadata
}

// CheckDuplicate checks if a file hash already exists
func CheckDuplicate(hash string) (bool, string) {
	refID, exists := fileHashes[hash]
	return exists, refID
}

// StoreFileMetadata saves metadata for a new file
func StoreFileMetadata(filename, mimetype, hash, path string, r *http.Request) {
	uploader := r.Header.Get("X-User-ID")
	if uploader == "" {
		uploader = "unknown"
	}
	meta := services.FileMeta{
		Filename:    filename,
		MIMEType:    mimetype,
		SHA256:      hash,
		Path:        path,
		Uploader:    uploader,
		UploadDate:  "now", // Replace with actual timestamp
		ReferenceID: hash,
	}
	fileHashes[hash] = hash
	fileMetadata[hash] = meta
}
