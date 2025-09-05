import { useAuthStore } from '../store/authStore'
import { useCallback, useEffect } from 'react'

/**
 * Authentication Hook
 * Provides auth state and actions with automatic activity tracking
 */
export const useAuth = () => {
  const store = useAuthStore()

  // Track user activity for session management
  const updateActivity = useCallback(() => {
    if (store.isAuthenticated) {
      store.updateActivity()
    }
  }, [store])

  // Set up activity tracking
  useEffect(() => {
    if (!store.isAuthenticated) return

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
    let activityTimer

    const handleActivity = () => {
      // Throttle activity updates to avoid excessive calls
      if (activityTimer) return
      
      activityTimer = setTimeout(() => {
        updateActivity()
        activityTimer = null
      }, 60000) // Update every minute
    }

    events.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true })
    })

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity)
      })
      if (activityTimer) {
        clearTimeout(activityTimer)
      }
    }
  }, [store.isAuthenticated, updateActivity])

  // Check for session expiration
  useEffect(() => {
    if (!store.isAuthenticated) return

    const checkSession = () => {
      if (!store.isSessionValid()) {
        store.logout(false)
      }
    }

    // Check session validity every 5 minutes
    const sessionTimer = setInterval(checkSession, 5 * 60 * 1000)

    return () => clearInterval(sessionTimer)
  }, [store])

  return {
    // State
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    lastActivity: store.lastActivity,

    // Actions
    login: store.login,
    register: store.register,
    logout: store.logout,
    updateProfile: store.updateProfile,
    changePassword: store.changePassword,
    refreshToken: store.refreshAccessToken,

    // Utilities
    hasPermission: store.hasPermission,
    getUsageLimits: store.getUsageLimits,
    isApproachingLimits: store.isApproachingLimits,
    isSessionValid: store.isSessionValid,
    getStoredTokens: store.getStoredTokens,

    // Computed values
    isEmailVerified: store.user?.emailVerified || false,
    subscriptionPlan: store.user?.subscriptionPlan || 'free',
    apiUsage: store.user?.APIUsageInfo || { used: 0, limit: 100, remaining: 100 },
    projectCount: store.user?.projectCount || 0,
    
    // User display info
    displayName: store.user?.name || store.user?.email?.split('@')[0] || 'User',
    initials: store.user?.name 
      ? store.user.name.split(' ').map(n => n[0]).join('').toUpperCase()
      : store.user?.email?.[0]?.toUpperCase() || 'U',
    
    // Subscription helpers
    isPro: store.user?.subscriptionPlan === 'pro',
    isPremium: store.user?.subscriptionPlan === 'premium',
    isFree: !store.user?.subscriptionPlan || store.user?.subscriptionPlan === 'free'
  }
}