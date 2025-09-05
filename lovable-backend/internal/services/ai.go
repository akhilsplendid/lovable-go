// internal/services/ai.go
package services

import (
	"bytes"
	"context"
	"crypto/sha256"
	"encoding/json"
	"fmt"
	"net/http"
	"regexp"
	"strings"
	"time"

	"lovable-backend/internal/config"
	"lovable-backend/internal/models"
	"lovable-backend/internal/redis"
	"lovable-backend/pkg/logger"
)

type AIService struct {
	config      config.AIConfig
	redisClient *redis.Client
	httpClient  *http.Client
	logger      *logger.Logger
}

type ClaudeRequest struct {
	Model     string    `json:"model"`
	MaxTokens int       `json:"max_tokens"`
	Messages  []Message `json:"messages"`
}

type Message struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type ClaudeResponse struct {
	Content []ContentBlock `json:"content"`
	Usage   Usage          `json:"usage"`
}

type ContentBlock struct {
	Type string `json:"type"`
	Text string `json:"text"`
}

type Usage struct {
	InputTokens  int `json:"input_tokens"`
	OutputTokens int `json:"output_tokens"`
}

type GenerationResult struct {
	ConversationalResponse string `json:"conversational_response"`
	HTMLCode               string `json:"html_code"`
	TokensUsed             int    `json:"tokens_used"`
	ResponseTime           int64  `json:"response_time"`
	FromCache              bool   `json:"from_cache"`
}

type TemplateCategory struct {
	Name        string
	Description string
	Prompt      string
}

func NewAIService(config config.AIConfig, redisClient *redis.Client) *AIService {
	return &AIService{
		config:      config,
		redisClient: redisClient,
		httpClient: &http.Client{
			Timeout: time.Duration(config.Timeout) * time.Second,
		},
		logger: logger.New("development"), // TODO: Get from config
	}
}

func (s *AIService) GenerateWebsite(userPrompt string, conversationHistory []models.ConversationEntry, progressCallback func(int)) (*GenerationResult, error) {
	startTime := time.Now()

	// Check cache first
	if cached, err := s.getCachedGeneration(userPrompt, conversationHistory); err == nil && cached != nil {
		s.logger.Info("Using cached generation")
		return &GenerationResult{
			ConversationalResponse: cached.ConversationalResponse,
			HTMLCode:               cached.HTMLCode,
			TokensUsed:             cached.TokensUsed,
			ResponseTime:           time.Since(startTime).Milliseconds(),
			FromCache:              true,
		}, nil
	}

	if progressCallback != nil {
		progressCallback(10)
	}

	// Build messages for Claude API
	messages := s.buildConversationMessages(userPrompt, conversationHistory)

	if progressCallback != nil {
		progressCallback(30)
	}

	// Call Claude API
	response, err := s.callClaudeAPI(messages)
	if err != nil {
		// Try fallback generation
		if strings.Contains(err.Error(), "rate limit") || strings.Contains(err.Error(), "quota") {
			return s.generateFallbackWebsite(userPrompt), nil
		}
		return nil, fmt.Errorf("AI generation failed: %w", err)
	}

	if progressCallback != nil {
		progressCallback(70)
	}

	// Parse response
	result := s.parseGenerationResponse(response)
	result.ResponseTime = time.Since(startTime).Milliseconds()

	if progressCallback != nil {
		progressCallback(90)
	}

	// Cache the result
	s.cacheGeneration(userPrompt, result, conversationHistory)

	if progressCallback != nil {
		progressCallback(100)
	}

	return result, nil
}

func (s *AIService) RefineWebsite(currentCode, refinementRequest string) (*GenerationResult, error) {
	startTime := time.Now()

	prompt := fmt.Sprintf(`I have this existing website code:

%s

Please make the following refinement: %s

Provide the complete updated HTML code with your improvements.`, currentCode, refinementRequest)

	messages := []Message{
		{
			Role:    "user",
			Content: fmt.Sprintf("%s\n\nPlease provide both a conversational response AND complete HTML code as specified in your system instructions.", prompt),
		},
	}

	// Call Claude API
	response, err := s.callClaudeAPI(messages)
	if err != nil {
		return nil, fmt.Errorf("AI refinement failed: %w", err)
	}

	// Parse response
	result := s.parseGenerationResponse(response)
	result.ResponseTime = time.Since(startTime).Milliseconds()

	return result, nil
}

