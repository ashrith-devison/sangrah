package servicesImpl

import (
	"io"
	"os"
	"path/filepath"
)

// StorageService implements services.StorageServiceInterface

type StorageService struct {
	BaseDir string
}

func NewStorageService(baseDir string) *StorageService {
	return &StorageService{BaseDir: baseDir}
}

func (s *StorageService) SaveFile(file io.Reader, filename string) (string, error) {
	path := filepath.Join(s.BaseDir, filename)
	out, err := os.Create(path)
	if err != nil {
		return "", err
	}
	defer out.Close()
	_, err = io.Copy(out, file)
	if err != nil {
		return "", err
	}
	return path, nil
}

func (s *StorageService) GetFile(path string) (io.ReadCloser, error) {
	return os.Open(filepath.Join(s.BaseDir, path))
}

func (s *StorageService) DeleteFile(path string) error {
	return os.Remove(filepath.Join(s.BaseDir, path))
}
