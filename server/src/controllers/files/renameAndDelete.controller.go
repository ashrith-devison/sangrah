package files

import (
	"backend/src/config"
	"backend/src/dto"
	"backend/src/repos"
	"backend/src/servicesImpl"
	"backend/src/utils"
	"database/sql"
	"encoding/json"
	"io"
	"net/http"
	"os"
	"strings"
)

// Interface for file rename repo
type FileRenameRepo interface {
	GetFilePathByUsernameAndFilename(username, filename string) (string, error)
	RenameFileByFilename(username, filename, newName string) error
}

// Injectable dependencies for RenameFileHandler
var GetDBForRename = utils.GetDB
var NewFileCrudRepoForRename = func(db utils.DBExecutor) FileRenameRepo {
	return repos.NewFileCrudRepo(db)
}
var OpenFileForRename = func(name string) (io.ReadCloser, error) { return os.Open(name) }
var ValidateMimeTypeForRename = utils.ValidateMimeType

// Injectable dependencies for testability
var ValidateJWT = utils.ValidateJWT
var LoadConfig = config.LoadConfig

type UserFileCrudServiceForDelete interface {
	DeleteFile(req dto.DeleteFileRequest) error
}

var NewUserFileCrudService = func(cfg *config.Config) UserFileCrudServiceForDelete {
	return servicesImpl.NewUserFileCrudService(cfg)
}

// DeleteFileHandler deletes a file owned by the user with strict rules
// @Summary Delete a file
// @Description Deletes a file owned by the user. Only the uploader can delete. Deduplication respected.
// @Tags file
// @Accept json
// @Produce json
// @Param deleteRequest body dto.DeleteFileRequest true "Delete file payload (fileId, username)"
// @Success 200 {object} utils.APIResponse "File deleted successfully"
// @Failure 400 {object} utils.APIError "Invalid request"
// @Failure 404 {object} utils.APIError "File not found or not owned"
// @Failure 500 {object} utils.APIError "Internal server error"
// @Router /api/v1/file/delete [post]
func DeleteFileHandler(w http.ResponseWriter, r *http.Request) {
	var req dto.DeleteFileRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.WriteAPIError(w, http.StatusBadRequest, "Invalid request payload", err.Error())
		return
	}
	if req.FileId == "" {
		utils.WriteAPIError(w, http.StatusBadRequest, "Missing required fields", "fileId required")
		return
	}
	// Extract JWT token from Authorization header
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		utils.WriteAPIError(w, http.StatusUnauthorized, "Missing Authorization header", "No token provided")
		return
	}
	tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
	claims, err := ValidateJWT(tokenStr)
	if err != nil {
		utils.WriteAPIError(w, http.StatusUnauthorized, "Invalid token", err.Error())
		return
	}
	username, ok := claims["user_id"].(string)
	if !ok || username == "" {
		utils.WriteAPIError(w, http.StatusUnauthorized, "Invalid token claims", "Username not found in token")
		return
	}
	req.Username = username
	// Use service layer for deletion
	cfg, err := LoadConfig()
	if err != nil {
		utils.WriteAPIError(w, http.StatusInternalServerError, "Failed to load config", err.Error())
		return
	}
	userFileCrudService := NewUserFileCrudService(cfg)
	err = userFileCrudService.DeleteFile(req)
	if err != nil {
		if err == sql.ErrNoRows {
			utils.WriteAPIError(w, http.StatusNotFound, "File not found or not owned", "File not found or not owned by user")
		} else {
			utils.WriteAPIError(w, http.StatusInternalServerError, "Failed to delete file", err.Error())
		}
		return
	}
	utils.WriteAPIResponse(w, http.StatusOK, "File deleted successfully", map[string]interface{}{"fileId": req.FileId})
}

// Injectable for testability
type FileCrudRepoForDeleteByFilename interface {
	DeleteFileByFilename(username, filename string) error
}

var GetDBForDeleteByFilename = utils.GetDB
var NewFileCrudRepoForDeleteByFilename = func(db *sql.DB) FileCrudRepoForDeleteByFilename {
	return repos.NewFileCrudRepo(db)
}

