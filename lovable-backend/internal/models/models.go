// internal/models/models.go
package models

import (
	"time"

	"github.com/google/uuid"
	"github.com/lib/pq"
	"gorm.io/gorm"
)

type User struct {
	ID               uuid.UUID      `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	Email            string         `json:"email" gorm:"uniqueIndex;not null"`
	PasswordHash     string         `json:"-" gorm:"not null"`
	Name             *string        `json:"name"`
	AvatarURL        *string        `json:"avatar_url"`
	SubscriptionPlan string         `json:"subscription_plan" gorm:"default:'free'"`
	APIUsageCount    int            `json:"api_usage_count" gorm:"default:0"`
	APIUsageLimit    int            `json:"api_usage_limit" gorm:"default:100"`
	IsActive         bool           `json:"is_active" gorm:"default:true"`
	EmailVerified    bool           `json:"email_verified" gorm:"default:false"`
	LastLoginAt      *time.Time     `json:"last_login_at"`
	CreatedAt        time.Time      `json:"created_at"`
	UpdatedAt        time.Time      `json:"updated_at"`
	DeletedAt        gorm.DeletedAt `json:"-" gorm:"index"`

	// Relationships
	Projects      []Project      `json:"projects,omitempty" gorm:"foreignKey:UserID"`
	Conversations []Conversation `json:"conversations,omitempty" gorm:"foreignKey:UserID"`
	Templates     []Template     `json:"templates,omitempty" gorm:"foreignKey:CreatedBy"`
}

type Project struct {
	ID           uuid.UUID      `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	UserID       uuid.UUID      `json:"user_id" gorm:"type:uuid;not null"`
	Name         string         `json:"name" gorm:"not null"`
	Description  *string        `json:"description"`
	HTMLCode     *string        `json:"html_code"`
	CSSCode      *string        `json:"css_code"`
	JSCode       *string        `json:"js_code"`
	PreviewURL   *string        `json:"preview_url"`
	ThumbnailURL *string        `json:"thumbnail_url"`
	Status       string         `json:"status" gorm:"default:'draft'"` // draft, published, archived
	Tags         pq.StringArray `json:"tags" gorm:"type:text[]"`
	IsPublic     bool           `json:"is_public" gorm:"default:false"`
	ViewCount    int            `json:"view_count" gorm:"default:0"`
	LikeCount    int            `json:"like_count" gorm:"default:0"`
	PublishedAt  *time.Time     `json:"published_at"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `json:"-" gorm:"index"`

	// Relationships
	User          User           `json:"user,omitempty" gorm:"foreignKey:UserID"`
	Conversations []Conversation `json:"conversations,omitempty" gorm:"foreignKey:ProjectID"`
}

type Conversation struct {
	ID                 uuid.UUID `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	ProjectID          uuid.UUID `json:"project_id" gorm:"type:uuid;not null"`
	UserID             uuid.UUID `json:"user_id" gorm:"type:uuid;not null"`
	UserMessage        string    `json:"user_message" gorm:"not null"`
	AIResponse         string    `json:"ai_response" gorm:"not null"`
	GeneratedCode      *string   `json:"generated_code"`
	TokensUsed         int       `json:"tokens_used" gorm:"default:0"`
	ResponseTimeMS     *int      `json:"response_time_ms"`
	ModelUsed          *string   `json:"model_used"`
	MessageType        string    `json:"message_type" gorm:"default:'generation'"` // generation, refinement, question
	SatisfactionRating *int      `json:"satisfaction_rating"`                      // 1-5 rating
	CreatedAt          time.Time `json:"created_at"`

	// Relationships
	Project Project `json:"project,omitempty" gorm:"foreignKey:ProjectID"`
	User    User    `json:"user,omitempty" gorm:"foreignKey:UserID"`
}

