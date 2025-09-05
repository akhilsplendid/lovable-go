/**
 * Application Constants
 * Updated to use CodeSandbox Sandpack instead of Replit
 */

// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'
export const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3001'

// Sandpack Configuration (replacing Replit)
export const SANDPACK_CONFIG = {
  defaultTemplate: import.meta.env.VITE_SANDPACK_TEMPLATE || 'vanilla',
  defaultTheme: import.meta.env.VITE_SANDPACK_THEME || 'dark',
  autoReload: true,
  showNavigator: false,
  showTabs: true,
  showLineNumbers: true,
  showInlineErrors: true,
  wrapContent: true,
  editorHeight: 400,
  editorWidthPercentage: 50,
  templates: [
    {
      id: 'vanilla',
      name: 'HTML/CSS/JS',
      description: 'Pure HTML, CSS, and JavaScript',
      files: {
        '/index.html': { active: true },
        '/styles.css': {},
        '/script.js': {}
      }
    },
    {
      id: 'react',
      name: 'React',
      description: 'React application with JSX',
      files: {
        '/App.js': { active: true },
        '/index.js': {},
        '/styles.css': {}
      }
    },
    {
      id: 'vue',
      name: 'Vue.js',
      description: 'Vue.js single file component',
      files: {
        '/App.vue': { active: true },
        '/main.js': {}
      }
    },
    {
      id: 'svelte',
      name: 'Svelte',
      description: 'Svelte component',
      files: {
        '/App.svelte': { active: true },
        '/main.js': {}
      }
    }
  ],
  themes: [
    { id: 'light', name: 'Light', description: 'Light theme' },
    { id: 'dark', name: 'Dark', description: 'Dark theme' },
    { id: 'github-light', name: 'GitHub Light', description: 'GitHub inspired light theme' },
    { id: 'github-dark', name: 'GitHub Dark', description: 'GitHub inspired dark theme' },
    { id: 'monokai-pro', name: 'Monokai Pro', description: 'Monokai Pro theme' },
    { id: 'night-owl', name: 'Night Owl', description: 'Night Owl theme by Sarah Drasner' },
    { id: 'cobalt2', name: 'Cobalt 2', description: 'Cobalt 2 theme' }
  ]
}

// Preview Device Breakpoints
export const DEVICE_BREAKPOINTS = {
  mobile: {
    name: 'Mobile',
    width: 375,
    height: 667,
    icon: 'smartphone',
    className: 'w-80 h-[500px]',
    mediaQuery: '(max-width: 768px)'
  },
  tablet: {
    name: 'Tablet',
    width: 768,
    height: 1024,
    icon: 'tablet',
    className: 'w-96 h-[600px]',
    mediaQuery: '(max-width: 1024px)'
  },
  desktop: {
    name: 'Desktop',
    width: 1200,
    height: 800,
    icon: 'monitor',
    className: 'w-full h-full',
    mediaQuery: '(min-width: 1024px)'
  }
}

// Application Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  PROJECTS: '/projects',
  PROJECT_EDITOR: '/projects/:projectId',
  PROFILE: '/profile',
  SETTINGS: '/settings'
}

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth-storage',
  UI_SETTINGS: 'ui-settings',
  SANDPACK_SETTINGS: 'sandpack-settings',
  PROJECTS_CACHE: 'projects-cache',
  CHAT_HISTORY: 'chat-history',
  THEME_PREFERENCE: 'theme-preference',
  EDITOR_PREFERENCES: 'editor-preferences'
}

// Theme Configuration
export const THEME_CONFIG = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
  DEFAULT: 'dark'
}

// Animation Durations (in milliseconds)
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  VERY_SLOW: 1000
}

// File Types and Extensions
export const FILE_TYPES = {
  HTML: {
    extension: 'html',
    mimeType: 'text/html',
    language: 'html'
  },
  CSS: {
    extension: 'css',
    mimeType: 'text/css',
    language: 'css'
  },
  JAVASCRIPT: {
    extension: 'js',
    mimeType: 'application/javascript',
    language: 'javascript'
  },
  JSON: {
    extension: 'json',
    mimeType: 'application/json',
    language: 'json'
  },
  TYPESCRIPT: {
    extension: 'ts',
    mimeType: 'application/typescript',
    language: 'typescript'
  },
  JSX: {
    extension: 'jsx',
    mimeType: 'text/jsx',
    language: 'jsx'
  },
  VUE: {
    extension: 'vue',
    mimeType: 'text/x-vue',
    language: 'vue'
  },
  SVELTE: {
    extension: 'svelte',
    mimeType: 'text/x-svelte',
    language: 'svelte'
  }
}