func DeleteFileByFilenameHandler(w http.ResponseWriter, r *http.Request) {
	var req dto.DeleteFileByFilenameRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.WriteAPIError(w, http.StatusBadRequest, "Invalid request payload", err.Error())
		return
	}
	if req.Filename == "" {
		utils.WriteAPIError(w, http.StatusBadRequest, "Missing required fields", "filename required")
		return
	}
	// Extract JWT token from Authorization header
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		utils.WriteAPIError(w, http.StatusUnauthorized, "Missing Authorization header", "No token provided")
		return
	}
	tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
	claims, err := ValidateJWT(tokenStr)
	if err != nil {
		utils.WriteAPIError(w, http.StatusUnauthorized, "Invalid token", err.Error())
		return
	}
	username, ok := claims["user_id"].(string)
	if !ok || username == "" {
		utils.WriteAPIError(w, http.StatusUnauthorized, "Invalid token claims", "Username not found in token")
		return
	}
	req.Username = username
	db := GetDBForDeleteByFilename()
	fileCrudRepo := NewFileCrudRepoForDeleteByFilename(db)
	err = fileCrudRepo.DeleteFileByFilename(req.Username, req.Filename)
	if err != nil {
		if err == sql.ErrNoRows {
			utils.WriteAPIError(w, http.StatusNotFound, "File not found or not owned", "File not found or not owned by user")
		} else {
			utils.WriteAPIError(w, http.StatusInternalServerError, "Failed to delete file", err.Error())
		}
		return
	}
	utils.WriteAPIResponse(w, http.StatusOK, "File deleted successfully", map[string]interface{}{"filename": req.Filename})
}

// RenameFileHandler renames a file owned by the user
// @Summary Rename a file
// @Description Renames a file owned by the user
// @Tags file
// @Accept json
// @Produce json
// @Param renameRequest body dto.FileRenameRequest true "Rename file payload. Required: filename, newName, username."
// @Success 200 {object} utils.APIResponse "File renamed successfully"
// @Failure 400 {object} utils.APIError "Invalid request"
// @Failure 404 {object} utils.APIError "File not found or not owned"
// @Failure 500 {object} utils.APIError "Internal server error"
// @Router /api/v1/file/rename [post]
func RenameFileHandler(w http.ResponseWriter, r *http.Request) {
       // Extract JWT token from Authorization header
       authHeader := r.Header.Get("Authorization")
       if authHeader == "" {
	       utils.WriteAPIError(w, http.StatusUnauthorized, "Missing Authorization header", "No token provided")
	       return
       }
       tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
       claims, err := ValidateJWT(tokenStr)
       if err != nil {
	       utils.WriteAPIError(w, http.StatusUnauthorized, "Invalid token", err.Error())
	       return
       }
       username, ok := claims["user_id"].(string)
       if !ok || username == "" {
	       utils.WriteAPIError(w, http.StatusUnauthorized, "Invalid token claims", "Username not found in token")
	       return
       }

       var req dto.FileRenameRequest
       if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
	       utils.WriteAPIError(w, http.StatusBadRequest, "Invalid request payload", err.Error())
	       return
       }
       if req.Filename == "" || req.NewName == "" || req.Username == "" {
	       utils.WriteAPIError(w, http.StatusBadRequest, "Missing required fields", "filename, newName, username required")
	       return
       }
       // Reject if newName does not have an extension
       if !strings.Contains(req.NewName, ".") || strings.HasPrefix(req.NewName, ".") || strings.HasSuffix(req.NewName, ".") {
	       utils.WriteAPIError(w, http.StatusBadRequest, "Invalid new filename", "New filename must include a valid extension")
	       return
       }
       db := GetDBForRename()
       fileCrudRepo := NewFileCrudRepoForRename(db)

       // Get file path using repo
       filePath, err := fileCrudRepo.GetFilePathByUsernameAndFilename(req.Username, req.Filename)
       if err != nil || filePath == "" {
	       utils.WriteAPIError(w, http.StatusNotFound, "File not found", "File not found for MIME validation")
	       return
       }
       // Open file and validate MIME type
       f, err := OpenFileForRename(filePath)
       if err != nil {
	       utils.WriteAPIError(w, http.StatusInternalServerError, "Failed to open file for MIME validation", err.Error())
	       return
       }
       defer f.Close()
       buffer := make([]byte, 512)
       n, _ := f.Read(buffer)
       if err := ValidateMimeTypeForRename(req.NewName, buffer[:n]); err != nil {
	       utils.WriteAPIError(w, http.StatusBadRequest, "MIME type mismatch", err.Error())
	       return
       }

       err = fileCrudRepo.RenameFileByFilename(req.Username, req.Filename, req.NewName)
       if err != nil {
	       if err == sql.ErrNoRows {
		       utils.WriteAPIError(w, http.StatusNotFound, "File not found or not owned", "File not found or not owned by user")
	       } else {
		       utils.WriteAPIError(w, http.StatusInternalServerError, "Failed to rename file", err.Error())
	       }
	       return
       }
       utils.WriteAPIResponse(w, http.StatusOK, "File renamed successfully", map[string]interface{}{"filename": req.Filename, "newName": req.NewName})
}
