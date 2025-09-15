// @title FileVault API
// @version 1.0
// @description API documentation for FileVault authentication service.
// @host localhost:8080
// @BasePath /api/v1
package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/joho/godotenv"

	"craftiverse.co.in/fileVault/backend/controllers"
	"craftiverse.co.in/fileVault/backend/docs"
	"craftiverse.co.in/fileVault/backend/routers"
	httpSwagger "github.com/swaggo/http-swagger"
)

func main() {
	// Load environment variables from .env file
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found or error loading .env file:", err)
	}

	// Debug: Print DB environment variables
	log.Println("DB_HOST:", os.Getenv("DB_HOST"))
	log.Println("DB_PORT:", os.Getenv("DB_PORT"))
	log.Println("DB_USER:", os.Getenv("DB_USER"))
	log.Println("DB_PASSWORD:", os.Getenv("DB_PASSWORD"))
	log.Println("DB_NAME:", os.Getenv("DB_NAME"))

	// Initialize AuthService after env vars are loaded
	controllers.InitAuthService()

	// Wait for DB connection before starting server
	if controllers.AuthServiceUnavailable() {
		log.Fatalf("Failed to connect to database. Server will not start.")
	}
	docs.SwaggerInfo.Title = "FileVault API"
	docs.SwaggerInfo.Version = "1.0"
	docs.SwaggerInfo.Description = "API documentation for FileVault authentication service."
	docs.SwaggerInfo.Host = "localhost:8080"
	docs.SwaggerInfo.BasePath = ""

	port := os.Getenv("PORT")
	if port == "" {
		fmt.Println("No PORT environment variable found, using default port 8080")
		port = "8080"
	}
	mux := http.NewServeMux()

	// Create a subrouter for /api/v1/auth

	// Serve Swagger UI at /api/docs
	mux.Handle("/api/docs/", httpSwagger.WrapHandler)
	authMux := http.NewServeMux()
	routers.RegisterAuthRoutes(authMux)
	mux.Handle("/api/v1/auth/", http.StripPrefix("/api/v1/auth", authMux))

	server := &http.Server{
		Addr:         ":" + port,
		Handler:      mux,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	log.Printf("Starting the Server @ %s", port)
	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatalf("Could not listen on %s: %v\n", port, err)
	}
}
