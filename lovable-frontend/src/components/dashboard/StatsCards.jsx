import React from 'react'
import { motion } from 'framer-motion'
import { 
  FolderOpen, 
  Zap, 
  Download, 
  TrendingUp,
  Eye,
  Heart,
  Code,
  Globe
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useProjects } from '../../hooks/useProjects'

/**
 * Individual Stat Card Component
 */
const StatCard = ({ 
  title, 
  value, 
  change, 
  changeType = 'positive', 
  icon: Icon,
  color = 'blue',
  loading = false,
  onClick,
  description 
}) => {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      icon: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-200 dark:border-blue-800'
    },
    green: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      icon: 'text-green-600 dark:text-green-400',
      border: 'border-green-200 dark:border-green-800'
    },
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      icon: 'text-purple-600 dark:text-purple-400',
      border: 'border-purple-200 dark:border-purple-800'
    },
    orange: {
      bg: 'bg-orange-50 dark:bg-orange-900/20',
      icon: 'text-orange-600 dark:text-orange-400',
      border: 'border-orange-200 dark:border-orange-800'
    }
  }

  const colors = colorClasses[color] || colorClasses.blue

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        card p-6 cursor-pointer transition-all duration-200 hover:shadow-card-hover
        ${colors.border} border
        ${onClick ? 'hover:bg-gray-50 dark:hover:bg-gray-800' : ''}
      `}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center">
            <div className={`p-2 rounded-lg ${colors.bg} mr-3`}>
              {loading ? (
                <div className="w-6 h-6 animate-pulse bg-gray-300 dark:bg-gray-600 rounded" />
              ) : (
                <Icon className={`w-6 h-6 ${colors.icon}`} />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {title}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {loading ? (
                  <div className="h-8 w-16 bg-gray-300 dark:bg-gray-600 animate-pulse rounded" />
                ) : (
                  value
                )}
              </p>
            </div>
          </div>
          
          {change !== undefined && !loading && (
            <div className="flex items-center mt-2">
              <TrendingUp 
                className={`w-4 h-4 mr-1 ${
                  changeType === 'positive' 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`} 
              />
              <span 
                className={`text-sm font-medium ${
                  changeType === 'positive'
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {change > 0 ? '+' : ''}{change}%
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                vs last month
              </span>
            </div>
          )}

          {description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {description}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  )
}

/**
 * Main Stats Cards Component
 */
const StatsCards = ({ className = '' }) => {
  const { user, apiUsage } = useAuth()
  const { getProjectStats, isLoading } = useProjects()
  
  // Get project statistics
  const projectStats = getProjectStats()

  // Calculate usage percentage
  const usagePercentage = apiUsage.limit > 0 
    ? Math.round((apiUsage.used / apiUsage.limit) * 100)
    : 0

  // Determine usage color based on percentage
  const getUsageColor = (percentage) => {
    if (percentage >= 90) return 'text-red-600 dark:text-red-400'
    if (percentage >= 70) return 'text-orange-600 dark:text-orange-400'
    return 'text-green-600 dark:text-green-400'
  }

  const stats = [
    {
      title: 'Total Projects',
      value: projectStats.total,
      change: 15, // This would come from analytics in real app
      changeType: 'positive',
      icon: FolderOpen,
      color: 'blue',
      description: `${projectStats.published} published, ${projectStats.draft} drafts`,
      onClick: () => {
        // Navigate to projects page
        window.location.href = '/projects'
      }
    },
    {
      title: 'AI Generations',
      value: apiUsage.used,
      icon: Zap,
      color: 'purple',
      description: `${apiUsage.remaining} remaining of ${apiUsage.limit}`,
      onClick: () => {
        // Navigate to usage page or show usage modal
      }
    },
    {
      title: 'Projects with Code',
      value: projectStats.withCode,
      change: 8,
      changeType: 'positive',
      icon: Code,
      color: 'green',
      description: 'Ready to export and deploy',
      onClick: () => {
        // Navigate to projects with filter
      }
    },
    {
      title: 'Usage',
      value: `${usagePercentage}%`,
      icon: TrendingUp,
      color: usagePercentage >= 70 ? 'orange' : 'green',
      description: `${apiUsage.used}/${apiUsage.limit} requests used`,
      onClick: () => {
        // Show usage details
      }
    }
  ]

  // Add additional stats for pro/premium users
  const additionalStats = []

  if (user?.subscriptionPlan !== 'free') {
    additionalStats.push(
      {
        title: 'Total Views',
        value: '1.2K', // This would come from analytics
        change: 23,
        changeType: 'positive',
        icon: Eye,
        color: 'blue',
        description: 'Across all published projects'
      },
      {
        title: 'Exports',
        value: 45, // This would come from analytics
        change: 12,
        changeType: 'positive',
        icon: Download,
        color: 'green',
        description: 'HTML and ZIP downloads'
      }
    )
  }

  const allStats = [...stats, ...additionalStats]

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {allStats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <StatCard 
              {...stat} 
              loading={isLoading}
            />
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Subscription Status */}
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Subscription
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                {user?.subscriptionPlan || 'free'} Plan
              </p>
            </div>
            <div className="text-right">
              <div className={`text-2xl font-bold ${getUsageColor(usagePercentage)}`}>
                {usagePercentage}%
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                API Usage
              </p>
            </div>
          </div>
          
          {/* Usage Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
              <span>Usage</span>
              <span>{apiUsage.used}/{apiUsage.limit}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <motion.div
                className={`h-2 rounded-full ${
                  usagePercentage >= 90 
                    ? 'bg-red-600' 
                    : usagePercentage >= 70 
                      ? 'bg-orange-600' 
                      : 'bg-green-600'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${usagePercentage}%` }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </div>
          </div>

          {/* Upgrade CTA for free users */}
          {user?.subscriptionPlan === 'free' && usagePercentage >= 70 && (
            <div className="mt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full btn-primary text-sm"
                onClick={() => {
                  // Navigate to upgrade page
                }}
              >
                Upgrade to Pro
              </motion.button>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Quick Stats
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400 mr-2" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Published
                </span>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {projectStats.published}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <FolderOpen className="w-4 h-4 text-orange-600 dark:text-orange-400 mr-2" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Drafts
                </span>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {projectStats.draft}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Heart className="w-4 h-4 text-red-600 dark:text-red-400 mr-2" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Archived
                </span>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {projectStats.archived}
              </span>
            </div>

            {user?.subscriptionPlan !== 'free' && (
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    This Month
                  </span>
                  <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                    +{Math.floor(Math.random() * 10) + 1} projects
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default StatsCards