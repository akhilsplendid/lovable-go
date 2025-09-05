// internal/services/project.go
package services

import (
	"fmt"
	"math"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"lovable-backend/internal/models"
	"lovable-backend/internal/redis"
)

type ProjectService struct {
	db          *gorm.DB
	redisClient *redis.Client
}

type ProjectQuery struct {
	Page   int
	Limit  int
	Status string
	Search string
	Tags   []string
	Sort   string
	Order  string
}

func NewProjectService(db *gorm.DB, redisClient *redis.Client) *ProjectService {
	return &ProjectService{
		db:          db,
		redisClient: redisClient,
	}
}

func (s *ProjectService) GetProjects(userID uuid.UUID, query *ProjectQuery) (*models.ProjectsResponse, error) {
	offset := (query.Page - 1) * query.Limit

	// Build base query
	db := s.db.Model(&models.Project{}).Where("user_id = ?", userID)

	// Apply filters
	if query.Status != "" {
		db = db.Where("status = ?", query.Status)
	}

	if query.Search != "" {
		search := "%" + query.Search + "%"
		db = db.Where("name ILIKE ? OR description ILIKE ?", search, search)
	}

	if len(query.Tags) > 0 {
		db = db.Where("tags && ?", query.Tags)
	}

	// Get total count
	var totalCount int64
	if err := db.Count(&totalCount).Error; err != nil {
		return nil, err
	}

	// Apply sorting and pagination
	orderClause := fmt.Sprintf("%s %s", query.Sort, query.Order)
	db = db.Order(orderClause).Offset(offset).Limit(query.Limit)

	// Execute query
	var projects []models.Project
	if err := db.Find(&projects).Error; err != nil {
		return nil, err
	}

	// Convert to response format
	projectInfos := make([]models.ProjectInfo, len(projects))
	for i, p := range projects {
		projectInfos[i] = models.ProjectInfo{
			ID:          p.ID,
			Name:        p.Name,
			Description: p.Description,
			Status:      p.Status,
			Tags:        p.Tags,
			IsPublic:    p.IsPublic,
			ViewCount:   p.ViewCount,
			LikeCount:   p.LikeCount,
			HasCode:     p.HTMLCode != nil,
			CreatedAt:   p.CreatedAt,
			UpdatedAt:   p.UpdatedAt,
		}
	}

	// Calculate pagination
	totalPages := int(math.Ceil(float64(totalCount) / float64(query.Limit)))

	return &models.ProjectsResponse{
		Projects: projectInfos,
		Pagination: &models.PaginationResponse{
			CurrentPage: query.Page,
			TotalPages:  totalPages,
			TotalCount:  totalCount,
			HasNextPage: query.Page < totalPages,
			HasPrevPage: query.Page > 1,
		},
	}, nil
}

func (s *ProjectService) GetProject(userID, projectID uuid.UUID) (*models.Project, error) {
	var project models.Project
	if err := s.db.Where("id = ? AND user_id = ?", projectID, userID).First(&project).Error; err != nil {
		return nil, err
	}

	// Increment view count
	s.db.Model(&project).Update("view_count", gorm.Expr("view_count + 1"))

	return &project, nil
}

func (s *ProjectService) CreateProject(userID uuid.UUID, req *models.CreateProjectRequest) (*models.Project, error) {
	// Check project limit based on subscription
	var count int64
	s.db.Model(&models.Project{}).Where("user_id = ?", userID).Count(&count)

	// Get user's subscription plan
	var user models.User
	if err := s.db.First(&user, "id = ?", userID).Error; err != nil {
		return nil, err
	}

	limits := map[string]int64{
		"free":    5,
		"pro":     50,
		"premium": 500,
	}

	limit := limits[user.SubscriptionPlan]
	if limit == 0 {
		limit = limits["free"]
	}

	if count >= limit {
		return nil, fmt.Errorf("project limit reached for %s plan (%d projects)", user.SubscriptionPlan, limit)
	}

	project := models.Project{
		UserID:      userID,
		Name:        req.Name,
		Description: &req.Description,
		Tags:        req.Tags,
	}

	if err := s.db.Create(&project).Error; err != nil {
		return nil, err
	}

	return &project, nil
}

