package files

import (
	"backend/src/config"
	"backend/src/dto"
	"backend/src/repos"
	"backend/src/servicesImpl"
	"backend/src/utils"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"

	"go.uber.org/zap"
)

// UserFileCrudService interface for testable user file logic
type UserFileCrudService interface {
	UserFileExists(username, hash string) (bool, error)
	GetNextCopyFilename(username, filename string) (string, error)
	InsertUserFileWithPath(username, hash, filename, role, folderPath string) error
}

// realUserFileCrudService implements UserFileCrudService using the real service
type realUserFileCrudService struct {
	inner *servicesImpl.UserFileCrudService
}

func (r realUserFileCrudService) UserFileExists(username, hash string) (bool, error) {
	return r.inner.Repo.UserFileExists(username, hash)
}
func (r realUserFileCrudService) GetNextCopyFilename(username, filename string) (string, error) {
	return r.inner.Repo.GetNextCopyFilename(username, filename)
}
func (r realUserFileCrudService) InsertUserFileWithPath(username, hash, filename, role, folderPath string) error {
	return r.inner.InsertUserFileWithPath(username, hash, filename, role, folderPath)
}

// UserFileCrudServiceImpl is the injectable service (can be replaced in tests)
var UserFileCrudServiceImpl func(cfg *config.Config) UserFileCrudService = func(cfg *config.Config) UserFileCrudService {
	return realUserFileCrudService{servicesImpl.NewUserFileCrudService(cfg)}
}

// FileUploader interface for upload logic (for testability)
type FileUploader interface {
	CoreUpload(file io.ReadSeeker, filename string, r *http.Request) (string, string, string, string, error)
}

// Default implementation uses servicesImpl.CoreUpload
type realFileUploader struct{}

func (realFileUploader) CoreUpload(file io.ReadSeeker, filename string, r *http.Request) (string, string, string, string, error) {
	return servicesImpl.CoreUpload(file, filename, r)
}

var FileUploaderImpl FileUploader = realFileUploader{}

// FileCrudRepo interface for testable DB logic
// Injectable DB getter for testability
var GetDBForUploadAndView = utils.GetDB

type FileCrudRepo interface {
	GetUserStorageUsedMB(username string) (float64, error)
	// Add other methods as needed for your handler
}

// realFileCrudRepo implements FileCrudRepo using the real repo
type realFileCrudRepo struct{}

func (realFileCrudRepo) GetUserStorageUsedMB(username string) (float64, error) {
	return repos.NewFileCrudRepo(GetDBForUploadAndView()).GetUserStorageUsedMB(username)
}

// FileCrudRepoImpl is the injectable repo (can be replaced in tests)
var FileCrudRepoImpl FileCrudRepo = realFileCrudRepo{}

