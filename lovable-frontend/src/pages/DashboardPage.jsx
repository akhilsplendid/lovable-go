import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
  Plus, 
  Folder, 
  Zap, 
  TrendingUp, 
  Clock, 
  Star,
  Eye,
  Download,
  ChevronRight,
  Sparkles,
  BarChart3,
  Users
} from 'lucide-react'

import { useAuth } from '../hooks/useAuth'
import { useProjects } from '../hooks/useProjects'
import { useUIStore } from '../store/uiStore'
import Button from '../components/ui/Button'
import StatsCards from '../components/dashboard/StatsCards'
import RecentProjects from '../components/dashboard/RecentProjects'
import UsageStats from '../components/dashboard/UsageStats'

/**
 * Dashboard Page Component
 * Main dashboard showing overview of user's projects, statistics, and quick actions
 */
const DashboardPage = () => {
  const navigate = useNavigate()
  const { user, displayName, subscriptionPlan, apiUsage } = useAuth()
  const { 
    projects, 
    isLoading, 
    createProject, 
    isCreating, 
    getRecentProjects,
    getProjectStats
  } = useProjects()
  const { openModal } = useUIStore()
  
  const [greeting, setGreeting] = useState('')

  // Set greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good morning')
    else if (hour < 18) setGreeting('Good afternoon')
    else setGreeting('Good evening')
  }, [])

  // Get dashboard data
  const recentProjects = getRecentProjects(5)
  const projectStats = getProjectStats()

  const handleCreateProject = async (projectData) => {
    try {
      const newProject = await createProject(projectData)
      navigate(`/projects/${newProject.id}`)
    } catch (error) {
      console.error('Failed to create project:', error)
    }
  }

  const quickCreateProject = async () => {
    const projectName = `Project ${projectStats.total + 1}`
    await handleCreateProject({
      name: projectName,
      description: `Created on ${new Date().toLocaleDateString()}`,
      tags: []
    })
  }

  // Usage percentage for different subscription tiers
  const usagePercentage = (apiUsage.used / apiUsage.limit) * 100
  const isNearLimit = usagePercentage >= 80

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {greeting}, {displayName}! 👋
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Ready to create something amazing today?
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex items-center gap-4 mt-6 lg:mt-0"
        >
          <Button
            onClick={() => navigate('/projects')}
            variant="outline"
            leftIcon={Folder}
          >
            All Projects
          </Button>
          <Button
            onClick={quickCreateProject}
            loading={isCreating}
            leftIcon={Plus}
          >
            New Project
          </Button>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <div
          onClick={() => openModal('createProject')}
          className="card card-hover p-6 cursor-pointer group"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus className="w-6 h-6 text-primary-600" />
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Create from Scratch
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Start with a blank canvas
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 ml-auto group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        <div
          onClick={() => navigate('/templates')}
          className="card card-hover p-6 cursor-pointer group"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Use Template
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Start with a pre-designed template
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 ml-auto group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        <div
          onClick={() => navigate('/ai-assistant')}
          className="card card-hover p-6 cursor-pointer group"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                AI Assistant
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Let AI create for you
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 ml-auto group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <StatsCards 
          stats={{
            totalProjects: projectStats.total,
            publishedProjects: projectStats.published,
            totalViews: projects.reduce((sum, p) => sum + (p.view_count || 0), 0),
            totalDownloads: projects.reduce((sum, p) => sum + (p.download_count || 0), 0)
          }}
          isLoading={isLoading}
        />
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Recent Projects */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="xl:col-span-2"
        >
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Recent Projects
              </h2>
              <Button
                onClick={() => navigate('/projects')}
                variant="ghost"
                size="sm"
                rightIcon={ChevronRight}
              >
                View all
              </Button>
            </div>
            
            <RecentProjects 
              projects={recentProjects}
              isLoading={isLoading}
              onProjectClick={(project) => navigate(`/projects/${project.id}`)}
            />

            {recentProjects.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <Folder className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No projects yet
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Create your first project to get started
                </p>
                <Button
                  onClick={quickCreateProject}
                  loading={isCreating}
                  leftIcon={Plus}
                >
                  Create Your First Project
                </Button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Usage Stats & Account Info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="space-y-6"
        >
          {/* Usage Stats */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Usage This Month
            </h3>
            
            <div className="space-y-4">
              {/* AI Generations */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    AI Generations
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {apiUsage.used} / {apiUsage.limit}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      isNearLimit ? 'bg-warning-500' : 'bg-primary-600'
                    }`}
                    style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                  />
                </div>
                {isNearLimit && (
                  <p className="text-xs text-warning-600 dark:text-warning-400 mt-1">
                    You're approaching your monthly limit
                  </p>
                )}
              </div>

              {/* Storage */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Storage Used
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    2.4 GB / 10 GB
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="h-2 bg-blue-600 rounded-full transition-all duration-300"
                    style={{ width: '24%' }}
                  />
                </div>
              </div>
            </div>

            {subscriptionPlan === 'free' && (
              <div className="mt-6 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                <div className="flex items-center mb-2">
                  <TrendingUp className="w-5 h-5 text-primary-600 mr-2" />
                  <span className="text-sm font-medium text-primary-800 dark:text-primary-200">
                    Upgrade for More
                  </span>
                </div>
                <p className="text-xs text-primary-700 dark:text-primary-300 mb-3">
                  Get unlimited AI generations and premium features
                </p>
                <Button size="sm" fullWidth>
                  Upgrade to Pro
                </Button>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quick Stats
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Star className="w-5 h-5 text-warning-500 mr-2" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Favorites
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {projects.filter(p => p.is_favorite).length}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Eye className="w-5 h-5 text-blue-500 mr-2" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Total Views
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {projects.reduce((sum, p) => sum + (p.view_count || 0), 0).toLocaleString()}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Download className="w-5 h-5 text-success-500 mr-2" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Downloads
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {projects.reduce((sum, p) => sum + (p.download_count || 0), 0).toLocaleString()}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-gray-500 mr-2" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Member Since
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {user?.createdAt ? new Date(user.createdAt).getFullYear() : '2024'}
                </span>
              </div>
            </div>
          </div>

          {/* Tips & Tricks */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              💡 Tip of the Day
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Use specific descriptions when talking to the AI. Instead of "make it pretty", 
              try "use a modern design with a blue color scheme and clean typography".
            </p>
            <Button variant="ghost" size="sm" fullWidth>
              More Tips
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Recent Activity
          </h2>
          
          <div className="space-y-4">
            {/* Mock activity items */}
            {[
              { action: 'Created', item: 'Landing Page Project', time: '2 hours ago', icon: Plus },
              { action: 'Updated', item: 'Portfolio Website', time: '5 hours ago', icon: Zap },
              { action: 'Published', item: 'Business Site', time: '1 day ago', icon: TrendingUp },
              { action: 'Downloaded', item: 'E-commerce Template', time: '2 days ago', icon: Download }
            ].map((activity, index) => (
              <div key={index} className="flex items-center py-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mr-4">
                  <activity.icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900 dark:text-white">
                    <span className="font-medium">{activity.action}</span>{' '}
                    <span className="text-gray-600 dark:text-gray-400">{activity.item}</span>
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 text-center">
            <Button variant="ghost" size="sm">
              View All Activity
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default DashboardPage