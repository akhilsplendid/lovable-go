import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FolderOpen, 
  Eye, 
  Edit3, 
  MoreVertical, 
  Globe, 
  Clock,
  Code,
  Trash2,
  Copy,
  ExternalLink,
  Settings
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useProjects, useProject } from '../../hooks/useProjects'
import { useAuth } from '../../hooks/useAuth'
import Button from '../ui/Button'

/**
 * Project Card Component
 */
const ProjectCard = ({ project, onEdit, onDelete, onDuplicate, onView }) => {
  const [showMenu, setShowMenu] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const getStatusColor = (status) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'archived':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
    }
  }

  const formatDate = (date) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true })
    } catch {
      return 'Unknown'
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -2 }}
      className="project-card group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Project Preview/Thumbnail */}
      <div 
        className="relative h-32 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-t-xl overflow-hidden cursor-pointer"
        onClick={() => onView(project)}
      >
        {project.html_code ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <iframe
              srcDoc={project.html_code}
              className="w-full h-full scale-50 transform origin-top-left pointer-events-none"
              style={{ width: '200%', height: '200%' }}
              title={`Preview of ${project.name}`}
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200" />
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <Code className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                No preview available
              </p>
            </div>
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-2 left-2">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
            {project.status}
          </span>
        </div>

        {/* Actions Menu */}
        <div className="absolute top-2 right-2">
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className={`p-1 bg-white dark:bg-gray-800 shadow-sm transition-opacity duration-200 ${
                isHovered ? 'opacity-100' : 'opacity-0'
              }`}
              onClick={(e) => {
                e.stopPropagation()
                setShowMenu(!showMenu)
              }}
            >
              <MoreVertical className="w-4 h-4" />
            </Button>

            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -5 }}
                  className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-20"
                  onMouseLeave={() => setShowMenu(false)}
                >
                  <button
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                    onClick={() => {
                      onEdit(project)
                      setShowMenu(false)
                    }}
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit Project
                  </button>
                  
                  {project.is_public && (
                    <button
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                      onClick={() => {
                        window.open(`/preview/${project.id}`, '_blank')
                        setShowMenu(false)
                      }}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open Preview
                    </button>
                  )}
                  
                  <button
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                    onClick={() => {
                      onDuplicate(project)
                      setShowMenu(false)
                    }}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Duplicate
                  </button>
                  
                  <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
                  
                  <button
                    className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center"
                    onClick={() => {
                      onDelete(project)
                      setShowMenu(false)
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Quick Action Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          className="project-card-overlay"
        >
          <Button
            variant="ghost"
            size="sm"
            className="bg-white dark:bg-gray-800 shadow-sm"
            onClick={() => onEdit(project)}
          >
            <Edit3 className="w-4 h-4 mr-2" />
            Edit
          </Button>
        </motion.div>
      </div>

      {/* Project Info */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 
            className="text-lg font-semibold text-gray-900 dark:text-white truncate cursor-pointer hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            onClick={() => onView(project)}
          >
            {project.name}
          </h3>
        </div>

        {project.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
            {project.description}
          </p>
        )}

        {/* Tags */}
        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {project.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
              >
                {tag}
              </span>
            ))}
            {project.tags.length > 3 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                +{project.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            <span>{formatDate(project.updated_at)}</span>
          </div>
          
          <div className="flex items-center space-x-3">
            {project.has_code && (
              <div className="flex items-center">
                <Code className="w-3 h-3 mr-1 text-green-600 dark:text-green-400" />
                <span className="text-green-600 dark:text-green-400">Ready</span>
              </div>
            )}
            
            {project.is_public && (
              <div className="flex items-center">
                <Globe className="w-3 h-3 mr-1 text-blue-600 dark:text-blue-400" />
                <span className="text-blue-600 dark:text-blue-400">Public</span>
              </div>
            )}
            
            {project.view_count > 0 && (
              <div className="flex items-center">
                <Eye className="w-3 h-3 mr-1" />
                <span>{project.view_count}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

/**
 * Empty State Component
 */
const EmptyState = ({ onCreateProject }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="text-center py-12"
  >
    <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
      No projects yet
    </h3>
    <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
      Start building amazing websites with AI. Create your first project and watch the magic happen.
    </p>
    <Button 
      variant="primary"
      onClick={onCreateProject}
      leftIcon={FolderOpen}
    >
      Create Your First Project
    </Button>
  </motion.div>
)

/**
 * Main Recent Projects Component
 */
const RecentProjects = ({ limit = 6, showCreateButton = true, className = '' }) => {
  const { user } = useAuth()
  const { 
    getRecentProjects, 
    deleteProject, 
    duplicateProject,
    isLoading,
    isDeleting,
    isDuplicating
  } = useProjects()

  // Get recent projects
  const recentProjects = getRecentProjects(limit)

  const handleView = (project) => {
    window.location.href = `/projects/${project.id}`
  }

  const handleEdit = (project) => {
    window.location.href = `/projects/${project.id}`
  }

  const handleDelete = async (project) => {
    if (window.confirm(`Are you sure you want to delete "${project.name}"?`)) {
      try {
        await deleteProject(project.id)
      } catch (error) {
        console.error('Failed to delete project:', error)
      }
    }
  }

  const handleDuplicate = async (project) => {
    try {
      const duplicated = await duplicateProject(project.id)
      // Navigate to duplicated project
      window.location.href = `/projects/${duplicated.id}`
    } catch (error) {
      console.error('Failed to duplicate project:', error)
    }
  }

  const handleCreateProject = () => {
    // This would typically open a create project modal
    window.location.href = '/projects?create=true'
  }

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Recent Projects
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: limit }).map((_, index) => (
            <div key={index} className="card animate-pulse">
              <div className="h-32 bg-gray-300 dark:bg-gray-600 rounded-t-xl" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4" />
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-full" />
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Recent Projects
        </h2>
        
        {showCreateButton && (
          <Button
            variant="primary"
            size="sm"
            onClick={handleCreateProject}
            leftIcon={FolderOpen}
          >
            New Project
          </Button>
        )}
      </div>

      {/* Projects Grid */}
      {recentProjects.length === 0 ? (
        <EmptyState onCreateProject={handleCreateProject} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {recentProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onDuplicate={handleDuplicate}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* View All Link */}
      {recentProjects.length >= limit && (
        <div className="text-center pt-4">
          <Button
            variant="outline"
            onClick={() => window.location.href = '/projects'}
            rightIcon={ExternalLink}
          >
            View All Projects
          </Button>
        </div>
      )}

      {/* Loading Overlay */}
      {(isDeleting || isDuplicating) && (
        <div className="absolute inset-0 bg-white bg-opacity-50 dark:bg-gray-900 dark:bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600" />
              <span className="text-gray-900 dark:text-white">
                {isDeleting ? 'Deleting project...' : 'Duplicating project...'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RecentProjects