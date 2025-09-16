// PostgreSQL CREATE TABLE for file_metadata:
//
// CREATE TABLE file_metadata (
//
//	id SERIAL PRIMARY KEY,
//	filename VARCHAR(255) NOT NULL,
//	mime_type VARCHAR(128) NOT NULL,
//	sha256 VARCHAR(64) NOT NULL,
//	path TEXT NOT NULL,
//	reference_id VARCHAR(64) NOT NULL,
//	reference_count INT DEFAULT 1,
//	file_size FLOAT NOT NULL
//
// );

package repos

import (
	"backend/src/dto"
	"backend/src/utils"
	"database/sql"
	"strings"
)

type FileRepo struct {
	db *sql.DB
}

type FileRepository interface {
	SaveFileMeta(meta dto.FileMeta) error
	GetFileAnalytics() (uniqueUploaders int, logicalFiles int, savedSize float64, err error)
}

func NewFileRepo(db *sql.DB) *FileRepo {
	return &FileRepo{db: db}
}

func (r *FileRepo) SaveFileMeta(meta dto.FileMeta) error {
	// Check if uploader exists in users table (trim whitespace)
	var uploaderExists bool
	uploader := meta.Uploader
	if len(uploader) > 0 {
		uploader = strings.TrimSpace(uploader)
	}
	err := utils.QueryRow(r.db, "SELECT EXISTS(SELECT 1 FROM users WHERE LOWER(username) = LOWER($1))", []interface{}{&uploaderExists}, uploader)

	if err != nil {
		return err
	}
	if !uploaderExists {
		return sql.ErrNoRows // or fmt.Errorf("uploader does not exist")
	}

	var count int
	err = utils.QueryRow(r.db, "SELECT reference_count FROM file_metadata WHERE sha256 = $1", []interface{}{&count}, meta.SHA256)
	if err == nil {
		// File exists, increment reference_count
		_, err = utils.ExecQuery(r.db, "UPDATE file_metadata SET reference_count = reference_count + 1 WHERE sha256 = $1", meta.SHA256)
		return err
	} else if err == sql.ErrNoRows {
		// File does not exist, insert new metadata
		query := `INSERT INTO file_metadata (filename, mime_type, sha256, path, reference_id, reference_count, file_size)
			 VALUES ($1, $2, $3, $4, $5, $6, $7)`
		_, err = utils.ExecQuery(r.db, query,
			meta.Filename,
			meta.MIMEType,
			meta.SHA256,
			meta.Path,
			meta.ReferenceID,
			meta.ReferenceCount,
			meta.FileSize,
		)
		return err
	}
	// Other error
	return err
}

func (r *FileRepo) GetFileAnalytics() (uniqueUploaders int, logicalFiles int, savedSize float64, err error) {
	// Remove uploader from query and logic
	logicalFiles = 0
	savedSize = 0

	query := "SELECT reference_id, reference_count, file_size FROM file_metadata"
	refSet := make(map[string]struct{})
	err = utils.QueryRows(r.db, query, func(rows *sql.Rows) error {
		var referenceID string
		var referenceCount int
		var fileSize float64
		if err := rows.Scan(&referenceID, &referenceCount, &fileSize); err != nil {
			return err
		}
		refSet[referenceID] = struct{}{}
		logicalFiles += referenceCount
		if referenceCount > 1 {
			savedSize += fileSize * float64(referenceCount-1)
		}
		return nil
	})
	if err != nil {
		return 0, 0, 0, err
	}
	uniqueUploaders = len(refSet)
	return uniqueUploaders, logicalFiles, savedSize, nil
}
