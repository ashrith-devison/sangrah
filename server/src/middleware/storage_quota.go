package middleware

import (
	"backend/src/config"
	"backend/src/repos"
	"backend/src/utils"
	"net/http"

	"github.com/gin-gonic/gin"
)

func StorageQuotaMiddleware(cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetString("userID") // Assumes userID is set in context
		if userID == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
			return
		}

		db, err := utils.ConnectPostgres()
		if err != nil {
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "DB connection error"})
			return
		}
		defer db.Close()
		repo := repos.FileCrudRepo{Db: db}
		used, err := repo.GetUserStorageUsedMB(userID)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "Failed to get storage usage"})
			return
		}
		if used > float64(cfg.StorageQuotaMB) {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "Storage quota exceeded"})
			return
		}
		c.Next()
	}
}
