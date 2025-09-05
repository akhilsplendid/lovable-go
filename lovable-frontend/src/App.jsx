import React, { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'

// Stores
import { useAuthStore } from './store/authStore'
import { useUIStore } from './store/uiStore'

// Components
import Layout from './components/layout/Layout'
import ProtectedRoute from './components/auth/ProtectedRoute'

// Pages - Lazy loaded for better performance
const LoginPage = React.lazy(() => import('./pages/LoginPage'))
const RegisterPage = React.lazy(() => import('./pages/RegisterPage'))
const DashboardPage = React.lazy(() => import('./pages/DashboardPage'))
const ProjectsPage = React.lazy(() => import('./pages/ProjectsPage'))
const ProjectEditorPage = React.lazy(() => import('./pages/ProjectEditorPage'))
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'))

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
  </div>
)

/**
 * Main Application Component
 * Handles routing, global state initialization, and theme management
 */
function App() {
  const { initializeAuth, isLoading: authLoading } = useAuthStore()
  const { theme, initializeTheme } = useUIStore()

  // Initialize app on mount
  useEffect(() => {
    const initializeApp = async () => {
      try {
        await Promise.all([
          initializeAuth(),
          initializeTheme()
        ])
      } catch (error) {
        console.error('App initialization error:', error)
      }
    }

    initializeApp()
  }, [initializeAuth, initializeTheme])

  // Apply theme to document
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  // Show loading screen during initial auth check
  if (authLoading) {
    return <PageLoader />
  }

  return (
    <div className="app min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
      <AnimatePresence mode="wait">
        <React.Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Protected Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              {/* Dashboard */}
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              
              {/* Projects */}
              <Route path="projects" element={<ProjectsPage />} />
              <Route path="projects/:projectId" element={<ProjectEditorPage />} />
              
              {/* Profile */}
              <Route path="profile" element={<ProfilePage />} />
            </Route>

            {/* Catch all - redirect to dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </React.Suspense>
      </AnimatePresence>
    </div>
  )
}

export default App