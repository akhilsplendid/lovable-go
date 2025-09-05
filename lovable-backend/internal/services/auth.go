// internal/services/auth.go
package services

import (
	"errors"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"

	"lovable-backend/internal/config"
	"lovable-backend/internal/models"
	"lovable-backend/internal/redis"
)

type AuthService struct {
	db          *gorm.DB
	redisClient *redis.Client
	jwtConfig   config.JWTConfig
}

type JWTClaims struct {
	UserID           uuid.UUID `json:"user_id"`
	Email            string    `json:"email"`
	Name             *string   `json:"name"`
	SubscriptionPlan string    `json:"subscription_plan"`
	Type             string    `json:"type"` // "access" or "refresh"
	jwt.RegisteredClaims
}

type SessionData struct {
	UserID    uuid.UUID `json:"user_id"`
	Email     string    `json:"email"`
	Name      *string   `json:"name"`
	LoginTime time.Time `json:"login_time"`
	IPAddress string    `json:"ip_address"`
	UserAgent string    `json:"user_agent"`
}

func NewAuthService(db *gorm.DB, redisClient *redis.Client, jwtConfig config.JWTConfig) *AuthService {
	return &AuthService{
		db:          db,
		redisClient: redisClient,
		jwtConfig:   jwtConfig,
	}
}

func (s *AuthService) Register(req *models.RegisterRequest) (*models.AuthResponse, error) {
	// Validate confirm password
	if req.Password != req.ConfirmPassword {
		return nil, errors.New("passwords do not match")
	}

	// Check if user exists
	var existingUser models.User
	if err := s.db.Where("email = ?", req.Email).First(&existingUser).Error; err == nil {
		return nil, errors.New("user with this email already exists")
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, fmt.Errorf("failed to hash password: %w", err)
	}

	// Create user
	user := models.User{
		Email:        req.Email,
		PasswordHash: string(hashedPassword),
		Name:         &req.Name,
	}

	if err := s.db.Create(&user).Error; err != nil {
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	// Generate tokens
	accessToken, err := s.generateAccessToken(&user)
	if err != nil {
		return nil, fmt.Errorf("failed to generate access token: %w", err)
	}

	refreshToken, err := s.generateRefreshToken(user.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to generate refresh token: %w", err)
	}

	return &models.AuthResponse{
		Message: "User registered successfully",
		User: &models.UserInfo{
			ID:               user.ID,
			Email:            user.Email,
			Name:             user.Name,
			AvatarURL:        user.AvatarURL,
			SubscriptionPlan: user.SubscriptionPlan,
			EmailVerified:    user.EmailVerified,
			CreatedAt:        user.CreatedAt,
		},
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		ExpiresIn:    "24h",
	}, nil
}

func (s *AuthService) Login(req *models.LoginRequest) (*models.AuthResponse, error) {
	var user models.User
	if err := s.db.Where("email = ?", req.Email).First(&user).Error; err != nil {
		return nil, errors.New("invalid email or password")
	}

	// Check if account is active
	if !user.IsActive {
		return nil, errors.New("account is disabled")
	}

	// Verify password
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		return nil, errors.New("invalid email or password")
	}

	// Update last login
	now := time.Now()
	user.LastLoginAt = &now
	s.db.Model(&user).Update("last_login_at", now)

	// Generate tokens
	accessToken, err := s.generateAccessToken(&user)
	if err != nil {
		return nil, fmt.Errorf("failed to generate access token: %w", err)
	}

	refreshToken, err := s.generateRefreshToken(user.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to generate refresh token: %w", err)
	}

	// Get project count
	var projectCount int64
	s.db.Model(&models.Project{}).Where("user_id = ?", user.ID).Count(&projectCount)

	return &models.AuthResponse{
		Message: "Login successful",
		User: &models.UserInfo{
			ID:               user.ID,
			Email:            user.Email,
			Name:             user.Name,
			AvatarURL:        user.AvatarURL,
			SubscriptionPlan: user.SubscriptionPlan,
			EmailVerified:    user.EmailVerified,
			ProjectCount:     projectCount,
			APIUsageInfo: models.APIUsageInfo{
				Used:      user.APIUsageCount,
				Limit:     user.APIUsageLimit,
				Remaining: user.APIUsageLimit - user.APIUsageCount,
				Plan:      user.SubscriptionPlan,
			},
			CreatedAt:   user.CreatedAt,
			LastLoginAt: user.LastLoginAt,
		},
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		ExpiresIn:    "24h",
	}, nil
}

func (s *AuthService) RefreshToken(req *models.RefreshTokenRequest) (*models.AuthResponse, error) {
	claims, err := s.validateRefreshToken(req.RefreshToken)
	if err != nil {
		return nil, errors.New("invalid refresh token")
	}

	var user models.User
	if err := s.db.First(&user, "id = ?", claims.UserID).Error; err != nil {
		return nil, errors.New("user not found")
	}

	if !user.IsActive {
		return nil, errors.New("account is disabled")
	}

	// Generate new tokens
	accessToken, err := s.generateAccessToken(&user)
	if err != nil {
		return nil, fmt.Errorf("failed to generate access token: %w", err)
	}

	newRefreshToken, err := s.generateRefreshToken(user.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to generate refresh token: %w", err)
	}

	return &models.AuthResponse{
		Message:      "Token refreshed successfully",
		AccessToken:  accessToken,
		RefreshToken: newRefreshToken,
		ExpiresIn:    "24h",
	}, nil
}

