package routers

import (
	"backend/src/controllers"
	"backend/src/middleware"
	"net/http"
)

// RegisterFileRoutes registers file upload and related endpoints
func RegisterFileRoutes(mux *http.ServeMux) {

	mux.HandleFunc("/owned-info", controllers.OwnedFileInfoHandler)   // GET /owned-info?username=...
	mux.HandleFunc("/update-info", controllers.UpdateFileInfoHandler) // POST /update-info

	// mux.HandleFunc("/upload", controllers.FileUploadHandler)             // POST /upload
	mux.Handle("/path/download", middleware.AuthMiddleware(http.HandlerFunc(controllers.ServeFileByPathHandler))) // GET /by-path?path=...
	mux.Handle("/path/view", middleware.AuthMiddleware(http.HandlerFunc(controllers.ServeFileByPathViewHandler))) // GET /path/view?path=...
	mux.HandleFunc("/upload-meta", controllers.FileMetaUploadHandler)                                             // POST /api/v1/file/upload-meta
	mux.HandleFunc("/storage/analytics", controllers.AnalyticsHandler)                                            // GET /storage/analytics

	// File sharing endpoints
	mux.HandleFunc("/share", controllers.ShareFileHandler)                                                                      // POST /share
	mux.HandleFunc("/shared/list", controllers.ListSharedFilesHandler)                                                          // GET /shared/list?username=...
	mux.HandleFunc("/shared-with-me", controllers.SharedWithMeHandler)                                                          // GET /shared-with-me?username=...
	mux.HandleFunc("/share/revoke", controllers.RevokeFileShareHandler)                                                         // POST /share/revoke
	mux.HandleFunc("/search", controllers.SearchFilesHandler)                                                                   // GET /search?filename=...&mimeType=...&minSize=...&maxSize=...&startDate=...&endDate=...&tags=...&uploader=...&limit=...&offset=...
	mux.Handle("/owned", middleware.RoleMiddleware([]string{"admin", "user"}, http.HandlerFunc(controllers.OwnedFilesHandler))) // GET /owned?username=...

	mux.Handle("/rename", middleware.RoleMiddleware([]string{"admin", "user"}, http.HandlerFunc(controllers.RenameFileHandler))) // POST /rename
	// mux.HandleFunc("/delete", controllers.DeleteFileHandler)                                                                                        // POST /delete
	mux.Handle("/delete-filename", middleware.RoleMiddleware([]string{"admin", "user"}, http.HandlerFunc(controllers.DeleteFileByFilenameHandler))) // POST /delete-by-filename

	// Public share endpoints
	mux.HandleFunc("/public-share", controllers.PublicShareHandler)          // POST /public-share
	mux.HandleFunc("/public/view", controllers.PublicAccessHandler)          // GET /public/view?token=...
	mux.HandleFunc("/storage-quota", controllers.GetUserStorageQuotaHandler) // GET /storage-quota?username=...

}
