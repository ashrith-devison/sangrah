package admin

import (
	"backend/src/config"
	"backend/src/services"
	"backend/src/servicesImpl"

	"database/sql"

	"go.uber.org/zap"
)

var AdminService services.AdminServiceInterface
var UserFileCrudService services.FileCrudServiceInterface
var AdminLogger = zap.NewNop() // Replace with actual logger initialization

func InitAdminService(db *sql.DB, cfg *config.Config, fileService services.FileServiceInterface, fileShareService *servicesImpl.FileShareService, userFileCrudService services.FileCrudServiceInterface) {
	UserFileCrudService = userFileCrudService
	AdminService = servicesImpl.NewAdminService(db, fileService, fileShareService, userFileCrudService)
}
