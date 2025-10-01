package files

import (
	"backend/src/repos"
	"backend/src/utils"
	"encoding/json"
	"net/http"
)

// API to mark a file as starred or update its tag
// @Summary Mark file as starred or update tag
// @Description Updates starred or tag for a file in user_file_info
// @Tags file
// @Accept json
// @Produce json
// @Param payload body map[string]interface{} true "Payload: username, filename, starred, tags"
// @Success 200 {object} utils.APIResponse "File updated"
// @Failure 400 {object} utils.APIError "Missing fields"
// @Failure 500 {object} utils.APIError "Internal server error"
// @Router /api/v1/file/update-info [post]
func UpdateFileInfoHandler(w http.ResponseWriter, r *http.Request) {
	var payload struct {
		Username string `json:"username"`
		Filename string `json:"filename"`
		Starred  *bool  `json:"starred"`
		Tags     string `json:"tags"`
	}
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		utils.WriteAPIError(w, http.StatusBadRequest, "Invalid request payload", err.Error())
		return
	}
	if payload.Username == "" || payload.Filename == "" {
		utils.WriteAPIError(w, http.StatusBadRequest, "Missing required fields", "username, filename required")
		return
	}
	db := utils.GetDB()
	fileCrudRepo := repos.NewFileCrudRepo(db)
	var tagsPtr *string
	if payload.Tags != "" {
		tagsPtr = &payload.Tags
	}
	err := fileCrudRepo.UpsertUserFileInfo(payload.Username, payload.Filename, tagsPtr, payload.Starred)
	if err != nil {
		utils.WriteAPIError(w, http.StatusInternalServerError, "Failed to upsert file info", err.Error())
		return
	}
	utils.WriteAPIResponse(w, http.StatusOK, "File info upserted", nil)
}

// Get files owned by a user from user_file_info
// @Summary List files owned by user (extended info)
// @Description Returns files from user_file_info where username matches
// @Tags file
// @Produce json
// @Param username query string true "Username to list owned files for"
// @Success 200 {array} map[string]interface{} "List of owned files"
// @Failure 400 {object} utils.APIError "Missing username"
// @Failure 500 {object} utils.APIError "Internal server error"
// @Router /api/v1/file/owned-info [get]
func OwnedFileInfoHandler(w http.ResponseWriter, r *http.Request) {
	username := r.URL.Query().Get("username")
	if username == "" {
		utils.WriteAPIError(w, http.StatusBadRequest, "Missing username", "Username required")
		return
	}
	db := utils.GetDB()
	fileCrudRepo := repos.NewFileCrudRepo(db)
	rows, err := fileCrudRepo.QueryOwnedFileInfoRows(username)
	if err != nil {
		utils.WriteAPIError(w, http.StatusInternalServerError, "Failed to fetch files", err.Error())
		return
	}
	defer rows.Close()
	var files []map[string]interface{}
	for rows.Next() {
		var id int
		var uname, filename, tags, permission, shaFileId string
		var uploadTime string
		var starred bool
		if err := rows.Scan(&id, &uname, &filename, &tags, &uploadTime, &starred, &permission, &shaFileId); err != nil {
			utils.WriteAPIError(w, http.StatusInternalServerError, "Failed to scan row", err.Error())
			return
		}
		files = append(files, map[string]interface{}{
			"id":          id,
			"username":    uname,
			"filename":    filename,
			"tags":        tags,
			"upload_time": uploadTime,
			"starred":     starred,
			"permission":  permission,
			"sha_file_id": shaFileId,
		})
	}
	utils.WriteAPIResponse(w, http.StatusOK, "Owned file info fetched", files)
}
