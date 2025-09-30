package servicesImpl

import (
	"backend/src/config"
	"backend/src/dto"
	"backend/src/repos"
	"backend/src/utils"
)

type FileSearchService struct {
	repo *repos.FileSearchRepo
}

func NewFileSearchService(cfg *config.Config) *FileSearchService {
	db, err := utils.ConnectPostgresWithConfig(cfg)
	if err != nil {
		panic("Failed to connect to DB: " + err.Error())
	}
	repo := repos.NewFileSearchRepo(db)
	return &FileSearchService{repo: repo}
}

func (s *FileSearchService) SearchFiles(params dto.FileSearchParams) ([]dto.FileMeta, error) {
	return s.repo.SearchFiles(params)
}
