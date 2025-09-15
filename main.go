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

	// Register file routes
	fileMux := http.NewServeMux()
	routers.RegisterFileRoutes(fileMux)
	mux.Handle("/api/v1/file/", http.StripPrefix("/api/v1/file", fileMux))

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