// AI Generation Limits by Subscription Plan
export const AI_LIMITS = {
  FREE: {
    projects: 5,
    generations: 10,
    exports: 5,
    tokensPerDay: 1000,
    collaborators: 0
  },
  PRO: {
    projects: 50,
    generations: 100,
    exports: 50,
    tokensPerDay: 10000,
    collaborators: 3
  },
  PREMIUM: {
    projects: 500,
    generations: 500,
    exports: 200,
    tokensPerDay: 50000,
    collaborators: 10
  }
}

// Error Codes
export const ERROR_CODES = {
  // Network errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  CONNECTION_ERROR: 'CONNECTION_ERROR',
  
  // Authentication errors
  AUTH_ERROR: 'AUTH_ERROR',
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  UNAUTHORIZED: 'UNAUTHORIZED',
  
  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  
  // Rate limiting
  RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR',
  QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',
  
  // AI Generation errors
  GENERATION_ERROR: 'GENERATION_ERROR',
  AI_SERVICE_UNAVAILABLE: 'AI_SERVICE_UNAVAILABLE',
  INVALID_PROMPT: 'INVALID_PROMPT',
  
  // Preview errors
  PREVIEW_ERROR: 'PREVIEW_ERROR',
  SANDPACK_ERROR: 'SANDPACK_ERROR',
  COMPILATION_ERROR: 'COMPILATION_ERROR',
  
  // Project errors
  PROJECT_NOT_FOUND: 'PROJECT_NOT_FOUND',
  PROJECT_LIMIT_EXCEEDED: 'PROJECT_LIMIT_EXCEEDED',
  
  // Export errors
  EXPORT_ERROR: 'EXPORT_ERROR',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE'
}

// Success Messages
export const SUCCESS_MESSAGES = {
  PROJECT_CREATED: 'Project created successfully!',
  PROJECT_UPDATED: 'Project updated successfully!',
  PROJECT_DELETED: 'Project deleted successfully!',
  PROJECT_DUPLICATED: 'Project duplicated successfully!',
  CODE_EXPORTED: 'Code exported successfully!',
  SETTINGS_SAVED: 'Settings saved successfully!',
  PASSWORD_CHANGED: 'Password changed successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  LOGIN_SUCCESS: 'Welcome back!',
  REGISTER_SUCCESS: 'Account created successfully!',
  GENERATION_SUCCESS: 'Website generated successfully!',
  REFINEMENT_SUCCESS: 'Website refined successfully!'
}

// Default Project Templates
export const DEFAULT_HTML_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Website</title>
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
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        
        .container {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 3rem;
            text-align: center;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            max-width: 600px;
            width: 100%;
        }
        
        h1 {
            font-size: 3rem;
            font-weight: 700;
            margin-bottom: 1rem;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        p {
            font-size: 1.2rem;
            color: #666;
            margin-bottom: 2rem;
        }
        
        .cta-button {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 1rem 2rem;
            border: none;
            border-radius: 50px;
            font-size: 1rem;
            font-weight: 600;
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
        <h1>Welcome to Your Website</h1>
        <p>Start chatting with AI to create something amazing! Your ideas will come to life through natural language conversations.</p>
        <button class="cta-button" onclick="showMessage()">Get Started</button>
    </div>

    <script>
        function showMessage() {
            alert('Ready to build? Start by describing what you want to create!');
        }
        
        // Add a simple animation on load
        document.addEventListener('DOMContentLoaded', function() {
            const container = document.querySelector('.container');
            container.style.opacity = '0';
            container.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                container.style.transition = 'all 0.8s ease';
                container.style.opacity = '1';
                container.style.transform = 'translateY(0)';
            }, 100);
        });
    </script>
