// internal/handlers/ai.go
package handlers

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"

	"lovable-backend/internal/models"
	"lovable-backend/internal/services"
	"lovable-backend/pkg/logger"
)

type AIHandler struct {
	aiService      *services.AIService
	projectService *services.ProjectService
	authService    *services.AuthService
	logger         *logger.Logger
	upgrader       websocket.Upgrader
}

func NewAIHandler(aiService *services.AIService, projectService *services.ProjectService, logger *logger.Logger) *AIHandler {
	upgrader := websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool {
			// Allow all origins for development - restrict in production
			return true
		},
	}

	return &AIHandler{
		aiService:      aiService,
		projectService: projectService,
		logger:         logger,
		upgrader:       upgrader,
	}
}

func (h *AIHandler) Generate(c *gin.Context) {
	userIDStr := c.GetString("userID")
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid user ID",
			"code":  "INVALID_USER_ID",
		})
		return
	}

	var req models.GenerateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request data",
			"code":    "VALIDATION_ERROR",
			"details": err.Error(),
		})
		return
	}

	startTime := time.Now()

	// Verify project ownership and get project details
	project, err := h.projectService.GetProject(userID, req.ProjectID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Project not found or access denied",
			"code":  "PROJECT_NOT_FOUND",
		})
		return
	}

	// Generate website code
	result, err := h.aiService.GenerateWebsite(req.Message, req.ConversationHistory, nil)
	if err != nil {
		status := http.StatusInternalServerError
		code := "GENERATION_ERROR"

		if err.Error() == "rate limit exceeded" {
			status = http.StatusTooManyRequests
			code = "AI_RATE_LIMIT"
		}

		c.JSON(status, gin.H{
			"error": err.Error(),
			"code":  code,
		})
		return
	}

	responseTime := time.Since(startTime).Milliseconds()

	// Save conversation and update project
	conversation, err := h.projectService.SaveConversation(
		req.ProjectID, userID, req.Message,
		result.ConversationalResponse, result.HTMLCode,
		result.TokensUsed, responseTime, "claude-sonnet-4", "generation",
	)
	if err != nil {
		h.logger.Error("Failed to save conversation", "error", err)
	}

	// Update project with new code if generated
	if result.HTMLCode != "" {
		updateReq := &models.UpdateProjectRequest{
			HTMLCode: &result.HTMLCode,
		}
		h.projectService.UpdateProject(userID, req.ProjectID, updateReq)
	}

	// Increment user usage
	h.authService.IncrementUsage(userID)

	// Use the project variable in response
	response := models.GenerateResponse{
		Message: "Website generated successfully",
		Result: models.GenerationResult{
			ConversationID:         conversation.ID,
			ConversationalResponse: result.ConversationalResponse,
			HTMLCode:               result.HTMLCode,
			TokensUsed:             result.TokensUsed,
			ResponseTime:           int(responseTime),
			FromCache:              result.FromCache,
			GeneratedAt:            conversation.CreatedAt,
		},
		Project: &models.ProjectBasicInfo{
			ID:   project.ID,
			Name: project.Name,
		},
	}

	c.JSON(http.StatusOK, response)
}

func (h *AIHandler) Refine(c *gin.Context) {
	userIDStr := c.GetString("userID")
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid user ID",
			"code":  "INVALID_USER_ID",
		})
		return
	}

	var req models.RefineRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request data",
			"code":    "VALIDATION_ERROR",
			"details": err.Error(),
		})
		return
	}

	startTime := time.Now()

	// Verify project ownership
	_, err = h.projectService.GetProject(userID, req.ProjectID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Project not found or access denied",
			"code":  "PROJECT_NOT_FOUND",
		})
		return
	}

	// Refine website code
	result, err := h.aiService.RefineWebsite(req.CurrentCode, req.RefinementRequest)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Website refinement failed",
			"code":  "REFINEMENT_ERROR",
		})
		return
	}

	responseTime := time.Since(startTime).Milliseconds()

	// Save conversation and update project
	conversation, err := h.projectService.SaveConversation(
		req.ProjectID, userID, req.RefinementRequest,
		result.ConversationalResponse, result.HTMLCode,
		result.TokensUsed, responseTime, "claude-sonnet-4", "refinement",
	)
	if err != nil {
		h.logger.Error("Failed to save conversation", "error", err)
	}

	// Update project with refined code
	if result.HTMLCode != "" {
		updateReq := &models.UpdateProjectRequest{
			HTMLCode: &result.HTMLCode,
		}
		h.projectService.UpdateProject(userID, req.ProjectID, updateReq)
	}

	// Increment user usage
	h.authService.IncrementUsage(userID)

	response := gin.H{
		"message": "Website refined successfully",
		"result": models.GenerationResult{
			ConversationID:         conversation.ID,
			ConversationalResponse: result.ConversationalResponse,
			HTMLCode:               result.HTMLCode,
			TokensUsed:             result.TokensUsed,
			ResponseTime:           int(responseTime),
			GeneratedAt:            conversation.CreatedAt,
		},
	}

	c.JSON(http.StatusOK, response)
}