type Template struct {
	ID          uuid.UUID      `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	Name        string         `json:"name" gorm:"not null"`
	Description *string        `json:"description"`
	Category    string         `json:"category" gorm:"not null"`
	HTMLCode    string         `json:"html_code" gorm:"not null"`
	CSSCode     *string        `json:"css_code"`
	JSCode      *string        `json:"js_code"`
	PreviewURL  *string        `json:"preview_url"`
	Tags        pq.StringArray `json:"tags" gorm:"type:text[]"`
	UsageCount  int            `json:"usage_count" gorm:"default:0"`
	Rating      float32        `json:"rating" gorm:"default:0.00"`
	IsPremium   bool           `json:"is_premium" gorm:"default:false"`
	CreatedBy   *uuid.UUID     `json:"created_by" gorm:"type:uuid"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`

	// Relationships
	Creator *User `json:"creator,omitempty" gorm:"foreignKey:CreatedBy"`
}

type UserSession struct {
	ID           uuid.UUID `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	UserID       uuid.UUID `json:"user_id" gorm:"type:uuid;not null"`
	SessionToken string    `json:"session_token" gorm:"not null"`
	ExpiresAt    time.Time `json:"expires_at" gorm:"not null"`
	IPAddress    *string   `json:"ip_address"`
	UserAgent    *string   `json:"user_agent"`
	CreatedAt    time.Time `json:"created_at"`

	// Relationships
	User User `json:"user,omitempty" gorm:"foreignKey:UserID"`
}

