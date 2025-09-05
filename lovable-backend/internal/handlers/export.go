// internal/handlers/export.go
package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"lovable-backend/internal/models"
	"lovable-backend/internal/services"
	"lovable-backend/pkg/logger"
)

type ExportHandler struct {
	exportService *services.ExportService
	logger        *logger.Logger
}

func NewExportHandler(exportService *services.ExportService, logger *logger.Logger) *ExportHandler {
	return &ExportHandler{
		exportService: exportService,
		logger:        logger,
	}
}

func (h *ExportHandler) ExportHTML(c *gin.Context) {
	userIDStr := c.GetString("userID")
	if _, err := uuid.Parse(userIDStr); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid user ID",
			"code":  "INVALID_USER_ID",
		})
		return
	}

	projectIDStr := c.Param("projectId")
	projectID, err := uuid.Parse(projectIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid project ID format",
			"code":  "INVALID_PROJECT_ID",
		})
		return
	}

	minify := c.Query("minify") == "true"

	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid user ID format",
			"code":  "INVALID_USER_ID",
		})
		return
	}

	htmlContent, filename, err := h.exportService.ExportHTML(userID, projectID, minify)
	if err != nil {
		status := http.StatusInternalServerError
		code := "EXPORT_ERROR"

		if err.Error() == "project not found" {
			status = http.StatusNotFound
			code = "PROJECT_NOT_FOUND"
		} else if err.Error() == "no HTML code available for this project" {
			status = http.StatusBadRequest
			code = "NO_HTML_CODE"
		}

		c.JSON(status, gin.H{
			"error": err.Error(),
			"code":  code,
		})
		return
	}

	c.Header("Content-Type", "text/html; charset=utf-8")
	c.Header("Content-Disposition", "attachment; filename=\""+filename+"\"")
	c.Header("Cache-Control", "no-cache")

	h.logger.Info("HTML exported", "projectId", projectID, "userId", userID)

	c.Data(http.StatusOK, "text/html; charset=utf-8", htmlContent)
}

func (h *ExportHandler) ExportZIP(c *gin.Context) {
	userIDStr := c.GetString("userID")
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid user ID",
			"code":  "INVALID_USER_ID",
		})
		return
	}

	projectIDStr := c.Param("projectId")
	projectID, err := uuid.Parse(projectIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid project ID format",
			"code":  "INVALID_PROJECT_ID",
		})
		return
	}

	includeAssets := c.Query("includeAssets") == "true"

	zipContent, filename, err := h.exportService.ExportZIP(userID, projectID, includeAssets)
	if err != nil {
		status := http.StatusInternalServerError
		code := "EXPORT_ERROR"

		if err.Error() == "project not found" {
			status = http.StatusNotFound
			code = "PROJECT_NOT_FOUND"
		} else if err.Error() == "no code available for this project" {
			status = http.StatusBadRequest
			code = "NO_CODE"
		}

		c.JSON(status, gin.H{
			"error": err.Error(),
			"code":  code,
		})
		return
	}

	c.Header("Content-Type", "application/zip")
	c.Header("Content-Disposition", "attachment; filename=\""+filename+"\"")
	c.Header("Cache-Control", "no-cache")

	h.logger.Info("ZIP exported", "projectId", projectID, "userId", userID)

	c.Data(http.StatusOK, "application/zip", zipContent)
}

