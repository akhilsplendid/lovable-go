import React, { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Loader2, Shield, AlertCircle } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import Button from '../ui/Button'

/**
 * Loading Spinner Component
 */
const LoadingSpinner = ({ message = 'Checking authentication...' }) => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center p-8"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="inline-block mb-4"
      >
        <Loader2 className="w-8 h-8 text-primary-600" />
      </motion.div>
      <p className="text-gray-600 dark:text-gray-400">{message}</p>
    </motion.div>
  </div>
)

/**
 * Access Denied Component
 */
const AccessDenied = ({ 
  message = 'You do not have permission to access this page.',
  onRetry 
}) => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 px-4">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center max-w-md"
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center w-12 h-12 bg-error-100 dark:bg-error-900 rounded-full mx-auto mb-4">
          <Shield className="w-6 h-6 text-error-600 dark:text-error-400" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Access Denied
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {message}
        </p>
        {onRetry && (
          <Button
            variant="primary"
            onClick={onRetry}
            className="w-full"
          >
            Try Again
          </Button>
        )}
      </div>
    </motion.div>
  </div>
)

/**
 * Session Expired Component
 */
const SessionExpired = ({ onLogin }) => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 px-4">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center max-w-md"
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center w-12 h-12 bg-warning-100 dark:bg-warning-900 rounded-full mx-auto mb-4">
          <AlertCircle className="w-6 h-6 text-warning-600 dark:text-warning-400" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Session Expired
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Your session has expired for security reasons. Please sign in again to continue.
        </p>
        <Button
          variant="primary"
          onClick={onLogin}
          className="w-full"
        >
          Sign In Again
        </Button>
      </div>
    </motion.div>
  </div>
)

/**
 * ProtectedRoute Component
 * Wraps routes that require authentication and authorization
 */
const ProtectedRoute = ({ 
  children, 
  requiredPermissions = [], 
  fallback,
  showAccessDenied = true 
}) => {
  const { 
    isAuthenticated, 
    isLoading, 
    user, 
    hasPermission, 
    isSessionValid,
    refreshToken 
  } = useAuth()
  const location = useLocation()

  // Try to refresh token if session is invalid
  useEffect(() => {
    const checkAndRefreshSession = async () => {
      if (isAuthenticated && !isSessionValid()) {
        try {
          await refreshToken()
        } catch (error) {
          console.warn('Token refresh failed:', error)
        }
      }
    }

    checkAndRefreshSession()
  }, [isAuthenticated, isSessionValid, refreshToken])

  // Show loading spinner while checking authentication
  if (isLoading) {
    return <LoadingSpinner />
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <Navigate 
        to="/login" 
        state={{ from: location }} 
        replace 
      />
    )
  }

  // Check if session is still valid
  if (!isSessionValid()) {
    return (
      <SessionExpired 
        onLogin={() => window.location.href = '/login'}
      />
    )
  }

  // Check permissions if required
  if (requiredPermissions.length > 0) {
    const hasRequiredPermissions = requiredPermissions.every(permission => 
      hasPermission(permission)
    )

    if (!hasRequiredPermissions) {
      if (fallback) {
        return fallback
      }

      if (showAccessDenied) {
        return (
          <AccessDenied 
            message={`You need ${requiredPermissions.join(', ')} permission(s) to access this page.`}
            onRetry={() => window.location.reload()}
          />
        )
      }

      // Redirect to dashboard if no access and no custom handling
      return (
        <Navigate 
          to="/dashboard" 
          state={{ 
            from: location,
            error: 'Insufficient permissions'
          }} 
          replace 
        />
      )
    }
  }

  // Check subscription-based access
  const checkSubscriptionAccess = () => {
    if (!user?.subscriptionPlan) return false
    
    const currentPath = location.pathname
    
    // Define route access based on subscription plans
    const routeAccess = {
      '/dashboard': ['free', 'pro', 'premium'],
      '/projects': ['free', 'pro', 'premium'],
      '/profile': ['free', 'pro', 'premium'],
      '/analytics': ['pro', 'premium'],
      '/collaboration': ['premium'],
      '/advanced-settings': ['premium']
    }

    const requiredPlans = routeAccess[currentPath]
    if (requiredPlans && !requiredPlans.includes(user.subscriptionPlan)) {
      return false
    }

    return true
  }

  // Check if user has access based on subscription
  if (!checkSubscriptionAccess()) {
    return (
      <AccessDenied 
        message={`This feature requires a ${user?.subscriptionPlan === 'free' ? 'Pro or Premium' : 'Premium'} subscription.`}
        onRetry={() => window.location.href = '/pricing'}
      />
    )
  }

  // Render protected content with user context
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  )
}

/**
 * AdminRoute Component
 * Specialized protected route for admin-only pages
 */
export const AdminRoute = ({ children, ...props }) => {
  const { user } = useAuth()
  
  const isAdmin = user?.email?.endsWith('@lovable.dev') || 
                  user?.role === 'admin' || 
                  user?.subscriptionPlan === 'admin'

  return (
    <ProtectedRoute
      requiredPermissions={[]}
      fallback={
        <AccessDenied 
          message="This page is restricted to administrators only."
        />
      }
      {...props}
    >
      {isAdmin ? children : (
        <AccessDenied 
          message="This page is restricted to administrators only."
        />
      )}
    </ProtectedRoute>
  )
}

/**
 * SubscriptionRoute Component
 * Protected route that requires specific subscription level
 */
export const SubscriptionRoute = ({ 
  children, 
  requiredPlan = 'pro',
  ...props 
}) => {
  const { user } = useAuth()
  
  const planHierarchy = {
    free: 0,
    pro: 1,
    premium: 2
  }

  const userPlanLevel = planHierarchy[user?.subscriptionPlan] || 0
  const requiredPlanLevel = planHierarchy[requiredPlan] || 1

  const hasAccess = userPlanLevel >= requiredPlanLevel

  return (
    <ProtectedRoute
      fallback={
        <AccessDenied 
          message={`This feature requires a ${requiredPlan} subscription or higher.`}
          onRetry={() => window.location.href = '/pricing'}
        />
      }
      {...props}
    >
      {hasAccess ? children : (
        <AccessDenied 
          message={`This feature requires a ${requiredPlan} subscription or higher.`}
          onRetry={() => window.location.href = '/pricing'}
        />
      )}
    </ProtectedRoute>
  )
}

/**
 * RoleBasedRoute Component
 * Protected route based on user roles
 */
export const RoleBasedRoute = ({ 
  children, 
  allowedRoles = [], 
  ...props 
}) => {
  const { user } = useAuth()
  
  const userRole = user?.role || 'user'
  const hasAccess = allowedRoles.includes(userRole)

  return (
    <ProtectedRoute
      fallback={
        <AccessDenied 
          message={`This page is restricted to users with ${allowedRoles.join(' or ')} role.`}
        />
      }
      {...props}
    >
      {hasAccess ? children : (
        <AccessDenied 
          message={`This page is restricted to users with ${allowedRoles.join(' or ')} role.`}
        />
      )}
    </ProtectedRoute>
  )
}

export default ProtectedRoute