// FileMetaUploadHandler handles file upload with metadata
// @Summary Upload file with metadata
// @Summary Upload one or more files with metadata
// @Description Accepts multiple files and metadata, saves all to database. Supports optional folder path.
// @Tags file
// @Accept multipart/form-data
// @Produce json
// @Param file formData file true "Files to upload (multiple allowed)"
// @Param uploader formData string true "Uploader (username)"
// @Param path formData string false "Folder path (optional, defaults to /home)"
// @Success 201 {object} utils.APIResponse "Files and metadata uploaded"
// @Failure 400 {object} utils.APIError "Bad request"
// @Failure 500 {object} utils.APIError "Internal server error"
// @Router /api/v1/file/upload-meta [post]
func FileMetaUploadHandler(w http.ResponseWriter, r *http.Request) {
	requestID := r.Header.Get("X-Request-ID")
	if requestID == "" {
		requestID = "filemeta-" + fmt.Sprintf("%d", os.Getpid())
	}
	FileLogger.Info("[UPLOAD-META] Request", zap.String("requestID", requestID), zap.String("remoteAddr", r.RemoteAddr))
	err := r.ParseMultipartForm(10 << 20)
	if err != nil {
		FileLogger.Error("Failed to parse form", zap.String("requestID", requestID), zap.Error(err))
		utils.WriteAPIError(w, http.StatusBadRequest, "Failed to parse form", err.Error())
		return
	}

	uploader := r.FormValue("uploader")
	if uploader == "" {
		FileLogger.Error("Missing uploader", zap.String("requestID", requestID))
		utils.WriteAPIError(w, http.StatusBadRequest, "Missing uploader", "uploader (username) required")
		return
	}

	files := r.MultipartForm.File["file"]
	if len(files) == 0 {
		FileLogger.Error("No files found in request", zap.String("requestID", requestID))
		utils.WriteAPIError(w, http.StatusBadRequest, "No files found in request", "No files uploaded")
		return
	}
	cfg, err := config.LoadConfig()
	if err != nil {
		utils.WriteAPIError(w, http.StatusInternalServerError, "Failed to load config", err.Error())
		return
	}
	username := r.FormValue("username")
	if username == "" {
		username = uploader
	}
	if username == "" {
		FileLogger.Error("Missing username", zap.String("requestID", requestID))
		utils.WriteAPIError(w, http.StatusBadRequest, "Missing username", "Username required for quota check")
		return
	}
	usedMB, err := FileCrudRepoImpl.GetUserStorageUsedMB(username)
	if err != nil {
		utils.WriteAPIError(w, http.StatusInternalServerError, "Failed to get storage usage", err.Error())
		return
	}
	var uploadedFiles []map[string]interface{}
	for _, handler := range files {
		file, err := handler.Open()
		if err != nil {
			FileLogger.Error("File open error", zap.String("requestID", requestID), zap.String("filename", handler.Filename), zap.Error(err))
			continue
		}
		defer file.Close()
		if usedMB+float64(handler.Size)/(1024*1024) > float64(cfg.StorageQuotaMB) {
			FileLogger.Error("Storage quota exceeded", zap.String("requestID", requestID), zap.String("filename", handler.Filename))
			uploadedFiles = append(uploadedFiles, map[string]interface{}{
				"filename": handler.Filename,
				"error":    "Storage quota exceeded",
			})
			continue
		}
		filename, mimetype, hash, savedPath, err := FileUploaderImpl.CoreUpload(file, handler.Filename, r)
		if err != nil {
			FileLogger.Error("Failed to upload file", zap.String("requestID", requestID), zap.String("filename", handler.Filename), zap.Error(err))
			uploadedFiles = append(uploadedFiles, map[string]interface{}{
				"filename": handler.Filename,
				"error":    err.Error(),
			})
			continue
		}
		log.Print(uploader)
		err = FileService.StoreFileMetadata(filename, mimetype, hash, savedPath, uploader)
		if err != nil {
			FileLogger.Error("Failed to save file metadata", zap.String("requestID", requestID), zap.Error(err))
			uploadedFiles = append(uploadedFiles, map[string]interface{}{
				"filename": handler.Filename,
				"error":    err.Error(),
			})
			continue
		}
		// Insert corrected filename into user_files
		originalExt := filepath.Ext(handler.Filename)
		correctedFilename := handler.Filename
		if originalExt != "" && filename != hash {
			correctExt := filepath.Ext(filename)
			if correctExt != "" && correctExt != originalExt {
				correctedFilename = strings.TrimSuffix(handler.Filename, originalExt) + correctExt
			}
		}
		userFileCrudService := UserFileCrudServiceImpl(cfg)
		userFileExists, err := userFileCrudService.UserFileExists(username, hash)
		if err != nil {
			FileLogger.Error("Failed to check if user file exists", zap.String("requestID", requestID), zap.Error(err))
			uploadedFiles = append(uploadedFiles, map[string]interface{}{
				"filename": handler.Filename,
				"error":    err.Error(),
			})
			continue
		}
		if userFileExists {
			correctedFilename, _ = userFileCrudService.GetNextCopyFilename(username, handler.Filename)
		}
		folderPath := r.FormValue("path")
		if folderPath == "" {
			folderPath = "/home"
		}
		err = userFileCrudService.InsertUserFileWithPath(username, hash, correctedFilename, "owner", folderPath)
		if err != nil {
			FileLogger.Error("Failed to insert user_file with path", zap.String("requestID", requestID), zap.Error(err))
			uploadedFiles = append(uploadedFiles, map[string]interface{}{
				"filename": handler.Filename,
				"error":    err.Error(),
			})
			continue
		}
		FileLogger.Info("File and metadata uploaded", zap.String("requestID", requestID), zap.String("filename", handler.Filename), zap.String("sha256", hash), zap.String("uploader", uploader))
		uploadedFiles = append(uploadedFiles, map[string]interface{}{
			"message":  "File and metadata uploaded successfully.",
			"filename": correctedFilename,
			"sha256":   hash,
		})
	}
	utils.WriteAPIResponse(w, http.StatusCreated, "Files and metadata processed", uploadedFiles)
}