func (h *ExportHandler) BatchExport(c *gin.Context) {
	userIDStr := c.GetString("userID")
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid user ID",
			"code":  "INVALID_USER_ID",
		})
		return
	}

	var req models.BatchExportRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request data",
			"code":    "VALIDATION_ERROR",
			"details": err.Error(),
		})
		return
	}

	zipContent, filename, err := h.exportService.BatchExport(userID, req.ProjectIDs, req.IncludeAssets)
	if err != nil {
		status := http.StatusInternalServerError
		code := "BATCH_EXPORT_ERROR"

		if err.Error() == "no projects found" {
			status = http.StatusNotFound
			code = "NO_PROJECTS"
		}

		c.JSON(status, gin.H{
			"error": err.Error(),
			"code":  code,
		})
		return
	}

	c.Header("Content-Type", "application/zip")
	c.Header("Content-Disposition", "attachment; filename=\""+filename+"\"")
	c.Header("Cache-Control", "no-cache")

	h.logger.Info("Batch export completed", "projectCount", len(req.ProjectIDs), "userId", userID)

	c.Data(http.StatusOK, "application/zip", zipContent)
}

func (h *ExportHandler) GetExportHistory(c *gin.Context) {
	userIDStr := c.GetString("userID")
	if _, err := uuid.Parse(userIDStr); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid user ID",
			"code":  "INVALID_USER_ID",
		})
		return
	}

	// In a real implementation, this would fetch from Redis or database
	// For now, return mock data
	exportHistory := []gin.H{
		{
			"type":  "HTML Exports",
			"count": 12,
		},
		{
			"type":  "ZIP Exports",
			"count": 8,
		},
		{
			"type":  "Batch Exports",
			"count": 2,
		},
		{
			"type":  "Total Projects Exported",
			"count": 15,
		},
	}

	totalExports := 0
	for _, stat := range exportHistory {
		totalExports += stat["count"].(int)
	}

	c.JSON(http.StatusOK, gin.H{
		"exportStats": exportHistory,
		"summary": gin.H{
			"totalExports": totalExports,
			"lastUpdated":  time.Now().Format(time.RFC3339),
		},
	})
}

func (h *ExportHandler) Preview(c *gin.Context) {
	projectIDStr := c.Param("projectId")
	projectID, err := uuid.Parse(projectIDStr)
	if err != nil {
		c.String(http.StatusBadRequest, `
			<!DOCTYPE html>
			<html>
			<head>
				<title>Invalid Project</title>
				<style>
					body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
					.error { color: #e74c3c; }
				</style>
			</head>
			<body>
				<h1 class="error">Invalid Project ID</h1>
				<p>The project ID format is invalid.</p>
			</body>
			</html>
		`)
		return
	}

	var userID *uuid.UUID
	if userIDStr := c.GetString("userID"); userIDStr != "" {
		if uid, err := uuid.Parse(userIDStr); err == nil {
			userID = &uid
		}
	}

	project, err := h.exportService.GetProjectForPreview(projectID, userID)
	if err != nil {
		c.Header("Content-Type", "text/html; charset=utf-8")
		c.String(http.StatusNotFound, `
			<!DOCTYPE html>
			<html>
			<head>
				<title>Project Not Found</title>
				<style>
					body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
					.error { color: #e74c3c; }
				</style>
			</head>
			<body>
				<h1 class="error">Project Not Found</h1>
				<p>The requested project does not exist or is not public.</p>
			</body>
			</html>
		`)
		return
	}

	if project.HTMLCode == nil || *project.HTMLCode == "" {
		c.Header("Content-Type", "text/html; charset=utf-8")
		c.String(http.StatusBadRequest, `
			<!DOCTYPE html>
			<html>
			<head>
				<title>No Content</title>
				<style>
					body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
					.warning { color: #f39c12; }
				</style>
			</head>
			<body>
				<h1 class="warning">No Content Available</h1>
				<p>This project doesn't have any generated content yet.</p>
			</body>
			</html>
		`)
		return
	}

	c.Header("Content-Type", "text/html; charset=utf-8")
	c.Header("X-Frame-Options", "SAMEORIGIN")
	c.String(http.StatusOK, *project.HTMLCode)
}

func (h *ExportHandler) HealthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"service":          "Export",
		"status":           "healthy",
		"timestamp":        time.Now().Format(time.RFC3339),
		"supportedFormats": []string{"html", "zip"},
	})
}
