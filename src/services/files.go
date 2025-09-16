package services

import (
	"backend/src/dto"
	"io"
	"net/http"
)

// FileServiceInterface defines file-related operations for controllers

type FileServiceInterface interface {
	CheckDuplicate(hash string) (bool, string)
	StoreFileMetadata(filename, mimetype, hash, path string, uploader string) error
	GetFileByPath(path string) (dto.FileMeta, error)
	CoreUpload(file io.ReadSeeker, filename string, r *http.Request) (string, string, string, string, error)
}
