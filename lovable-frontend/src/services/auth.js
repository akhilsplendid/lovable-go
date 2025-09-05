import { apiService } from './api'

/**
 * Authentication Service
 * Handles all authentication-related API calls
 */
export const authService = {
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @param {string} userData.email - User email
   * @param {string} userData.password - User password
   * @param {string} userData.confirmPassword - Password confirmation
   * @param {string} userData.name - User name
   * @returns {Promise<Object>} User data and tokens
   */
  register: async (userData) => {
    try {
      const response = await apiService.post('/api/auth/register', userData)
      return response
    } catch (error) {
      throw error
    }
  },

  /**
   * Login user
   * @param {Object} credentials - Login credentials
   * @param {string} credentials.email - User email
   * @param {string} credentials.password - User password
   * @returns {Promise<Object>} User data and tokens
   */
  login: async (credentials) => {
    try {
      const response = await apiService.post('/api/auth/login', credentials)
      return response
    } catch (error) {
      throw error
    }
  },

  /**
   * Logout user
   * @returns {Promise<void>}
   */
  logout: async () => {
    try {
      await apiService.post('/api/auth/logout')
    } catch (error) {
      // Ignore logout errors - token might already be invalid
      console.warn('Logout API error:', error)
    }
  },

  /**
   * Refresh access token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<Object>} New tokens
   */
  refreshToken: async (refreshToken) => {
    try {
      const response = await apiService.post('/api/auth/refresh', {
        refreshToken
      })
      return response
    } catch (error) {
      throw error
    }
  },

  /**
   * Get current user profile
   * @returns {Promise<Object>} User profile data
   */
  getProfile: async () => {
    try {
      const response = await apiService.get('/api/auth/me')
      return response.user
    } catch (error) {
      throw error
    }
  },

  /**
   * Update user profile
   * @param {Object} updates - Profile updates
   * @param {string} [updates.name] - Updated name
   * @param {string} [updates.avatarUrl] - Updated avatar URL
   * @returns {Promise<Object>} Updated user data
   */
  updateProfile: async (updates) => {
    try {
      const response = await apiService.put('/api/auth/me', updates)
      return response.user
    } catch (error) {
      throw error
    }
  },

  /**
   * Change user password
   * @param {Object} passwordData - Password change data
   * @param {string} passwordData.currentPassword - Current password
   * @param {string} passwordData.newPassword - New password
   * @param {string} passwordData.confirmNewPassword - New password confirmation
   * @returns {Promise<void>}
   */
  changePassword: async (passwordData) => {
    try {
      await apiService.put('/api/auth/password', passwordData)
    } catch (error) {
      throw error
    }
  },

  /**
   * Request password reset
   * @param {string} email - User email
   * @returns {Promise<void>}
   */
  requestPasswordReset: async (email) => {
    try {
      await apiService.post('/api/auth/reset-password', { email })
    } catch (error) {
      throw error
    }
  },

  /**
   * Reset password with token
   * @param {Object} resetData - Password reset data
   * @param {string} resetData.token - Reset token
   * @param {string} resetData.password - New password
   * @param {string} resetData.confirmPassword - Password confirmation
   * @returns {Promise<void>}
   */
  resetPassword: async (resetData) => {
    try {
      await apiService.post('/api/auth/reset-password/confirm', resetData)
    } catch (error) {
      throw error
    }
  },

  /**
   * Verify email address
   * @param {string} token - Verification token
   * @returns {Promise<void>}
   */
  verifyEmail: async (token) => {
    try {
      await apiService.post('/api/auth/verify-email', { token })
    } catch (error) {
      throw error
    }
  },

  /**
   * Resend email verification
   * @returns {Promise<void>}
   */
  resendVerification: async () => {
    try {
      await apiService.post('/api/auth/verify-email/resend')
    } catch (error) {
      throw error
    }
  },

  /**
   * Check if email is available
   * @param {string} email - Email to check
   * @returns {Promise<boolean>} Whether email is available
   */
  checkEmailAvailability: async (email) => {
    try {
      const response = await apiService.get('/api/auth/check-email', { email })
      return response.available
    } catch (error) {
      throw error
    }
  },

  /**
   * Get user sessions
   * @returns {Promise<Array>} Active sessions
   */
  getSessions: async () => {
    try {
      const response = await apiService.get('/api/auth/sessions')
      return response.sessions
    } catch (error) {
      throw error
    }
  },

  /**
   * Revoke a specific session
   * @param {string} sessionId - Session ID to revoke
   * @returns {Promise<void>}
   */
  revokeSession: async (sessionId) => {
    try {
      await apiService.delete(`/api/auth/sessions/${sessionId}`)
    } catch (error) {
      throw error
    }
  },

  /**
   * Revoke all sessions except current
   * @returns {Promise<void>}
   */
  revokeAllSessions: async () => {
    try {
      await apiService.delete('/api/auth/sessions')
    } catch (error) {
      throw error
    }
  },

  /**
   * Enable two-factor authentication
   * @returns {Promise<Object>} 2FA setup data (QR code, secret)
   */
  enable2FA: async () => {
    try {
      const response = await apiService.post('/api/auth/2fa/enable')
      return response
    } catch (error) {
      throw error
    }
  },

  /**
   * Confirm two-factor authentication setup
   * @param {Object} data - 2FA confirmation data
   * @param {string} data.token - TOTP token
   * @param {string} data.secret - 2FA secret
   * @returns {Promise<Array>} Backup codes
   */
  confirm2FA: async (data) => {
    try {
      const response = await apiService.post('/api/auth/2fa/confirm', data)
      return response.backupCodes
    } catch (error) {
      throw error
    }
  },

  /**
   * Disable two-factor authentication
   * @param {string} password - User password for confirmation
   * @returns {Promise<void>}
   */
  disable2FA: async (password) => {
    try {
      await apiService.post('/api/auth/2fa/disable', { password })
    } catch (error) {
      throw error
    }
  },

  /**
   * Generate new backup codes
   * @returns {Promise<Array>} New backup codes
   */
  generateBackupCodes: async () => {
    try {
      const response = await apiService.post('/api/auth/2fa/backup-codes')
      return response.backupCodes
    } catch (error) {
      throw error
    }
  },

  /**
   * Get account statistics
   * @returns {Promise<Object>} Account stats
   */
  getAccountStats: async () => {
    try {
      const response = await apiService.get('/api/auth/stats')
      return response.stats
    } catch (error) {
      throw error
    }
  },

  /**
   * Update account preferences
   * @param {Object} preferences - User preferences
   * @returns {Promise<Object>} Updated preferences
   */
  updatePreferences: async (preferences) => {
    try {
      const response = await apiService.put('/api/auth/preferences', preferences)
      return response.preferences
    } catch (error) {
      throw error
    }
  },

  /**
   * Delete user account
   * @param {string} password - Password confirmation
   * @returns {Promise<void>}
   */
  deleteAccount: async (password) => {
    try {
      await apiService.delete('/api/auth/account', { data: { password } })
    } catch (error) {
      throw error
    }
  },

  /**
   * Export user data
   * @returns {Promise<Blob>} User data export
   */
  exportData: async () => {
    try {
      const response = await apiService.get('/api/auth/export', {
        responseType: 'blob'
      })
      return response
    } catch (error) {
      throw error
    }
  }
}