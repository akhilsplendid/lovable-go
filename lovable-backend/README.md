# Lovable.dev Clone - Go Backend

A production-ready Go backend that replicates Lovable.dev functionality.

## 🚀 Quick Start

1. **Setup environment:**
   ```bash
   make setup
   ```

2. **Add your API keys to .env:**
   ```bash
   # Edit .env and add:
   CLAUDE_API_KEY=your-claude-key
   OPENAI_API_KEY=your-openai-key
   ```

3. **Start development server:**
   ```bash
   make dev
   ```

## 📋 Available Commands

- `make setup` - Setup development environment
- `make dev` - Run with hot reload
- `make run` - Run without hot reload
- `make build` - Build binary
- `make clean` - Clean build artifacts

## 🔧 Next Steps

1. Replace placeholder files with actual code from the artifacts
2. Start with `cmd/server/main.go` 
3. Then replace each file in `internal/` directories
4. Test the API endpoints

## 🗄️ Database Access

- PostgreSQL: `localhost:5433`
- Redis: `localhost:6380`
- Credentials in `.env` file
