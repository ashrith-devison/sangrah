package routers

import (
	"backend/src/controllers"
	"net/http"
)

func RegisterAdminRoutes(mux *http.ServeMux) {
	mux.HandleFunc("/upload", controllers.AdminUploadFileHandler)           // POST /api/v1/admin/upload
	mux.HandleFunc("/share", controllers.AdminShareFileHandler)             // POST /api/v1/admin/share
	mux.HandleFunc("/files", controllers.AdminListFilesHandler)             // GET /api/v1/admin/files
	mux.HandleFunc("/stats", controllers.AdminStatsHandler)                 // GET /api/v1/admin/stats
	mux.HandleFunc("/users", controllers.GetAllUsersHandler)                // GET /api/v1/admin/users
	mux.HandleFunc("/generate-token", controllers.GenerateUserTokenHandler) // POST /api/v1/admin/generate-token
}