func (s *ProjectService) UpdateProject(userID, projectID uuid.UUID, req *models.UpdateProjectRequest) (*models.Project, error) {
	var project models.Project
	if err := s.db.Where("id = ? AND user_id = ?", projectID, userID).First(&project).Error; err != nil {
		return nil, err
	}

	// Build updates map
	updates := make(map[string]interface{})
	if req.Name != nil {
		updates["name"] = *req.Name
	}
	if req.Description != nil {
		updates["description"] = *req.Description
	}
	if req.HTMLCode != nil {
		updates["html_code"] = *req.HTMLCode
	}
	if req.CSSCode != nil {
		updates["css_code"] = *req.CSSCode
	}
	if req.JSCode != nil {
		updates["js_code"] = *req.JSCode
	}
	if req.Status != nil {
		updates["status"] = *req.Status
	}
	if req.Tags != nil {
		updates["tags"] = req.Tags
	}
	if req.IsPublic != nil {
		updates["is_public"] = *req.IsPublic
	}

	if len(updates) > 0 {
		if err := s.db.Model(&project).Updates(updates).Error; err != nil {
			return nil, err
		}
	}

	// Reload project
	s.db.First(&project, "id = ?", projectID)
	return &project, nil
}

func (s *ProjectService) DeleteProject(userID, projectID uuid.UUID) error {
	// Delete in transaction
	return s.db.Transaction(func(tx *gorm.DB) error {
		// Delete conversations first
		if err := tx.Where("project_id = ?", projectID).Delete(&models.Conversation{}).Error; err != nil {
			return err
		}

		// Delete project
		result := tx.Where("id = ? AND user_id = ?", projectID, userID).Delete(&models.Project{})
		if result.Error != nil {
			return result.Error
		}

		if result.RowsAffected == 0 {
			return gorm.ErrRecordNotFound
		}

		return nil
	})
}

func (s *ProjectService) DuplicateProject(userID, projectID uuid.UUID) (*models.Project, error) {
	// Get original project
	var original models.Project
	if err := s.db.Where("id = ? AND user_id = ?", projectID, userID).First(&original).Error; err != nil {
		return nil, err
	}

	// Check project limit
	var count int64
	s.db.Model(&models.Project{}).Where("user_id = ?", userID).Count(&count)

	var user models.User
	s.db.First(&user, "id = ?", userID)

	limits := map[string]int64{
		"free":    5,
		"pro":     50,
		"premium": 500,
	}

	limit := limits[user.SubscriptionPlan]
	if limit == 0 {
		limit = limits["free"]
	}

	if count >= limit {
		return nil, fmt.Errorf("project limit reached")
	}

	// Create duplicate
	duplicate := models.Project{
		UserID:      userID,
		Name:        fmt.Sprintf("%s (Copy)", original.Name),
		Description: original.Description,
		HTMLCode:    original.HTMLCode,
		CSSCode:     original.CSSCode,
		JSCode:      original.JSCode,
		Tags:        original.Tags,
	}

	if err := s.db.Create(&duplicate).Error; err != nil {
		return nil, err
	}

	return &duplicate, nil
}

func (s *ProjectService) GetConversations(userID, projectID uuid.UUID) ([]models.Conversation, error) {
	// Verify project ownership
	var project models.Project
	if err := s.db.Where("id = ? AND user_id = ?", projectID, userID).First(&project).Error; err != nil {
		return nil, err
	}

	var conversations []models.Conversation
	if err := s.db.Where("project_id = ?", projectID).Order("created_at ASC").Find(&conversations).Error; err != nil {
		return nil, err
	}

	return conversations, nil
}

func (s *ProjectService) SaveConversation(projectID, userID uuid.UUID, userMessage, aiResponse, generatedCode string, tokensUsed int, responseTime int64, modelUsed, messageType string) (*models.Conversation, error) {
	conversation := models.Conversation{
		ProjectID:      projectID,
		UserID:         userID,
		UserMessage:    userMessage,
		AIResponse:     aiResponse,
		GeneratedCode:  &generatedCode,
		TokensUsed:     tokensUsed,
		ResponseTimeMS: func() *int { rt := int(responseTime); return &rt }(),
		ModelUsed:      &modelUsed,
		MessageType:    messageType,
	}

	if err := s.db.Create(&conversation).Error; err != nil {
		return nil, err
	}

	return &conversation, nil
}
