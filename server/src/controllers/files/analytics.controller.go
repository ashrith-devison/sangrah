package files

import (
	"backend/src/repos"
	"backend/src/utils"
	"net/http"
	"os"
	"strings"
)

// GetUserStorageQuotaHandler returns the storage quota used by a user
// @Summary Get user storage quota used
// @Description Returns the storage quota used by the user in MB
// @Tags file
// @Produce json
// @Param username query string true "Username to check storage quota for"
// @Success 200 {object} map[string]interface{} "Storage quota used"
// @Failure 400 {object} utils.APIError "Missing username"
// @Failure 500 {object} utils.APIError "Internal server error"
// @Router /api/v1/file/storage-quota [get]
func GetUserStorageQuotaHandler(w http.ResponseWriter, r *http.Request) {
	username := r.URL.Query().Get("username")
	if username == "" {
		utils.WriteAPIError(w, http.StatusBadRequest, "Missing username", "Username required")
		return
	}
	db, err := utils.ConnectPostgres()
	if err != nil {
		utils.WriteAPIError(w, http.StatusInternalServerError, "Failed to connect to DB", err.Error())
		return
	}
	defer db.Close()
	fileCrudRepo := repos.FileCrudRepo{Db: db}
	usedMB, err := fileCrudRepo.GetUserStorageUsedMB(username)
	if err != nil {
		utils.WriteAPIError(w, http.StatusInternalServerError, "Failed to get storage usage", err.Error())
		return
	}
	utils.WriteAPIResponse(w, http.StatusOK, "User storage quota fetched", map[string]interface{}{
		"username": username,
		"usedMB":   usedMB,
	})
}

// AnalyticsHandler serves analytics about file storage and uploads
// @Summary File storage analytics
// @Description Returns analytics: user count, file count, deduplication savings, etc.
// @Tags analytics
// @Produce json
// @Success 200 {object} utils.APIResponse "Analytics data"
// @Router /api/v1/file/storage/analytics [get]
func AnalyticsHandler(w http.ResponseWriter, r *http.Request) {
	db, err := utils.ConnectPostgres()
	if err != nil {
		utils.WriteAPIError(w, http.StatusInternalServerError, "Failed to connect to DB", err.Error())
		return
	}
	defer db.Close()
	fileCrudRepo := repos.FileCrudRepo{Db: db}
	fileRepo := repos.NewFileRepo(db)
	logicalFiles, uniqueUploaders, err := fileCrudRepo.GetLogicalFilesAndUniqueUploaders()
	if err != nil {
		utils.WriteAPIError(w, http.StatusInternalServerError, "Failed to fetch logical files and uploaders", err.Error())
		return
	}
	totalStorageBytes, spaceSavedBytes, err := fileRepo.GetDeduplicationStats()
	if err != nil {
		utils.WriteAPIError(w, http.StatusInternalServerError, "Failed to fetch deduplication stats", err.Error())
		return
	}
	// Physical file count and size from storage dir
	storageDir := "storage"
	physicalFiles := 0
	physicalSize := float64(0)
	entries, err := os.ReadDir(storageDir)
	if err == nil {
		for _, entry := range entries {
			if !entry.IsDir() {
				physicalFiles++
				info, err := entry.Info()
				if err == nil {
					physicalSize += float64(info.Size())
				}
			}
		}
	}
	analytics := map[string]interface{}{
		"unique_uploaders":                     uniqueUploaders,
		"logical_files":                        logicalFiles,
		"physical_files":                       physicalFiles,
		"total_storage_bytes":                  totalStorageBytes,
		"total_physical_space_occupied(in Mb)": physicalSize / (1024 * 1024),
		"space_saved_bytes":                    spaceSavedBytes,
		"space_saved_mb":                       spaceSavedBytes / (1024 * 1024),
	}
	utils.WriteAPIResponse(w, http.StatusOK, "Storage analytics", analytics)
}

// UserStatsHandler returns file stats for a given username
// @Summary Get file stats for a user
// @Description Returns stats: number of owned files, duplicate files, large files, starred files, total storage used
// @Tags file
// @Produce json
// @Param username query string true "Username to get stats for"
// @Success 200 {object} map[string]interface{} "User file stats"
// @Failure 400 {object} utils.APIError "Missing username"
// @Failure 500 {object} utils.APIError "Internal server error"
// @Router /api/v1/file/stats [get]
func UserStatsHandler(w http.ResponseWriter, r *http.Request) {
	usernameOrEmail := r.URL.Query().Get("username")
	if usernameOrEmail == "" {
		utils.WriteAPIError(w, http.StatusBadRequest, "Missing username", "Username or email required")
		return
	}
	db, err := utils.ConnectPostgres()
	if err != nil {
		utils.WriteAPIError(w, http.StatusInternalServerError, "Failed to connect to DB", err.Error())
		return
	}
	defer db.Close()
	var username string
	// If input contains '@', treat as email and look up username
	if strings.Contains(usernameOrEmail, "@") {
		err := db.QueryRow("SELECT username FROM users WHERE email = $1", usernameOrEmail).Scan(&username)
		if err != nil {
			utils.WriteAPIError(w, http.StatusBadRequest, "Invalid email", "No user found for this email")
			return
		}
	} else {
		username = usernameOrEmail
	}
	fileCrudRepo := repos.FileCrudRepo{Db: db}

	// Number of files shared in public
	publicSharedCount, err := fileCrudRepo.GetPublicSharedCount(username)
	if err != nil {
		publicSharedCount = 0
	}
	// Total download count for user's owned files
	downloadCount, err := fileCrudRepo.GetDownloadCount(username)
	if err != nil {
		downloadCount = 0
	}

	// Number of owned files
	ownedCount, err := fileCrudRepo.GetOwnedFileCount(username)
	if err != nil {
		ownedCount = 0
	}

	// Number of duplicate files
	duplicateCount, err := fileCrudRepo.GetDuplicateFileCount(username)
	if err != nil {
		duplicateCount = 0
	}

	// Number of large files (>10MB)
	largeFilesCount, err := fileCrudRepo.GetLargeFileCount(username)
	if err != nil {
		largeFilesCount = 0
	}

	// Number of starred files
	starredCount, err := fileCrudRepo.GetStarredFileCount(username)
	if err != nil {
		starredCount = 0
	}

	// Total storage used
	usedMB, err := fileCrudRepo.GetUserStorageUsedMB(username)
	if err != nil {
		usedMB = 0
	}

	// Files uploaded in last 24 hours
	last24hCount, err := fileCrudRepo.GetFilesUploadedLast24h(username)
	if err != nil {
		last24hCount = 0
	}

	// Files uploaded in last 1 week
	lastWeekCount, err := fileCrudRepo.GetFilesUploadedLastWeek(username)
	if err != nil {
		lastWeekCount = 0
	}

	stats := map[string]interface{}{
		"owned_files":         ownedCount,
		"duplicate_files":     duplicateCount,
		"large_files":         largeFilesCount,
		"starred_files":       starredCount,
		"storage_used_mb":     usedMB,
		"uploaded_last_24h":   last24hCount,
		"uploaded_last_week":  lastWeekCount,
		"download_count":      downloadCount,
		"public_shared_files": publicSharedCount,
	}
	utils.WriteAPIResponse(w, http.StatusOK, "User file stats fetched", stats)
}
