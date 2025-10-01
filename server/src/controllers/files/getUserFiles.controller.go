package files

import (
	"backend/src/repos"
	"backend/src/utils"
	"database/sql"
	"net/http"
)

// OwnedFilesHandler returns files owned by the user (permission = 'owner')
// @Summary List files owned by user
// @Description Returns files where the user has 'owner' permission
// @Tags file
// @Produce json
// @Param username query string true "Username to list owned files for"
// @Success 200 {array} dto.UserFile "List of owned files"
// @Failure 400 {object} utils.APIError "Missing username"
// @Failure 500 {object} utils.APIError "Internal server error"
// @Router /api/v1/file/owned [get]
func OwnedFilesHandler(w http.ResponseWriter, r *http.Request) {
	username, ok := utils.GetUsernameFromContext(r.Context())
	if !ok || username == "" {
		utils.WriteAPIError(w, http.StatusUnauthorized, "Unauthorized", "Username not found in token/context")
		return
	}
	db := utils.GetDB()
	fileCrudRepo := repos.FileCrudRepo{Db: db}
	rows, err := fileCrudRepo.QueryOwnedFilesRows(username)
	if err != nil {
		utils.WriteAPIError(w, http.StatusInternalServerError, "Failed to fetch owned files", err.Error())
		return
	}
	defer rows.Close()
	var files []map[string]interface{}
	for rows.Next() {
		var id int
		var uname, fileId, filename, permission string
		var path sql.NullString
		var createdAt string
		if err := rows.Scan(&id, &uname, &fileId, &filename, &permission, &path, &createdAt); err != nil {
			utils.WriteAPIError(w, http.StatusInternalServerError, "Failed to scan row", err.Error())
			return
		}
		// Query file_size from file_metadata using repo method
		fileSizeBytes, err := fileCrudRepo.GetFileSizeBySha256(fileId)
		if err != nil {
			fileSizeBytes = 0 // If not found, default to 0
		}

		fileObj := map[string]interface{}{
			"id":         id,
			"username":   uname,
			"fileId":     fileId,
			"filename":   filename,
			"permission": permission,
			"path": func() string {
				if path.Valid {
					return path.String
				} else {
					return "/"
				}
			}(),
			"created_at": createdAt,
		}
		if fileSizeBytes > 0 {
			fileObj["size_mb"] = fileSizeBytes / (1024 * 1024)
		}
		files = append(files, fileObj)
	}
	utils.WriteAPIResponse(w, http.StatusOK, "Owned files fetched", files)
}