func (h *AIHandler) GenerateTemplate(c *gin.Context) {
	userIDStr := c.GetString("userID")
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid user ID",
			"code":  "INVALID_USER_ID",
		})
		return
	}

	var req models.TemplateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request data",
			"code":    "VALIDATION_ERROR",
			"details": err.Error(),
		})
		return
	}

	style := ""
	if req.Style != nil {
		style = *req.Style
	}

	colorScheme := ""
	if req.ColorScheme != nil {
		colorScheme = *req.ColorScheme
	}

	// Generate template
	result, err := h.aiService.GenerateFromTemplate(req.Category, style, colorScheme)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Template generation failed",
			"code":  "TEMPLATE_ERROR",
		})
		return
	}

	// Increment user usage
	h.authService.IncrementUsage(userID)

	response := gin.H{
		"message": "Template generated successfully",
		"template": gin.H{
			"category":    req.Category,
			"style":       style,
			"colorScheme": colorScheme,
			"htmlCode":    result.HTMLCode,
			"description": result.ConversationalResponse,
		},
	}

	c.JSON(http.StatusOK, response)
}

func (h *AIHandler) GetTemplates(c *gin.Context) {
	category := c.Query("category")
	limit, err := strconv.Atoi(c.DefaultQuery("limit", "20"))
	if err != nil || limit <= 0 {
		limit = 20
	}

	// This would typically fetch from database
	// For now, return the available template categories
	templates := []gin.H{
		{
			"id":          uuid.New(),
			"name":        "Modern Portfolio",
			"description": "A clean, modern portfolio website perfect for developers and designers",
			"category":    "portfolio",
			"tags":        []string{"modern", "portfolio", "developer"},
			"usage_count": 145,
			"rating":      4.8,
			"is_premium":  false,
			"created_at":  time.Now().Add(-30 * 24 * time.Hour),
		},
		{
			"id":          uuid.New(),
			"name":        "SaaS Landing Page",
			"description": "A high-converting landing page template for SaaS products",
			"category":    "landing",
			"tags":        []string{"saas", "landing", "conversion"},
			"usage_count": 98,
			"rating":      4.6,
			"is_premium":  false,
			"created_at":  time.Now().Add(-15 * 24 * time.Hour),
		},
		{
			"id":          uuid.New(),
			"name":        "Restaurant Website",
			"description": "Appetizing restaurant website with menu and contact information",
			"category":    "restaurant",
			"tags":        []string{"restaurant", "food", "menu"},
			"usage_count": 67,
			"rating":      4.4,
			"is_premium":  false,
			"created_at":  time.Now().Add(-7 * 24 * time.Hour),
		},
	}

	// Filter by category if specified
	if category != "" {
		filtered := []gin.H{}
		for _, template := range templates {
			if template["category"] == category {
				filtered = append(filtered, template)
			}
		}
		templates = filtered
	}

	categories := []string{
		"portfolio", "landing", "blog", "ecommerce", "restaurant",
		"business", "personal", "dashboard", "documentation",
	}

	c.JSON(http.StatusOK, gin.H{
		"templates":  templates,
		"categories": categories,
	})
}

func (h *AIHandler) GetTemplate(c *gin.Context) {
	templateIDStr := c.Param("id")
	templateID, err := uuid.Parse(templateIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid template ID format",
			"code":  "INVALID_TEMPLATE_ID",
		})
		return
	}

	// This would typically fetch from database
	// For demo purposes, return a sample template
	template := gin.H{
		"id":          templateID,
		"name":        "Modern Portfolio",
		"description": "A clean, modern portfolio website perfect for developers and designers",
		"category":    "portfolio",
		"html_code":   "<!DOCTYPE html>...", // Full HTML would be here
		"tags":        []string{"modern", "portfolio", "developer"},
		"usage_count": 146, // Incremented
		"rating":      4.8,
		"is_premium":  false,
		"created_at":  time.Now().Add(-30 * 24 * time.Hour),
	}

	c.JSON(http.StatusOK, gin.H{
		"template": template,
	})
}

