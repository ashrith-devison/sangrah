package files

import (
	"backend/src/dto"
	"io"
	"net/http"
	"os"
	"path/filepath"
)

// mockUploader implements files.FileUploader for testing
type mockUploader struct{}

func (mockUploader) CoreUpload(file io.ReadSeeker, filename string, r *http.Request) (string, string, string, string, error) {
	os.MkdirAll("storage/test", 0755)
	path := filepath.Join("storage/test", filename)
	f, err := os.Create(path)
	if err != nil {
		return "", "", "", "", err
	}
	defer f.Close()
	io.Copy(f, file)
	return filename, "text/plain", "mockhash", path, nil
}

// mockFileCrudRepo implements FileCrudRepo for testing
type mockFileCrudRepo struct{}

func (mockFileCrudRepo) GetUserStorageUsedMB(username string) (float64, error) {
	return 0, nil // Always allow upload in test
}

// mockFileService implements the FileService interface for testing
type mockFileService struct{}

func (mockFileService) StoreFileMetadata(filename, mimetype, hash, path, uploader string) error {
	return nil
}
func (mockFileService) CheckDuplicate(hash string) (bool, string)       { return false, "" }
func (mockFileService) GetFileByPath(path string) (dto.FileMeta, error) { return dto.FileMeta{}, nil }
func (mockFileService) CoreUpload(file io.ReadSeeker, filename string, r *http.Request) (string, string, string, string, error) {
	return filename, "text/plain", "mockhash", "storage/test/" + filename, nil
}

// mock logger
type mockLogger struct{}

func (mockLogger) Info(msg string, fields ...interface{})  {}
func (mockLogger) Error(msg string, fields ...interface{}) {}

// mockUserFileCrudService implements UserFileCrudService for testing
type mockUserFileCrudService struct{}

func (mockUserFileCrudService) UserFileExists(username, hash string) (bool, error) { return false, nil }
func (mockUserFileCrudService) GetNextCopyFilename(username, filename string) (string, error) {
	return filename, nil
}
func (mockUserFileCrudService) InsertUserFileWithPath(username, hash, filename, role, folderPath string) error {
	return nil
}