// @Summary Get file by path
// @Description Serves a file from storage by its path
// @Tags file
// @Produce application/octet-stream
// @Param path query string true "File path relative to storage/"
// @Success 200 {file} file "File served successfully"
// @Failure 400 {object} utils.APIError "Bad request"
// @Failure 404 {object} utils.APIError "File not found"
// @Router /api/v1/file/path/download [get]
func ServeFileByPathHandler(w http.ResponseWriter, r *http.Request) {
	path := r.URL.Query().Get("path")
	requestID := r.Header.Get("X-Request-ID")
	if requestID == "" {
		requestID = "file-download-" + fmt.Sprintf("%d", os.Getpid())
	}
	FileLogger.Info("[DOWNLOAD] Request", zap.String("requestID", requestID), zap.String("remoteAddr", r.RemoteAddr), zap.String("path", path))
	if path == "" {
		FileLogger.Error("Missing file path", zap.String("requestID", requestID), zap.String("remoteAddr", r.RemoteAddr))
		utils.WriteAPIError(w, http.StatusBadRequest, "Missing file path", "No path provided")
		return
	}
	cleanPath := filepath.Clean(path)
	if strings.Contains(cleanPath, "..") {
		FileLogger.Error("Path traversal attempt", zap.String("requestID", requestID), zap.String("remoteAddr", r.RemoteAddr), zap.String("path", path))
		utils.WriteAPIError(w, http.StatusBadRequest, "Invalid file path", "Path traversal detected")
		return
	}
	absPath := filepath.Join("storage", cleanPath)
	fileMeta, err := FileService.GetFileByPath(absPath)
	if err != nil {
		FileLogger.Error("File not found", zap.String("requestID", requestID), zap.String("remoteAddr", r.RemoteAddr), zap.String("path", absPath), zap.Error(err))
		utils.WriteAPIError(w, http.StatusNotFound, "File not found", err.Error())
		return
	}
	file, err := os.Open(fileMeta.Path)
	if err != nil {
		FileLogger.Error("Failed to open file", zap.String("requestID", requestID), zap.String("remoteAddr", r.RemoteAddr), zap.String("path", fileMeta.Path), zap.Error(err))
		utils.WriteAPIError(w, http.StatusInternalServerError, "Failed to open file", err.Error())
		return
	}
	defer file.Close()

	// Increment download_count in user_files for this file using repo
	db2 := GetDBForUploadAndView()
	fileCrudRepo := repos.NewFileCrudRepo(db2)
	// If SHA256 is missing, look it up from DB using filename and username
	fmt.Printf("logger: %v\n", fileMeta)
	if fileMeta.SHA256 == "" {
		var sha256 string
		username := r.URL.Query().Get("username")
		baseFilename := filepath.Base(fileMeta.Filename)
		fmt.Printf("[DEBUG] DB lookup: fileMeta.Filename=%s, baseFilename=%s\n", fileMeta.Filename, baseFilename)
		var repoErr error
		if username != "" {
			sha256, repoErr = fileCrudRepo.GetFileIdByFilenameAndUsername(baseFilename, username)
		} else {
			sha256, repoErr = fileCrudRepo.GetFileIdByFilenameAnyUser(baseFilename)
		}
		fmt.Printf("[DEBUG] DB lookup for SHA256: filename=%s, username=%s, result=%s, err=%v\n", baseFilename, username, sha256, repoErr)
		if repoErr == nil && sha256 != "" {
			fileMeta.SHA256 = sha256
		} else {
			// Fallback: extract file_id from path
			fileId := strings.TrimPrefix(fileMeta.Path, "storage"+string(os.PathSeparator))
			dot := strings.LastIndex(fileId, ".")
			if dot > 0 {
				fileId = fileId[:dot]
			}
			fileMeta.SHA256 = fileId
			fmt.Printf("[DEBUG] Fallback fileId from path: %s\n", fileId)
		}
	}
	// remove extension from SHA256 if present
	if strings.Contains(fileMeta.SHA256, ".") {
		fileMeta.SHA256 = strings.Split(fileMeta.SHA256, ".")[0]
	}
	fmt.Printf("logger after: %v\n", fileMeta.SHA256)
	updateErr := fileCrudRepo.IncrementDownloadCount(fileMeta.SHA256)
	fmt.Printf("Incrementing download count for fileId: %v\n", fileMeta.SHA256)
	if updateErr != nil {
		FileLogger.Error("Failed to increment download_count", zap.String("requestID", requestID), zap.String("file_id", fileMeta.SHA256), zap.Error(updateErr))
	}

	FileLogger.Info("Serving file", zap.String("requestID", requestID), zap.String("remoteAddr", r.RemoteAddr), zap.String("path", fileMeta.Path))
	w.Header().Set("Content-Disposition", "attachment; filename="+filepath.Base(cleanPath))
	w.Header().Set("Content-Type", "application/octet-stream")
	io.Copy(w, file)
}