func (s *AuthService) ValidateToken(tokenString string) (*JWTClaims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &JWTClaims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte(s.jwtConfig.Secret), nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(*JWTClaims); ok && token.Valid {
		return claims, nil
	}

	return nil, errors.New("invalid token")
}

func (s *AuthService) GetUserByID(userID uuid.UUID) (*models.User, error) {
	var user models.User
	if err := s.db.First(&user, "id = ?", userID).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func (s *AuthService) UpdateProfile(userID uuid.UUID, req *models.UpdateProfileRequest) (*models.User, error) {
	var user models.User
	if err := s.db.First(&user, "id = ?", userID).Error; err != nil {
		return nil, err
	}

	updates := make(map[string]interface{})
	if req.Name != nil {
		updates["name"] = *req.Name
	}
	if req.AvatarURL != nil {
		updates["avatar_url"] = *req.AvatarURL
	}

	if len(updates) > 0 {
		if err := s.db.Model(&user).Updates(updates).Error; err != nil {
			return nil, err
		}
	}

	return &user, nil
}

func (s *AuthService) ChangePassword(userID uuid.UUID, req *models.ChangePasswordRequest) error {
	if req.NewPassword != req.ConfirmNewPassword {
		return errors.New("new passwords do not match")
	}

	var user models.User
	if err := s.db.First(&user, "id = ?", userID).Error; err != nil {
		return err
	}

	// Verify current password
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.CurrentPassword)); err != nil {
		return errors.New("current password is incorrect")
	}

	// Hash new password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		return fmt.Errorf("failed to hash new password: %w", err)
	}

	// Update password
	return s.db.Model(&user).Update("password_hash", string(hashedPassword)).Error
}

func (s *AuthService) CheckUsageLimit(userID uuid.UUID, subscriptionPlan string) (bool, *models.APIUsageInfo, error) {
	limits := map[string]int{
		"free":    10,
		"pro":     100,
		"premium": 500,
	}

	dailyLimit := limits[subscriptionPlan]
	if dailyLimit == 0 {
		dailyLimit = limits["free"]
	}

	var dailyUsage int64 = 0

	// Use our exported Ctx field (uppercase)
	if s.redisClient != nil && s.redisClient.Client != nil {
		today := time.Now().Format("2006-01-02")
		cacheKey := fmt.Sprintf("usage:daily:%s:%s", userID.String(), today)

		// Use the exported Ctx field
		if val, err := s.redisClient.Client.Get(s.redisClient.Ctx, cacheKey).Int64(); err == nil {
			dailyUsage = val
		}
	}

	usageInfo := &models.APIUsageInfo{
		Used:      int(dailyUsage),
		Limit:     dailyLimit,
		Remaining: dailyLimit - int(dailyUsage),
		Plan:      subscriptionPlan,
	}

	return dailyUsage < int64(dailyLimit), usageInfo, nil
}

func (s *AuthService) IncrementUsage(userID uuid.UUID) error {
	// Increment in database
	if err := s.db.Model(&models.User{}).Where("id = ?", userID).
		Update("api_usage_count", gorm.Expr("api_usage_count + 1")).Error; err != nil {
		return err
	}

	// Increment daily usage in Redis using our methods
	if s.redisClient != nil {
		today := time.Now().Format("2006-01-02")
		cacheKey := fmt.Sprintf("usage:daily:%s:%s", userID.String(), today)

		// Use our custom Incr method
		s.redisClient.Incr(cacheKey)
		// Set expiration
		s.redisClient.SetTTL(cacheKey, 24*time.Hour)
	}

	return nil
}

func (s *AuthService) SetSession(userID uuid.UUID, sessionData *SessionData) error {
	if s.redisClient == nil {
		return nil
	}

	sessionKey := fmt.Sprintf("session:%s", userID.String())
	return s.redisClient.Set(sessionKey, sessionData, 24*time.Hour)
}

func (s *AuthService) DeleteSession(userID uuid.UUID) error {
	if s.redisClient == nil {
		return nil
	}

	sessionKey := fmt.Sprintf("session:%s", userID.String())
	return s.redisClient.Del(sessionKey)
}

func (s *AuthService) generateAccessToken(user *models.User) (string, error) {
	claims := JWTClaims{
		UserID:           user.ID,
		Email:            user.Email,
		Name:             user.Name,
		SubscriptionPlan: user.SubscriptionPlan,
		Type:             "access",
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Duration(s.jwtConfig.ExpirationHours) * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "lovable-backend",
			Subject:   user.ID.String(),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.jwtConfig.Secret))
}

func (s *AuthService) generateRefreshToken(userID uuid.UUID) (string, error) {
	claims := JWTClaims{
		UserID: userID,
		Type:   "refresh",
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Duration(s.jwtConfig.RefreshExpirationDays) * 24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "lovable-backend",
			Subject:   userID.String(),
		},
	}

	secret := s.jwtConfig.RefreshSecret
	if secret == "" {
		secret = s.jwtConfig.Secret
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}

func (s *AuthService) validateRefreshToken(tokenString string) (*JWTClaims, error) {
	secret := s.jwtConfig.RefreshSecret
	if secret == "" {
		secret = s.jwtConfig.Secret
	}

	token, err := jwt.ParseWithClaims(tokenString, &JWTClaims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte(secret), nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(*JWTClaims); ok && token.Valid && claims.Type == "refresh" {
		return claims, nil
	}

	return nil, errors.New("invalid refresh token")
}
