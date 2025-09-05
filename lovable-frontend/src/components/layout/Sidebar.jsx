import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LayoutDashboard,
  FolderOpen,
  User,
  Settings,
  HelpCircle,
  ChevronLeft,
  Zap,
  FileText,
  Sparkles,
  History,
  Star
} from 'lucide-react'

import { useUIStore } from '../../store/uiStore'
import { useAuth } from '../../hooks/useAuth'
import { useProjects } from '../../hooks/useProjects'
import { IconButton } from '../ui/Button'

/**
 * Sidebar Component
 * Main navigation sidebar with collapsible functionality
 */
const Sidebar = () => {
  const location = useLocation()
  const { user } = useAuth()
  const { getRecentProjects } = useProjects()
  const { 
    sidebarOpen, 
    sidebarCollapsed, 
    mobileMenuOpen,
    setSidebarOpen,
    toggleSidebarCollapse,
    closeMobileMenu
  } = useUIStore()

  const recentProjects = getRecentProjects(3)

  const navigationItems = [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard',
      exact: true
    },
    {
      label: 'Projects',
      icon: FolderOpen,
      path: '/projects',
      badge: recentProjects.length
    },
    {
      label: 'Templates',
      icon: Sparkles,
      path: '/templates'
    },
    {
      label: 'History',
      icon: History,
      path: '/history'
    }
  ]

  const secondaryItems = [
    {
      label: 'Profile',
      icon: User,
      path: '/profile'
    },
    {
      label: 'Settings',
      icon: Settings,
      path: '/settings'
    },
    {
      label: 'Help',
      icon: HelpCircle,
      path: '/help'
    }
  ]

  const handleNavClick = () => {
    if (window.innerWidth < 1024) {
      closeMobileMenu()
    }
  }

  const sidebarVariants = {
    open: {
      width: sidebarCollapsed ? '4rem' : '16rem',
      transition: { duration: 0.3 }
    },
    closed: {
      width: 0,
      transition: { duration: 0.3 }
    }
  }

  const contentVariants = {
    open: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.2, delay: 0.1 }
    },
    collapsed: {
      opacity: 0,
      x: -20,
      transition: { duration: 0.2 }
    }
  }

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={closeMobileMenu}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        variants={sidebarVariants}
        animate={sidebarOpen ? 'open' : 'closed'}
        className={`fixed left-0 top-16 bottom-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-50 lg:z-30 lg:relative lg:top-0 overflow-hidden ${
          mobileMenuOpen ? 'block' : 'hidden lg:block'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.div
                  variants={contentVariants}
                  animate="open"
                  exit="collapsed"
                  className="flex items-center space-x-2"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-blue-600 rounded-lg flex items-center justify-center">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    Navigation
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Collapse button */}
            <IconButton
              icon={ChevronLeft}
              onClick={toggleSidebarCollapse}
              size="sm"
              variant="ghost"
              className={`hidden lg:flex transition-transform duration-200 ${
                sidebarCollapsed ? 'rotate-180' : ''
              }`}
              aria-label="Toggle sidebar"
            />
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {/* Primary navigation */}
            <div className="space-y-1">
              {navigationItems.map((item) => (
                <NavItem
                  key={item.path}
                  item={item}
                  collapsed={sidebarCollapsed}
                  onClick={handleNavClick}
                />
              ))}
            </div>

            {/* Recent projects */}
            <AnimatePresence>
              {!sidebarCollapsed && recentProjects.length > 0 && (
                <motion.div
                  variants={contentVariants}
                  animate="open"
                  exit="collapsed"
                  className="pt-6"
                >
                  <h3 className="px-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                    Recent Projects
                  </h3>
                  <div className="space-y-1">
                    {recentProjects.map((project) => (
                      <NavLink
                        key={project.id}
                        to={`/projects/${project.id}`}
                        onClick={handleNavClick}
                        className={({ isActive }) =>
                          `flex items-center px-2 py-2 text-sm font-medium rounded-lg transition-colors ${
                            isActive
                              ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200'
                              : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                          }`
                        }
                      >
                        <FileText className="w-4 h-4 mr-3 flex-shrink-0" />
                        <span className="truncate">{project.name}</span>
                      </NavLink>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Divider */}
            <div className="border-t border-gray-200 dark:border-gray-800 pt-6" />

            {/* Secondary navigation */}
            <div className="space-y-1">
              {secondaryItems.map((item) => (
                <NavItem
                  key={item.path}
                  item={item}
                  collapsed={sidebarCollapsed}
                  onClick={handleNavClick}
                />
              ))}
            </div>
          </nav>

          {/* Sidebar footer */}
          <div className="border-t border-gray-200 dark:border-gray-800 p-4">
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.div
                  variants={contentVariants}
                  animate="open"
                  exit="collapsed"
                  className="bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 rounded-lg p-3"
                >
                  <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4 text-primary-600" />
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {user?.subscriptionPlan?.toUpperCase() || 'FREE'} Plan
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {user?.subscriptionPlan === 'free' ? 'Upgrade for more features' : 'Thank you for your support!'}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Collapsed footer */}
            {sidebarCollapsed && (
              <div className="flex justify-center">
                <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                  <Star className="w-4 h-4 text-primary-600" />
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.aside>
    </>
  )
}

/**
 * Navigation Item Component
 */
const NavItem = ({ item, collapsed, onClick }) => {
  const location = useLocation()
  const isActive = item.exact 
    ? location.pathname === item.path
    : location.pathname.startsWith(item.path)

  if (collapsed) {
    return (
      <NavLink
        to={item.path}
        onClick={onClick}
        className={({ isActive }) =>
          `flex items-center justify-center p-3 rounded-lg transition-colors relative group ${
            isActive
              ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200'
              : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
          }`
        }
        title={item.label}
      >
        <item.icon className="w-5 h-5" />
        
        {/* Badge for collapsed state */}
        {item.badge && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center">
            {item.badge}
          </span>
        )}

        {/* Tooltip */}
        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
          {item.label}
        </div>
      </NavLink>
    )
  }

  return (
    <NavLink
      to={item.path}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
          isActive
            ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200'
            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
        }`
      }
    >
      <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
      <span className="flex-1">{item.label}</span>
      
      {/* Badge */}
      {item.badge && (
        <span className="ml-2 bg-primary-600 text-white text-xs px-2 py-1 rounded-full">
          {item.badge}
        </span>
      )}
    </NavLink>
  )
}

export default Sidebar