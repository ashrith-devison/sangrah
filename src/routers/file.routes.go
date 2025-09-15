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
}