func (h *AIHandler) GetStatus(c *gin.Context) {
	status := gin.H{
		"service":   "AI Generation",
		"status":    "operational",
		"timestamp": time.Now().Format(time.RFC3339),
		"models": gin.H{
			"primary":  "claude-sonnet-4-20250514",
			"fallback": "template-based",
		},
		"aiService": "connected",
		"cache":     "connected", // Would check Redis status
	}

	c.JSON(http.StatusOK, status)
}

func (h *AIHandler) GetUsage(c *gin.Context) {
	userIDStr := c.GetString("userID")
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid user ID",
			"code":  "INVALID_USER_ID",
		})
		return
	}

	user, err := h.authService.GetUserByID(userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "User not found",
			"code":  "USER_NOT_FOUND",
		})
		return
	}

	// Get recent usage stats - would typically fetch from database
	recentUsage := []gin.H{
		{
			"date":        time.Now().Format("2006-01-02"),
			"generations": 5,
			"tokens":      2450,
		},
		{
			"date":        time.Now().Add(-24 * time.Hour).Format("2006-01-02"),
			"generations": 8,
			"tokens":      3420,
		},
	}

	response := gin.H{
		"currentUsage": gin.H{
			"apiCalls":  user.APIUsageCount,
			"limit":     user.APIUsageLimit,
			"remaining": user.APIUsageLimit - user.APIUsageCount,
			"plan":      user.SubscriptionPlan,
		},
		"stats": gin.H{
			"totalGenerations":   45,
			"totalRefinements":   12,
			"totalTokens":        25600,
			"cacheHits":          8,
			"templatesGenerated": 3,
		},
		"recentUsage": recentUsage,
	}

	c.JSON(http.StatusOK, response)
}

func (h *AIHandler) HealthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"service":   "AI Generation",
		"status":    "healthy",
		"timestamp": time.Now().Format(time.RFC3339),
	})
}

// WebSocket handler for real-time AI generation
func (h *AIHandler) HandleWebSocket(c *gin.Context) {
	conn, err := h.upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		h.logger.Error("WebSocket upgrade failed", "error", err)
		return
	}
	defer conn.Close()

	userIDStr := c.GetString("userID")
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		h.logger.Error("Invalid user ID for WebSocket", "error", err)
		return
	}

	h.logger.Info("WebSocket connection established", "userID", userID)

	for {
		var msg struct {
			Type                string                     `json:"type"`
			ProjectID           string                     `json:"projectId"`
			Message             string                     `json:"message"`
			ConversationHistory []models.ConversationEntry `json:"conversationHistory"`
		}

		err := conn.ReadJSON(&msg)
		if err != nil {
			h.logger.Error("WebSocket read error", "error", err)
			break
		}

		if msg.Type == "generate_website" {
			projectID, err := uuid.Parse(msg.ProjectID)
			if err != nil {
				conn.WriteJSON(gin.H{
					"type":      "error",
					"projectId": msg.ProjectID,
					"error":     "Invalid project ID",
				})
				continue
			}

			// Send generation started
			conn.WriteJSON(gin.H{
				"type":      "generation_started",
				"projectId": msg.ProjectID,
			})

			// Generate with progress callbacks
			result, err := h.aiService.GenerateWebsite(msg.Message, msg.ConversationHistory, func(progress int) {
				conn.WriteJSON(gin.H{
					"type":      "generation_progress",
					"projectId": msg.ProjectID,
					"progress":  progress,
					"stage":     "generating",
				})
			})

			if err != nil {
				conn.WriteJSON(gin.H{
					"type":      "generation_error",
					"projectId": msg.ProjectID,
					"error":     err.Error(),
				})
				continue
			}

			// Save conversation
			conversation, _ := h.projectService.SaveConversation(
				projectID, userID, msg.Message,
				result.ConversationalResponse, result.HTMLCode,
				result.TokensUsed, result.ResponseTime, "claude-sonnet-4", "generation",
			)

			// Update project
			if result.HTMLCode != "" {
				updateReq := &models.UpdateProjectRequest{
					HTMLCode: &result.HTMLCode,
				}
				h.projectService.UpdateProject(userID, projectID, updateReq)
			}

			// Send completion
			conn.WriteJSON(gin.H{
				"type":      "generation_complete",
				"projectId": msg.ProjectID,
				"result": gin.H{
					"conversationId":         conversation.ID,
					"conversationalResponse": result.ConversationalResponse,
					"htmlCode":               result.HTMLCode,
					"tokensUsed":             result.TokensUsed,
					"responseTime":           result.ResponseTime,
					"fromCache":              result.FromCache,
				},
			})

			// Increment usage
			h.authService.IncrementUsage(userID)
		}
	}

	h.logger.Info("WebSocket connection closed", "userID", userID)
}
