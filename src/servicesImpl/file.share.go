package servicesImpl

import (
	"backend/src/dto"
	"backend/src/repos"
	"backend/src/utils"
)

// Compile-time assertion
var _ = (repos.FileShareRepository)(nil)

// FileShareService implements FileShareServiceInterface

type FileShareService struct {
	repo *repos.FileShareRepo
}

func NewFileShareService() *FileShareService {
	db, err := utils.ConnectPostgres()
	if err != nil {
		panic("Failed to connect to DB: " + err.Error())
	}
	repo := repos.NewFileShareRepo(db)
	return &FileShareService{repo: repo}
}

func (s *FileShareService) ShareFile(req dto.FileShareRequest) (dto.FileShareResponse, error) {
	err := s.repo.ShareFile(req.Owner, req.Recipient, req.FileID, req.Permission)
	if err != nil {
		return dto.FileShareResponse{Success: false, Message: err.Error()}, err
	}
	return dto.FileShareResponse{Success: true, Message: "File shared successfully"}, nil
}

func (s *FileShareService) ListSharedFiles(username string) ([]dto.UserFile, error) {
	return s.repo.ListSharedFiles(username)
}

func (s *FileShareService) RevokeFileShare(owner string, fileId string, recipient string) error {
	return s.repo.RevokeFileShare(owner, fileId, recipient)
}
