import axios from 'axios'
import toast from 'react-hot-toast'

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

/**
 * Create axios instance with default configuration
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * Token management utilities
 */
const tokenManager = {
  getAccessToken: () => {
    try {
      const authStorage = localStorage.getItem('auth-storage')
      if (authStorage) {
        const parsed = JSON.parse(authStorage)
        return parsed.state?.accessToken
      }
    } catch (error) {
      console.warn('Failed to get access token:', error)
    }
    return null
  },

  getRefreshToken: () => {
    try {
      const authStorage = localStorage.getItem('auth-storage')
      if (authStorage) {
        const parsed = JSON.parse(authStorage)
        return parsed.state?.refreshToken
      }
    } catch (error) {
      console.warn('Failed to get refresh token:', error)
    }
    return null
  },

  setTokens: (accessToken, refreshToken) => {
    try {
      const authStorage = localStorage.getItem('auth-storage')
      if (authStorage) {
        const parsed = JSON.parse(authStorage)
        parsed.state.accessToken = accessToken
        parsed.state.refreshToken = refreshToken
        localStorage.setItem('auth-storage', JSON.stringify(parsed))
      }
    } catch (error) {
      console.warn('Failed to set tokens:', error)
    }
  },

  clearTokens: () => {
    try {
      const authStorage = localStorage.getItem('auth-storage')
      if (authStorage) {
        const parsed = JSON.parse(authStorage)
        parsed.state.accessToken = null
        parsed.state.refreshToken = null
        parsed.state.isAuthenticated = false
        localStorage.setItem('auth-storage', JSON.stringify(parsed))
      }
    } catch (error) {
      console.warn('Failed to clear tokens:', error)
    }
  }
}

/**
 * Request interceptor to add auth token
 */
api.interceptors.request.use(
  (config) => {
    const token = tokenManager.getAccessToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Add request timestamp for debugging
    config.metadata = { startTime: new Date() }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

/**
 * Response interceptor to handle errors and token refresh
 */
api.interceptors.response.use(
  (response) => {
    // Calculate request duration
    const duration = new Date() - response.config.metadata?.startTime
    console.log(`API Request: ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status} (${duration}ms)`)

    return response
  },
  async (error) => {
    const originalRequest = error.config
    
    // Don't retry if it's already a retry attempt
    if (originalRequest._retry) {
      return Promise.reject(error)
    }

    // Handle 401 errors - token might be expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = tokenManager.getRefreshToken()
        
        if (!refreshToken) {
          throw new Error('No refresh token available')
        }

        // Try to refresh the token
        const response = await axios.post(
          `${API_BASE_URL}/api/auth/refresh`,
          { refreshToken },
          { timeout: 10000 }
        )

        const { accessToken, refreshToken: newRefreshToken } = response.data
        
        // Update tokens in storage
        tokenManager.setTokens(accessToken, newRefreshToken)
        
        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return api(originalRequest)

      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        tokenManager.clearTokens()
        
        // Redirect to login page
        window.location.href = '/login'
        
        return Promise.reject(refreshError)
      }
    }

    // Handle other error types
    handleApiError(error)
    
    return Promise.reject(error)
  }
)

/**
 * Handle API errors with user-friendly messages
 */
const handleApiError = (error) => {
  const status = error.response?.status
  const message = error.response?.data?.error || error.message
  
  // Don't show toast for certain status codes
  const silentErrors = [401, 403]
  
  if (!silentErrors.includes(status)) {
    switch (status) {
      case 400:
        toast.error(`Invalid request: ${message}`)
        break
      case 404:
        toast.error('Resource not found')
        break
      case 409:
        toast.error(`Conflict: ${message}`)
        break
      case 422:
        toast.error(`Validation error: ${message}`)
        break
      case 429:
        toast.error('Too many requests. Please try again later.')
        break
      case 500:
        toast.error('Server error. Please try again.')
        break
      case 503:
        toast.error('Service unavailable. Please try again later.')
        break
      default:
        if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNABORTED') {
          toast.error('Network error. Please check your connection.')
        } else {
          toast.error(`Error: ${message}`)
        }
    }
  }
}

/**
 * Request wrapper with loading state and error handling
 */
const createRequest = (method) => {
  return async (url, data = null, options = {}) => {
    try {
      const config = {
        method,
        url,
        ...options
      }

      if (data && ['post', 'put', 'patch'].includes(method.toLowerCase())) {
        config.data = data
      } else if (data && method.toLowerCase() === 'get') {
        config.params = data
      }

      const response = await api(config)
      return response.data
    } catch (error) {
      throw error
    }
  }
}

/**
 * HTTP method helpers
 */
export const apiService = {
  get: createRequest('GET'),
  post: createRequest('POST'),
  put: createRequest('PUT'),
  patch: createRequest('PATCH'),
  delete: createRequest('DELETE'),

  /**
   * Upload file with progress tracking
   */
  upload: async (url, file, onProgress) => {
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await api.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            onProgress(progress)
          }
        },
      })

      return response.data
    } catch (error) {
      throw error
    }
  },

  /**
   * Download file
   */
  download: async (url, filename) => {
    try {
      const response = await api.get(url, {
        responseType: 'blob',
      })

      // Create download link
      const blob = new Blob([response.data])
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = filename || 'download'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)

      return response.data
    } catch (error) {
      throw error
    }
  },

  /**
   * Stream data with Server-Sent Events
   */
  stream: (url, onMessage, onError = null, onOpen = null) => {
    const eventSource = new EventSource(`${API_BASE_URL}${url}`)

    if (onOpen) {
      eventSource.onopen = onOpen
    }

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        onMessage(data)
      } catch (error) {
        console.error('Failed to parse SSE data:', error)
        if (onError) onError(error)
      }
    }

    eventSource.onerror = (error) => {
      console.error('SSE error:', error)
      if (onError) onError(error)
    }

    return eventSource
  },

  /**
   * Check API health
   */
  health: async () => {
    try {
      const response = await api.get('/health')
      return response.data
    } catch (error) {
      throw error
    }
  },

  /**
   * Get API status
   */
  status: async () => {
    try {
      const response = await api.get('/api/status')
      return response.data
    } catch (error) {
      throw error
    }
  }
}

/**
 * Request interceptor utilities
 */
export const requestUtils = {
  /**
   * Add request ID for tracking
   */
  addRequestId: () => {
    api.interceptors.request.use((config) => {
      config.headers['X-Request-ID'] = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      return config
    })
  },

  /**
   * Add user agent information
   */
  addUserAgent: () => {
    api.interceptors.request.use((config) => {
      config.headers['X-Client-Version'] = '1.0.0'
      config.headers['X-Client-Platform'] = navigator.platform
      return config
    })
  },

  /**
   * Log all requests in development
   */
  enableRequestLogging: () => {
    if (import.meta.env.DEV) {
      api.interceptors.request.use((config) => {
        console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`, {
          data: config.data,
          params: config.params,
          headers: config.headers
        })
        return config
      })
    }
  }
}

// Initialize request utilities
requestUtils.addRequestId()
requestUtils.addUserAgent()
requestUtils.enableRequestLogging()

export default api