package servicesImpl

import (
	"backend/src/config"
	"backend/src/dto"
	"backend/src/repos"
	"backend/src/utils"
)

type UserFileCrudService struct {
	Repo *repos.FileCrudRepo
}

func NewUserFileCrudService(cfg *config.Config) *UserFileCrudService {
	db, err := utils.ConnectPostgresWithConfig(cfg)
	if err != nil {
		panic("Failed to connect to DB: " + err.Error())
	}
	repo := &repos.FileCrudRepo{Db: db}
	return &UserFileCrudService{Repo: repo}
}

// InsertUserFileWithPath inserts a user_file record with a path (folder)
func (s *UserFileCrudService) InsertUserFileWithPath(username, fileId, filename, permission, path string) error {
	query := `INSERT INTO user_files (username, file_id, filename, permission, path) VALUES ($1, $2, $3, $4, $5)`
	_, err := s.Repo.Db.Exec(query, username, fileId, filename, permission, path)
	return err
}

func (s *UserFileCrudService) RenameFile(req dto.FileRenameRequest) error {
	return s.Repo.RenameFileByFilename(req.Username, req.Filename, req.NewName)
}

func (s *UserFileCrudService) DeleteFile(req dto.DeleteFileRequest) error {
	return s.Repo.DeleteFile(req.FileId, req.Username)
}

func (s *UserFileCrudService) InsertUserFile(username, fileId, filename, permission string) error {
	return s.Repo.InsertUserFile(username, fileId, filename, permission)
}

func (s *UserFileCrudService) UserExists(username string) (bool, error) {
	return s.Repo.UserExists(username)
}
