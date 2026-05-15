package routes

import (
	"trading-journal/controllers"
	"trading-journal/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(router *gin.Engine) {
	// Serve uploaded files statically
	router.Static("/uploads", "./uploads")

	// Health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	api := router.Group("/api")

	// Auth routes (public)
	authController := controllers.NewAuthController()
	authRoutes := api.Group("/auth")
	{
		authRoutes.POST("/register", authController.Register)
		authRoutes.POST("/login", authController.Login)
	}

	// Protected routes
	protected := api.Group("")
	protected.Use(middleware.AuthMiddleware())
	{
		// Auth (protected)
		protected.GET("/auth/me", authController.GetMe)

		// File upload
		uploadController := controllers.NewUploadController()
		protected.POST("/upload/screenshot", uploadController.UploadScreenshot)

		// Trades
		tradeController := controllers.NewTradeController()
		trades := protected.Group("/trades")
		{
			trades.POST("", tradeController.CreateTrade)
			trades.GET("", tradeController.GetTrades)
			trades.GET("/:id", tradeController.GetTradeByID)
			trades.PUT("/:id", tradeController.UpdateTrade)
			trades.DELETE("/:id", tradeController.DeleteTrade)

			// Trade reviews
			trades.POST("/:id/review", tradeController.CreateTradeReview)
			trades.PUT("/:id/review", tradeController.UpdateTradeReview)
		}

		// Analytics / Dashboard
		analyticsController := controllers.NewAnalyticsController()
		dashboard := protected.Group("/dashboard")
		{
			dashboard.GET("/stats", analyticsController.GetDashboardStats)
			dashboard.GET("/monthly-performance", analyticsController.GetMonthlyPerformance)
		}
	}
}
