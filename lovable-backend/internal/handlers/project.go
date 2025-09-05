// internal/handlers/project.go
package handlers

import (
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"lovable-backend/internal/models"
	"lovable-backend/internal/services"
	"lovable-backend/pkg/logger"
)

type ProjectHandler struct {
	projectService *services.ProjectService
	logger         *logger.Logger
}

func NewProjectHandler(projectService *services.ProjectService, logger *logger.Logger) *ProjectHandler {
	return &ProjectHandler{
		projectService: projectService,
		logger:         logger,
	}
}

func (h *ProjectHandler) GetProjects(c *gin.Context) {
	userIDStr := c.GetString("userID")
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid user ID",
			"code":  "INVALID_USER_ID",
		})
		return
	}

	// Parse query parameters
	query := &services.ProjectQuery{
		Page:   1,
		Limit:  20,
		Sort:   "updated_at",
		Order:  "desc",
		Status: c.Query("status"),
		Search: c.Query("search"),
	}

	if page, err := strconv.Atoi(c.DefaultQuery("page", "1")); err == nil && page > 0 {
		query.Page = page
	}

	if limit, err := strconv.Atoi(c.DefaultQuery("limit", "20")); err == nil && limit > 0 && limit <= 100 {
		query.Limit = limit
	}

	if sort := c.Query("sort"); sort != "" {
		if sort == "created_at" || sort == "updated_at" || sort == "name" || sort == "view_count" {
			query.Sort = sort
		}
	}

	if order := c.Query("order"); order == "asc" {
		query.Order = "asc"
	}

	if tags := c.Query("tags"); tags != "" {
		query.Tags = strings.Split(tags, ",")
	}

	response, err := h.projectService.GetProjects(userID, query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch projects",
			"code":  "FETCH_ERROR",
		})
		return
	}

	c.JSON(http.StatusOK, response)
}

func (h *ProjectHandler) GetProject(c *gin.Context) {
	userIDStr := c.GetString("userID")
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid user ID",
			"code":  "INVALID_USER_ID",
		})
		return
	}

	projectIDStr := c.Param("id")
	projectID, err := uuid.Parse(projectIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid project ID format",
			"code":  "INVALID_PROJECT_ID",
		})
		return
	}

	project, err := h.projectService.GetProject(userID, projectID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Project not found",
			"code":  "PROJECT_NOT_FOUND",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"project": project,
	})
}

func (h *ProjectHandler) CreateProject(c *gin.Context) {
	userIDStr := c.GetString("userID")
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid user ID",
			"code":  "INVALID_USER_ID",
		})
		return
	}

	var req models.CreateProjectRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request data",
			"code":    "VALIDATION_ERROR",
			"details": err.Error(),
		})
		return
	}

	project, err := h.projectService.CreateProject(userID, &req)
	if err != nil {
		status := http.StatusInternalServerError
		code := "CREATE_ERROR"

		if strings.Contains(err.Error(), "project limit reached") {
			status = http.StatusForbidden
			code = "PROJECT_LIMIT_EXCEEDED"
		}

		c.JSON(status, gin.H{
			"error": err.Error(),
			"code":  code,
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Project created successfully",
		"project": project,
	})
}

func (h *ProjectHandler) UpdateProject(c *gin.Context) {
	userIDStr := c.GetString("userID")
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid user ID",
			"code":  "INVALID_USER_ID",
		})
		return
	}

	projectIDStr := c.Param("id")
	projectID, err := uuid.Parse(projectIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid project ID format",
			"code":  "INVALID_PROJECT_ID",
		})
		return
	}

	var req models.UpdateProjectRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request data",
			"code":    "VALIDATION_ERROR",
			"details": err.Error(),
		})
		return
	}

	project, err := h.projectService.UpdateProject(userID, projectID, &req)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Project not found",
			"code":  "PROJECT_NOT_FOUND",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Project updated successfully",
		"project": project,
	})
}

func (h *ProjectHandler) DeleteProject(c *gin.Context) {
	userIDStr := c.GetString("userID")
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid user ID",
			"code":  "INVALID_USER_ID",
		})
		return
	}

	projectIDStr := c.Param("id")
	projectID, err := uuid.Parse(projectIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid project ID format",
			"code":  "INVALID_PROJECT_ID",
		})
		return
	}

	err = h.projectService.DeleteProject(userID, projectID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Project not found",
			"code":  "PROJECT_NOT_FOUND",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Project deleted successfully",
	})
}

func (h *ProjectHandler) DuplicateProject(c *gin.Context) {
	userIDStr := c.GetString("userID")
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid user ID",
			"code":  "INVALID_USER_ID",
		})
		return
	}

	projectIDStr := c.Param("id")
	projectID, err := uuid.Parse(projectIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid project ID format",
			"code":  "INVALID_PROJECT_ID",
		})
		return
	}

	project, err := h.projectService.DuplicateProject(userID, projectID)
	if err != nil {
		status := http.StatusInternalServerError
		code := "DUPLICATE_ERROR"

		if strings.Contains(err.Error(), "project limit reached") {
			status = http.StatusForbidden
			code = "PROJECT_LIMIT_EXCEEDED"
		}

		c.JSON(status, gin.H{
			"error": err.Error(),
			"code":  code,
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Project duplicated successfully",
		"project": project,
	})
}

func (h *ProjectHandler) GetConversations(c *gin.Context) {
	userIDStr := c.GetString("userID")
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid user ID",
			"code":  "INVALID_USER_ID",
		})
		return
	}

	projectIDStr := c.Param("id")
	projectID, err := uuid.Parse(projectIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid project ID format",
			"code":  "INVALID_PROJECT_ID",
		})
		return
	}

	conversations, err := h.projectService.GetConversations(userID, projectID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Project not found",
			"code":  "PROJECT_NOT_FOUND",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"conversations": conversations,
		"total":         len(conversations),
	})
}

func (h *ProjectHandler) HealthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"service":   "Projects",
		"status":    "healthy",
		"timestamp": time.Now().Format(time.RFC3339),
	})
}
