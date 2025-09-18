package middleware

import (
	"backend/src/utils"
	"net/http"
	"strings"
)

// AdminMiddleware checks if the user is an admin
func AdminMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			utils.WriteAPIError(w, http.StatusUnauthorized, "Missing Authorization header", "")
			return
		}
		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		claims, err := utils.ValidateJWT(tokenString)
		if err != nil {
			utils.WriteAPIError(w, http.StatusUnauthorized, "Invalid token", err.Error())
			return
		}
		// Check if user is admin (assume is_admin is in claims or query DB)
		isAdmin, ok := claims["is_admin"].(bool)
		if !ok || !isAdmin {
			utils.WriteAPIError(w, http.StatusForbidden, "Admin access required", "")
			return
		}
		next.ServeHTTP(w, r)
	})
}