func (s *AIService) GenerateFromTemplate(category, style, colorScheme string) (*GenerationResult, error) {
	templates := s.getTemplatePrompts()
	template, exists := templates[category]
	if !exists {
		template = templates["business"]
	}

	prompt := template.Prompt
	if style != "" {
		prompt += fmt.Sprintf(" with a %s design style", style)
	}
	if colorScheme != "" {
		prompt += fmt.Sprintf(" using a %s color scheme", colorScheme)
	}

	return s.GenerateWebsite(prompt, []models.ConversationEntry{}, nil)
}

func (s *AIService) buildConversationMessages(userPrompt string, conversationHistory []models.ConversationEntry) []Message {
	messages := []Message{}

	// Add conversation history (last 10 messages to stay within context)
	recentHistory := conversationHistory
	if len(recentHistory) > 10 {
		recentHistory = recentHistory[len(recentHistory)-10:]
	}

	for _, entry := range recentHistory {
		messages = append(messages, Message{
			Role:    entry.Role,
			Content: entry.Content,
		})
	}

	// Add current user prompt with system instructions
	messages = append(messages, Message{
		Role: "user",
		Content: fmt.Sprintf(`%s

%s

Please provide both a conversational response AND complete HTML code as specified in your system instructions.`, s.getSystemPrompt(), userPrompt),
	})

	return messages
}

