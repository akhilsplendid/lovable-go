/**
 * Replit Service
 * Handles integration with Replit API for secure website previews
 */
class ReplitService {
  constructor() {
    this.apiToken = import.meta.env.VITE_REPLIT_TOKEN
    this.baseUrl = 'https://replit.com/api/v0'
    this.activeRepls = new Map() // Track active repls for cleanup
    this.previewCache = new Map() // Cache preview URLs
  }

  /**
   * Create a new repl with website code
   * @param {string} projectId - Project ID for tracking
   * @param {string} htmlCode - HTML code
   * @param {string} cssCode - CSS code (optional)
   * @param {string} jsCode - JavaScript code (optional)
   * @returns {Promise<Object>} Repl information
   */
  async createRepl(projectId, htmlCode, cssCode = '', jsCode = '') {
    if (!this.apiToken) {
      throw new Error('Replit API token not configured')
    }

    try {
      // Prepare files for the repl
      const files = this.prepareFiles(htmlCode, cssCode, jsCode)
      
      // Create repl via API
      const response = await fetch(`${this.baseUrl}/repls`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: `Website Preview - ${projectId}`,
          description: 'Auto-generated website preview',
          language: 'html',
          files,
          isPrivate: true,
          folderId: null // Could organize in a specific folder
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to create repl: ${response.statusText}`)
      }

      const replData = await response.json()
      
      // Track the repl
      this.activeRepls.set(projectId, {
        replId: replData.id,
        url: replData.url,
        createdAt: new Date(),
        projectId
      })

      return {
        replId: replData.id,
        url: replData.url,
        previewUrl: `${replData.url}?embed=true`,
        editUrl: replData.url
      }

    } catch (error) {
      console.error('Replit creation error:', error)
      throw error
    }
  }

  /**
   * Update existing repl with new code
   * @param {string} replId - Repl ID
   * @param {string} htmlCode - Updated HTML code
   * @param {string} cssCode - Updated CSS code
   * @param {string} jsCode - Updated JavaScript code
   * @returns {Promise<Object>} Update result
   */
  async updateRepl(replId, htmlCode, cssCode = '', jsCode = '') {
    try {
      const files = this.prepareFiles(htmlCode, cssCode, jsCode)
      
      const response = await fetch(`${this.baseUrl}/repls/${replId}/files`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ files })
      })

      if (!response.ok) {
        throw new Error(`Failed to update repl: ${response.statusText}`)
      }

      // Trigger repl restart for changes to take effect
      await this.restartRepl(replId)

      return await response.json()

    } catch (error) {
      console.error('Replit update error:', error)
      throw error
    }
  }

  /**
   * Get preview URL for a project (create if doesn't exist)
   * @param {string} projectId - Project ID
   * @param {string} htmlCode - HTML code
   * @param {string} cssCode - CSS code
   * @param {string} jsCode - JavaScript code
   * @returns {Promise<string>} Preview URL
   */
  async getPreviewUrl(projectId, htmlCode, cssCode = '', jsCode = '') {
    try {
      // Check cache first
      const cached = this.previewCache.get(projectId)
      if (cached && this.isCacheValid(cached)) {
        return cached.previewUrl
      }

      // Check if repl already exists for this project
      const existingRepl = this.activeRepls.get(projectId)
      
      if (existingRepl) {
        // Update existing repl
        await this.updateRepl(existingRepl.replId, htmlCode, cssCode, jsCode)
        const previewUrl = `${existingRepl.url}?embed=true`
        
        // Update cache
        this.previewCache.set(projectId, {
          previewUrl,
          cachedAt: new Date(),
          replId: existingRepl.replId
        })
        
        return previewUrl
      } else {
        // Create new repl
        const replData = await this.createRepl(projectId, htmlCode, cssCode, jsCode)
        
        // Cache the preview URL
        this.previewCache.set(projectId, {
          previewUrl: replData.previewUrl,
          cachedAt: new Date(),
          replId: replData.replId
        })
        
        return replData.previewUrl
      }

    } catch (error) {
      console.error('Preview URL error:', error)
      // Fallback to local preview
      return this.createLocalPreview(htmlCode, cssCode, jsCode)
    }
  }

  /**
   * Delete a repl
   * @param {string} projectId - Project ID
   * @returns {Promise<void>}
   */
  async deleteRepl(projectId) {
    const replData = this.activeRepls.get(projectId)
    if (!replData) return

    try {
      const response = await fetch(`${this.baseUrl}/repls/${replData.replId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
        }
      })

      if (!response.ok) {
        console.warn(`Failed to delete repl: ${response.statusText}`)
      }

    } catch (error) {
      console.warn('Repl deletion error:', error)
    } finally {
      // Always clean up local tracking
      this.activeRepls.delete(projectId)
      this.previewCache.delete(projectId)
    }
  }

  /**
   * Restart a repl to apply changes
   * @param {string} replId - Repl ID
   * @returns {Promise<void>}
   */
  async restartRepl(replId) {
    try {
      await fetch(`${this.baseUrl}/repls/${replId}/restart`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
        }
      })
    } catch (error) {
      console.warn('Repl restart error:', error)
    }
  }

  /**
   * Get repl status
   * @param {string} replId - Repl ID
   * @returns {Promise<Object>} Repl status
   */
  async getReplStatus(replId) {
    try {
      const response = await fetch(`${this.baseUrl}/repls/${replId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to get repl status: ${response.statusText}`)
      }

      return await response.json()

    } catch (error) {
      console.error('Repl status error:', error)
      throw error
    }
  }

  /**
   * Prepare files for repl creation/update
   * @private
   */
  prepareFiles(htmlCode, cssCode, jsCode) {
    const files = {}

    // Main HTML file
    files['index.html'] = {
      content: this.processHTMLCode(htmlCode, cssCode, jsCode)
    }

    // Separate CSS file if provided and not inline
    if (cssCode && !htmlCode.includes('<style>')) {
      files['style.css'] = {
        content: cssCode
      }
    }

    // Separate JS file if provided and not inline
    if (jsCode && !htmlCode.includes('<script>')) {
      files['script.js'] = {
        content: jsCode
      }
    }

    // Add package.json for potential dependencies
    files['package.json'] = {
      content: JSON.stringify({
        name: 'website-preview',
        version: '1.0.0',
        description: 'Generated website preview',
        main: 'index.html',
        scripts: {
          start: 'python -m http.server 8000'
        }
      }, null, 2)
    }

    // Add .replit configuration
    files['.replit'] = {
      content: `language = "html"
run = "python -m http.server 8000"

[nix]
channel = "stable-21_11"

[deployment]
run = ["sh", "-c", "python -m http.server 8000"]`
    }

    return files
  }

  /**
   * Process HTML code to include external CSS/JS if needed
   * @private
   */
  processHTMLCode(htmlCode, cssCode, jsCode) {
    let processedHTML = htmlCode

    // Add CSS link if external CSS provided
    if (cssCode && !htmlCode.includes('<style>') && !htmlCode.includes('style.css')) {
      const headCloseIndex = processedHTML.indexOf('</head>')
      if (headCloseIndex !== -1) {
        processedHTML = processedHTML.slice(0, headCloseIndex) + 
          '  <link rel="stylesheet" href="style.css">\n' +
          processedHTML.slice(headCloseIndex)
      }
    }

    // Add JS script if external JS provided
    if (jsCode && !htmlCode.includes('<script>') && !htmlCode.includes('script.js')) {
      const bodyCloseIndex = processedHTML.lastIndexOf('</body>')
      if (bodyCloseIndex !== -1) {
        processedHTML = processedHTML.slice(0, bodyCloseIndex) + 
          '  <script src="script.js"></script>\n' +
          processedHTML.slice(bodyCloseIndex)
      }
    }

    return processedHTML
  }

  /**
   * Check if cached preview is still valid
   * @private
   */
  isCacheValid(cached) {
    const maxAge = 10 * 60 * 1000 // 10 minutes
    return Date.now() - cached.cachedAt.getTime() < maxAge
  }

  /**
   * Create local preview as fallback when Replit is unavailable
   * @private
   */
  createLocalPreview(htmlCode, cssCode, jsCode) {
    const fullHTML = this.processHTMLCode(htmlCode, cssCode, jsCode)
    const blob = new Blob([fullHTML], { type: 'text/html' })
    return URL.createObjectURL(blob)
  }

  /**
   * Clean up old repls to avoid hitting limits
   */
  async cleanupOldRepls() {
    const maxAge = 24 * 60 * 60 * 1000 // 24 hours
    const now = new Date()

    for (const [projectId, replData] of this.activeRepls.entries()) {
      if (now - replData.createdAt > maxAge) {
        await this.deleteRepl(projectId)
      }
    }
  }

  /**
   * Get service statistics
   */
  getStats() {
    return {
      activeRepls: this.activeRepls.size,
      cachedPreviews: this.previewCache.size,
      isConfigured: !!this.apiToken,
      replList: Array.from(this.activeRepls.keys())
    }
  }

  /**
   * Clear all caches and repls
   */
  async clearAll() {
    // Delete all active repls
    const deletePromises = Array.from(this.activeRepls.keys()).map(
      projectId => this.deleteRepl(projectId)
    )
    
    await Promise.all(deletePromises)
    
    // Clear caches
    this.activeRepls.clear()
    this.previewCache.clear()
  }
}

// Create singleton instance
const replitService = new ReplitService()

// Auto cleanup every hour
if (typeof window !== 'undefined') {
  setInterval(() => {
    replitService.cleanupOldRepls().catch(console.error)
  }, 60 * 60 * 1000)
}

export { replitService, ReplitService }