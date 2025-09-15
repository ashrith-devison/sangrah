package services

import "net/http"

// FileServiceInterface defines file-related operations for controllers

type FileMeta struct {
	Filename    string
	MIMEType    string
	SHA256      string
	Path        string
	Uploader    string
	UploadDate  string
	ReferenceID string
}

type FileServiceInterface interface {
	CheckDuplicate(hash string) (bool, string)
	StoreFileMetadata(filename, mimetype, hash, path string, r *http.Request)
	GetFileByPath(path string) (FileMeta, error)
}
