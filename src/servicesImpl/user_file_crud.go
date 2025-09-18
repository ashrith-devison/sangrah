package servicesImpl

import (
	"backend/src/dto"
	"backend/src/repos"
	"backend/src/utils"
)

type UserFileCrudService struct {
	repo *repos.FileCrudRepo
}

func NewUserFileCrudService() *UserFileCrudService {
	db, err := utils.ConnectPostgres()
	if err != nil {
		panic("Failed to connect to DB: " + err.Error())
	}
	repo := &repos.FileCrudRepo{Db: db}
	return &UserFileCrudService{repo: repo}
}

func (s *UserFileCrudService) RenameFile(req dto.FileRenameRequest) error {
	return s.repo.RenameFile(req.FileID, req.NewName, req.Username)
}

func (s *UserFileCrudService) DeleteFile(req dto.DeleteFileRequest) error {
	return s.repo.DeleteFile(req.FileId, req.Username)
}

func (s *UserFileCrudService) InsertUserFile(username, fileId, filename, permission string) error {
	return s.repo.InsertUserFile(username, fileId, filename, permission)
}

// User CRUD
func (s *UserFileCrudService) GetUser(username string) (dto.User, error) {
	return dto.User{}, nil // Placeholder for removed functionality
}

func (s *UserFileCrudService) UpdateUser(username string, req dto.UserUpdateRequest) error {
	return nil // Placeholder for removed functionality
}

func (s *UserFileCrudService) DeleteUser(username string) error {
	return nil // Placeholder for removed functionality
}
