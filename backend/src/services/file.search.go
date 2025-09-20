package services

import "backend/src/dto"

// FileSearchServiceInterface defines file search operations

type FileSearchServiceInterface interface {
	SearchFiles(params dto.FileSearchParams) ([]dto.FileMeta, error)
}
