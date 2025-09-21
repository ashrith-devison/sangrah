package servicesImpl

import (
	"backend/src/config"
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

// --- Public Share Service ---

type PublicShareService struct {
	repo    *repos.FileShareRepo // You may want a dedicated repo for public shares
	baseURL string
}

func NewPublicShareService() *PublicShareService {
	db, err := utils.ConnectPostgres()
	if err != nil {
		panic("Failed to connect to DB: " + err.Error())
	}
	repo := repos.NewFileShareRepo(db)
	cfg, _ := config.LoadConfig()
	return &PublicShareService{repo: repo, baseURL: cfg.PublicShareBaseURL}
}

// SharePublicly generates a token and persists mapping
func (s *PublicShareService) SharePublicly(req dto.PublicShareRequest) (dto.PublicShareResponse, error) {
	// Generate a random token (for demo, use fileId + username + timestamp)
	token := utils.GeneratePublicToken(req.FileId, req.Username)
	// Persist mapping (implement repo logic as needed)
	err := s.repo.SavePublicShare(token, req.FileId, req.Username)
	if err != nil {
		return dto.PublicShareResponse{}, err
	}
	// Update is_public flag in user_files
	_ = s.repo.SetFilePublic(req.FileId, req.Username)
	publicUrl := s.baseURL + token
	return dto.PublicShareResponse{PublicUrl: publicUrl, Token: token}, nil
}

// ResolveToken returns file metadata for a given token
func (s *PublicShareService) ResolveToken(token string) (dto.FileMeta, error) {
	return s.repo.GetFileMetaByToken(token)
}
