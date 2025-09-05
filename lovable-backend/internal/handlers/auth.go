// internal/handlers/auth.go
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

type AuthHandler struct {
	authService *services.AuthService
	logger      *logger.Logger
}

func NewAuthHandler(authService *services.AuthService, logger *logger.Logger) *AuthHandler {
	return &AuthHandler{
		authService: authService,
		logger:      logger,
	}
}

func (h *AuthHandler) Register(c *gin.Context) {
	var req models.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request data",
			"code":    "VALIDATION_ERROR",
			"details": err.Error(),
		})
		return
	}

	response, err := h.authService.Register(&req)
	if err != nil {
		status := http.StatusInternalServerError
		code := "REGISTRATION_ERROR"

		if err.Error() == "passwords do not match" {
			status = http.StatusBadRequest
			code = "PASSWORD_MISMATCH"
		} else if err.Error() == "user with this email already exists" {
			status = http.StatusConflict
			code = "EMAIL_EXISTS"
		}

		c.JSON(status, gin.H{
			"error": err.Error(),
			"code":  code,
		})
		return
	}

	// Set session
	h.authService.SetSession(response.User.ID, &services.SessionData{
		UserID:    response.User.ID,
		Email:     response.User.Email,
		Name:      response.User.Name,
		LoginTime: time.Now(),
		IPAddress: c.ClientIP(),
		UserAgent: c.GetHeader("User-Agent"),
	})

	c.JSON(http.StatusCreated, response)
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req models.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request data",
			"code":    "VALIDATION_ERROR",
			"details": err.Error(),
		})
		return
	}

	response, err := h.authService.Login(&req)
	if err != nil {
		status := http.StatusInternalServerError
		code := "LOGIN_ERROR"

		if err.Error() == "invalid email or password" {
			status = http.StatusUnauthorized
			code = "INVALID_CREDENTIALS"
		} else if err.Error() == "account is disabled" {
			status = http.StatusForbidden
			code = "ACCOUNT_DISABLED"
		}

		c.JSON(status, gin.H{
			"error": err.Error(),
			"code":  code,
		})
		return
	}

	// Set session
	h.authService.SetSession(response.User.ID, &services.SessionData{
		UserID:    response.User.ID,
		Email:     response.User.Email,
		Name:      response.User.Name,
		LoginTime: time.Now(),
		IPAddress: c.ClientIP(),
		UserAgent: c.GetHeader("User-Agent"),
	})

	c.JSON(http.StatusOK, response)
}

func (h *AuthHandler) RefreshToken(c *gin.Context) {
	var req models.RefreshTokenRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request data",
			"code":    "VALIDATION_ERROR",
			"details": err.Error(),
		})
		return
	}

	response, err := h.authService.RefreshToken(&req)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": err.Error(),
			"code":  "REFRESH_ERROR",
		})
		return
	}

	c.JSON(http.StatusOK, response)
}

func (h *AuthHandler) Logout(c *gin.Context) {
	userID := c.GetString("userID")
	if userID != "" {
		if uid, err := uuid.Parse(userID); err == nil {
			h.authService.DeleteSession(uid)
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Logout successful",
	})
}

func (h *AuthHandler) GetProfile(c *gin.Context) {
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

	c.JSON(http.StatusOK, gin.H{
		"user": models.UserInfo{
			ID:               user.ID,
			Email:            user.Email,
			Name:             user.Name,
			AvatarURL:        user.AvatarURL,
			SubscriptionPlan: user.SubscriptionPlan,
			EmailVerified:    user.EmailVerified,
			APIUsageInfo: models.APIUsageInfo{
				Used:      user.APIUsageCount,
				Limit:     user.APIUsageLimit,
				Remaining: user.APIUsageLimit - user.APIUsageCount,
				Plan:      user.SubscriptionPlan,
			},
			CreatedAt:   user.CreatedAt,
			LastLoginAt: user.LastLoginAt,
		},
	})
}

func (h *AuthHandler) UpdateProfile(c *gin.Context) {
	userIDStr := c.GetString("userID")
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid user ID",
			"code":  "INVALID_USER_ID",
		})
		return
	}

	var req models.UpdateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request data",
			"code":    "VALIDATION_ERROR",
			"details": err.Error(),
		})
		return
	}

	user, err := h.authService.UpdateProfile(userID, &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Profile update failed",
			"code":  "UPDATE_ERROR",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Profile updated successfully",
		"user": models.UserInfo{
			ID:               user.ID,
			Email:            user.Email,
			Name:             user.Name,
			AvatarURL:        user.AvatarURL,
			SubscriptionPlan: user.SubscriptionPlan,
		},
	})
}

func (h *AuthHandler) ChangePassword(c *gin.Context) {
	userIDStr := c.GetString("userID")
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid user ID",
			"code":  "INVALID_USER_ID",
		})
		return
	}

	var req models.ChangePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request data",
			"code":    "VALIDATION_ERROR",
			"details": err.Error(),
		})
		return
	}

	err = h.authService.ChangePassword(userID, &req)
	if err != nil {
		status := http.StatusInternalServerError
		code := "PASSWORD_CHANGE_ERROR"

		if err.Error() == "new passwords do not match" {
			status = http.StatusBadRequest
			code = "PASSWORD_MISMATCH"
		} else if err.Error() == "current password is incorrect" {
			status = http.StatusBadRequest
			code = "INVALID_CURRENT_PASSWORD"
		}

		c.JSON(status, gin.H{
			"error": err.Error(),
			"code":  code,
		})
		return
	}

	// Clear session after password change
	h.authService.DeleteSession(userID)

	c.JSON(http.StatusOK, gin.H{
		"message": "Password changed successfully. Please log in again.",
	})
}

func (h *AuthHandler) HealthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"service":   "Authentication",
		"status":    "healthy",
		"timestamp": time.Now().Format(time.RFC3339),
	})
}
