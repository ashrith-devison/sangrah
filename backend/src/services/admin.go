package services

import "backend/src/dto"

type AdminServiceInterface interface {
	UploadFile(req dto.AdminFileUploadRequest) error
	ShareFile(req dto.AdminShareRequest) (dto.FileShareResponse, error)
	GetAllFiles() (dto.AdminFileListResponse, error)
	GetUsageStats() (dto.AdminStatsResponse, error)
}
