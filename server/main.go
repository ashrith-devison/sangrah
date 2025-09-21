package main

import (
	"backend/src/config"
	"backend/src/controllers"
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
	if err := godotenv.Load(); err != nil {
		panic("Failed to load .env file: " + err.Error())
	}

	logger, _ := zap.NewDevelopment()
	defer logger.Sync()

	controllers.InitLogger(logger)

	logger.Info("ENV", zap.String("PORT", os.Getenv("PORT")))
	logger.Info("ENV", zap.String("DB_URL", os.Getenv("DB_URL")))

	cfg, err := config.LoadConfig()
	if err != nil {
		logger.Fatal("Failed to load config", zap.Error(err))
	}
	logger.Info("Loaded DB_URL", zap.String("DB_URL", cfg.DBUrl))

	controllers.InitAuthService()
	controllers.InitFileShareService()
	controllers.InitFileSearchService()
	controllers.InitAdminService()

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
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		mux.ServeHTTP(w, r)
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
