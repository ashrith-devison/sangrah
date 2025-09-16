package repos

import (
	"backend/src/dto"
	"database/sql"
)

type FileShareRepo struct {
	db *sql.DB
}

type FileShareRepository interface {
	ShareFile(owner, recipient string, fileId string, permission string) error
	ListSharedFiles(username string) ([]dto.UserFile, error)
	RevokeFileShare(owner string, fileId string, recipient string) error
}

func NewFileShareRepo(db *sql.DB) *FileShareRepo {
	return &FileShareRepo{db: db}
}

func (r *FileShareRepo) ShareFile(owner, recipient string, fileId string, permission string) error {
	query := `
		INSERT INTO user_files (username, file_id, permission)
		VALUES ($1, $2, $3)
		ON CONFLICT (username, file_id)
		DO UPDATE SET permission = EXCLUDED.permission
	`
	_, err := r.db.Exec(query, recipient, fileId, permission)
	return err
}

func (r *FileShareRepo) ListSharedFiles(username string) ([]dto.UserFile, error) {
	query := `SELECT id, username, file_id, permission FROM user_files WHERE username = $1`
	rows, err := r.db.Query(query, username)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var files []dto.UserFile
	for rows.Next() {
		var uf dto.UserFile
		if err := rows.Scan(&uf.ID, &uf.Username, &uf.FileID, &uf.Permission); err != nil {
			return nil, err
		}
		files = append(files, uf)
	}
	return files, nil
}

func (r *FileShareRepo) RevokeFileShare(owner string, fileId string, recipient string) error {
	query := `DELETE FROM user_files WHERE username = $1 AND file_id = $2`
	_, err := r.db.Exec(query, recipient, fileId)
	return err
}
