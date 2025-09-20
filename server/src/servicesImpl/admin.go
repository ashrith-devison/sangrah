package servicesImpl

import (
	"backend/src/dto"
	"backend/src/repos"
	"backend/src/services"
	"backend/src/utils"
	"database/sql"
)

type AdminService struct {
	repo             *repos.AdminRepo
	fileService      services.FileServiceInterface
	fileShareService *FileShareService
	userFileService  services.FileCrudServiceInterface
}

func NewAdminService(db *sql.DB, fileService services.FileServiceInterface, fileShareService *FileShareService, userFileService services.FileCrudServiceInterface) services.AdminServiceInterface {
	var repo *repos.AdminRepo
	if db != nil {
		repo = repos.NewAdminRepo(db)
	} else {
		// Connect inside if not provided
		dbConn, err := utils.ConnectPostgres()
		if err != nil {
			panic("Failed to connect to DB: " + err.Error())
		}
		repo = repos.NewAdminRepo(dbConn)
	}
	return &AdminService{
		repo:             repo,
		fileService:      fileService,
		fileShareService: fileShareService,
		userFileService:  userFileService,
	}
}

func (s *AdminService) UploadFile(req dto.AdminFileUploadRequest) error {
	// Store metadata
	err := s.fileService.StoreFileMetadata(req.Filename, req.MIMEType, req.Hash, req.Path, req.Uploader)
	if err != nil {
		return err
	}
	// Insert into user_files
	return s.userFileService.InsertUserFile(req.Uploader, req.Hash, req.Filename, "owner")
}

func (s *AdminService) ShareFile(req dto.AdminShareRequest) (dto.FileShareResponse, error) {
	// Reuse existing share logic
	return s.fileShareService.ShareFile(dto.FileShareRequest{
		Owner:      "",
		Recipient:  req.ShareWith,
		FileID:     req.FileId,
		Permission: req.Permission,
	})
}

func (s *AdminService) GetAllFiles() (dto.AdminFileListResponse, error) {
	files, err := s.repo.GetAllFiles()
	if err != nil {
		return dto.AdminFileListResponse{}, err
	}
	return dto.AdminFileListResponse{Files: files}, nil
}

func (s *AdminService) GetUsageStats() (dto.AdminStatsResponse, error) {
	stats, err := s.repo.GetUsageStats()
	if err != nil {
		return dto.AdminStatsResponse{}, err
	}
	return stats, nil
}