// ServeFileByPathViewHandler serves a file for browser viewing (inline)
// @Summary View file by path
// @Description Serves a file from storage by its path for browser viewing
// @Tags file
// @Produce */*
// @Param path query string true "File path relative to storage/"
// @Success 200 {file} file "File served for viewing"
// @Failure 400 {object} utils.APIError "Bad request"
// @Failure 404 {object} utils.APIError "File not found"
// @Router /api/v1/file/path/view [get]
func ServeFileByPathViewHandler(w http.ResponseWriter, r *http.Request) {
	path := r.URL.Query().Get("path")
	requestID := r.Header.Get("X-Request-ID")
	if requestID == "" {
		requestID = "file-view-" + fmt.Sprintf("%d", os.Getpid())
	}
	FileLogger.Info("[VIEW] Request", zap.String("requestID", requestID), zap.String("remoteAddr", r.RemoteAddr), zap.String("path", path))
	if path == "" {
		FileLogger.Error("Missing file path", zap.String("requestID", requestID), zap.String("remoteAddr", r.RemoteAddr))
		utils.WriteAPIError(w, http.StatusBadRequest, "Missing file path", "No path provided")
		return
	}

	cleanPath := filepath.Clean(path)
	if strings.Contains(cleanPath, "..") {
		FileLogger.Error("Path traversal attempt", zap.String("requestID", requestID), zap.String("remoteAddr", r.RemoteAddr), zap.String("path", path))
		utils.WriteAPIError(w, http.StatusBadRequest, "Invalid file path", "Path traversal detected")
		return
	}
	absPath := filepath.Join("storage", cleanPath)
	fileMeta, err := FileService.GetFileByPath(absPath)
	if err != nil {
		FileLogger.Error("File not found", zap.String("requestID", requestID), zap.String("remoteAddr", r.RemoteAddr), zap.String("path", absPath), zap.Error(err))
		utils.WriteAPIError(w, http.StatusNotFound, "File not found", err.Error())
		return
	}
	// Use StorageService for file retrieval
	storageService := servicesImpl.NewStorageService("storage")
	file, err := storageService.GetFile(filepath.Base(fileMeta.Path))
	if err != nil {
		FileLogger.Error("Failed to open file", zap.String("requestID", requestID), zap.String("remoteAddr", r.RemoteAddr), zap.String("path", fileMeta.Path), zap.Error(err))
		utils.WriteAPIError(w, http.StatusInternalServerError, "Failed to open file", err.Error())
		return
	}
	defer file.Close()
	FileLogger.Info("Serving file", zap.String("requestID", requestID), zap.String("remoteAddr", r.RemoteAddr), zap.String("path", fileMeta.Path))
	buffer := make([]byte, 512)
	n, _ := file.Read(buffer)
	contentType := http.DetectContentType(buffer[:n])
	w.Header().Set("Content-Disposition", "inline; filename="+filepath.Base(cleanPath))
	w.Header().Set("Content-Type", contentType)
	if seeker, ok := file.(io.Seeker); ok {
		seeker.Seek(0, io.SeekStart)
	}
	io.Copy(w, file)
}

