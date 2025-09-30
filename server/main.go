package main

import (
	"backend/src/config"
	"backend/src/controllers"
	"backend/src/middleware"
	"backend/src/routers"
	"net/http"
	"os"
	"time"

	_ "backend/docs"

	"github.com/joho/godotenv"
	httpSwagger "github.com/swaggo/http-swagger"
	"go.uber.org/zap"
)

func main() {
	if err := godotenv.Load("F:/New folder/fileVault/server/.env"); err != nil {
		panic("Failed to load .env file: " + err.Error())
	}
	println("[DEBUG] PORT after loading .env:", os.Getenv("PORT"))

	logger, _ := zap.NewDevelopment()
	defer logger.Sync()

	controllers.InitLogger(logger)

	logger.Info("ENV", zap.String("PORT", os.Getenv("PORT")))
	logger.Info("ENV", zap.String("DB_URL", os.Getenv("DB_URL")))
	logger.Info("ENV", zap.String("RATE_LIMIT", os.Getenv("RATE_LIMIT")))

	cfg, err := config.LoadConfig()
	if err != nil {
		logger.Fatal("Failed to load config", zap.Error(err))
	}
	logger.Info("Loaded DB_URL", zap.String("DB_URL", cfg.DBUrl))

	controllers.InitAuthService(cfg)
	controllers.InitFileShareService(cfg)
	controllers.InitFileSearchService(cfg)
	controllers.InitAdminService(cfg)

	port := os.Getenv("PORT")
	if port == "" {
		logger.Warn("No PORT environment variable found, using default port 8080")
		port = "8080"
	}
	mux := http.NewServeMux()
	mux.Handle("/api/docs/", httpSwagger.WrapHandler)
	authMux := http.NewServeMux()
	routers.RegisterAuthRoutes(authMux)
	mux.Handle("/api/v1/auth/", http.StripPrefix("/api/v1/auth", authMux))

	// Register file routes and tested
	fileMux := http.NewServeMux()
	routers.RegisterFileRoutes(fileMux)
	mux.Handle("/api/v1/file/", http.StripPrefix("/api/v1/file", fileMux))

	// Register admin routes
	adminMux := http.NewServeMux()
	routers.RegisterAdminRoutes(adminMux)
	mux.Handle("/api/v1/admin/", http.StripPrefix("/api/v1/admin", adminMux))

	// CORS middleware for development
	wrappedMux := middleware.RateLimitByIPMiddleware(mux)
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		wrappedMux.ServeHTTP(w, r)
	})

	logger.Info("Starting server", zap.String("port", port))
	srv := &http.Server{
		Addr:         ":" + port,
		Handler:      handler,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
	}
	if err := srv.ListenAndServe(); err != nil {
		logger.Fatal("Server failed", zap.Error(err))
	}

	server := &http.Server{
		Addr:         ":" + port,
		Handler:      mux,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	logger.Info("Starting the Server", zap.String("port", port))
	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		logger.Fatal("Could not listen", zap.String("port", port), zap.Error(err))
	}
}
