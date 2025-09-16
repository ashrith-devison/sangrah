package repos

import (
	"backend/src/dto"
	"database/sql"
	"fmt"
	"strings"
)

type FileSearchRepo struct {
	db *sql.DB
}

type FileSearchRepository interface {
	SearchFiles(params dto.FileSearchParams) ([]dto.FileMeta, error)
}

func NewFileSearchRepo(db *sql.DB) *FileSearchRepo {
	return &FileSearchRepo{db: db}
}

func (r *FileSearchRepo) SearchFiles(params dto.FileSearchParams) ([]dto.FileMeta, error) {
	var filters []string
	var args []interface{}
	idx := 1

	if params.Filename != "" {
		filters = append(filters, fmt.Sprintf("filename ILIKE '%%' || $%d || '%%'", idx))
		args = append(args, params.Filename)
		idx++
	}
	if params.MimeType != "" {
		filters = append(filters, fmt.Sprintf("mime_type = $%d", idx))
		args = append(args, params.MimeType)
		idx++
	}
	if params.MinSize > 0 {
		filters = append(filters, fmt.Sprintf("file_size >= $%d", idx))
		args = append(args, params.MinSize)
		idx++
	}
	if params.MaxSize > 0 {
		filters = append(filters, fmt.Sprintf("file_size <= $%d", idx))
		args = append(args, params.MaxSize)
		idx++
	}
	if params.StartDate != "" {
		filters = append(filters, fmt.Sprintf("upload_date >= $%d", idx))
		args = append(args, params.StartDate)
		idx++
	}
	if params.EndDate != "" {
		filters = append(filters, fmt.Sprintf("upload_date <= $%d", idx))
		args = append(args, params.EndDate)
		idx++
	}
	where := ""
	if len(filters) > 0 {
		where = "WHERE " + strings.Join(filters, " AND ")
	}
	query := fmt.Sprintf("SELECT filename, mime_type, sha256, path, reference_id, reference_count, file_size FROM file_metadata %s LIMIT $%d OFFSET $%d", where, idx, idx+1)
	args = append(args, params.Limit, params.Offset)

	rows, err := r.db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var results []dto.FileMeta
	for rows.Next() {
		var meta dto.FileMeta
		if err := rows.Scan(&meta.Filename, &meta.MIMEType, &meta.SHA256, &meta.Path, &meta.ReferenceID, &meta.ReferenceCount, &meta.FileSize); err != nil {
			return nil, err
		}
		results = append(results, meta)
	}
	return results, nil
}
