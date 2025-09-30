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
	err := r.Db.QueryRow("SELECT COUNT(*) FROM user_files WHERE permission = 'owner'").Scan(&stats.TotalLogicalFiles)
	if err != nil {
		return stats, err
	}
	// Total physical files
	err = r.Db.QueryRow("SELECT COUNT(*) FROM file_metadata").Scan(&stats.TotalPhysicalFiles)
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
	// Total physical storage used
	err = r.Db.QueryRow("SELECT COALESCE(SUM(file_size), 0) FROM file_metadata").Scan(&stats.TotalStorageUsed)
	if err != nil {
		return stats, err
	}
	// Total logical storage
	err = r.Db.QueryRow("SELECT COALESCE(SUM(file_size * reference_count), 0) FROM file_metadata").Scan(&stats.TotalLogicalStorage)
	if err != nil {
		return stats, err
	}
	// Space saved by deduplication
	stats.SpaceSaved = stats.TotalLogicalStorage - stats.TotalStorageUsed
	// Calculate averages and deduplication ratio
	if stats.TotalUsers > 0 {
		stats.AvgFilesPerUser = float64(stats.TotalLogicalFiles) / float64(stats.TotalUsers)
		stats.AvgStoragePerUser = stats.TotalLogicalStorage / float64(stats.TotalUsers)
	} else {
		stats.AvgFilesPerUser = 0
		stats.AvgStoragePerUser = 0
	}
	if stats.TotalLogicalStorage > 0 {
		stats.DeduplicationRatio = stats.TotalStorageUsed / stats.TotalLogicalStorage
	} else {
		stats.DeduplicationRatio = 0
	}
	return stats, nil
}

// GetAllUsers retrieves all users for admin
func (r *AdminRepo) GetAllUsers() ([]map[string]interface{}, error) {
	rows, err := r.Db.Query("SELECT id, username, email, is_admin, created_at FROM users")
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var users []map[string]interface{}
	for rows.Next() {
		var id int
		var username, email string
		var isAdmin bool
		var createdAt string
		if err := rows.Scan(&id, &username, &email, &isAdmin, &createdAt); err != nil {
			return nil, err
		}
		users = append(users, map[string]interface{}{
			"id":        id,
			"username":  username,
			"email":     email,
			"isAdmin":   isAdmin,
			"createdAt": createdAt,
		})
	}
	return users, nil
}

// GetUserEmailAndAdmin fetches email and is_admin for a username
func (r *AdminRepo) GetUserEmailAndAdmin(username string) (string, bool, error) {
	var email string
	var isAdmin bool
	err := r.Db.QueryRow("SELECT email, is_admin FROM users WHERE username = $1", username).Scan(&email, &isAdmin)
	if err != nil {
		return "", false, err
	}
	return email, isAdmin, nil
}
