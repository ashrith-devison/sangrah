package servicesImpl

import (
	"backend/src/dto"
	"backend/src/repos"
	"backend/src/utils"
	"crypto/sha256"
	"fmt"
	"io"
	"log"
	"mime"
	"net/http"
	"os"
	"path/filepath"
)

// FileService implements services.FileServiceInterface
type FileService struct{}

func (fs *FileService) StoreFileMetadata(filename, mimetype, hash, path string, uploader string) error {
	if uploader == "" {
		uploader = "unknown"
	}
	fileInfo, err := os.Stat(path)
	var fileSize float64
	if err == nil {
		fileSize = float64(fileInfo.Size())
	}
	meta := dto.FileMeta{
		Filename:       filename,
		MIMEType:       mimetype,
		SHA256:         hash,
		Path:           path,
		Uploader:       uploader,
		UploadDate:     "now", // Replace with actual timestamp
		ReferenceID:    hash,
		ReferenceCount: 1,
		FileSize:       fileSize,
	}
	fileHashes[hash] = hash
	fileMetadata[hash] = meta

	// Save metadata to database using FileRepo
	db, err := utils.ConnectPostgres()
	if err != nil {
		log.Printf("Failed to connect to DB: %v", err)
		return err
	}
	defer db.Close()
	fileRepo := repos.NewFileRepo(db)
	if err := fileRepo.SaveFileMeta(meta); err != nil {
		log.Printf("Failed to save file metadata: %v", err)
		return err
	}
	return nil
}

// CoreUpload implements the interface method for modular upload logic
func (fs *FileService) CoreUpload(file io.ReadSeeker, filename string, r *http.Request) (string, string, string, string, error) {
	return CoreUpload(file, filename, r)
}

func (fs *FileService) CheckDuplicate(hash string) (bool, string) {
	return CheckDuplicate(hash)
}

func (fs *FileService) GetFileByPath(path string) (dto.FileMeta, error) {
	// Accept both hash_path and direct path
	for _, meta := range fileMetadata {
		if meta.Path == path || filepath.Base(meta.Path) == filepath.Base(path) {
			return meta, nil
		}
	}
	// If not found, fallback to direct file existence
	if _, err := os.Stat(path); err == nil {
		// Try to look up SHA256 from DB using filename
		db, dbErr := utils.ConnectPostgres()
		var sha256 string
		if dbErr == nil {
			defer db.Close()
			// Try to get hash for any user (if you want to restrict, pass username)
			db.QueryRow("SELECT file_id FROM user_files WHERE filename = $1 LIMIT 1", filepath.Base(path)).Scan(&sha256)
		}
		return dto.FileMeta{Path: path, Filename: filepath.Base(path), SHA256: sha256}, nil
	}
	return dto.FileMeta{}, http.ErrMissingFile
}

var fileHashes = make(map[string]string) // hash -> referenceID
var fileMetadata = make(map[string]dto.FileMeta)

// FileMetadata returns all file metadata
func FileMetadata() map[string]dto.FileMeta {
	return fileMetadata
}

// CheckDuplicate checks if a file hash already exists
func CheckDuplicate(hash string) (bool, string) {
	refID, exists := fileHashes[hash]
	return exists, refID
}

// StoreFileMetadata saves metadata for a new file

// CoreUpload handles the core logic for file upload, including MIME validation and saving
func CoreUpload(file io.ReadSeeker, filename string, r *http.Request) (string, string, string, string, error) {
	buffer := make([]byte, 512)
	_, err := file.Read(buffer)
	if err != nil && err != io.EOF {
		return "", "", "", "", err
	}
	filetype := http.DetectContentType(buffer)
	if _, err := file.Seek(0, io.SeekStart); err != nil {
		return "", "", "", "", err
	}
	hash := sha256.New()
	_, err = io.Copy(hash, file)
	if err != nil {
		return "", "", "", "", err
	}
	hashSum := fmt.Sprintf("%x", hash.Sum(nil))
	if _, err := file.Seek(0, io.SeekStart); err != nil {
		return "", "", "", "", err
	}
	var ext string
	ext = filepath.Ext(filename) // fallback to original extension
	if filetype == "image/jpeg" {
		ext = ".jpg"
	} else {
		exts, err := mime.ExtensionsByType(filetype)
		if err == nil && len(exts) > 0 {
			ext = exts[0]
		}
		if ext == "" {
			ext = filepath.Ext(filename) // fallback to original extension
		}
	}
	filePath := filepath.Join("storage", hashSum+ext)
	out, err := os.Create(filePath)
	if err != nil {
		return "", "", "", "", err
	}
	defer out.Close()
	_, err = io.Copy(out, file)
	if err != nil {
		return "", "", "", "", err
	}
	return hashSum + ext, filetype, hashSum, filePath, nil
}
