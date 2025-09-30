package services

import (
	"backend/src/dto"
)

// FileShareServiceInterface defines sharing/ownership operations

type FileShareServiceInterface interface {
	ShareFile(req dto.FileShareRequest) (dto.FileShareResponse, error)
	ListSharedFiles(username string) ([]dto.UserFile, error)
	RevokeFileShare(owner string, fileId string, recipient string) error
	GetFilesSharedWith(username string) ([]map[string]interface{}, error)
	GetFilesSharedBy(username string) ([]map[string]interface{}, error)
	IsFileAlreadyShared(fileId, recipient, owner string) (bool, error)
}
