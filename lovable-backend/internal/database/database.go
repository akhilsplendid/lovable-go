// internal/database/database.go
package database

import (
	"fmt"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"lovable-backend/internal/config"
	"lovable-backend/internal/models"
)

func Connect(cfg config.DatabaseConfig) (*gorm.DB, error) {
	dsn := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=%s",
		cfg.Host, cfg.Port, cfg.User, cfg.Password, cfg.Name, cfg.SSLMode)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
		NowFunc: func() time.Time {
			return time.Now().UTC()
		},
	})

	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	// Configure connection pool
	sqlDB, err := db.DB()
	if err != nil {
		return nil, fmt.Errorf("failed to configure database: %w", err)
	}

	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)
	sqlDB.SetConnMaxLifetime(time.Hour)

	return db, nil
}

func Migrate(db *gorm.DB) error {
	// Enable UUID extension
	if err := db.Exec("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"").Error; err != nil {
		return fmt.Errorf("failed to create uuid extension: %w", err)
	}

	// Auto migrate all models
	err := db.AutoMigrate(
		&models.User{},
		&models.Project{},
		&models.Conversation{},
		&models.Template{},
		&models.UserSession{},
		&models.APIUsage{},
	)

	if err != nil {
		return fmt.Errorf("failed to migrate database: %w", err)
	}

	// Create indexes
	if err := createIndexes(db); err != nil {
		return fmt.Errorf("failed to create indexes: %w", err)
	}

	return nil
}

func createIndexes(db *gorm.DB) error {
	indexes := []string{
		// Users indexes
		"CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)",
		"CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at)",

		// Projects indexes
		"CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id)",
		"CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status)",
		"CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at)",
		"CREATE INDEX IF NOT EXISTS idx_projects_is_public ON projects(is_public)",
		"CREATE INDEX IF NOT EXISTS idx_projects_tags ON projects USING GIN(tags)",

		// Full-text search index for projects
		"CREATE INDEX IF NOT EXISTS idx_projects_search ON projects USING GIN(to_tsvector('english', name || ' ' || COALESCE(description, '')))",

		// Conversations indexes
		"CREATE INDEX IF NOT EXISTS idx_conversations_project_id ON conversations(project_id)",
		"CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id)",
		"CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at)",

		// Templates indexes
		"CREATE INDEX IF NOT EXISTS idx_templates_category ON templates(category)",
		"CREATE INDEX IF NOT EXISTS idx_templates_tags ON templates USING GIN(tags)",
		"CREATE INDEX IF NOT EXISTS idx_templates_rating ON templates(rating)",

		// Sessions indexes
		"CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON user_sessions(user_id)",
		"CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON user_sessions(expires_at)",

		// API usage indexes
		"CREATE INDEX IF NOT EXISTS idx_api_usage_user_id ON api_usage(user_id)",
		"CREATE INDEX IF NOT EXISTS idx_api_usage_created_at ON api_usage(created_at)",
	}

	for _, indexSQL := range indexes {
		if err := db.Exec(indexSQL).Error; err != nil {
			// Log warning but continue if index already exists
			fmt.Printf("Index creation warning: %v\n", err)
		}
	}

	return nil
}

