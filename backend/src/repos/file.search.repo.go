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
		filters = append(filters, fmt.Sprintf("uf.filename ILIKE '%%' || $%d || '%%'", idx))
		args = append(args, params.Filename)
		idx++
	}
	if params.MimeType != "" {
		filters = append(filters, fmt.Sprintf("fm.mime_type = $%d", idx))
		args = append(args, params.MimeType)
		idx++
	}
	if params.MinSize > 0 {
		filters = append(filters, fmt.Sprintf("fm.file_size >= $%d", idx))
		args = append(args, params.MinSize)
		idx++
	}
	if params.MaxSize > 0 {
		filters = append(filters, fmt.Sprintf("fm.file_size <= $%d", idx))
		args = append(args, params.MaxSize)
		idx++
	}
	if params.StartDate != "" {
		filters = append(filters, fmt.Sprintf("uf.created_at >= $%d", idx))
		args = append(args, params.StartDate)
		idx++
	}
	if params.EndDate != "" {
		filters = append(filters, fmt.Sprintf("uf.created_at <= $%d", idx))
		args = append(args, params.EndDate)
		idx++
	}
	if params.Uploader != "" {
		filters = append(filters, fmt.Sprintf("uf.username = $%d", idx))
		args = append(args, params.Uploader)
		idx++
	}
	where := ""
	if len(filters) > 0 {
		where = "WHERE " + strings.Join(filters, " AND ")
	}

	// Handle limit and offset
	limitClause := ""
	if params.Limit > 0 {
		limitClause = fmt.Sprintf(" LIMIT $%d", idx)
		args = append(args, params.Limit)
		idx++
	}
	offsetClause := ""
	if params.Offset > 0 {
		offsetClause = fmt.Sprintf(" OFFSET $%d", idx)
		args = append(args, params.Offset)
		idx++
	}

	query := fmt.Sprintf("SELECT uf.filename, fm.mime_type, fm.sha256, fm.path, fm.reference_id, fm.reference_count, fm.file_size, uf.created_at, uf.username FROM file_metadata fm JOIN user_files uf ON fm.sha256 = uf.file_id %s ORDER BY uf.created_at DESC%s%s", where, limitClause, offsetClause)

	rows, err := r.db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var results []dto.FileMeta
	for rows.Next() {
		var meta dto.FileMeta
		if err := rows.Scan(&meta.Filename, &meta.MIMEType, &meta.SHA256, &meta.Path, &meta.ReferenceID, &meta.ReferenceCount, &meta.FileSize, &meta.UploadDate, &meta.Uploader); err != nil {
			return nil, err
		}
		results = append(results, meta)
	}
	return results, nil
}