func (s *AIService) callClaudeAPI(messages []Message) (*ClaudeResponse, error) {
	if s.config.ClaudeAPIKey == "" {
		return nil, fmt.Errorf("Claude API key not configured")
	}

	request := ClaudeRequest{
		Model:     s.config.Model,
		MaxTokens: s.config.MaxTokens,
		Messages:  messages,
	}

	jsonData, err := json.Marshal(request)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	req, err := http.NewRequestWithContext(context.Background(), "POST", "https://api.anthropic.com/v1/messages", bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("x-api-key", s.config.ClaudeAPIKey)
	req.Header.Set("anthropic-version", "2023-06-01")

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("API request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode == 429 {
		return nil, fmt.Errorf("rate limit exceeded")
	} else if resp.StatusCode == 401 {
		return nil, fmt.Errorf("invalid API key")
	} else if resp.StatusCode != 200 {
		return nil, fmt.Errorf("API error: %s", resp.Status)
	}

	var response ClaudeResponse
	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	return &response, nil
}

func (s *AIService) parseGenerationResponse(response *ClaudeResponse) *GenerationResult {
	if len(response.Content) == 0 {
		return &GenerationResult{
			ConversationalResponse: "I've created your website! Check out the preview to see how it looks.",
			HTMLCode:               s.generateFallbackHTML("My Website"),
			TokensUsed:             response.Usage.InputTokens + response.Usage.OutputTokens,
		}
	}

	content := response.Content[0].Text

	// Extract HTML code using regex
	codeRegex := regexp.MustCompile(`<website_code>([\s\S]*?)</website_code>`)
	matches := codeRegex.FindStringSubmatch(content)

	var htmlCode string
	var conversationalResponse string

	if len(matches) > 1 {
		htmlCode = strings.TrimSpace(matches[1])
		// Everything before <website_code> is conversational response
		parts := strings.Split(content, "<website_code>")
		conversationalResponse = strings.TrimSpace(parts[0])
	} else {
		// If no code tags found, use fallback
		conversationalResponse = content
		htmlCode = s.generateFallbackHTML("My Website")
	}

	if conversationalResponse == "" {
		conversationalResponse = "I've created your website! Check out the preview to see how it looks."
	}

	// Validate HTML structure
	if !s.validateHTML(htmlCode) {
		s.logger.Warn("Generated HTML may have structural issues")
	}

	return &GenerationResult{
		ConversationalResponse: conversationalResponse,
		HTMLCode:               htmlCode,
		TokensUsed:             response.Usage.InputTokens + response.Usage.OutputTokens,
	}
}

func (s *AIService) validateHTML(html string) bool {
	hasDoctype := strings.Contains(html, "<!DOCTYPE html>")
	hasHTMLTag := strings.Contains(html, "<html") && strings.Contains(html, "</html>")
	hasHeadTag := strings.Contains(html, "<head>") && strings.Contains(html, "</head>")
	hasBodyTag := strings.Contains(html, "<body>") && strings.Contains(html, "</body>")
	hasTitle := strings.Contains(html, "<title>") && strings.Contains(html, "</title>")
	hasViewport := strings.Contains(html, "viewport")

	return hasDoctype && hasHTMLTag && hasHeadTag && hasBodyTag && hasTitle && hasViewport
}

func (s *AIService) getCachedGeneration(prompt string, conversationHistory []models.ConversationEntry) (*GenerationResult, error) {
	if s.redisClient == nil {
		return nil, fmt.Errorf("redis not available")
	}

	// Create hash of prompt + context for cache key
	contextString, _ := json.Marshal(conversationHistory)
	hashInput := fmt.Sprintf("%s%s", prompt, string(contextString))
	hash := fmt.Sprintf("%x", sha256.Sum256([]byte(hashInput)))

	cacheKey := fmt.Sprintf("generation:%s", hash[:16])

	var cached GenerationResult
	if err := s.redisClient.Get(cacheKey, &cached); err != nil {
		return nil, err
	}

	return &cached, nil
}

func (s *AIService) cacheGeneration(prompt string, result *GenerationResult, conversationHistory []models.ConversationEntry) {
	if s.redisClient == nil {
		return
	}

	contextString, _ := json.Marshal(conversationHistory)
	hashInput := fmt.Sprintf("%s%s", prompt, string(contextString))
	hash := fmt.Sprintf("%x", sha256.Sum256([]byte(hashInput)))

	cacheKey := fmt.Sprintf("generation:%s", hash[:16])
	s.redisClient.Set(cacheKey, result, time.Hour) // Cache for 1 hour
}

func (s *AIService) generateFallbackWebsite(userPrompt string) *GenerationResult {
	title := s.extractTitleFromPrompt(userPrompt)
	if title == "" {
		title = "My Website"
	}

	return &GenerationResult{
		ConversationalResponse: "I'm experiencing high demand right now, so I've created a basic template for you. Please try again in a few minutes for a more customized website.",
		HTMLCode:               s.generateFallbackHTML(title),
		TokensUsed:             0,
		ResponseTime:           100,
		FromCache:              false,
	}
}

func (s *AIService) generateFallbackHTML(title string) string {
	return fmt.Sprintf(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>%s</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%);
            min-height: 100vh;
        }

        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
            text-align: center;
        }

        .card {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 20px;
            padding: 3rem;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            backdrop-filter: blur(10px);
        }

        h1 {
            font-size: 2.5rem;
            margin-bottom: 1rem;
            color: #2c3e50;
        }

        p {
            font-size: 1.1rem;
            color: #7f8c8d;
            margin-bottom: 2rem;
        }

        .cta-button {
            background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%);
            color: white;
            padding: 1rem 2rem;
            border: none;
            border-radius: 50px;
            font-size: 1rem;
            cursor: pointer;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            text-decoration: none;
            display: inline-block;
        }

        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
        }

        @media (max-width: 768px) {
            .container {
                padding: 1rem;
            }

            .card {
                padding: 2rem;
            }

            h1 {
                font-size: 2rem;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <h1>%s</h1>
            <p>Welcome to your new website! This is a basic template to get you started. The AI is currently busy creating more amazing websites, but your site is ready to be customized.</p>
            <button class="cta-button" onclick="showMessage()">Get Started</button>
        </div>
    </div>

    <script>
        function showMessage() {
            alert('Your website is ready to be customized! Try asking the AI for specific features or design changes.');
        }

        // Add some interactive animations
        document.addEventListener('DOMContentLoaded', function() {
            const card = document.querySelector('.card');
            card.style.transform = 'translateY(20px)';
            card.style.opacity = '0';

            setTimeout(() => {
                card.style.transition = 'all 0.8s ease';
                card.style.transform = 'translateY(0)';
                card.style.opacity = '1';
            }, 100);
        });
    </script>
</body>
</html>`, title, title)
}

func (s *AIService) extractTitleFromPrompt(prompt string) string {
	patterns := []string{
		`(?i)(?:create|build|make).*?(?:website|site|page).*?for.*?([^.!?]*)`,
		`([^.!?]*?)(?:website|site|page)`,
		`(portfolio|blog|landing page|homepage|dashboard)`,
	}

	for _, pattern := range patterns {
		re := regexp.MustCompile(pattern)
		matches := re.FindStringSubmatch(prompt)
		if len(matches) > 1 && strings.TrimSpace(matches[1]) != "" {
			title := strings.TrimSpace(matches[1])
			title = regexp.MustCompile(`^(a |an |the )`).ReplaceAllString(title, "")
			return title
		}
	}

	return ""
}

func (s *AIService) getSystemPrompt() string {
	return `You are an expert web developer and designer specializing in creating beautiful, modern, responsive websites. Your job is to generate complete, functional HTML documents based on user requests.

CRITICAL INSTRUCTIONS:
1. Always respond with BOTH a conversational response AND complete HTML code
2. Create a complete, self-contained HTML file with embedded CSS and JavaScript
3. Use modern, responsive design principles with mobile-first approach
4. Include interactive elements and animations when appropriate
5. Choose beautiful color schemes, typography, and layouts
6. Ensure accessibility with proper semantic HTML and ARIA labels
7. Make the website functional and production-ready

RESPONSE FORMAT:
First provide a brief, engaging conversational response (2-3 sentences) about what you're building.

Then provide the complete HTML code wrapped in <website_code> tags:

<website_code>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>[Appropriate Title]</title>
    <style>
        /* Modern, beautiful CSS with responsive design */
        /* Use CSS Grid, Flexbox, custom properties */
        /* Include hover effects, transitions, animations */
    </style>
</head>
<body>
    <!-- Semantic HTML with proper structure -->
    <!-- Include relevant content and interactive elements -->

    <script>
        // Add JavaScript for interactivity if needed
        // Modern ES6+ JavaScript
    </script>
</body>
</html>
</website_code>

DESIGN PRINCIPLES:
- Use modern CSS features (Grid, Flexbox, custom properties)
- Implement smooth transitions and micro-animations
- Choose cohesive color palettes and typography
- Ensure proper contrast ratios for accessibility
- Include responsive breakpoints for mobile/tablet/desktop
- Add interactive elements that enhance user experience
- Use semantic HTML5 elements
- Include proper meta tags for SEO

Remember: The HTML must be complete and self-contained. No external dependencies except for fonts or icons from CDNs if needed.`
}

func (s *AIService) getTemplatePrompts() map[string]TemplateCategory {
	return map[string]TemplateCategory{
		"portfolio": {
			Name:        "Portfolio",
			Description: "A modern portfolio website for professionals",
			Prompt:      "Create a modern portfolio website for a professional",
		},
		"landing": {
			Name:        "Landing Page",
			Description: "A high-converting landing page for SaaS products",
			Prompt:      "Create a compelling landing page for a SaaS product",
		},
		"blog": {
			Name:        "Blog",
			Description: "A beautiful blog homepage with article previews",
			Prompt:      "Create a beautiful blog homepage with article previews",
		},
		"ecommerce": {
			Name:        "E-commerce",
			Description: "An e-commerce product showcase page",
			Prompt:      "Create an e-commerce product showcase page",
		},
		"restaurant": {
			Name:        "Restaurant",
			Description: "A restaurant website with menu and contact info",
			Prompt:      "Create a restaurant website with menu and contact info",
		},
		"business": {
			Name:        "Business",
			Description: "A professional business website",
			Prompt:      "Create a professional business website",
		},
		"personal": {
			Name:        "Personal",
			Description: "A personal website homepage",
			Prompt:      "Create a personal website homepage",
		},
		"dashboard": {
			Name:        "Dashboard",
			Description: "A web application dashboard interface",
			Prompt:      "Create a web application dashboard interface",
		},
		"documentation": {
			Name:        "Documentation",
			Description: "A documentation website homepage",
			Prompt:      "Create a documentation website homepage",
		},
	}
}
