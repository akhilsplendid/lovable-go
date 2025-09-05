import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Menu, 
  X, 
  Sun, 
  Moon, 
  User, 
  Settings, 
  LogOut, 
  Bell, 
  Search,
  Plus,
  ChevronDown,
  Zap
} from 'lucide-react'

import { useAuth } from '../../hooks/useAuth'
import { useUIStore } from '../../store/uiStore'
import Button, { IconButton } from '../ui/Button'
import { useProjects } from '../../hooks/useProjects'

/**
 * Header Component
 * Main application header with navigation, user menu, and actions
 */
const Header = () => {
  const navigate = useNavigate()
  const { user, logout, displayName, initials, apiUsage } = useAuth()
  const { 
    theme, 
    toggleTheme, 
    mobileMenuOpen, 
    toggleMobileMenu,
    openModal 
  } = useUIStore()
  
  const { createProject } = useProjects()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const handleCreateProject = async () => {
    try {
      const project = await createProject({
        name: `New Project ${Date.now()}`,
        description: '',
        tags: []
      })
      navigate(`/projects/${project.id}`)
    } catch (error) {
      // Error handled by the hook
    }
  }

  const handleLogout = () => {
    logout()
    setUserMenuOpen(false)
  }

  const usagePercentage = (apiUsage.used / apiUsage.limit) * 100
  const isApproachingLimit = usagePercentage >= 80

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left section */}
          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
            <IconButton
              icon={mobileMenuOpen ? X : Menu}
              onClick={toggleMobileMenu}
              className="lg:hidden"
              aria-label="Toggle mobile menu"
              size="sm"
            />

            {/* Logo */}
            <Link 
              to="/dashboard" 
              className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">L</span>
              </div>
              <span className="text-xl font-bold hidden sm:block">Lovable</span>
            </Link>

            {/* Search bar - Desktop */}
            <div className="hidden md:flex items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-64 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchQuery.trim()) {
                      navigate(`/projects?search=${encodeURIComponent(searchQuery.trim())}`)
                    }
                  }}
                />
              </div>
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Create project button */}
            <Button
              leftIcon={Plus}
              onClick={handleCreateProject}
              size="sm"
              className="hidden sm:flex"
            >
              New Project
            </Button>

            <IconButton
              icon={Plus}
              onClick={handleCreateProject}
              className="sm:hidden"
              aria-label="Create project"
              size="sm"
            />

            {/* API Usage indicator */}
            <div className="hidden sm:flex items-center space-x-2">
              <div className="flex items-center space-x-1 text-xs text-gray-600 dark:text-gray-400">
                <Zap className={`w-3 h-3 ${isApproachingLimit ? 'text-warning-500' : 'text-primary-500'}`} />
                <span>{apiUsage.used}/{apiUsage.limit}</span>
              </div>
              <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${
                    isApproachingLimit ? 'bg-warning-500' : 'bg-primary-500'
                  }`}
                  style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                />
              </div>
            </div>

            {/* Notifications */}
            <IconButton
              icon={Bell}
              aria-label="Notifications"
              size="sm"
              className="hidden sm:flex relative"
            >
              {/* Notification badge */}
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-error-500 rounded-full"></span>
            </IconButton>

            {/* Theme toggle */}
            <IconButton
              icon={theme === 'dark' ? Sun : Moon}
              onClick={toggleTheme}
              aria-label="Toggle theme"
              size="sm"
            />

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={displayName}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {initials}
                  </div>
                )}
                <ChevronDown className="w-4 h-4 text-gray-500 hidden sm:block" />
              </button>

              {/* User dropdown menu */}
              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50"
                  >
                    {/* User info */}
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {displayName}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {user?.email}
                      </p>
                      <div className="flex items-center mt-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200">
                          {user?.subscriptionPlan?.toUpperCase() || 'FREE'}
                        </span>
                      </div>
                    </div>

                    {/* Menu items */}
                    <div className="py-1">
                      <Link
                        to="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <User className="w-4 h-4 mr-3" />
                        Profile
                      </Link>

                      <button
                        onClick={() => {
                          setUserMenuOpen(false)
                          openModal('settings')
                        }}
                        className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <Settings className="w-4 h-4 mr-3" />
                        Settings
                      </button>

                      <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-2 text-sm text-error-600 hover:bg-error-50 dark:hover:bg-error-900/20"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Sign out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile search bar */}
      <div className="md:hidden px-4 pb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && searchQuery.trim()) {
                navigate(`/projects?search=${encodeURIComponent(searchQuery.trim())}`)
              }
            }}
          />
        </div>

        {/* Mobile API usage */}
        <div className="flex items-center justify-between mt-3 px-1">
          <span className="text-xs text-gray-600 dark:text-gray-400">API Usage</span>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {apiUsage.used}/{apiUsage.limit}
            </span>
            <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${
                  isApproachingLimit ? 'bg-warning-500' : 'bg-primary-500'
                }`}
                style={{ width: `${Math.min(usagePercentage, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Click outside to close user menu */}
      {userMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setUserMenuOpen(false)}
        />
      )}
    </header>
  )
}

export default Header