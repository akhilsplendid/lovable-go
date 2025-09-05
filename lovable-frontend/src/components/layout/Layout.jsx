import React, { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useUIStore } from '../../store/uiStore'
import { useAuth } from '../../hooks/useAuth'
import Header from './Header'
import Sidebar from './Sidebar'
import { useWebSocket } from '../../hooks/useWebSocket'

/**
 * Main Layout Component
 * Provides the overall application layout structure
 */
const Layout = () => {
  const location = useLocation()
  const { isAuthenticated, user } = useAuth()
  const { 
    sidebarOpen, 
    sidebarCollapsed, 
    mobileMenuOpen, 
    closeMobileMenu,
    globalLoading,
    loadingMessage
  } = useUIStore()

  // Initialize WebSocket connection
  const { isConnected } = useWebSocket({
    onConnect: () => {
      console.log('WebSocket connected in layout')
    },
    onError: (error) => {
      console.warn('WebSocket connection error:', error)
    }
  })

  // Close mobile menu on route change
  useEffect(() => {
    closeMobileMenu()
  }, [location.pathname, closeMobileMenu])

  // Auto-close sidebar on mobile when clicking outside
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        closeMobileMenu()
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [closeMobileMenu])

  // Page transition variants
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 }
  }

  const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.3
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <Header />

      {/* Main content area */}
      <div className="flex flex-1 relative">
        {/* Sidebar */}
        <Sidebar />

        {/* Main content */}
        <main 
          className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
            sidebarOpen && !mobileMenuOpen
              ? sidebarCollapsed 
                ? 'lg:ml-16' 
                : 'lg:ml-64'
              : ''
          }`}
        >
          {/* Connection status indicator */}
          {isAuthenticated && !isConnected && (
            <div className="bg-warning-50 dark:bg-warning-900/20 border-b border-warning-200 dark:border-warning-800 px-4 py-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-warning-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-warning-800 dark:text-warning-200">
                    Reconnecting to real-time services...
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Global loading overlay */}
          {globalLoading && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl">
                <div className="flex items-center space-x-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                  <span className="text-gray-900 dark:text-gray-100">
                    {loadingMessage || 'Loading...'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Page content with animation */}
          <motion.div
            key={location.pathname}
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
            className="flex-1 flex flex-col"
          >
            <div className="flex-1 p-4 sm:p-6 lg:p-8">
              <Outlet />
            </div>
          </motion.div>

          {/* Footer */}
          <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
              <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                <span>© 2024 Lovable</span>
                <span>•</span>
                <a href="#" className="hover:text-primary-600 transition-colors">
                  Privacy
                </a>
                <span>•</span>
                <a href="#" className="hover:text-primary-600 transition-colors">
                  Terms
                </a>
                <span>•</span>
                <a href="#" className="hover:text-primary-600 transition-colors">
                  Support
                </a>
              </div>

              <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-success-500' : 'bg-error-500'}`}></div>
                  <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
                </div>
                <span>•</span>
                <span>v1.0.0</span>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  )
}

/**
 * Layout wrapper with error boundary
 */
class LayoutErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Layout error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="max-w-md mx-auto text-center p-6">
            <div className="w-16 h-16 bg-error-100 dark:bg-error-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-error-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Something went wrong
            </h1>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              An unexpected error occurred. Please refresh the page or contact support if the problem persists.
            </p>
            
            <button
              onClick={() => window.location.reload()}
              className="btn btn-primary"
            >
              Refresh Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Layout with error boundary wrapper
 */
const LayoutWithErrorBoundary = () => (
  <LayoutErrorBoundary>
    <Layout />
  </LayoutErrorBoundary>
)

export default LayoutWithErrorBoundary