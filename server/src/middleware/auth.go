package middleware

import (
	"backend/src/utils"
	"net/http"
	"strings"
)

// AuthMiddleware validates JWT and sets username in context
func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			utils.WriteAPIError(w, http.StatusUnauthorized, "Missing Authorization header", "No token provided")
			return
		}
		tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
		claims, err := utils.ValidateJWT(tokenStr)
		if err != nil {
			utils.WriteAPIError(w, http.StatusUnauthorized, "Invalid token", err.Error())
			return
		}
		username, ok := claims["user_id"].(string)
		if !ok || username == "" {
			utils.WriteAPIError(w, http.StatusUnauthorized, "Invalid token claims", "Username not found in token")
			return
		}
		// Set username in request context
		ctx := r.Context()
		ctx = utils.SetUsernameInContext(ctx, username)
		r = r.WithContext(ctx)
		next.ServeHTTP(w, r)
	})
}
