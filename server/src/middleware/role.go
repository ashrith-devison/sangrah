package middleware

import (
	"backend/src/utils"
	"net/http"
	"strings"
)

// RoleMiddleware allows only users with specified roles to access the endpoint
func RoleMiddleware(allowedRoles []string, next http.Handler) http.Handler {
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
		role, ok := claims["role"].(string)
		if !ok || role == "" {
			utils.WriteAPIError(w, http.StatusForbidden, "Role not found in token", "No role claim")
			return
		}
		allowed := false
		for _, r := range allowedRoles {
			if r == role {
				allowed = true
				break
			}
		}
		if !allowed {
			utils.WriteAPIError(w, http.StatusForbidden, "Access denied", "Role not allowed")
			return
		}
		// Set username and role in context if needed
		ctx := r.Context()
		if username, ok := claims["user_id"].(string); ok {
			ctx = utils.SetUsernameInContext(ctx, username)
		}
		ctx = utils.SetRoleInContext(ctx, role)
		r = r.WithContext(ctx)
		next.ServeHTTP(w, r)
	})
}
