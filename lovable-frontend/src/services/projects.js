import { apiService } from './api'

/**
 * Projects Service
 * Handles all project-related API calls
 */
export const projectService = {
  /**
   * Get user projects with pagination and filters
   * @param {Object} params - Query parameters
   * @param {number} [params.page=1] - Page number
   * @param {number} [params.limit=20] - Items per page
   * @param {string} [params.search] - Search query
   * @param {string} [params.status] - Filter by status
   * @param {string} [params.tags] - Filter by tags (comma-separated)
   * @param {string} [params.sort] - Sort field
   * @param {string} [params.order] - Sort order (asc/desc)
   * @returns {Promise<Object>} Projects and pagination info
   */
  getProjects: async (params = {}) => {
    try {
      const response = await apiService.get('/api/projects', params)
      return response
    } catch (error) {
      throw error
    }
  },

  /**
   * Get a specific project by ID
   * @param {string} projectId - Project ID
   * @returns {Promise<Object>} Project data
   */
  getProject: async (projectId) => {
    try {
      const response = await apiService.get(`/api/projects/${projectId}`)
      return response.project
    } catch (error) {
      throw error
    }
  },

  /**
   * Create a new project
   * @param {Object} projectData - Project data
   * @param {string} projectData.name - Project name
   * @param {string} [projectData.description] - Project description
   * @param {string[]} [projectData.tags] - Project tags
   * @returns {Promise<Object>} Created project
   */
  createProject: async (projectData) => {
    try {
      const response = await apiService.post('/api/projects', projectData)
      return response.project
    } catch (error) {
      throw error
    }
  },

  /**
   * Update a project
   * @param {string} projectId - Project ID
   * @param {Object} updates - Project updates
   * @param {string} [updates.name] - Updated name
   * @param {string} [updates.description] - Updated description
   * @param {string} [updates.html_code] - Updated HTML code
   * @param {string} [updates.css_code] - Updated CSS code
   * @param {string} [updates.js_code] - Updated JavaScript code
   * @param {string} [updates.status] - Updated status
   * @param {string[]} [updates.tags] - Updated tags
   * @param {boolean} [updates.is_public] - Updated visibility
   * @returns {Promise<Object>} Updated project
   */
  updateProject: async (projectId, updates) => {
    try {
      const response = await apiService.put(`/api/projects/${projectId}`, updates)
      return response.project
    } catch (error) {
      throw error
    }
  },

  /**
   * Delete a project
   * @param {string} projectId - Project ID
   * @returns {Promise<void>}
   */
  deleteProject: async (projectId) => {
    try {
      await apiService.delete(`/api/projects/${projectId}`)
    } catch (error) {
      throw error
    }
  },

  /**
   * Duplicate a project
   * @param {string} projectId - Project ID to duplicate
   * @returns {Promise<Object>} Duplicated project
   */
  duplicateProject: async (projectId) => {
    try {
      const response = await apiService.post(`/api/projects/${projectId}/duplicate`)
      return response.project
    } catch (error) {
      throw error
    }
  },

  /**
   * Get project conversations/chat history
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
   * Publish a project (make it public)
   * @param {string} projectId - Project ID
   * @returns {Promise<Object>} Updated project with public URL
   */
  publishProject: async (projectId) => {
    try {
      const response = await apiService.post(`/api/projects/${projectId}/publish`)
      return response.project
    } catch (error) {
      throw error
    }
  },

  /**
   * Unpublish a project (make it private)
   * @param {string} projectId - Project ID
   * @returns {Promise<Object>} Updated project
   */
  unpublishProject: async (projectId) => {
    try {
      const response = await apiService.post(`/api/projects/${projectId}/unpublish`)
      return response.project
    } catch (error) {
      throw error
    }
  },

  /**
   * Export project as HTML file
   * @param {string} projectId - Project ID
   * @param {boolean} [minify=false] - Whether to minify HTML
   * @returns {Promise<Blob>} HTML file blob
   */
  exportHTML: async (projectId, minify = false) => {
    try {
      const response = await apiService.get(`/api/export/${projectId}/html`, {
        minify
      }, {
        responseType: 'blob'
      })
      return response
    } catch (error) {
      throw error
    }
  },

  /**
   * Export project as ZIP file
   * @param {string} projectId - Project ID
   * @param {boolean} [includeAssets=false] - Whether to include assets
   * @returns {Promise<Blob>} ZIP file blob
   */
  exportZIP: async (projectId, includeAssets = false) => {
    try {
      const response = await apiService.get(`/api/export/${projectId}/zip`, {
        includeAssets
      }, {
        responseType: 'blob'
      })
      return response
    } catch (error) {
      throw error
    }
  },

  /**
   * Batch export multiple projects
   * @param {string[]} projectIds - Array of project IDs
   * @param {boolean} [includeAssets=false] - Whether to include assets
   * @returns {Promise<Blob>} ZIP file blob
   */
  exportBatch: async (projectIds, includeAssets = false) => {
    try {
      const response = await apiService.post('/api/export/batch', {
        projectIds,
        includeAssets
      }, {
        responseType: 'blob'
      })
      return response
    } catch (error) {
      throw error
    }
  },

  /**
   * Get project preview URL
   * @param {string} projectId - Project ID
   * @returns {string} Preview URL
   */
  getPreviewURL: (projectId) => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'
    return `${baseUrl}/api/export/${projectId}/preview`
  },

  /**
   * Get project statistics
   * @param {string} projectId - Project ID
   * @returns {Promise<Object>} Project statistics
   */
  getProjectStats: async (projectId) => {
    try {
      const response = await apiService.get(`/api/projects/${projectId}/stats`)
      return response.stats
    } catch (error) {
      throw error
    }
  },

  /**
   * Get project export history
   * @param {string} projectId - Project ID
   * @returns {Promise<Array>} Export history
   */
  getExportHistory: async (projectId) => {
    try {
      const response = await apiService.get(`/api/projects/${projectId}/exports`)
      return response.exports
    } catch (error) {
      throw error
    }
  },

  /**
   * Add project to favorites
   * @param {string} projectId - Project ID
   * @returns {Promise<void>}
   */
  addToFavorites: async (projectId) => {
    try {
      await apiService.post(`/api/projects/${projectId}/favorite`)
    } catch (error) {
      throw error
    }
  },

  /**
   * Remove project from favorites
   * @param {string} projectId - Project ID
   * @returns {Promise<void>}
   */
  removeFromFavorites: async (projectId) => {
    try {
      await apiService.delete(`/api/projects/${projectId}/favorite`)
    } catch (error) {
      throw error
    }
  },

  /**
   * Get user's favorite projects
   * @returns {Promise<Array>} Favorite projects
   */
  getFavorites: async () => {
    try {
      const response = await apiService.get('/api/projects/favorites')
      return response.projects
    } catch (error) {
      throw error
    }
  },

  /**
   * Archive a project
   * @param {string} projectId - Project ID
   * @returns {Promise<Object>} Updated project
   */
  archiveProject: async (projectId) => {
    try {
      const response = await apiService.post(`/api/projects/${projectId}/archive`)
      return response.project
    } catch (error) {
      throw error
    }
  },

  /**
   * Unarchive a project
   * @param {string} projectId - Project ID
   * @returns {Promise<Object>} Updated project
   */
  unarchiveProject: async (projectId) => {
    try {
      const response = await apiService.post(`/api/projects/${projectId}/unarchive`)
      return response.project
    } catch (error) {
      throw error
    }
  },

  /**
   * Get project templates
   * @param {Object} params - Query parameters
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
   * Get a specific template
   * @param {string} templateId - Template ID
   * @returns {Promise<Object>} Template data
   */
  getTemplate: async (templateId) => {
    try {
      const response = await apiService.get(`/api/ai/templates/${templateId}`)
      return response.template
    } catch (error) {
      throw error
    }
  },

  /**
   * Create project from template
   * @param {string} templateId - Template ID
   * @param {Object} projectData - Project data
   * @param {string} projectData.name - Project name
   * @param {string} [projectData.description] - Project description
   * @returns {Promise<Object>} Created project
   */
  createFromTemplate: async (templateId, projectData) => {
    try {
      const response = await apiService.post('/api/projects/from-template', {
        templateId,
        ...projectData
      })
      return response.project
    } catch (error) {
      throw error
    }
  },

  /**
   * Share project with other users
   * @param {string} projectId - Project ID
   * @param {Object} shareData - Share configuration
   * @param {string[]} shareData.emails - User emails to share with
   * @param {string} shareData.permission - Permission level (view/edit)
   * @param {string} [shareData.message] - Optional message
   * @returns {Promise<Object>} Share result
   */
  shareProject: async (projectId, shareData) => {
    try {
      const response = await apiService.post(`/api/projects/${projectId}/share`, shareData)
      return response
    } catch (error) {
      throw error
    }
  },

  /**
   * Get project collaborators
   * @param {string} projectId - Project ID
   * @returns {Promise<Array>} Project collaborators
   */
  getCollaborators: async (projectId) => {
    try {
      const response = await apiService.get(`/api/projects/${projectId}/collaborators`)
      return response.collaborators
    } catch (error) {
      throw error
    }
  },

  /**
   * Remove collaborator from project
   * @param {string} projectId - Project ID
   * @param {string} userId - User ID to remove
   * @returns {Promise<void>}
   */
  removeCollaborator: async (projectId, userId) => {
    try {
      await apiService.delete(`/api/projects/${projectId}/collaborators/${userId}`)
    } catch (error) {
      throw error
    }
  },

  /**
   * Update collaborator permissions
   * @param {string} projectId - Project ID
   * @param {string} userId - User ID
   * @param {string} permission - New permission level
   * @returns {Promise<void>}
   */
  updateCollaboratorPermission: async (projectId, userId, permission) => {
    try {
      await apiService.put(`/api/projects/${projectId}/collaborators/${userId}`, {
        permission
      })
    } catch (error) {
      throw error
    }
  },

  /**
   * Get project activity/audit log
   * @param {string} projectId - Project ID
   * @param {Object} [params] - Query parameters
   * @returns {Promise<Array>} Activity log entries
   */
  getProjectActivity: async (projectId, params = {}) => {
    try {
      const response = await apiService.get(`/api/projects/${projectId}/activity`, params)
      return response.activities
    } catch (error) {
      throw error
    }
  }
}