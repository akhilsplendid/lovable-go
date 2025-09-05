# Makefile for Lovable.dev Clone

.PHONY: setup build run dev clean logs test docker-up docker-down docker-rebuild

# Colors for output
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
NC := \033[0m # No Color

# Default target
help:
	@echo "$(GREEN)Lovable.dev Clone - Available Commands:$(NC)"
	@echo "  $(YELLOW)make setup$(NC)     - Setup development environment"
	@echo "  $(YELLOW)make build$(NC)     - Build the Go binary"
	@echo "  $(YELLOW)make run$(NC)       - Run the application"
	@echo "  $(YELLOW)make dev$(NC)       - Run with hot reload (requires air)"
	@echo "  $(YELLOW)make test$(NC)      - Run tests"
	@echo "  $(YELLOW)make docker-up$(NC) - Start all services with Docker"
	@echo "  $(YELLOW)make docker-down$(NC) - Stop all Docker services"
	@echo "  $(YELLOW)make docker-rebuild$(NC) - Rebuild and restart Docker services"
	@echo "  $(YELLOW)make logs$(NC)      - Show Docker logs"
	@echo "  $(YELLOW)make clean$(NC)     - Clean build artifacts"

# Setup development environment
setup:
	@echo "$(GREEN)Setting up development environment...$(NC)"
	@if [ ! -f .env ]; then \
		echo "$(YELLOW)Creating .env file from template...$(NC)"; \
		cp .env .env.backup 2>/dev/null || true; \
	fi
	@echo "$(GREEN)Installing Go dependencies...$(NC)"
	go mod download
	@echo "$(GREEN)Installing development tools...$(NC)"
	go install github.com/cosmtrek/air@latest
	@echo "$(GREEN)Creating necessary directories...$(NC)"
	mkdir -p logs cmd/server
	@echo "$(GREEN)✅ Setup complete!$(NC)"
	@echo "$(YELLOW)Next steps:$(NC)"
	@echo "  1. Add your Claude API key to .env file"
	@echo "  2. Run 'make docker-up' to start services"
	@echo "  3. Run 'make dev' to start the API server"

# Build the binary
build:
	@echo "$(GREEN)Building Go binary...$(NC)"
	CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o bin/main ./cmd/server
	@echo "$(GREEN)✅ Build complete!$(NC)"

# Run the application
run: build
	@echo "$(GREEN)Starting Lovable.dev Clone API...$(NC)"
	./bin/main

# Run with hot reload
dev:
	@echo "$(GREEN)Starting development server with hot reload...$(NC)"
	@if ! command -v air > /dev/null; then \
		echo "$(RED)Air not installed. Run 'make setup' first.$(NC)"; \
		exit 1; \
	fi
	air

# Run tests
test:
	@echo "$(GREEN)Running tests...$(NC)"
	go test -v ./...

# Docker commands
docker-up:
	@echo "$(GREEN)Starting Docker services...$(NC)"
	docker-compose up -d postgres redis
	@echo "$(GREEN)Waiting for services to be ready...$(NC)"
	sleep 5
	@echo "$(GREEN)✅ Services are running!$(NC)"
	@echo "$(YELLOW)PostgreSQL:$(NC) localhost:5433"
	@echo "$(YELLOW)Redis:$(NC) localhost:6380"

docker-down:
	@echo "$(GREEN)Stopping Docker services...$(NC)"
	docker-compose down
	@echo "$(GREEN)✅ Services stopped!$(NC)"

docker-rebuild:
	@echo "$(GREEN)Rebuilding Docker services...$(NC)"
	docker-compose down
	docker-compose build --no-cache
	docker-compose up -d
	@echo "$(GREEN)✅ Services rebuilt and started!$(NC)"

docker-full:
	@echo "$(GREEN)Starting all services including API...$(NC)"
	docker-compose up -d
	@echo "$(GREEN)✅ All services are running!$(NC)"

# Show logs
logs:
	docker-compose logs -f

logs-api:
	docker-compose logs -f api

logs-db:
	docker-compose logs -f postgres

logs-redis:
	docker-compose logs -f redis

# Clean up
clean:
	@echo "$(GREEN)Cleaning up...$(NC)"
	rm -rf bin/
	rm -rf logs/*.log
	go clean -cache
	docker system prune -f
	@echo "$(GREEN)✅ Cleanup complete!$(NC)"

# Database operations
db-migrate:
	@echo "$(GREEN)Running database migrations...$(NC)"
	docker-compose exec postgres psql -U postgres -d ai_website_builder -f /docker-entrypoint-initdb.d/init-db.sql

db-reset:
	@echo "$(GREEN)Resetting database...$(NC)"
	docker-compose down postgres
	docker volume rm lovable-backend_postgres_data 2>/dev/null || true
	docker-compose up -d postgres
	sleep 5
	@make db-migrate

# Health checks
health:
	@echo "$(GREEN)Checking service health...$(NC)"
	@curl -s http://localhost:3001/health | jq . || echo "$(RED)API not responding$(NC)"
	@docker-compose ps

# Quick start
quick-start: docker-up
	@echo "$(GREEN)Quick starting Lovable.dev Clone...$(NC)"
	@sleep 3
	@make dev

# Production deployment
deploy:
	@echo "$(GREEN)Building for production...$(NC)"
	docker-compose -f docker-compose.yml build
	docker-compose -f docker-compose.yml up -d
	@echo "$(GREEN)✅ Deployed to production!$(NC)"