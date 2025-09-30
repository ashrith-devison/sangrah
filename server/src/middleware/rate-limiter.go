package middleware

import (
	"net/http"
	"os"
	"strconv"
	"sync"
	"time"
)

// ipRateLimiterEntry stores timestamps of requests for an IP
type ipRateLimiterEntry struct {
	Requests []int64
	LastSeen int64
}

var ipRateLimiterStore = struct {
	mu         sync.Mutex
	ipRequests map[string]*ipRateLimiterEntry
}{ipRequests: make(map[string]*ipRateLimiterEntry)}

// getRateLimitFromEnv reads RATE_LIMIT from .env or returns default
func getRateLimitFromEnv() int {
	val := os.Getenv("RATE_LIMIT")
	if val == "" {
		return 10 // default requests per second
	}
	limit, err := strconv.Atoi(val)
	if err != nil || limit <= 0 {
		return 10
	}
	return limit
}

// RateLimitByIPMiddleware limits requests per second per IP
func RateLimitByIPMiddleware(next http.Handler) http.Handler {
	window := int64(1000) // 1 second in ms
	maxRequests := getRateLimitFromEnv()
	println("[RateLimitByIPMiddleware] Started. Limiting requests per IP to", maxRequests, "per", window, "ms.")
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ip := r.RemoteAddr
		// Remove port if present
		for i := len(ip) - 1; i >= 0; i-- {
			if ip[i] == ':' {
				ip = ip[:i]
				break
			}
		}
		endpoint := r.URL.Path
		println("[RateLimitByIPMiddleware] Incoming request:", r.Method, endpoint, "from IP:", ip)
		now := time.Now().UnixNano() / int64(time.Millisecond)

		ipRateLimiterStore.mu.Lock()
		entry := ipRateLimiterStore.ipRequests[ip]
		if entry == nil {
			entry = &ipRateLimiterEntry{Requests: []int64{}, LastSeen: now}
			ipRateLimiterStore.ipRequests[ip] = entry
		}
		// Remove requests outside window
		var filtered []int64
		for _, ts := range entry.Requests {
			if now-ts < window {
				filtered = append(filtered, ts)
			}
		}
		if len(filtered) >= maxRequests {
			ipRateLimiterStore.mu.Unlock()
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusTooManyRequests)
			w.Write([]byte(`{"error": "Rate limit exceeded", "ip": "` + ip + `", "endpoint": "` + endpoint + `", "limit": ` + strconv.Itoa(maxRequests) + `, "window_ms": ` + strconv.FormatInt(window, 10) + `}`))
			return
		}
		filtered = append(filtered, now)
		entry.Requests = filtered
		entry.LastSeen = now
		ipRateLimiterStore.ipRequests[ip] = entry
		// Cleanup old entries (every 1000 requests)
		if len(filtered) == 1 && now%1000 == 0 {
			for ipKey, entry := range ipRateLimiterStore.ipRequests {
				if now-entry.LastSeen > window*10 {
					delete(ipRateLimiterStore.ipRequests, ipKey)
				}
			}
		}
		ipRateLimiterStore.mu.Unlock()

		next.ServeHTTP(w, r)
	})
}
