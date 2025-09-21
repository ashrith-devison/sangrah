package middleware

import (
	"net/http"
	"sync"
	"time"

	"backend/src/config"

	"github.com/gin-gonic/gin"
)

// RateLimiter stores user request timestamps
var rateLimiterStore = struct {
	mu           sync.Mutex
	userRequests map[string][]int64
}{userRequests: make(map[string][]int64)}

func RateLimitMiddleware(cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetString("userID") // Assumes userID is set in context
		if userID == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
			return
		}

		now := time.Now().UnixNano() / int64(time.Millisecond)
		window := int64(1000) // 1 second window
		maxRequests := cfg.RateLimit

		rateLimiterStore.mu.Lock()
		requests := rateLimiterStore.userRequests[userID]
		// Remove requests outside the window
		var filtered []int64
		for _, ts := range requests {
			if now-ts < window {
				filtered = append(filtered, ts)
			}
		}
		if len(filtered) >= maxRequests {
			rateLimiterStore.mu.Unlock()
			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{"error": "Rate limit exceeded"})
			return
		}
		filtered = append(filtered, now)
		rateLimiterStore.userRequests[userID] = filtered
		rateLimiterStore.mu.Unlock()

		c.Next()
	}
}