</body>
</html>`

// Regex Patterns for Code Extraction
export const CODE_PATTERNS = {
  CSS_IN_HTML: /<style[^>]*>([\s\S]*?)<\/style>/gi,
  JS_IN_HTML: /<script[^>]*>([\s\S]*?)<\/script>/gi,
  HTML_TITLE: /<title[^>]*>([\s\S]*?)<\/title>/i,
  HTML_META_DESCRIPTION: /<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i,
  HTML_LANG: /<html[^>]*lang="([^"]*)"[^>]*>/i,
  CSS_IMPORT: /@import\s+(?:url\()?["']([^"']+)["'](?:\))?/g,
  JS_IMPORT: /import.*from\s+["']([^"']+)["']/g
}

// WebSocket Events
export const WS_EVENTS = {
  // Connection events
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  RECONNECT: 'reconnect',
  ERROR: 'error',
  
  // AI Generation events
  GENERATION_STARTED: 'generation_started',
  GENERATION_PROGRESS: 'generation_progress',
  GENERATION_COMPLETE: 'generation_complete',
  GENERATION_ERROR: 'generation_error',
  
  // Collaboration events
  USER_TYPING: 'user_typing',
  CODE_CHANGES: 'code_changes',
  CURSOR_POSITION: 'cursor_position',
  USER_JOINED: 'user_joined',
  USER_LEFT: 'user_left',
  
  // Room events
  JOIN_ROOM: 'join_room',
  LEAVE_ROOM: 'leave_room',
  ROOM_UPDATE: 'room_update'
}

// Query Keys for React Query
export const QUERY_KEYS = {
  PROJECTS: 'projects',
  PROJECT: 'project',
  CONVERSATIONS: 'conversations',
  TEMPLATES: 'templates',
  USER_PROFILE: 'user-profile',
  AI_USAGE: 'ai-usage',
  AI_STATUS: 'ai-status',
  EXPORT_HISTORY: 'export-history'
}

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
}

// Keyboard Shortcuts
export const KEYBOARD_SHORTCUTS = {
  SAVE_PROJECT: 'Ctrl+S',
  NEW_PROJECT: 'Ctrl+N',
  OPEN_PREVIEW: 'Ctrl+P',
  TOGGLE_THEME: 'Ctrl+Shift+T',
  OPEN_SETTINGS: 'Ctrl+,',
  SEARCH_PROJECTS: 'Ctrl+K',
  TOGGLE_SIDEBAR: 'Ctrl+B',
  FOCUS_CHAT: 'Ctrl+/',
  EXPORT_PROJECT: 'Ctrl+E',
  DUPLICATE_PROJECT: 'Ctrl+D'
}

// Default AI Prompts for Templates
export const AI_PROMPTS = {
  PORTFOLIO: 'Create a modern portfolio website for a web developer with sections for about, projects, skills, and contact information.',
  LANDING_PAGE: 'Build a high-converting landing page for a SaaS product with hero section, features, pricing, and testimonials.',
  BLOG: 'Design a clean blog homepage with article previews, categories, search functionality, and author bio.',
  ECOMMERCE: 'Create an e-commerce product showcase page with product grid, filters, and shopping cart functionality.',
  RESTAURANT: 'Build a restaurant website with menu, about section, contact information, and reservation system.',
  BUSINESS: 'Create a professional business website with services, team, testimonials, and contact form.',
  PERSONAL: 'Design a personal website homepage with bio, interests, social links, and recent activities.',
  DASHBOARD: 'Build a modern dashboard interface with charts, metrics, tables, and navigation.',
  DOCUMENTATION: 'Create a documentation website with navigation, search, code examples, and responsive design.'
}

// Export limits for different file types
export const EXPORT_LIMITS = {
  HTML_SIZE: 10 * 1024 * 1024, // 10MB
  CSS_SIZE: 5 * 1024 * 1024,   // 5MB
  JS_SIZE: 5 * 1024 * 1024,    // 5MB
  TOTAL_SIZE: 50 * 1024 * 1024, // 50MB
  FILES_COUNT: 100
}

// Feature flags
export const FEATURE_FLAGS = {
  ENABLE_COLLABORATION: true,
  ENABLE_TEMPLATES: true,
  ENABLE_AI_SUGGESTIONS: true,
  ENABLE_CODE_EDITOR: true,
  ENABLE_MOBILE_PREVIEW: true,
  ENABLE_EXPORT: true,
  ENABLE_SHARING: true,
  ENABLE_ANALYTICS: false // Set to false for privacy
}

// Default export with all constants
export default {
  API_BASE_URL,
  WS_URL,
  SANDPACK_CONFIG,
  DEVICE_BREAKPOINTS,
  ROUTES,
  STORAGE_KEYS,
  THEME_CONFIG,
  ANIMATION_DURATION,
  FILE_TYPES,
  AI_LIMITS,
  ERROR_CODES,
  SUCCESS_MESSAGES,
  DEFAULT_HTML_TEMPLATE,
  CODE_PATTERNS,
  WS_EVENTS,
  QUERY_KEYS,
  HTTP_STATUS,
  KEYBOARD_SHORTCUTS,
  AI_PROMPTS,
  EXPORT_LIMITS,
  FEATURE_FLAGS
}