package repos

import (
	"backend/src/dto"
	"database/sql"
	"fmt"
)

type FileShareRepo struct {
	db *sql.DB
}

type FileShareRepository interface {
	ShareFile(owner, recipient string, fileId string, permission string) error
	ListSharedFiles(username string) ([]dto.UserFile, error)
	RevokeFileShare(owner string, fileId string, recipient string) error
}

// SetFilePublic updates is_public flag for a file and user
func (r *FileShareRepo) SetFilePublic(fileId, username string) error {
	query := `UPDATE user_files SET is_public = true WHERE file_id = $1 AND username = $2`
	_, err := r.db.Exec(query, fileId, username)
	return err
}

func NewFileShareRepo(db *sql.DB) *FileShareRepo {
	return &FileShareRepo{db: db}
}

func (r *FileShareRepo) ShareFile(owner, recipient string, fileId string, permission string) error {
	// Fetch filename for fileId and owner
	var filename string
	err := r.db.QueryRow("SELECT filename FROM user_files WHERE file_id = $1 AND username = $2 AND permission = 'owner'", fileId, owner).Scan(&filename)
	if err == sql.ErrNoRows {
		return fmt.Errorf("file not found or not owned by user")
	} else if err != nil {
		return err
	}
	query := `
		INSERT INTO user_files (username, file_id, shared_with, shared_by, permission, filename)
		VALUES ($1, $2, $3, $4, $5, $6)
		ON CONFLICT (file_id, username, shared_with)
		DO UPDATE SET permission = EXCLUDED.permission, shared_by = EXCLUDED.shared_by
	`
	_, err = r.db.Exec(query, recipient, fileId, owner, owner, permission, filename)
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

// SavePublicShare persists the public share token mapping
func (r *FileShareRepo) SavePublicShare(token, fileId, username string) error {
	query := `INSERT INTO public_shares (token, file_id, username) VALUES ($1, $2, $3)`
	_, err := r.db.Exec(query, token, fileId, username)
	return err
}

// GetFileMetaByToken retrieves file metadata for a given public share token
func (r *FileShareRepo) GetFileMetaByToken(token string) (dto.FileMeta, error) {
	query := `SELECT fm.filename, fm.mime_type, fm.sha256, fm.path, fm.reference_id, fm.reference_count, fm.file_size
			  FROM public_shares ps
			  JOIN file_metadata fm ON ps.file_id = fm.sha256
			  WHERE ps.token = $1`
	row := r.db.QueryRow(query, token)
	var meta dto.FileMeta
	err := row.Scan(&meta.Filename, &meta.MIMEType, &meta.SHA256, &meta.Path, &meta.ReferenceID, &meta.ReferenceCount, &meta.FileSize)
	if err != nil {
		return dto.FileMeta{}, err
	}
	return meta, nil
}
