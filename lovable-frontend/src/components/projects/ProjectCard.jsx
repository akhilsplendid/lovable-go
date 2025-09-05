import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Eye, 
  Heart, 
  Calendar, 
  Code, 
  Globe, 
  Lock,
  MoreVertical,
  Edit,
  Copy,
  Archive,
  Trash2,
  Download,
  Settings
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import Button from '../ui/Button'
import { useProjectStore } from '../../store/projectStore'
import toast from 'react-hot-toast'

/**
 * Project Card Component
 * Displays a project with preview, actions, and metadata
 */
const ProjectCard = ({ 
  project, 
  onEdit,
  onDuplicate,
  onDelete,
  onExport,
  onArchive,
  showSelection = false,
  isSelected = false,
  onToggleSelection
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [imageError, setImageError] = useState(false)
  const { toggleProjectSelection } = useProjectStore()

  // Format project data
  const {
    id,
    name,
    description,
    tags = [],
    status,
    is_public,
    view_count,
    like_count,
    has_code,
    created_at,
    updated_at,
    thumbnail_url
  } = project

  const statusColors = {
    draft: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    published: 'bg-success-100 text-success-700 dark:bg-success-900 dark:text-success-300',
    archived: 'bg-warning-100 text-warning-700 dark:bg-warning-900 dark:text-warning-300'
  }

  const handleMenuAction = (action, event) => {
    event.preventDefault()
    event.stopPropagation()
    setIsMenuOpen(false)
    
    switch (action) {
      case 'edit':
        onEdit?.(project)
        break
      case 'duplicate':
        onDuplicate?.(project)
        break
      case 'archive':
        onArchive?.(project)
        break
      case 'delete':
        onDelete?.(project)
        break
      case 'export':
        onExport?.(project)
        break
      case 'settings':
        // Handle settings
        break
      default:
        break
    }
  }

  const handleSelectionToggle = (event) => {
    event.preventDefault()
    event.stopPropagation()
    onToggleSelection?.(id)
    toggleProjectSelection(id)
  }

  const handleCardClick = () => {
    // Navigate to project editor
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -4 }}
      className="project-card group relative"
    >
      {/* Selection checkbox */}
      {showSelection && (
        <div className="absolute top-3 left-3 z-10">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={handleSelectionToggle}
            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800"
          />
        </div>
      )}

      {/* Actions menu */}
      <div className="absolute top-3 right-3 z-10">
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-gray-800 shadow-sm"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setIsMenuOpen(!isMenuOpen)
            }}
          >
            <MoreVertical className="w-4 h-4" />
          </Button>

          {/* Dropdown menu */}
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-20"
            >
              <button
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center"
                onClick={(e) => handleMenuAction('edit', e)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit project
              </button>
              
              <button
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center"
                onClick={(e) => handleMenuAction('duplicate', e)}
              >
                <Copy className="w-4 h-4 mr-2" />
                Duplicate
              </button>
              
              <button
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center"
                onClick={(e) => handleMenuAction('export', e)}
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
              
              <div className="border-t border-gray-200 dark:border-gray-600 my-1"></div>
              
              <button
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center"
                onClick={(e) => handleMenuAction('archive', e)}
              >
                <Archive className="w-4 h-4 mr-2" />
                {status === 'archived' ? 'Unarchive' : 'Archive'}
              </button>
              
              <button
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-red-600 dark:text-red-400 flex items-center"
                onClick={(e) => handleMenuAction('delete', e)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Click overlay to close menu */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      <Link to={`/projects/${id}`} className="block h-full">
        {/* Project thumbnail/preview */}
        <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-t-xl overflow-hidden relative">
          {thumbnail_url && !imageError ? (
            <img
              src={thumbnail_url}
              alt={`${name} preview`}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              {has_code ? (
                <Code className="w-12 h-12 text-gray-400" />
              ) : (
                <div className="text-center">
                  <Globe className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">No preview</p>
                </div>
              )}
            </div>
          )}

          {/* Status badge */}
          <div className="absolute top-3 left-3">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}>
              {status === 'published' && is_public && <Globe className="w-3 h-3 mr-1" />}
              {status === 'draft' && <Lock className="w-3 h-3 mr-1" />}
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </div>

          {/* Hover overlay */}
          <div className="project-card-overlay">
            <div className="text-white text-center">
              <Eye className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm font-medium">View Project</p>
            </div>
          </div>
        </div>

        {/* Project info */}
        <div className="p-4">
          {/* Title and description */}
          <div className="mb-3">
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-1 line-clamp-1">
              {name}
            </h3>
            {description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {description}
              </p>
            )}
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300"
                >
                  {tag}
                </span>
              ))}
              {tags.length > 3 && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  +{tags.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Stats and metadata */}
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Eye className="w-4 h-4 mr-1" />
                {view_count || 0}
              </div>
              <div className="flex items-center">
                <Heart className="w-4 h-4 mr-1" />
                {like_count || 0}
              </div>
            </div>
            
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              {formatDistanceToNow(new Date(updated_at), { addSuffix: true })}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export default ProjectCard