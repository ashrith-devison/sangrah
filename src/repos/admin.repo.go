package repos

import (
	"backend/src/dto"
	"database/sql"
)

type AdminRepo struct {
	Db *sql.DB
}

func NewAdminRepo(db *sql.DB) *AdminRepo {
	return &AdminRepo{Db: db}
}

// GetAllFiles retrieves all files with uploader details
func (r *AdminRepo) GetAllFiles() ([]dto.AdminFile, error) {
	rows, err := r.Db.Query(`
		SELECT uf.id, fm.filename, fm.file_size, fm.mime_type, COALESCE(SUM(uf.download_count), 0) as download_count, uf.created_at, uf.username AS uploader
		FROM file_metadata fm
		JOIN user_files uf ON fm.sha256 = uf.file_id
		WHERE uf.permission = 'owner'
		GROUP BY uf.id, fm.filename, fm.file_size, fm.mime_type, uf.created_at, uf.username
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var files []dto.AdminFile
	for rows.Next() {
		var file dto.AdminFile
		if err := rows.Scan(&file.Id, &file.Filename, &file.FileSize, &file.MimeType, &file.DownloadCount, &file.CreatedAt, &file.Uploader); err != nil {
			return nil, err
		}
		files = append(files, file)
	}
	return files, nil
}

// ShareFileWithUser shares a file with a specific user
func (r *AdminRepo) ShareFileWithUser(fileId, shareWith, permission string) error {
	_, err := r.Db.Exec(`
		INSERT INTO user_files (username, file_id, permission) VALUES ($1, $2, $3)
		ON CONFLICT (username, file_id) DO UPDATE SET permission = EXCLUDED.permission
	`, shareWith, fileId, permission)
	return err
}

// GetUsageStats retrieves overall usage statistics
func (r *AdminRepo) GetUsageStats() (dto.AdminStatsResponse, error) {
	var stats dto.AdminStatsResponse
	// Total files (logical files)
	err := r.Db.QueryRow("SELECT COUNT(*) FROM user_files WHERE permission = 'owner'").Scan(&stats.TotalFiles)
	if err != nil {
		return stats, err
	}
	// Total users
	err = r.Db.QueryRow("SELECT COUNT(*) FROM users").Scan(&stats.TotalUsers)
	if err != nil {
		return stats, err
	}
	// Total downloads
	err = r.Db.QueryRow("SELECT COALESCE(SUM(download_count), 0) FROM user_files").Scan(&stats.TotalDownloads)
	if err != nil {
		return stats, err
	}
	// Total storage used
	err = r.Db.QueryRow("SELECT COALESCE(SUM(file_size), 0) FROM file_metadata").Scan(&stats.TotalStorageUsed)
	return stats, err
}
