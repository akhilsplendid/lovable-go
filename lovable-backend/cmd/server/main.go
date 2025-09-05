package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

	"lovable-backend/internal/config"
	"lovable-backend/internal/database"
	"lovable-backend/internal/handlers"
	"lovable-backend/internal/middleware"
	"lovable-backend/internal/redis"
	"lovable-backend/internal/services"
	"lovable-backend/pkg/logger"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system environment variables")
	}

	// Initialize configuration
	cfg := config.Load()

	// Initialize logger
	logger := logger.New(cfg.Environment)

	// Initialize database
	db, err := database.Connect(cfg.Database)
	if err != nil {
		logger.Fatal("Failed to connect to database", "error", err)
	}

	// Run migrations
	if err := database.Migrate(db); err != nil {
		logger.Fatal("Failed to run migrations", "error", err)
	}

	// Initialize Redis
	redisClient := redis.Connect(cfg.Redis)
	if redisClient == nil {
		logger.Warn("Redis connection failed, continuing without cache")
	}

	// Initialize services
	authService := services.NewAuthService(db, redisClient, cfg.JWT)
	aiService := services.NewAIService(cfg.AI, redisClient)
	projectService := services.NewProjectService(db, redisClient)
	exportService := services.NewExportService(db)

	// Initialize handlers
	authHandler := handlers.NewAuthHandler(authService, logger)
	projectHandler := handlers.NewProjectHandler(projectService, logger)
	aiHandler := handlers.NewAIHandler(aiService, projectService, logger)
	exportHandler := handlers.NewExportHandler(exportService, logger)

	// Setup Gin router
	if cfg.Environment == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	router := gin.New()

	// Middleware
	router.Use(gin.Recovery())
	router.Use(middleware.Logger(logger))
	router.Use(middleware.Security())

	// CORS configuration
	corsConfig := cors.DefaultConfig()
	corsConfig.AllowOrigins = []string{cfg.FrontendURL}
	corsConfig.AllowCredentials = true
	corsConfig.AllowHeaders = []string{"*"}
	corsConfig.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	router.Use(cors.New(corsConfig))

	// Rate limiting
	rateLimiter := middleware.NewRateLimiter(redisClient)
	router.Use(rateLimiter.GlobalLimit())

	// Health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":      "healthy",
			"timestamp":   time.Now().Format(time.RFC3339),
			"version":     "1.0.0",
			"environment": cfg.Environment,
		})
	})

	// API routes
	api := router.Group("/api")
	{
		// Auth routes
		auth := api.Group("/auth")
		{
			auth.POST("/register", rateLimiter.AuthLimit(), authHandler.Register)
			auth.POST("/login", rateLimiter.AuthLimit(), authHandler.Login)
			auth.POST("/refresh", authHandler.RefreshToken)
			auth.POST("/logout", middleware.Auth(authService), authHandler.Logout)
			auth.GET("/me", middleware.Auth(authService), authHandler.GetProfile)
			auth.PUT("/me", middleware.Auth(authService), authHandler.UpdateProfile)
			auth.PUT("/password", middleware.Auth(authService), authHandler.ChangePassword)
			auth.GET("/health", authHandler.HealthCheck)
		}

		// Protected routes
		protected := api.Group("")
		protected.Use(middleware.Auth(authService))
		{
			// Project routes
			projects := protected.Group("/projects")
			{
				projects.GET("", rateLimiter.ProjectLimit(), projectHandler.GetProjects)
				projects.POST("", rateLimiter.ProjectLimit(), projectHandler.CreateProject)
				projects.GET("/:id", projectHandler.GetProject)
				projects.PUT("/:id", projectHandler.UpdateProject)
				projects.DELETE("/:id", projectHandler.DeleteProject)
				projects.POST("/:id/duplicate", projectHandler.DuplicateProject)
				projects.GET("/:id/conversations", projectHandler.GetConversations)
				projects.GET("/health", projectHandler.HealthCheck)
			}

			// AI routes
			ai := protected.Group("/ai")
			ai.Use(middleware.UsageLimit(authService))
			{
				ai.POST("/generate", rateLimiter.AILimit(), aiHandler.Generate)
				ai.POST("/refine", rateLimiter.AILimit(), aiHandler.Refine)
				ai.POST("/template", rateLimiter.AILimit(), aiHandler.GenerateTemplate)
				ai.GET("/templates", aiHandler.GetTemplates)
				ai.GET("/templates/:id", aiHandler.GetTemplate)
				ai.GET("/status", aiHandler.GetStatus)
				ai.GET("/usage", aiHandler.GetUsage)
				ai.GET("/health", aiHandler.HealthCheck)
			}

			// Export routes
			export := protected.Group("/export")
			{
				export.GET("/:projectId/html", rateLimiter.ExportLimit(), exportHandler.ExportHTML)
				export.GET("/:projectId/zip", rateLimiter.ExportLimit(), exportHandler.ExportZIP)
				export.POST("/batch", rateLimiter.ExportLimit(), exportHandler.BatchExport)
				export.GET("/history", exportHandler.GetExportHistory)
				export.GET("/health", exportHandler.HealthCheck)
			}
		}

		// Public preview route
		api.GET("/export/:projectId/preview", middleware.OptionalAuth(authService), exportHandler.Preview)
	}

	// WebSocket endpoint for real-time AI generation
	router.GET("/ws", middleware.Auth(authService), aiHandler.HandleWebSocket)

	// 404 handler
	router.NoRoute(func(c *gin.Context) {
		c.JSON(http.StatusNotFound, gin.H{
			"error":     "Endpoint not found",
			"path":      c.Request.URL.Path,
			"method":    c.Request.Method,
			"timestamp": time.Now().Format(time.RFC3339),
		})
	})

	// Create HTTP server
	server := &http.Server{
		Addr:         ":" + cfg.Port,
		Handler:      router,
		ReadTimeout:  30 * time.Second,
		WriteTimeout: 30 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Start server in goroutine
	go func() {
		logger.Info("🚀 Server starting", "port", cfg.Port, "environment", cfg.Environment)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logger.Fatal("Failed to start server", "error", err)
		}
	}()

	// Wait for interrupt signal to gracefully shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	logger.Info("🛑 Shutting down server...")

	// Graceful shutdown with timeout
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		logger.Fatal("Server forced to shutdown", "error", err)
	}

	// Close database connections
	if sqlDB, err := db.DB(); err == nil {
		sqlDB.Close()
	}

	// Close Redis connection
	if redisClient != nil {
		redisClient.Close()
	}

	logger.Info("✅ Server shutdown complete")
}
