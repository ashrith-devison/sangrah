package services

import "io"

// StorageServiceInterface defines file storage operations

type StorageServiceInterface interface {
	SaveFile(file io.Reader, filename string) (string, error)
	GetFile(path string) (io.ReadCloser, error)
	DeleteFile(path string) error
}
