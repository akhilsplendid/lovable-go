// internal/config/config.go
package config

import (
	"os"
	"strconv"
)

type Config struct {
	Environment string
	Port        string
	FrontendURL string
	Database    DatabaseConfig
	Redis       RedisConfig
	JWT         JWTConfig
	AI          AIConfig
}

type DatabaseConfig struct {
	Host     string
	Port     int
	User     string
	Password string
	Name     string
	SSLMode  string
}

type RedisConfig struct {
	URL      string
	Password string
}

type JWTConfig struct {
	Secret           string
	RefreshSecret    string
	ExpirationHours  int
	RefreshExpirationDays int
}

type AIConfig struct {
	ClaudeAPIKey string
	OpenAIAPIKey string
	Model        string
	MaxTokens    int
	Timeout      int
}

func Load() *Config {
	return &Config{
		Environment: getEnv("NODE_ENV", "development"),
		Port:        getEnv("PORT", "3001"),
		FrontendURL: getEnv("FRONTEND_URL", "http://localhost:3000"),
		Database: DatabaseConfig{
			Host:     getEnv("DB_HOST", "localhost"),
			Port:     getEnvInt("DB_PORT", 5432),
			User:     getEnv("DB_USER", "postgres"),
			Password: getEnv("DB_PASSWORD", "password"),
			Name:     getEnv("DB_NAME", "ai_website_builder"),
			SSLMode:  getEnv("DB_SSL_MODE", "disable"),
		},
		Redis: RedisConfig{
			URL:      getEnv("REDIS_URL", "redis://localhost:6379"),
			Password: getEnv("REDIS_PASSWORD", ""),
		},
		JWT: JWTConfig{
			Secret:                getEnv("JWT_SECRET", "your-super-secret-jwt-key-change-in-production"),
			RefreshSecret:         getEnv("JWT_REFRESH_SECRET", "your-refresh-secret"),
			ExpirationHours:       getEnvInt("JWT_EXPIRES_HOURS", 24),
			RefreshExpirationDays: getEnvInt("JWT_REFRESH_EXPIRES_DAYS", 30),
		},
		AI: AIConfig{
			ClaudeAPIKey: getEnv("CLAUDE_API_KEY", ""),
			OpenAIAPIKey: getEnv("OPENAI_API_KEY", ""),
			Model:        getEnv("AI_MODEL", "claude-sonnet-4-20250514"),
			MaxTokens:    getEnvInt("AI_MAX_TOKENS", 4000),
			Timeout:      getEnvInt("AI_TIMEOUT_SECONDS", 30),
		},
	}
}

func getEnv(key, defaultVal string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return defaultVal
}

func getEnvInt(key string, defaultVal int) int {
	if val := os.Getenv(key); val != "" {
		if intVal, err := strconv.Atoi(val); err == nil {
			return intVal
		}
	}
	return defaultVal
}

