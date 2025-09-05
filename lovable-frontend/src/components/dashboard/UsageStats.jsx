import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  Zap, 
  Calendar,
  Clock,
  Target,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  PieChart,
  Activity,
  Crown,
  ArrowUpRight,
  RefreshCw
} from 'lucide-react'
import { format, subDays, startOfWeek, endOfWeek } from 'date-fns'
import { useAuth } from '../../hooks/useAuth'
import { aiService } from '../../services/ai'
import Button from '../ui/Button'

/**
 * Usage Progress Bar Component
 */
const UsageProgressBar = ({ 
  used, 
  limit, 
  label, 
  color = 'blue',
  showPercentage = true,
  animated = true 
}) => {
  const percentage = limit > 0 ? Math.min((used / limit) * 100, 100) : 0
  
  const getColorClasses = (color, percentage) => {
    if (percentage >= 90) {
      return {
        bg: 'bg-red-600 dark:bg-red-500',
        text: 'text-red-600 dark:text-red-400'
      }
    } else if (percentage >= 70) {
      return {
        bg: 'bg-orange-600 dark:bg-orange-500',
        text: 'text-orange-600 dark:text-orange-400'
      }
    }
    
    const colors = {
      blue: { bg: 'bg-blue-600 dark:bg-blue-500', text: 'text-blue-600 dark:text-blue-400' },
      green: { bg: 'bg-green-600 dark:bg-green-500', text: 'text-green-600 dark:text-green-400' },
      purple: { bg: 'bg-purple-600 dark:bg-purple-500', text: 'text-purple-600 dark:text-purple-400' }
    }
    
    return colors[color] || colors.blue
  }

  const colorClasses = getColorClasses(color, percentage)

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-sm">
        <span className="font-medium text-gray-900 dark:text-white">
          {label}
        </span>
        {showPercentage && (
          <span className={`font-medium ${colorClasses.text}`}>
            {percentage.toFixed(1)}%
          </span>
        )}
      </div>
      
      <div className="relative">
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <motion.div
            className={`h-2 rounded-full ${colorClasses.bg}`}
            initial={{ width: 0 }}
            animate={{ width: animated ? `${percentage}%` : `${percentage}%` }}
            transition={{ duration: animated ? 1 : 0, delay: 0.2 }}
          />
        </div>
        
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
          <span>{used.toLocaleString()}</span>
          <span>{limit.toLocaleString()}</span>
        </div>
      </div>
    </div>
  )
}

/**
 * Usage Chart Component
 */
