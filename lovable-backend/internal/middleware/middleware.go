// internal/middleware/middleware.go
package middleware

import (
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"lovable-backend/internal/redis"
	"lovable-backend/internal/services"
	"lovable-backend/pkg/logger"
)

type RateLimiter struct {
	redisClient *redis.Client
}

func NewRateLimiter(redisClient *redis.Client) *RateLimiter {
	return &RateLimiter{
		redisClient: redisClient,
	}
}

// Auth middleware for JWT token validation
func Auth(authService *services.AuthService) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Access denied. No token provided.",
				"code":  "NO_TOKEN",
			})
			c.Abort()
			return
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Invalid token format",
				"code":  "INVALID_TOKEN_FORMAT",
			})
			c.Abort()
			return
		}

		token := parts[1]
		claims, err := authService.ValidateToken(token)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Invalid token",
				"code":  "INVALID_TOKEN",
			})
			c.Abort()
			return
		}

		// Set user info in context
		c.Set("userID", claims.UserID)
		c.Set("email", claims.Email)
		c.Set("name", claims.Name)
		c.Set("subscriptionPlan", claims.SubscriptionPlan)

		c.Next()
	}
}

// Optional auth middleware for public endpoints that may have auth
func OptionalAuth(authService *services.AuthService) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader != "" {
			parts := strings.Split(authHeader, " ")
			if len(parts) == 2 && parts[0] == "Bearer" {
				token := parts[1]
				if claims, err := authService.ValidateToken(token); err == nil {
					c.Set("userID", claims.UserID)
					c.Set("email", claims.Email)
					c.Set("name", claims.Name)
					c.Set("subscriptionPlan", claims.SubscriptionPlan)
				}
			}
		}
		c.Next()
	}
}

// Usage limit middleware
func UsageLimit(authService *services.AuthService) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, exists := c.Get("userID")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Authentication required",
				"code":  "AUTH_REQUIRED",
			})
			c.Abort()
			return
		}

		subscriptionPlan, _ := c.Get("subscriptionPlan")
		plan := "free"
		if subscriptionPlan != nil {
			plan = subscriptionPlan.(string)
		}

		allowed, usageInfo, err := authService.CheckUsageLimit(userID.(uuid.UUID), plan)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to check usage limit",
				"code":  "USAGE_CHECK_ERROR",
			})
			c.Abort()
			return
		}

		if !allowed {
			c.JSON(http.StatusTooManyRequests, gin.H{
				"error":     "Daily usage limit exceeded",
				"code":      "DAILY_LIMIT_EXCEEDED",
				"limit":     usageInfo.Limit,
				"used":      usageInfo.Used,
				"resetTime": time.Now().Add(24 * time.Hour).Format(time.RFC3339),
			})
			c.Abort()
			return
		}

		c.Set("usageInfo", usageInfo)
		c.Next()
	}
}

// Security middleware
func Security() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("X-Content-Type-Options", "nosniff")
		c.Header("X-Frame-Options", "DENY")
		c.Header("X-XSS-Protection", "1; mode=block")
		c.Header("Referrer-Policy", "strict-origin-when-cross-origin")
		c.Header("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
		c.Next()
	}
}

// Logger middleware
func Logger(logger *logger.Logger) gin.HandlerFunc {
	return gin.LoggerWithWriter(logger)
}

// Rate limiting methods
func (rl *RateLimiter) GlobalLimit() gin.HandlerFunc {
	return rl.createRateLimit("global", 100, 15*time.Minute, "Too many requests")
}

func (rl *RateLimiter) AuthLimit() gin.HandlerFunc {
	return rl.createRateLimit("auth", 5, 15*time.Minute, "Too many authentication attempts")
}

func (rl *RateLimiter) ProjectLimit() gin.HandlerFunc {
	return rl.createRateLimit("project", 30, time.Minute, "Too many project requests")
}

func (rl *RateLimiter) AILimit() gin.HandlerFunc {
	return rl.createRateLimit("ai", 10, time.Minute, "AI generation rate limit exceeded")
}

func (rl *RateLimiter) ExportLimit() gin.HandlerFunc {
	return rl.createRateLimit("export", 10, time.Minute, "Export rate limit exceeded")
}

func (rl *RateLimiter) createRateLimit(prefix string, limit int64, window time.Duration, message string) gin.HandlerFunc {
	return func(c *gin.Context) {
		if rl.redisClient == nil {
			c.Next()
			return
		}

		var key string
		if userID, exists := c.Get("userID"); exists {
			key = prefix + ":user:" + userID.(uuid.UUID).String()
		} else {
			key = prefix + ":ip:" + c.ClientIP()
		}

		allowed, remaining, resetTime, err := rl.redisClient.CheckRateLimit(key, limit, window)
		if err != nil {
			// Continue on Redis error
			c.Next()
			return
		}

		// Set rate limit headers
		c.Header("X-RateLimit-Limit", string(rune(limit)))
		c.Header("X-RateLimit-Remaining", string(rune(remaining)))
		c.Header("X-RateLimit-Reset", resetTime.Format(time.RFC3339))

		if !allowed {
			retryAfter := int64(resetTime.Sub(time.Now()).Seconds())
			c.JSON(http.StatusTooManyRequests, gin.H{
				"error":      message,
				"code":       "RATE_LIMIT_EXCEEDED",
				"retryAfter": retryAfter,
			})
			c.Abort()
			return
		}

		c.Next()
	}
}