// FileUploadHandler handles file uploads with MIME type validation and deduplication
// @Summary Upload a file
// @Description Uploads a file, validates MIME type, and deduplicates using SHA-256 hash. Returns reference if duplicate.
// @Tags file
// @Summary Upload one or more files
// @Description Upload multiple files. Each file is processed and returns status for each.
// @Tags file
// @Accept multipart/form-data
// @Produce json
// @Param file formData file true "Files to upload (multiple allowed)"
// @Param username formData string true "Uploader (username)"
// @Success 201 {object} utils.APIResponse "Files processed"
// @Failure 400 {object} utils.APIError "Bad request or MIME type mismatch"
// @Failure 500 {object} utils.APIError "Internal server error"
// @Router /api/v1/file/upload [post]
func FileUploadHandler(w http.ResponseWriter, r *http.Request) {
	requestID := r.Header.Get("X-Request-ID")
	if requestID == "" {
		requestID = "file-upload-" + fmt.Sprintf("%d", os.Getpid())
	}
	FileLogger.Info("[UPLOAD] Request", zap.String("requestID", requestID), zap.String("remoteAddr", r.RemoteAddr))
	err := r.ParseMultipartForm(10 << 20)
	if err != nil {
		FileLogger.Error("Failed to parse form", zap.String("requestID", requestID), zap.String("remoteAddr", r.RemoteAddr), zap.Error(err))
		utils.WriteAPIError(w, http.StatusBadRequest, "Failed to parse form", err.Error())
		return
	}
	files := r.MultipartForm.File["file"]
	if len(files) == 0 {
		FileLogger.Error("No files found in request", zap.String("requestID", requestID), zap.String("remoteAddr", r.RemoteAddr))
		utils.WriteAPIError(w, http.StatusBadRequest, "No files found in request", "No files uploaded")
		return
	}
	cfg, err := config.LoadConfig()
	if err != nil {
		utils.WriteAPIError(w, http.StatusInternalServerError, "Failed to load config", err.Error())
		return
	}
	username := r.FormValue("username")
	if username == "" {
		utils.WriteAPIError(w, http.StatusBadRequest, "Missing username", "Username required for quota check")
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
	var uploadedFiles []map[string]interface{}
	for _, handler := range files {
		file, err := handler.Open()
		if err != nil {
			FileLogger.Error("File open error", zap.String("requestID", requestID), zap.String("filename", handler.Filename), zap.Error(err))
			continue
		}
		defer file.Close()
		if usedMB+float64(handler.Size)/(1024*1024) > float64(cfg.StorageQuotaMB) {
			FileLogger.Error("Storage quota exceeded", zap.String("requestID", requestID), zap.String("filename", handler.Filename))
			uploadedFiles = append(uploadedFiles, map[string]interface{}{
				"filename": handler.Filename,
				"error":    "Storage quota exceeded",
			})
			continue
		}
		// Read first 512 bytes for MIME validation
		buffer := make([]byte, 512)
		n, _ := file.Read(buffer)
		if seeker, ok := file.(io.Seeker); ok {
			seeker.Seek(0, io.SeekStart)
		}
		// Validate MIME type using utility
		if err := utils.ValidateMimeType(handler.Filename, buffer[:n]); err != nil {
			FileLogger.Error("MIME type mismatch", zap.String("requestID", requestID), zap.String("filename", handler.Filename), zap.Error(err))
			uploadedFiles = append(uploadedFiles, map[string]interface{}{
				"filename": handler.Filename,
				"error":    err.Error(),
			})
			continue
		}
		filename, mimetype, hash, savedPath, err := servicesImpl.CoreUpload(file, handler.Filename, r)
		if err != nil {
			FileLogger.Error("Failed to upload file", zap.String("requestID", requestID), zap.String("filename", handler.Filename), zap.Error(err))
			uploadedFiles = append(uploadedFiles, map[string]interface{}{
				"filename": handler.Filename,
				"error":    err.Error(),
			})
			continue
		}
		isDuplicate, _ := FileService.CheckDuplicate(hash)
		if isDuplicate {
			copyFilename, copyErr := fileCrudRepo.GetNextCopyFilename(username, handler.Filename)
			if copyErr != nil {
				uploadedFiles = append(uploadedFiles, map[string]interface{}{
					"filename": handler.Filename,
					"error":    copyErr.Error(),
				})
				continue
			}
			_ = fileCrudRepo.InsertUserFile(username, hash, copyFilename, "owner")
			uploadedFiles = append(uploadedFiles, map[string]interface{}{
				"message":  "Duplicate file uploaded as copy.",
				"filename": copyFilename,
				"sha256":   hash,
			})
			continue
		}
		FileService.StoreFileMetadata(filename, mimetype, hash, savedPath, "")
		uploadedFiles = append(uploadedFiles, map[string]interface{}{
			"message":  "File uploaded successfully.",
			"filename": filename,
			"sha256":   hash,
		})
	}
	utils.WriteAPIResponse(w, http.StatusCreated, "Files processed", uploadedFiles)
}

// SearchFilesHandler handles file search and filtering
// @Summary Search files
// @Description Search and filter files by filename, MIME type, size, date, tags, uploader
// @Tags file-search
// @Accept json
// @Produce json
// @Param filename query string false "Filename to search"
// @Param mimeType query string false "MIME type filter"
// @Param minSize query number false "Minimum file size"
// @Param maxSize query number false "Maximum file size"
// @Param startDate query string false "Start upload date"
// @Param endDate query string false "End upload date"
// @Param uploader query string false "Uploader's name"
// @Param limit query int false "Limit"
// @Param offset query int false "Offset"
// @Success 200 {object} utils.APIResponse{data=[]dto.FileMeta} "Search results"
// @Router /api/v1/file/search [get]
func SearchFilesHandler(w http.ResponseWriter, r *http.Request) {
	params := dto.FileSearchParams{
		Filename: r.URL.Query().Get("filename"),
		MimeType: r.URL.Query().Get("mimeType"),
		Uploader: r.URL.Query().Get("uploader"),
		Limit:    50, // Default limit
		Offset:   0,  // Default offset
	}
	// Parse numeric and date params
	if minSize := r.URL.Query().Get("minSize"); minSize != "" {
		if v, err := parseFloat(minSize); err == nil {
			params.MinSize = v
		}
	}
	if maxSize := r.URL.Query().Get("maxSize"); maxSize != "" {
		if v, err := parseFloat(maxSize); err == nil {
			params.MaxSize = v
		}
	}
	params.StartDate = r.URL.Query().Get("startDate")
	params.EndDate = r.URL.Query().Get("endDate")
	if limit := r.URL.Query().Get("limit"); limit != "" {
		if v, err := parseInt(limit); err == nil && v > 0 {
			params.Limit = v
		}
	}
	if offset := r.URL.Query().Get("offset"); offset != "" {
		if v, err := parseInt(offset); err == nil && v >= 0 {
			params.Offset = v
		}
	}
	results, err := FileSearchService.SearchFiles(params)
	if err != nil {
		FileLogger.Error("File search failed", zap.Error(err))
		utils.WriteAPIError(w, http.StatusInternalServerError, "File search failed", err.Error())
		return
	}
	utils.WriteAPIResponse(w, http.StatusOK, "Files found successfully", results)
}

func parseFloat(s string) (float64, error) {
	return strconv.ParseFloat(s, 64)
}

func parseInt(s string) (int, error) {
	return strconv.Atoi(s)
}
