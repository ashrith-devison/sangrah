package routers

import (
	"backend/src/controllers"
	"net/http"
)

// RegisterFileRoutes registers file upload and related endpoints
func RegisterFileRoutes(mux *http.ServeMux) {
	mux.HandleFunc("/upload", controllers.FileUploadHandler)             // POST /upload
	mux.HandleFunc("/path/download", controllers.ServeFileByPathHandler) // GET /by-path?path=...
	mux.HandleFunc("/path/view", controllers.ServeFileByPathViewHandler) // GET /path/view?path=...
	mux.HandleFunc("/upload-meta", controllers.FileMetaUploadHandler)    // POST /api/v1/file/upload-meta
	mux.HandleFunc("/storage/analytics", controllers.AnalyticsHandler)   // GET /storage/analytics

	// File sharing endpoints
	mux.HandleFunc("/share", controllers.ShareFileHandler)              // POST /share
	mux.HandleFunc("/shared/list", controllers.ListSharedFilesHandler)  // GET /shared/list?username=...
	mux.HandleFunc("/share/revoke", controllers.RevokeFileShareHandler) // POST /share/revoke
	mux.HandleFunc("/search", controllers.SearchFilesHandler)           // GET /search?filename=...&mimeType=...&minSize=...&maxSize=...&startDate=...&endDate=...&tags=...&uploader=...&limit=...&offset=...
	mux.HandleFunc("/owned", controllers.OwnedFilesHandler)             // GET /owned?username=...

	mux.HandleFunc("/rename", controllers.RenameFileHandler) // POST /rename
	mux.HandleFunc("/delete", controllers.DeleteFileHandler) // POST /delete

}
