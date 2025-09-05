import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronRight, Home } from 'lucide-react'

/**
 * Breadcrumb Navigation Component
 * Shows the current page hierarchy with clickable navigation
 */
export const Breadcrumb = ({ items = [], className = '' }) => {
  const location = useLocation()

  // Auto-generate breadcrumbs if not provided
  const breadcrumbItems = items.length > 0 ? items : generateBreadcrumbs(location.pathname)

  if (breadcrumbItems.length <= 1) return null

  return (
    <nav className={`flex items-center space-x-1 text-sm ${className}`} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-1">
        {breadcrumbItems.map((item, index) => (
          <li key={item.path || index} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="w-4 h-4 text-gray-400 mx-1 flex-shrink-0" />
            )}
            
            {item.href && index < breadcrumbItems.length - 1 ? (
              <Link
                to={item.href}
                className="flex items-center space-x-1 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
              >
                {item.icon && <item.icon className="w-4 h-4" />}
                <span>{item.label}</span>
              </Link>
            ) : (
              <span className="flex items-center space-x-1 text-gray-900 dark:text-gray-100 font-medium">
                {item.icon && <item.icon className="w-4 h-4" />}
                <span>{item.label}</span>
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

/**
 * Tab Navigation Component
 * Horizontal tab navigation with active state
 */
export const TabNavigation = ({ 
  tabs = [], 
  activeTab, 
  onTabChange,
  className = '',
  variant = 'default' // default, pills, underline
}) => {
  const baseTabClasses = 'px-4 py-2 text-sm font-medium transition-all duration-200'
  
  const variantClasses = {
    default: {
      tab: 'rounded-lg',
      active: 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200',
      inactive: 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800'
    },
    pills: {
      tab: 'rounded-full',
      active: 'bg-primary-600 text-white',
      inactive: 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800'
    },
    underline: {
      tab: 'border-b-2',
      active: 'border-primary-600 text-primary-600',
      inactive: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
    }
  }

  const currentVariant = variantClasses[variant]

  return (
    <nav className={`flex space-x-1 ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`${baseTabClasses} ${currentVariant.tab} ${
            activeTab === tab.id 
              ? currentVariant.active 
              : currentVariant.inactive
          } relative`}
          disabled={tab.disabled}
        >
          <div className="flex items-center space-x-2">
            {tab.icon && <tab.icon className="w-4 h-4" />}
            <span>{tab.label}</span>
            {tab.badge && (
              <span className="ml-2 bg-gray-200 dark:bg-gray-700 text-xs px-2 py-1 rounded-full">
                {tab.badge}
              </span>
            )}
          </div>
          
          {/* Active indicator for underline variant */}
          {variant === 'underline' && activeTab === tab.id && (
            <motion.div
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"
              layoutId="activeTab"
              initial={false}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          )}
        </button>
      ))}
    </nav>
  )
}

/**
 * Step Navigation Component
 * Shows progress through multi-step processes
 */
export const StepNavigation = ({ 
  steps = [], 
  currentStep, 
  onStepChange,
  allowStepClick = false,
  className = ''
}) => {
  return (
    <nav className={`flex items-center ${className}`}>
      {steps.map((step, index) => {
        const isActive = currentStep === index
        const isCompleted = currentStep > index
        const isClickable = allowStepClick && (isCompleted || isActive)

        return (
          <div key={step.id || index} className="flex items-center">
            {/* Step indicator */}
            <div className="flex items-center">
              <button
                onClick={() => isClickable && onStepChange && onStepChange(index)}
                disabled={!isClickable}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 ${
                  isCompleted
                    ? 'bg-primary-600 text-white'
                    : isActive
                    ? 'bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-200'
                    : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                } ${isClickable ? 'cursor-pointer hover:scale-105' : 'cursor-default'}`}
              >
                {isCompleted ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  index + 1
                )}
              </button>
              
              {/* Step label */}
              <div className="ml-3 min-w-0">
                <p className={`text-sm font-medium ${
                  isActive 
                    ? 'text-gray-900 dark:text-gray-100' 
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {step.label}
                </p>
                {step.description && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {step.description}
                  </p>
                )}
              </div>
            </div>

            {/* Connector line */}
            {index < steps.length - 1 && (
              <div className={`ml-6 w-12 h-0.5 ${
                currentStep > index 
                  ? 'bg-primary-600' 
                  : 'bg-gray-200 dark:bg-gray-700'
              }`} />
            )}
          </div>
        )
      })}
    </nav>
  )
}

/**
 * Page Header Navigation
 * Common header with title, breadcrumbs, and actions
 */
export const PageHeader = ({ 
  title, 
  subtitle, 
  breadcrumbs = [],
  actions,
  tabs,
  activeTab,
  onTabChange,
  className = ''
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <Breadcrumb items={breadcrumbs} />
      )}

      {/* Title and actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {subtitle}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex items-center space-x-3">
            {actions}
          </div>
        )}
      </div>

      {/* Tabs */}
      {tabs && (
        <TabNavigation
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={onTabChange}
          variant="underline"
        />
      )}
    </div>
  )
}

/**
 * Generate breadcrumbs from pathname
 */
function generateBreadcrumbs(pathname) {
  const paths = pathname.split('/').filter(Boolean)
  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard', icon: Home }
  ]

  let currentPath = ''
  paths.forEach((path, index) => {
    currentPath += `/${path}`
    
    // Customize labels based on path
    let label = path.charAt(0).toUpperCase() + path.slice(1)
    
    // Handle specific routes
    if (path === 'projects') {
      label = 'Projects'
    } else if (path === 'profile') {
      label = 'Profile'
    } else if (path === 'settings') {
      label = 'Settings'
    }

    breadcrumbs.push({
      label,
      href: index === paths.length - 1 ? undefined : currentPath
    })
  })

  return breadcrumbs
}

export default {
  Breadcrumb,
  TabNavigation,
  StepNavigation,
  PageHeader
}