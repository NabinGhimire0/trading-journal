package main

import (
	"log"

	"trading-journal/config"
	"trading-journal/database"
	"trading-journal/middleware"
	"trading-journal/models"
	"trading-journal/routes"

	"github.com/gin-gonic/gin"
)

func main() {
	// Load configuration
	config.LoadConfig()

	// Connect to database
	database.Connect()

	// Auto-migrate
	if err := models.AutoMigrate(database.GetDB()); err != nil {
		log.Fatalf("Failed to auto-migrate: %v", err)
	}

	// Setup Gin
	router := gin.Default()

	// CORS middleware
	router.Use(middleware.CORSConfig())

	// Setup routes
	routes.SetupRoutes(router)

	// Start server
	port := config.AppConfig.Port
	log.Printf("Server starting on port %s", port)
	if err := router.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
