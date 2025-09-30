package routers

import (
	"net/http"

	"backend/src/controllers/auth"
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
	mux.HandleFunc("/login", auth.LoginHandler)       // POST /login
	mux.HandleFunc("/register", auth.RegisterHandler) // POST /register
	// mux.HandleFunc("/forget-password", auth.ForgetPasswordHandler) // POST /forget-password
}
