package repos

import (
	"database/sql"
	"fmt"
	"os"
	"strings"
)

// GetPublicSharedCount returns the number of files shared in public for a user
func (r *FileCrudRepo) GetPublicSharedCount(username string) (int, error) {
	var count int
	err := r.Db.QueryRow(`SELECT COUNT(*) FROM user_files WHERE username = $1 AND is_public = true`, username).Scan(&count)
	return count, err
}

// GetDownloadCount returns the total download count for user's owned files
func (r *FileCrudRepo) GetDownloadCount(username string) (int, error) {
	var count int
	err := r.Db.QueryRow(`SELECT COALESCE(SUM(download_count), 0) FROM user_files WHERE username = $1 AND permission = 'owner'`, username).Scan(&count)
	return count, err
}

// GetOwnedFileCount returns the number of files owned by a user
func (r *FileCrudRepo) GetOwnedFileCount(username string) (int, error) {
	var count int
	err := r.Db.QueryRow(`SELECT COUNT(*) FROM user_files WHERE username = $1 AND permission = 'owner'`, username).Scan(&count)
	return count, err
}

// GetDuplicateFileCount returns the number of duplicate files for a user (same hash, multiple filenames)
func (r *FileCrudRepo) GetDuplicateFileCount(username string) (int, error) {
	rows, err := r.Db.Query(`SELECT COUNT(*) FROM (SELECT file_id FROM user_files WHERE username = $1 GROUP BY file_id HAVING COUNT(*) > 1) AS dup`, username)
	if err != nil {
		return 0, err
	}
	defer rows.Close()
	var count int
	if rows.Next() {
		rows.Scan(&count)
	}
	return count, nil
}

// GetLargeFileCount returns the number of large files (>10MB) for a user
func (r *FileCrudRepo) GetLargeFileCount(username string) (int, error) {
	var count int
	err := r.Db.QueryRow(`SELECT COUNT(*) FROM user_files uf JOIN file_metadata fm ON uf.file_id = fm.sha256 WHERE uf.username = $1 AND fm.file_size > 10*1024*1024`, username).Scan(&count)
	return count, err
}

// GetStarredFileCount returns the number of starred files for a user
func (r *FileCrudRepo) GetStarredFileCount(username string) (int, error) {
	var count int
	err := r.Db.QueryRow(`SELECT COUNT(*) FROM user_file_info WHERE username = $1 AND starred = true`, username).Scan(&count)
	return count, err
}

// IncrementDownloadCount increments the download_count for a file in user_files
func (r *FileCrudRepo) IncrementDownloadCount(fileId string) error {
	fmt.Printf("Incrementing download count for fileId: %s\n", fileId)
	dot := strings.LastIndex(fileId, ".")
	if dot > 0 {
		fileId = fileId[:dot]
	}
	_, err := r.Db.Exec("UPDATE user_files SET download_count = download_count + 1 WHERE file_id = $1", fileId)
	if err != nil {
		fmt.Printf("Error incrementing download count for fileId %s: %v\n", fileId, err)
	}
	return err
}

// UpsertUserFileInfo inserts or updates a user_file_info record
func (r *FileCrudRepo) UpsertUserFileInfo(username, filename string, tags *string, starred *bool) error {
	// Build upsert query
	setClauses := []string{}
	args := []interface{}{username, filename}
	argIdx := 3
	if tags != nil {
		setClauses = append(setClauses, "tags = $"+fmt.Sprint(argIdx))
		args = append(args, *tags)
		argIdx++
	}
	if starred != nil {
		setClauses = append(setClauses, "starred = $"+fmt.Sprint(argIdx))
		args = append(args, *starred)
		argIdx++
	}
	// Insert if not exists, else update
	query := "INSERT INTO user_file_info (username, filename"
	if tags != nil {
		query += ", tags"
	}
	if starred != nil {
		query += ", starred"
	}
	query += ") VALUES ($1, $2"
	if tags != nil {
		query += ", $3"
	}
	if starred != nil {
		if tags != nil {
			query += ", $4"
		} else {
			query += ", $3"
		}
	}
	query += ") ON CONFLICT (username, filename) DO UPDATE SET " + strings.Join(setClauses, ", ")
	_, err := r.Db.Exec(query, args...)
	return err
}

// GetFileSizeBySha256 returns the file size in bytes for a given sha256
func (r *FileCrudRepo) GetFileSizeBySha256(sha256 string) (float64, error) {
	var fileSize float64
	err := r.Db.QueryRow("SELECT file_size FROM file_metadata WHERE sha256 = $1", sha256).Scan(&fileSize)
	if err != nil {
		return 0, err
	}
	return fileSize, nil
}

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

type FileCrudRepo struct {
	Db *sql.DB
}

// GetFilesUploadedLast24h returns the number of files uploaded by user in last 24 hours
func (r *FileCrudRepo) GetFilesUploadedLast24h(username string) (int, error) {
	var count int
	err := r.Db.QueryRow(`SELECT COUNT(*) FROM user_file_info WHERE username = $1 AND upload_time >= NOW() - INTERVAL '1 day'`, username).Scan(&count)
	return count, err
}

// GetFilesUploadedLastWeek returns the number of files uploaded by user in last 7 days
func (r *FileCrudRepo) GetFilesUploadedLastWeek(username string) (int, error) {
	var count int
	err := r.Db.QueryRow(`SELECT COUNT(*) FROM user_file_info WHERE username = $1 AND upload_time >= NOW() - INTERVAL '7 day'`, username).Scan(&count)
	return count, err
}

// GetFilePathByUsernameAndFilename returns the file path for a given username and filename
func (r *FileCrudRepo) GetFilePathByUsernameAndFilename(username, filename string) (string, error) {
	var filePath string
	err := r.Db.QueryRow("SELECT path FROM user_files WHERE username = $1 AND filename = $2", username, filename).Scan(&filePath)
	if err != nil {
		return "", err
	}
	return filePath, nil
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

func (r *FileCrudRepo) RenameFileByFilename(username, filename, newName string) error {
	// Get current filename for extension
	var currentFilename string
	err := r.Db.QueryRow("SELECT filename FROM user_files WHERE username = $1 AND filename = $2 AND permission = 'owner'", username, filename).Scan(&currentFilename)
	if err != nil {
		return err
	}
	// Extract extension
	ext := ""
	dot := strings.LastIndex(currentFilename, ".")
	if dot != -1 {
		ext = currentFilename[dot:]
	}
	// If newName already has an extension, use as is; else append original extension
	newDot := strings.LastIndex(newName, ".")
	var finalName string
	if ext != "" && (newDot == -1 || newDot == 0 || newDot == len(newName)-1) {
		finalName = newName + ext
	} else {
		finalName = newName
	}
	// Update filename in user_files
	res, err := r.Db.Exec("UPDATE user_files SET filename = $1 WHERE username = $2 AND filename = $3 AND permission = 'owner'", finalName, username, filename)
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
