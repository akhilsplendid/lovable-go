// pkg/logger/logger.go
package logger

import (
	"io"
	"log/slog"
	"os"
	"time"
)

type Logger struct {
	*slog.Logger
}

func (l *Logger) Fatal(s string, param2 string, err error) {
	panic("unimplemented")
}

func New(environment string) *Logger {
	var handler slog.Handler

	opts := &slog.HandlerOptions{
		Level: slog.LevelInfo,
		ReplaceAttr: func(groups []string, a slog.Attr) slog.Attr {
			// Customize timestamp format
			if a.Key == slog.TimeKey {
				return slog.String("timestamp", time.Now().Format(time.RFC3339))
			}
			return a
		},
	}

	if environment == "production" {
		// JSON handler for production
		handler = slog.NewJSONHandler(os.Stdout, opts)
	} else {
		// Text handler for development
		opts.Level = slog.LevelDebug
		handler = slog.NewTextHandler(os.Stdout, opts)
	}

	logger := slog.New(handler)
	return &Logger{Logger: logger}
}

func (l *Logger) Write(p []byte) (n int, err error) {
	// Implement io.Writer interface for Gin logging
	l.Info(string(p))
	return len(p), nil
}

// Convenience methods with structured logging
func (l *Logger) LogAPICall(method, url string, statusCode, responseTime int, userID string) {
	l.Info("API Call",
		"method", method,
		"url", url,
		"statusCode", statusCode,
		"responseTime", responseTime,
		"userID", userID,
	)
}

func (l *Logger) LogUserAction(userID, action string, details map[string]any) {
	attrs := []any{"userID", userID, "action", action}
	for k, v := range details {
		attrs = append(attrs, k, v)
	}
	l.Info("User Action", attrs...)
}

func (l *Logger) LogDatabaseOperation(operation, table string, duration int, userID string) {
	l.Debug("Database Operation",
		"operation", operation,
		"table", table,
		"duration", duration,
		"userID", userID,
	)
}

func (l *Logger) LogAIGeneration(userID, prompt string, tokensUsed, responseTime int, success bool) {
	l.Info("AI Generation",
		"userID", userID,
		"promptLength", len(prompt),
		"tokensUsed", tokensUsed,
		"responseTime", responseTime,
		"success", success,
	)
}

func (l *Logger) LogSecurityEvent(event, userID, ip string, details map[string]any) {
	attrs := []any{"event", event, "userID", userID, "ip", ip}
	for k, v := range details {
		attrs = append(attrs, k, v)
	}
	l.Warn("Security Event", attrs...)
}

func (l *Logger) LogPerformance(operation string, duration int, metadata map[string]any) {
	level := slog.LevelDebug
	if duration > 5000 {
		level = slog.LevelWarn
	} else if duration > 1000 {
		level = slog.LevelInfo
	}

	attrs := []any{"operation", operation, "duration", duration}
	for k, v := range metadata {
		attrs = append(attrs, k, v)
	}
	l.Log(nil, level, "Performance", attrs...)
}

func (l *Logger) LogCacheOperation(operation, key string, hit *bool, ttl *int) {
	attrs := []any{"operation", operation, "key", key[:min(50, len(key))]}
	if hit != nil {
		attrs = append(attrs, "hit", *hit)
	}
	if ttl != nil {
		attrs = append(attrs, "ttl", *ttl)
	}
	l.Debug("Cache Operation", attrs...)
}

func (l *Logger) LogExternalAPI(service, endpoint, method string, statusCode, responseTime int, success bool) {
	l.Info("External API Call",
		"service", service,
		"endpoint", endpoint,
		"method", method,
		"statusCode", statusCode,
		"responseTime", responseTime,
		"success", success,
	)
}

func (l *Logger) LogStartup() {
	l.Info("Application Starting",
		"goVersion", "1.21+",
		"environment", os.Getenv("NODE_ENV"),
		"port", os.Getenv("PORT"),
	)
}

func (l *Logger) LogShutdown(reason string) {
	l.Info("Application Shutting Down",
		"reason", reason,
		"uptime", time.Since(time.Now()), // This would be calculated properly
	)
}

func (l *Logger) LogMemoryUsage() {
	// This would include actual memory statistics
	l.Info("Memory Usage",
		"timestamp", time.Now().Format(time.RFC3339),
	)
}

// Helper function for min
func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

// Middleware adapter for Gin
func (l *Logger) GinMiddleware() io.Writer {
	return l
}