const UsageChart = ({ data, title }) => {
  const maxValue = Math.max(...data.map(d => d.value))
  
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-gray-900 dark:text-white">
        {title}
      </h3>
      
      <div className="flex items-end space-x-2 h-32">
        {data.map((item, index) => {
          const height = maxValue > 0 ? (item.value / maxValue) * 100 : 0
          
          return (
            <div key={index} className="flex-1 flex flex-col items-center space-y-2">
              <motion.div
                className="w-full bg-primary-600 dark:bg-primary-500 rounded-t-sm min-h-0"
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                style={{ minHeight: height > 0 ? '4px' : '0px' }}
              />
              
              <div className="text-xs text-center">
                <div className="font-medium text-gray-900 dark:text-white">
                  {item.value}
                </div>
                <div className="text-gray-500 dark:text-gray-400">
                  {item.label}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/**
 * Subscription Comparison Component
 */
const SubscriptionComparison = ({ currentPlan, onUpgrade }) => {
  const plans = {
    free: {
      name: 'Free',
      limits: { requests: 10, projects: 5, exports: 5 },
      features: ['Basic AI generation', 'Up to 5 projects', 'HTML export']
    },
    pro: {
      name: 'Pro',
      limits: { requests: 100, projects: 50, exports: 50 },
      features: ['Advanced AI generation', 'Up to 50 projects', 'All export formats', 'Priority support']
    },
    premium: {
      name: 'Premium',
      limits: { requests: 500, projects: 500, exports: 200 },
      features: ['Unlimited AI generation', 'Unlimited projects', 'All export formats', 'Priority support', 'Custom domains']
    }
  }

  const nextPlan = currentPlan === 'free' ? 'pro' : currentPlan === 'pro' ? 'premium' : null

  if (!nextPlan) {
    return (
      <div className="card p-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
        <div className="flex items-center space-x-3 mb-4">
          <Crown className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Premium Member
          </h3>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          You're enjoying all the benefits of our Premium plan!
        </p>
      </div>
    )
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Upgrade to {plans[nextPlan].name}
        </h3>
        <Button
          variant="primary"
          size="sm"
          onClick={onUpgrade}
          rightIcon={ArrowUpRight}
        >
          Upgrade
        </Button>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              Current: {plans[currentPlan].name}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {plans[currentPlan].limits.requests} requests/month
            </div>
          </div>
          
          <div className="text-center p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-800">
            <div className="text-lg font-bold text-primary-900 dark:text-primary-100">
              Upgrade: {plans[nextPlan].name}
            </div>
            <div className="text-sm text-primary-600 dark:text-primary-400">
              {plans[nextPlan].limits.requests} requests/month
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
            What you'll get:
          </h4>
          <ul className="space-y-1">
            {plans[nextPlan].features.map((feature, index) => (
              <li key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mr-2 flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

/**
 * Main Usage Stats Component
 */
const UsageStats = ({ className = '' }) => {
  const { user, apiUsage, subscriptionPlan } = useAuth()
  const [usageHistory, setUsageHistory] = useState([])
  const [todayStats, setTodayStats] = useState({ generations: 0, tokens: 0 })
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Generate mock usage history data
  useEffect(() => {
    const generateMockData = () => {
      const days = []
      for (let i = 6; i >= 0; i--) {
        const date = subDays(new Date(), i)
        days.push({
          label: format(date, 'MMM d'),
          value: Math.floor(Math.random() * 15) + 1,
          date
        })
      }
      return days
    }

    setUsageHistory(generateMockData())
    setTodayStats({
      generations: Math.floor(Math.random() * 8) + 1,
      tokens: Math.floor(Math.random() * 2000) + 500
    })
  }, [])

  // Refresh usage data
  const refreshUsage = async () => {
    setIsRefreshing(true)
    try {
      // In a real app, this would fetch from the API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Simulate new data
      setTodayStats(prev => ({
        ...prev,
        generations: prev.generations + Math.floor(Math.random() * 3)
      }))
    } catch (error) {
      console.error('Failed to refresh usage:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  // Calculate usage percentage
  const usagePercentage = apiUsage.limit > 0 
    ? Math.min((apiUsage.used / apiUsage.limit) * 100, 100) 
    : 0

  // Determine if user is approaching limits
  const isApproachingLimit = usagePercentage >= 80
  const isAtLimit = usagePercentage >= 100

  // Get plan limits
  const getPlanLimits = (plan) => {
    const limits = {
      free: { requests: 10, projects: 5, exports: 5 },
      pro: { requests: 100, projects: 50, exports: 50 },
      premium: { requests: 500, projects: 500, exports: 200 }
    }
    return limits[plan] || limits.free
  }

  const planLimits = getPlanLimits(subscriptionPlan)

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Usage Statistics
        </h2>
        
        <Button
          variant="outline"
          size="sm"
          onClick={refreshUsage}
          loading={isRefreshing}
          leftIcon={RefreshCw}
        >
          Refresh
        </Button>
      </div>

      {/* Usage Alert */}
      {isApproachingLimit && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg border ${
            isAtLimit
              ? 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200'
              : 'bg-orange-50 border-orange-200 text-orange-800 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-200'
          }`}
        >
          <div className="flex items-center">
            <AlertTriangle className={`w-5 h-5 mr-2 ${
              isAtLimit ? 'text-red-600 dark:text-red-400' : 'text-orange-600 dark:text-orange-400'
            }`} />
            <div>
              <h3 className="font-medium">
                {isAtLimit ? 'Usage Limit Reached' : 'Approaching Usage Limit'}
              </h3>
              <p className="text-sm mt-1">
                {isAtLimit 
                  ? 'You\'ve reached your monthly limit. Upgrade to continue using AI generation.'
                  : `You've used ${usagePercentage.toFixed(1)}% of your monthly limit.`
                }
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Current Usage Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Usage Progress */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Monthly Usage
            </h3>
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <Calendar className="w-4 h-4 mr-1" />
              {format(new Date(), 'MMM yyyy')}
            </div>
          </div>

          <div className="space-y-6">
            <UsageProgressBar
              used={apiUsage.used}
              limit={apiUsage.limit}
              label="API Requests"
              color="blue"
            />

            <UsageProgressBar
              used={Math.floor(Math.random() * planLimits.projects) + 1}
              limit={planLimits.projects}
              label="Projects Created"
              color="green"
            />

            <UsageProgressBar
              used={Math.floor(Math.random() * planLimits.exports) + 1}
              limit={planLimits.exports}
              label="Exports"
              color="purple"
            />
          </div>
        </div>

        {/* Today's Activity */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Today's Activity
            </h3>
            <Activity className="w-5 h-5 text-gray-400" />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-3" />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    AI Generations
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Websites created today
                  </div>
                </div>
              </div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {todayStats.generations}
              </div>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <Target className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3" />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    Tokens Used
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    AI processing today
                  </div>
                </div>
              </div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {todayStats.tokens.toLocaleString()}
              </div>
            </div>

            <div className="flex items-center justify-between py-3">
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-green-600 dark:text-green-400 mr-3" />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    Avg Response Time
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Generation speed
                  </div>
                </div>
              </div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                2.3s
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Usage History Chart */}
      <div className="card p-6">
        <UsageChart
          data={usageHistory}
          title="Daily Usage (Last 7 Days)"
        />
      </div>

      {/* Subscription Info */}
      <SubscriptionComparison
        currentPlan={subscriptionPlan}
        onUpgrade={() => {
          // Navigate to upgrade page
          window.location.href = '/upgrade'
        }}
      />

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
            {Math.floor(Math.random() * 50) + 20}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Total Projects
          </div>
        </div>

        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
            {Math.floor(Math.random() * 100) + 50}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Total Generations
          </div>
        </div>

        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-2">
            {Math.floor(Math.random() * 30) + 10}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Total Exports
          </div>
        </div>
      </div>
    </div>
  )
}

export default UsageStats