type APIUsage struct {
	ID             uuid.UUID `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	UserID         uuid.UUID `json:"user_id" gorm:"type:uuid;not null"`
	Endpoint       string    `json:"endpoint" gorm:"not null"`
	Method         string    `json:"method" gorm:"not null"`
	TokensUsed     int       `json:"tokens_used" gorm:"default:0"`
	ResponseTimeMS *int      `json:"response_time_ms"`
	StatusCode     int       `json:"status_code"`
	IPAddress      *string   `json:"ip_address"`
	CreatedAt      time.Time `json:"created_at"`

	// Relationships
	User User `json:"user,omitempty" gorm:"foreignKey:UserID"`
}

// DTOs for API requests/responses
type RegisterRequest struct {
	Email           string `json:"email" binding:"required,email"`
	Password        string `json:"password" binding:"required,min=8,max=128"`
	Name            string `json:"name" binding:"max=255"`
	ConfirmPassword string `json:"confirmPassword" binding:"required"`
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type RefreshTokenRequest struct {
	RefreshToken string `json:"refreshToken" binding:"required"`
}

type ChangePasswordRequest struct {
	CurrentPassword    string `json:"currentPassword" binding:"required"`
	NewPassword        string `json:"newPassword" binding:"required,min=8,max=128"`
	ConfirmNewPassword string `json:"confirmNewPassword" binding:"required"`
}

type UpdateProfileRequest struct {
	Name      *string `json:"name" binding:"omitempty,max=255"`
	AvatarURL *string `json:"avatarUrl" binding:"omitempty,max=500"`
}

type CreateProjectRequest struct {
	Name        string   `json:"name" binding:"required,min=1,max=255"`
	Description string   `json:"description" binding:"max=1000"`
	Tags        []string `json:"tags" binding:"max=10"`
}

type UpdateProjectRequest struct {
	Name        *string  `json:"name" binding:"omitempty,min=1,max=255"`
	Description *string  `json:"description" binding:"omitempty,max=1000"`
	HTMLCode    *string  `json:"html_code" binding:"omitempty,max=1000000"`
	CSSCode     *string  `json:"css_code" binding:"omitempty,max=500000"`
	JSCode      *string  `json:"js_code" binding:"omitempty,max=500000"`
	Status      *string  `json:"status" binding:"omitempty,oneof=draft published archived"`
	Tags        []string `json:"tags" binding:"max=10"`
	IsPublic    *bool    `json:"is_public"`
}

type GenerateRequest struct {
	ProjectID           uuid.UUID           `json:"projectId" binding:"required"`
	Message             string              `json:"message" binding:"required,min=1,max=5000"`
	ConversationHistory []ConversationEntry `json:"conversationHistory" binding:"max=50"`
}

type ConversationEntry struct {
	Role    string `json:"role" binding:"required,oneof=user assistant"`
	Content string `json:"content" binding:"required"`
}

type RefineRequest struct {
	ProjectID         uuid.UUID `json:"projectId" binding:"required"`
	RefinementRequest string    `json:"refinementRequest" binding:"required,min=1,max=2000"`
	CurrentCode       string    `json:"currentCode" binding:"required,max=1000000"`
}

type TemplateRequest struct {
	Category    string  `json:"category" binding:"required,oneof=portfolio landing blog ecommerce restaurant business personal dashboard documentation"`
	Style       *string `json:"style" binding:"omitempty,oneof=modern minimalist creative corporate playful"`
	ColorScheme *string `json:"colorScheme" binding:"omitempty,oneof=blue green purple red orange dark light"`
}

type BatchExportRequest struct {
	ProjectIDs    []uuid.UUID `json:"projectIds" binding:"required,min=1,max=10"`
	Format        string      `json:"format" binding:"oneof=zip"`
	IncludeAssets bool        `json:"includeAssets"`
}

// Response DTOs
type AuthResponse struct {
	Message      string    `json:"message"`
	User         *UserInfo `json:"user,omitempty"`
	AccessToken  string    `json:"accessToken,omitempty"`
	RefreshToken string    `json:"refreshToken,omitempty"`
	ExpiresIn    string    `json:"expiresIn,omitempty"`
}

type UserInfo struct {
	ID               uuid.UUID    `json:"id"`
	Email            string       `json:"email"`
	Name             *string      `json:"name"`
	AvatarURL        *string      `json:"avatarUrl"`
	SubscriptionPlan string       `json:"subscriptionPlan"`
	EmailVerified    bool         `json:"emailVerified"`
	ProjectCount     int64        `json:"projectCount"`
	APIUsageInfo     APIUsageInfo `json:"APIUsageInfo"`
	CreatedAt        time.Time    `json:"createdAt"`
	LastLoginAt      *time.Time   `json:"lastLoginAt"`
}

type APIUsageInfo struct {
	Used      int    `json:"used"`
	Limit     int    `json:"limit"`
	Remaining int    `json:"remaining"`
	Plan      string `json:"plan"`
}

type GenerateResponse struct {
	Message string            `json:"message"`
	Result  GenerationResult  `json:"result"`
	Project *ProjectBasicInfo `json:"project"`
}

type GenerationResult struct {
	ConversationID         uuid.UUID `json:"conversationId"`
	ConversationalResponse string    `json:"conversationalResponse"`
	HTMLCode               string    `json:"htmlCode"`
	TokensUsed             int       `json:"tokensUsed"`
	ResponseTime           int       `json:"responseTime"`
	FromCache              bool      `json:"fromCache"`
	GeneratedAt            time.Time `json:"generatedAt"`
}

type ProjectBasicInfo struct {
	ID   uuid.UUID `json:"id"`
	Name string    `json:"name"`
}

type PaginationResponse struct {
	CurrentPage int   `json:"currentPage"`
	TotalPages  int   `json:"totalPages"`
	TotalCount  int64 `json:"totalCount"`
	HasNextPage bool  `json:"hasNextPage"`
	HasPrevPage bool  `json:"hasPrevPage"`
}

type ProjectsResponse struct {
	Projects   []ProjectInfo       `json:"projects"`
	Pagination *PaginationResponse `json:"pagination"`
}

type ProjectInfo struct {
	ID          uuid.UUID `json:"id"`
	Name        string    `json:"name"`
	Description *string   `json:"description"`
	Status      string    `json:"status"`
	Tags        []string  `json:"tags"`
	IsPublic    bool      `json:"is_public"`
	ViewCount   int       `json:"view_count"`
	LikeCount   int       `json:"like_count"`
	HasCode     bool      `json:"has_code"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}
