import { create } from 'zustand'
import { subscribeWithSelector, persist } from 'zustand/middleware'
import toast from 'react-hot-toast'
import { authService } from '../services/auth'

/**
 * Authentication Store
 * Manages user authentication state, tokens, and auth-related operations
 */
export const useAuthStore = create(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        // State
        user: null,
        accessToken: null,
        refreshToken: null,
        isLoading: false,
        isAuthenticated: false,
        lastActivity: null,

        // Actions
        /**
         * Initialize authentication state on app startup
         */
        initializeAuth: async () => {
          set({ isLoading: true })
          
          try {
            const tokens = get().getStoredTokens()
            if (!tokens.accessToken) {
              set({ isLoading: false, isAuthenticated: false })
              return
            }

            // Validate token and get user info
            const user = await authService.getProfile()
            
            set({ 
              user,
              accessToken: tokens.accessToken,
              refreshToken: tokens.refreshToken,
              isAuthenticated: true,
              isLoading: false,
              lastActivity: Date.now()
            })
            
          } catch (error) {
            // Token might be expired, try to refresh
            try {
              await get().refreshAccessToken()
            } catch (refreshError) {
              // Refresh failed, clear auth state
              get().logout()
            }
            set({ isLoading: false })
          }
        },

        /**
         * Login user with email and password
         */
        login: async (credentials) => {
          set({ isLoading: true })
          
          try {
            const response = await authService.login(credentials)
            const { user, accessToken, refreshToken } = response
            
            set({
              user,
              accessToken,
              refreshToken,
              isAuthenticated: true,
              isLoading: false,
              lastActivity: Date.now()
            })
            
            toast.success(`Welcome back, ${user.name || user.email}!`)
            return response
            
          } catch (error) {
            set({ isLoading: false })
            
            const message = error.response?.data?.error || 'Login failed'
            toast.error(message)
            throw error
          }
        },

        /**
         * Register new user
         */
        register: async (userData) => {
          set({ isLoading: true })
          
          try {
            const response = await authService.register(userData)
            const { user, accessToken, refreshToken } = response
            
            set({
              user,
              accessToken,
              refreshToken,
              isAuthenticated: true,
              isLoading: false,
              lastActivity: Date.now()
            })
            
            toast.success(`Welcome to Lovable, ${user.name || user.email}!`)
            return response
            
          } catch (error) {
            set({ isLoading: false })
            
            const message = error.response?.data?.error || 'Registration failed'
            toast.error(message)
            throw error
          }
        },

        /**
         * Logout user and clear auth state
         */
        logout: async (showMessage = true) => {
          const { accessToken } = get()
          
          try {
            if (accessToken) {
              await authService.logout()
            }
          } catch (error) {
            // Ignore logout API errors - still clear local state
            console.warn('Logout API error:', error)
          } finally {
            set({
              user: null,
              accessToken: null,
              refreshToken: null,
              isAuthenticated: false,
              isLoading: false,
              lastActivity: null
            })
            
            if (showMessage) {
              toast.success('Logged out successfully')
            }
          }
        },

        /**
         * Refresh access token using refresh token
         */
        refreshAccessToken: async () => {
          const { refreshToken } = get()
          
          if (!refreshToken) {
            throw new Error('No refresh token available')
          }
          
          try {
            const response = await authService.refreshToken(refreshToken)
            const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response
            
            set({
              accessToken: newAccessToken,
              refreshToken: newRefreshToken,
              lastActivity: Date.now()
            })
            
            return response
            
          } catch (error) {
            // Refresh failed, logout user
            get().logout(false)
            throw error
          }
        },

        /**
         * Update user profile
         */
        updateProfile: async (updates) => {
          set({ isLoading: true })
          
          try {
            const updatedUser = await authService.updateProfile(updates)
            
            set(state => ({
              user: { ...state.user, ...updatedUser },
              isLoading: false
            }))
            
            toast.success('Profile updated successfully')
            return updatedUser
            
          } catch (error) {
            set({ isLoading: false })
            
            const message = error.response?.data?.error || 'Failed to update profile'
            toast.error(message)
            throw error
          }
        },

        /**
         * Change user password
         */
        changePassword: async (passwordData) => {
          set({ isLoading: true })
          
          try {
            await authService.changePassword(passwordData)
            
            set({ isLoading: false })
            toast.success('Password changed successfully. Please log in again.')
            
            // Force logout after password change
            setTimeout(() => get().logout(false), 1000)
            
          } catch (error) {
            set({ isLoading: false })
            
            const message = error.response?.data?.error || 'Failed to change password'
            toast.error(message)
            throw error
          }
        },

        /**
         * Update last activity timestamp
         */
        updateActivity: () => {
          set({ lastActivity: Date.now() })
        },

        /**
         * Check if user session is still valid
         */
        isSessionValid: () => {
          const { lastActivity, isAuthenticated } = get()
          if (!isAuthenticated || !lastActivity) return false
          
          // Session expires after 8 hours of inactivity
          const sessionTimeout = 8 * 60 * 60 * 1000 // 8 hours
          return Date.now() - lastActivity < sessionTimeout
        },

        /**
         * Get stored tokens from state
         */
        getStoredTokens: () => {
          const { accessToken, refreshToken } = get()
          return { accessToken, refreshToken }
        },

        /**
         * Check if user has specific permission
         */
        hasPermission: (permission) => {
          const { user } = get()
          if (!user) return false
          
          // Basic permission check based on subscription plan
          const permissions = {
            free: ['create_project', 'edit_project', 'view_project'],
            pro: ['create_project', 'edit_project', 'view_project', 'export_project', 'advanced_ai'],
            premium: ['create_project', 'edit_project', 'view_project', 'export_project', 'advanced_ai', 'batch_export', 'premium_templates']
          }
          
          const userPermissions = permissions[user.subscriptionPlan] || permissions.free
          return userPermissions.includes(permission)
        },

        /**
         * Get user usage limits based on plan
         */
        getUsageLimits: () => {
          const { user } = get()
          if (!user) return null
          
          const limits = {
            free: { projects: 5, aiRequests: 10, exports: 5 },
            pro: { projects: 50, aiRequests: 100, exports: 50 },
            premium: { projects: 500, aiRequests: 500, exports: 200 }
          }
          
          return limits[user.subscriptionPlan] || limits.free
        },

        /**
         * Check if user is approaching usage limits
         */
        isApproachingLimits: () => {
          const { user } = get()
          if (!user) return false
          
          const limits = get().getUsageLimits()
          if (!limits) return false
          
          const usageInfo = user.APIUsageInfo || { used: 0 }
          return usageInfo.used >= limits.aiRequests * 0.8 // 80% of limit
        }
      }),
      {
        name: 'auth-storage',
        partialize: (state) => ({
          user: state.user,
          accessToken: state.accessToken,
          refreshToken: state.refreshToken,
          isAuthenticated: state.isAuthenticated,
          lastActivity: state.lastActivity
        }),
        onRehydrateStorage: () => (state) => {
          // Check session validity on rehydration
          if (state && !state.isSessionValid()) {
            state.logout(false)
          }
        }
      }
    )
  )
)

// Subscribe to auth changes for automatic token refresh
useAuthStore.subscribe(
  (state) => state.lastActivity,
  (lastActivity, previousLastActivity) => {
    // Set up automatic token refresh every 30 minutes
    if (lastActivity && !previousLastActivity) {
      const refreshInterval = setInterval(async () => {
        const state = useAuthStore.getState()
        if (state.isAuthenticated && state.isSessionValid()) {
          try {
            await state.refreshAccessToken()
          } catch (error) {
            console.warn('Automatic token refresh failed:', error)
            clearInterval(refreshInterval)
          }
        } else {
          clearInterval(refreshInterval)
        }
      }, 30 * 60 * 1000) // 30 minutes

      // Clear interval on logout
      useAuthStore.subscribe(
        (state) => state.isAuthenticated,
        (isAuthenticated) => {
          if (!isAuthenticated) {
            clearInterval(refreshInterval)
          }
        }
      )
    }
  }
)