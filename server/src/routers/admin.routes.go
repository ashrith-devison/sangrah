package routers

import (
	"backend/src/controllers/admin"
	"net/http"
)

func RegisterAdminRoutes(mux *http.ServeMux) {
	mux.HandleFunc("/stats", admin.AdminStatsHandler)
	mux.HandleFunc("/users", admin.GetAllUsersHandler)
	mux.HandleFunc("/generate-token", admin.GenerateUserTokenHandler)
}
