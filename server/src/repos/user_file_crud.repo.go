package repos

import (
	"backend/src/dto"
	"database/sql"
	"fmt"
	"os"
	"strings"
)

// Analytics queries
func (r *FileCrudRepo) GetLogicalFilesAndUniqueUploaders() (logicalFiles int, uniqueUploaders int, err error) {
	logicalFiles = 0
	uploaderSet := make(map[string]struct{})
	rows, err := r.Db.Query("SELECT username FROM user_files WHERE permission = 'owner'")
	if err != nil {
		return 0, 0, err
	}
	defer rows.Close()
	for rows.Next() {
		var username string
		if err := rows.Scan(&username); err != nil {
			return 0, 0, err
		}
		logicalFiles++
		uploaderSet[username] = struct{}{}
	}
	uniqueUploaders = len(uploaderSet)
	return logicalFiles, uniqueUploaders, nil
}

// Insert a new user_file record on upload
func (r *FileCrudRepo) InsertUserFile(username, fileId, filename, permission string) error {
	query := `INSERT INTO user_files (username, file_id, filename, permission) VALUES ($1, $2, $3, $4)`
	_, err := r.Db.Exec(query, username, fileId, filename, permission)
	return err
}

// User CRUD

func (r *AuthRepo) GetUser(username string) (dto.User, error) {
	// ...implementation...
	return dto.User{}, nil
}

func (r *AuthRepo) UpdateUser(username string, req dto.UserUpdateRequest) error {
	// ...implementation...
	return nil
}

func (r *AuthRepo) DeleteUser(username string) error {
	// ...implementation...
	return nil
}

// File CRUD

type FileCrudRepo struct {
	Db *sql.DB
}

// GetNextCopyFilename returns the next available filename for a duplicate upload by the same user
func (r *FileCrudRepo) GetNextCopyFilename(username, baseFilename string) (string, error) {
	ext := ""
	name := baseFilename
	if dot := strings.LastIndex(baseFilename, "."); dot != -1 {
		ext = baseFilename[dot:]
		name = baseFilename[:dot]
	}
	var maxCopy int
	rows, err := r.Db.Query(`SELECT filename FROM user_files WHERE username = $1 AND filename LIKE $2 || '_copy%'`, username, name)
	if err != nil {
		return "", err
	}
	defer rows.Close()
	for rows.Next() {
		var fname string
		if err := rows.Scan(&fname); err == nil {
			// Match pattern: name_copy(n)
			var n int
			_, scanErr := fmt.Sscanf(fname, name+"_copy(%d)"+ext, &n)
			if scanErr == nil && n > maxCopy {
				maxCopy = n
			}
		}
	}
	return fmt.Sprintf("%s_copy(%d)%s", name, maxCopy+1, ext), nil
}

func (r *FileCrudRepo) RenameFile(fileId string, newName string, username string) error {
	// Get current filename for extension
	var currentFilename string
	err := r.Db.QueryRow("SELECT filename FROM user_files WHERE file_id = $1 AND username = $2 AND permission = 'owner'", fileId, username).Scan(&currentFilename)
	if err != nil {
		return err
	}
	// Extract extension
	ext := ""
	if dot := len(currentFilename) - 1 - len(currentFilename[:len(currentFilename)-1]); dot >= 0 {
		for i := len(currentFilename) - 1; i >= 0; i-- {
			if currentFilename[i] == '.' {
				ext = currentFilename[i:]
				break
			}
		}
	}
	// If no extension, just use newName
	finalName := newName
	if ext != "" {
		finalName = newName + ext
	}
	// Update filename in user_files
	res, err := r.Db.Exec("UPDATE user_files SET filename = $1 WHERE file_id = $2 AND username = $3 AND permission = 'owner'", finalName, fileId, username)
	if err != nil {
		return err
	}
	rowsAffected, err := res.RowsAffected()
	if err != nil || rowsAffected == 0 {
		return sql.ErrNoRows
	}
	// Optionally update in file_metadata if needed (not recommended for deduplication)
	return nil
}

func (r *FileCrudRepo) DeleteFile(fileId string, username string) error {
	// Check if user is owner/uploader
	var permission string
	err := r.Db.QueryRow("SELECT permission FROM user_files WHERE file_id = $1 AND username = $2", fileId, username).Scan(&permission)
	if err != nil {
		return err
	}
	if permission != "owner" {
		return sql.ErrNoRows // Not allowed to delete
	}
	// Remove user_files record
	_, err = r.Db.Exec("DELETE FROM user_files WHERE file_id = $1 AND username = $2 AND permission = 'owner'", fileId, username)
	if err != nil {
		return err
	}
	// Check reference count and get file path from file_metadata
	var refCount int
	var filePath string
	err = r.Db.QueryRow("SELECT reference_count, path FROM file_metadata WHERE sha256 = $1", fileId).Scan(&refCount, &filePath)
	if err != nil {
		return err
	}
	if refCount > 1 {
		// Just decrement reference_count
		_, err = r.Db.Exec("UPDATE file_metadata SET reference_count = reference_count - 1 WHERE sha256 = $1", fileId)
		return err
	} else {
		// Delete metadata and physical file
		_, err = r.Db.Exec("DELETE FROM file_metadata WHERE sha256 = $1", fileId)
		if err != nil {
			return err
		}
		// Delete physical file from storage
		if filePath != "" {
			if removeErr := os.Remove(filePath); removeErr != nil {
				// Optionally log error, but don't fail DB transaction
			}
		}
	}
	return nil
}

func (r *FileCrudRepo) DeleteFileByFilename(username, filename string) error {
	// Find the file_id for this user and filename
	var fileId string
	err := r.Db.QueryRow("SELECT file_id FROM user_files WHERE username = $1 AND filename = $2 AND permission = 'owner'", username, filename).Scan(&fileId)
	if err != nil {
		return err
	}
	// Remove user_files record for this filename
	_, err = r.Db.Exec("DELETE FROM user_files WHERE username = $1 AND filename = $2 AND permission = 'owner'", username, filename)
	if err != nil {
		return err
	}
	// Check reference count and get file path from file_metadata
	var refCount int
	var filePath string
	err = r.Db.QueryRow("SELECT reference_count, path FROM file_metadata WHERE sha256 = $1", fileId).Scan(&refCount, &filePath)
	if err != nil {
		return err
	}
	if refCount > 1 {
		// Just decrement reference_count
		_, err = r.Db.Exec("UPDATE file_metadata SET reference_count = reference_count - 1 WHERE sha256 = $1", fileId)
		return err
	} else {
		// Delete metadata and physical file
		_, err = r.Db.Exec("DELETE FROM file_metadata WHERE sha256 = $1", fileId)
		if err != nil {
			return err
		}
		// Delete physical file from storage
		if filePath != "" {
			if removeErr := os.Remove(filePath); removeErr != nil {
				// Optionally log error, but don't fail DB transaction
			}
		}
	}
	return nil
}

// GetUserStorageUsedMB returns total storage used by a user in MB
func (r *FileCrudRepo) GetUserStorageUsedMB(username string) (float64, error) {
	var totalBytes float64
	query := `SELECT COALESCE(SUM(fm.file_size), 0) FROM user_files uf JOIN file_metadata fm ON uf.file_id = fm.sha256 WHERE uf.username = $1`
	err := r.Db.QueryRow(query, username).Scan(&totalBytes)
	if err != nil {
		return 0, err
	}
	return totalBytes / (1024 * 1024), nil // Convert bytes to MB
}
