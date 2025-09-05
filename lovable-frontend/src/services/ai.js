import { apiService } from './api'

/**
 * AI Service
 * Handles all AI-related API calls for website generation
 */
export const aiService = {
  /**
   * Generate website from conversation
   * @param {Object} params - Generation parameters
   * @param {string} params.projectId - Project ID
   * @param {string} params.message - User message/prompt
   * @param {Array} [params.conversationHistory] - Previous conversation context
   * @returns {Promise<Object>} Generation result
   */
  generateWebsite: async (params) => {
    try {
      const response = await apiService.post('/api/ai/generate', {
        projectId: params.projectId,
        message: params.message,
        conversationHistory: params.conversationHistory || []
      })
      return response
    } catch (error) {
      throw error
    }
  },

  /**
   * Refine existing website with new instructions
   * @param {Object} params - Refinement parameters
   * @param {string} params.projectId - Project ID
   * @param {string} params.refinementRequest - Refinement instructions
   * @param {string} params.currentCode - Current HTML/CSS/JS code
   * @returns {Promise<Object>} Refinement result
   */
  refineWebsite: async (params) => {
    try {
      const response = await apiService.post('/api/ai/refine', {
        projectId: params.projectId,
        refinementRequest: params.refinementRequest,
        currentCode: params.currentCode
      })
      return response
    } catch (error) {
      throw error
    }
  },

  /**
   * Generate website from template
   * @param {Object} params - Template parameters
   * @param {string} params.category - Template category
   * @param {string} [params.style] - Design style
   * @param {string} [params.colorScheme] - Color scheme
   * @returns {Promise<Object>} Template generation result
   */
  generateFromTemplate: async (params) => {
    try {
      const response = await apiService.post('/api/ai/template', {
        category: params.category,
        style: params.style,
        colorScheme: params.colorScheme
      })
      return response
    } catch (error) {
      throw error
    }
  },

  /**
   * Get available templates
   * @param {Object} [params] - Query parameters
   * @param {string} [params.category] - Filter by category
   * @param {number} [params.limit] - Limit results
   * @returns {Promise<Object>} Templates and categories
   */
  getTemplates: async (params = {}) => {
    try {
      const response = await apiService.get('/api/ai/templates', params)
      return response
    } catch (error) {
      throw error
    }
  },

  /**
   * Get specific template details
   * @param {string} templateId - Template ID
   * @returns {Promise<Object>} Template details
   */
  getTemplate: async (templateId) => {
    try {
      const response = await apiService.get(`/api/ai/templates/${templateId}`)
      return response
    } catch (error) {
      throw error
    }
  },

  /**
   * Get AI service status
   * @returns {Promise<Object>} Service status and capabilities
   */
  getStatus: async () => {
    try {
      const response = await apiService.get('/api/ai/status')
      return response
    } catch (error) {
      throw error
    }
  },

  /**
   * Get user's AI usage statistics
   * @returns {Promise<Object>} Usage statistics
   */
  getUsage: async () => {
    try {
      const response = await apiService.get('/api/ai/usage')
      return response
    } catch (error) {
      throw error
    }
  },

  /**
   * Get conversation history for a project
   * @param {string} projectId - Project ID
   * @returns {Promise<Array>} Conversation history
   */
  getConversations: async (projectId) => {
    try {
      const response = await apiService.get(`/api/projects/${projectId}/conversations`)
      return response.conversations
    } catch (error) {
      throw error
    }
  },

  /**
   * Rate a generation result
   * @param {string} conversationId - Conversation ID
   * @param {number} rating - Rating (1-5)
   * @param {string} [feedback] - Optional feedback
   * @returns {Promise<void>}
   */
  rateGeneration: async (conversationId, rating, feedback = '') => {
    try {
      await apiService.post(`/api/ai/conversations/${conversationId}/rate`, {
        rating,
        feedback
      })
    } catch (error) {
      throw error
    }
  },

  /**
   * Report an issue with generation
   * @param {string} conversationId - Conversation ID
   * @param {Object} issue - Issue details
   * @param {string} issue.type - Issue type
   * @param {string} issue.description - Issue description
   * @returns {Promise<void>}
   */
  reportIssue: async (conversationId, issue) => {
    try {
      await apiService.post(`/api/ai/conversations/${conversationId}/report`, issue)
    } catch (error) {
      throw error
    }
  },

  /**
   * Get suggested prompts based on project context
   * @param {string} projectId - Project ID
   * @param {string} [context] - Current context
   * @returns {Promise<Array>} Suggested prompts
   */
  getSuggestedPrompts: async (projectId, context = '') => {
    try {
      const response = await apiService.get('/api/ai/suggestions', {
        projectId,
        context
      })
      return response.suggestions
    } catch (error) {
      throw error
    }
  },

  /**
   * Get AI model capabilities and limits
   * @returns {Promise<Object>} Model information
   */
  getModelInfo: async () => {
    try {
      const response = await apiService.get('/api/ai/models')
      return response
    } catch (error) {
      throw error
    }
  },

  /**
   * Analyze website code for improvements
   * @param {Object} params - Analysis parameters
   * @param {string} params.projectId - Project ID
   * @param {string} params.htmlCode - HTML code to analyze
   * @param {string} [params.cssCode] - CSS code to analyze
   * @param {string} [params.jsCode] - JavaScript code to analyze
   * @returns {Promise<Object>} Analysis results and suggestions
   */
  analyzeCode: async (params) => {
    try {
      const response = await apiService.post('/api/ai/analyze', {
        projectId: params.projectId,
        htmlCode: params.htmlCode,
        cssCode: params.cssCode,
        jsCode: params.jsCode
      })
      return response
    } catch (error) {
      throw error
    }
  },

  /**
   * Generate SEO improvements for website
   * @param {Object} params - SEO parameters
   * @param {string} params.projectId - Project ID
   * @param {string} params.htmlCode - Current HTML code
   * @param {string} [params.targetKeywords] - Target keywords
   * @param {string} [params.description] - Site description
   * @returns {Promise<Object>} SEO improvements
   */
  generateSEO: async (params) => {
    try {
      const response = await apiService.post('/api/ai/seo', {
        projectId: params.projectId,
        htmlCode: params.htmlCode,
        targetKeywords: params.targetKeywords,
        description: params.description
      })
      return response
    } catch (error) {
      throw error
    }
  },

  /**
   * Generate responsive improvements
   * @param {Object} params - Responsive parameters
   * @param {string} params.projectId - Project ID
   * @param {string} params.htmlCode - Current HTML code
   * @param {string} [params.targetDevices] - Target devices (mobile, tablet, desktop)
   * @returns {Promise<Object>} Responsive improvements
   */
  generateResponsive: async (params) => {
    try {
      const response = await apiService.post('/api/ai/responsive', {
        projectId: params.projectId,
        htmlCode: params.htmlCode,
        targetDevices: params.targetDevices
      })
      return response
    } catch (error) {
      throw error
    }
  },

  /**
   * Generate accessibility improvements
   * @param {Object} params - Accessibility parameters
   * @param {string} params.projectId - Project ID
   * @param {string} params.htmlCode - Current HTML code
   * @returns {Promise<Object>} Accessibility improvements
   */
  generateAccessibility: async (params) => {
    try {
      const response = await apiService.post('/api/ai/accessibility', {
        projectId: params.projectId,
        htmlCode: params.htmlCode
      })
      return response
    } catch (error) {
      throw error
    }
  },

  /**
   * Convert design screenshot to website
   * @param {Object} params - Conversion parameters
   * @param {string} params.projectId - Project ID
   * @param {File} params.image - Design screenshot
   * @param {string} [params.description] - Additional description
   * @returns {Promise<Object>} Generated website from design
   */
  convertDesignToWebsite: async (params) => {
    try {
      const formData = new FormData()
      formData.append('projectId', params.projectId)
      formData.append('image', params.image)
      if (params.description) {
        formData.append('description', params.description)
      }

      const response = await apiService.post('/api/ai/design-to-code', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response
    } catch (error) {
      throw error
    }
  },

  /**
   * Generate website variations
   * @param {Object} params - Variation parameters
   * @param {string} params.projectId - Project ID
   * @param {string} params.baseCode - Base HTML code
   * @param {string} params.variationType - Type of variation (color, layout, style)
   * @param {number} [params.count=3] - Number of variations
   * @returns {Promise<Object>} Website variations
   */
  generateVariations: async (params) => {
    try {
      const response = await apiService.post('/api/ai/variations', {
        projectId: params.projectId,
        baseCode: params.baseCode,
        variationType: params.variationType,
        count: params.count || 3
      })
      return response
    } catch (error) {
      throw error
    }
  },

  /**
   * Get generation history for user
   * @param {Object} [params] - Query parameters
   * @param {number} [params.page=1] - Page number
   * @param {number} [params.limit=20] - Items per page
   * @returns {Promise<Object>} Generation history
   */
  getGenerationHistory: async (params = {}) => {
    try {
      const response = await apiService.get('/api/ai/history', params)
      return response
    } catch (error) {
      throw error
    }
  },

  /**
   * Clear generation cache for user
   * @returns {Promise<void>}
   */
  clearCache: async () => {
    try {
      await apiService.delete('/api/ai/cache')
    } catch (error) {
      throw error
    }
  },

  /**
   * Get AI service health check
   * @returns {Promise<Object>} Health status
   */
  healthCheck: async () => {
    try {
      const response = await apiService.get('/api/ai/health')
      return response
    } catch (error) {
      throw error
    }
  }
}