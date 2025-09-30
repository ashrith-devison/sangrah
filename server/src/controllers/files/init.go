package files

import (
	"backend/src/config"
	"backend/src/services"
	servicesImpl "backend/src/servicesImpl"

	"go.uber.org/zap"
)

var FileService services.FileServiceInterface
var FileCrudService services.FileCrudServiceInterface
var FileShareService services.FileShareServiceInterface
var FileSearchService services.FileSearchServiceInterface
var FileLogger = zap.NewNop() // Replace with actual logger initialization

func InitFileServices(cfg *config.Config) {
	FileService = &servicesImpl.FileService{}
	FileCrudService = servicesImpl.NewUserFileCrudService(cfg)
	FileShareService = servicesImpl.NewFileShareService(cfg)
	FileSearchService = servicesImpl.NewFileSearchService(cfg)
}
