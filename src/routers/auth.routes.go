package routers

import (
	"net/http"

	"backend/src/controllers"
)

//
//  RegisterAuthRoutes godoc
//
//  @Summary      Register authentication routes
//  @Description  Registers login, register, and forget-password endpoints
//  @Tags         auth
//  @Router       /auth/login [post]
//  @Router       /auth/register [post]
//  @Router       /auth/forget-password [post]

func RegisterAuthRoutes(mux *http.ServeMux) {
	mux.HandleFunc("/login", controllers.LoginHandler)       // POST /login
	mux.HandleFunc("/register", controllers.RegisterHandler) // POST /register
	// mux.HandleFunc("/forget-password", controllers.ForgetPasswordHandler) // POST /forget-password
}
