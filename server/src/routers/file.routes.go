package routers

import (
	"backend/src/controllers/files"
	"backend/src/middleware"
	"net/http"
)

// RegisterFileRoutes registers file upload and related endpoints
func RegisterFileRoutes(mux *http.ServeMux) {
	mux.HandleFunc("/stats", files.UserStatsHandler) // GET /stats?username=...

	mux.HandleFunc("/owned-info", files.OwnedFileInfoHandler)   // GET /owned-info?username=...
	mux.HandleFunc("/update-info", files.UpdateFileInfoHandler) // POST /update-info

	// mux.HandleFunc("/upload", files.FileUploadHandler)             // POST /upload
	mux.Handle("/path/download", middleware.AuthMiddleware(http.HandlerFunc(files.ServeFileByPathHandler))) // GET /by-path?path=...
	mux.Handle("/path/view", middleware.AuthMiddleware(http.HandlerFunc(files.ServeFileByPathViewHandler))) // GET /path/view?path=...
	mux.HandleFunc("/upload-meta", files.FileMetaUploadHandler)                                             // POST /api/v1/file/upload-meta
	mux.HandleFunc("/storage/analytics", files.AnalyticsHandler)                                            // GET /storage/analytics

	// File sharing endpoints
	mux.HandleFunc("/share", files.ShareFileHandler)                                                                      // POST /share
	mux.HandleFunc("/shared/list", files.ListSharedFilesHandler)                                                          // GET /shared/list?username=...
	mux.HandleFunc("/shared-with-me", files.SharedWithMeHandler)                                                          // GET /shared-with-me?username=...
	mux.HandleFunc("/share/revoke", files.RevokeFileShareHandler)                                                         // POST /share/revoke
	mux.HandleFunc("/search", files.SearchFilesHandler)                                                                   // GET /search?filename=...&mimeType=...&minSize=...&maxSize=...&startDate=...&endDate=...&tags=...&uploader=...&limit=...&offset=...
	mux.Handle("/owned", middleware.RoleMiddleware([]string{"admin", "user"}, http.HandlerFunc(files.OwnedFilesHandler))) // GET /owned?username=...

	mux.Handle("/rename", middleware.RoleMiddleware([]string{"admin", "user"}, http.HandlerFunc(files.RenameFileHandler))) // POST /rename
	// mux.HandleFunc("/delete", files.DeleteFileHandler)                                                                                        // POST /delete
	mux.Handle("/delete-filename", middleware.RoleMiddleware([]string{"admin", "user"}, http.HandlerFunc(files.DeleteFileByFilenameHandler))) // POST /delete-by-filename

	// Public share endpoints
	mux.HandleFunc("/public-share", files.PublicShareHandler)          // POST /public-share
	mux.HandleFunc("/public/view", files.PublicAccessHandler)          // GET /public/view?token=...
	mux.HandleFunc("/storage-quota", files.GetUserStorageQuotaHandler) // GET /storage-quota?username=...

}
