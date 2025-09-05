import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Settings,
  Globe,
  Lock,
  Share2,
  Archive,
  Trash2,
  Copy,
  Download,
  Eye,
  EyeOff,
  Save,
  AlertTriangle,
  Users,
  Tag,
  Calendar,
  BarChart3
} from 'lucide-react'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Modal from '../ui/Modal'
import { useProject } from '../../hooks/useProjects'
import { projectService } from '../../services/projects'
import toast from 'react-hot-toast'

// Validation schema
const projectSettingsSchema = z.object({
  name: z.string()
    .min(1, 'Project name is required')
    .max(100, 'Project name must be less than 100 characters'),
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  tags: z.array(z.string()).max(10, 'Maximum 10 tags allowed'),
  status: z.enum(['draft', 'published', 'archived']),
  is_public: z.boolean()
})

/**
 * Project Settings Component
 * Comprehensive project configuration and management interface
 */
const ProjectSettings = ({ 
  projectId, 
  isOpen, 
  onClose, 
  onUpdate,
  onDelete,
  onArchive 
}) => {
  const [activeTab, setActiveTab] = useState('general')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const [collaborators, setCollaborators] = useState([])
  const [shareEmail, setShareEmail] = useState('')
  const [isSharing, setIsSharing] = useState(false)
  const [projectStats, setProjectStats] = useState(null)

  const { project, isLoading, updateProject } = useProject(projectId)

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isValid },
    watch,
    setValue,
    reset
  } = useForm({
    resolver: zodResolver(projectSettingsSchema),
    mode: 'onChange'
  })

  const watchedTags = watch('tags') || []
  const watchedStatus = watch('status')
  const watchedIsPublic = watch('is_public')

  // Initialize form with project data
  useEffect(() => {
    if (project) {
      reset({
        name: project.name,
        description: project.description || '',
        tags: project.tags || [],
        status: project.status,
        is_public: project.is_public || false
      })
    }
  }, [project, reset])

  // Load additional data when modal opens
  useEffect(() => {
    if (isOpen && projectId) {
      loadCollaborators()
      loadProjectStats()
    }
  }, [isOpen, projectId])

  const loadCollaborators = async () => {
    try {
      const response = await projectService.getCollaborators(projectId)
      setCollaborators(response)
    } catch (error) {
      console.error('Failed to load collaborators:', error)
    }
  }

  const loadProjectStats = async () => {
    try {
      const stats = await projectService.getProjectStats(projectId)
      setProjectStats(stats)
    } catch (error) {
      console.error('Failed to load project stats:', error)
    }
  }

  const handleSave = async (formData) => {
    if (!isDirty) return

    try {
      const updatedProject = await updateProject(formData)
      onUpdate?.(updatedProject)
      toast.success('Project settings updated successfully!')
      reset(formData) // Reset form state to mark as clean
    } catch (error) {
      console.error('Failed to update project:', error)
      toast.error('Failed to update project settings')
    }
  }

  const handleAddTag = (e) => {
    e.preventDefault()
    if (tagInput.trim() && watchedTags.length < 10 && !watchedTags.includes(tagInput.trim())) {
      setValue('tags', [...watchedTags, tagInput.trim()], { shouldDirty: true })
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove) => {
    setValue('tags', watchedTags.filter(tag => tag !== tagToRemove), { shouldDirty: true })
  }

  const handleShare = async (e) => {
    e.preventDefault()
    if (!shareEmail.trim()) return

    setIsSharing(true)
    try {
      await projectService.shareProject(projectId, {
        emails: [shareEmail],
        permission: 'view'
      })
      setShareEmail('')
      loadCollaborators()
      toast.success('Project shared successfully!')
    } catch (error) {
      toast.error('Failed to share project')
    } finally {
      setIsSharing(false)
    }
  }

  const handleRemoveCollaborator = async (userId) => {
    try {
      await projectService.removeCollaborator(projectId, userId)
      loadCollaborators()
      toast.success('Collaborator removed')
    } catch (error) {
      toast.error('Failed to remove collaborator')
    }
  }

  const handleDuplicate = async () => {
    try {
      const duplicatedProject = await projectService.duplicateProject(projectId)
      toast.success('Project duplicated successfully!')
      onClose()
    } catch (error) {
      toast.error('Failed to duplicate project')
    }
  }

  const handleArchive = async () => {
    try {
      if (project.status === 'archived') {
        await projectService.unarchiveProject(projectId)
        toast.success('Project unarchived successfully!')
      } else {
        await projectService.archiveProject(projectId)
        toast.success('Project archived successfully!')
      }
      onArchive?.(project)
      setShowArchiveConfirm(false)
      onClose()
    } catch (error) {
      toast.error('Failed to archive project')
    }
  }

  const handleDelete = async () => {
    try {
      await projectService.deleteProject(projectId)
      toast.success('Project deleted successfully!')
      onDelete?.(projectId)
      setShowDeleteConfirm(false)
      onClose()
    } catch (error) {
      toast.error('Failed to delete project')
    }
  }

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'sharing', label: 'Sharing', icon: Share2 },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'danger', label: 'Danger Zone', icon: AlertTriangle }
  ]

  if (isLoading || !project) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} maxWidth="3xl">
        <div className="p-6 flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </Modal>
    )
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="3xl">
      <div className="flex h-[600px]">
        {/* Sidebar */}
        <div className="w-64 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Project Settings
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
              {project.name}
            </p>
          </div>
          
          <nav className="p-2">
            {tabs.map((tab) => {
              const IconComponent = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    w-full flex items-center px-3 py-2 text-sm rounded-lg transition-colors
                    ${activeTab === tab.id
                      ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  <IconComponent className="w-4 h-4 mr-3" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col">
          <form onSubmit={handleSubmit(handleSave)} className="flex-1 overflow-y-auto">
            {/* General Settings */}
            {activeTab === 'general' && (
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    General Settings
                  </h3>
                  
                  <div className="space-y-4">
                    <Input
                      label="Project Name"
                      error={errors.name?.message}
                      {...register('name')}
                    />

                    <div>
                      <label className="form-label">Description</label>
                      <textarea
                        className="form-input"
                        rows={3}
                        placeholder="Describe your project..."
                        {...register('description')}
                      />
                      {errors.description && (
                        <p className="form-error">{errors.description.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="form-label">Status</label>
                      <select className="form-input" {...register('status')}>
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="is_public"
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        {...register('is_public')}
                      />
                      <label htmlFor="is_public" className="text-sm text-gray-700 dark:text-gray-300">
                        Make this project public
                      </label>
                    </div>

                    <div>
                      <label className="form-label">Tags</label>
                      <div className="space-y-3">
                        <div className="flex">
                          <input
                            type="text"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddTag(e)}
                            placeholder="Add a tag..."
                            className="form-input rounded-r-none border-r-0"
                          />
                          <button
                            type="button"
                            onClick={handleAddTag}
                            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-r-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600"
                          >
                            Add
                          </button>
                        </div>
                        
                        {watchedTags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {watchedTags.map((tag) => (
                              <span
                                key={tag}
                                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300"
                              >
                                {tag}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveTag(tag)}
                                  className="ml-2 text-primary-500 hover:text-primary-700"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Sharing */}
            {activeTab === 'sharing' && (
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Project Sharing
                  </h3>

                  {/* Public Access */}
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {watchedIsPublic ? (
                          <Globe className="w-5 h-5 text-green-500 mr-3" />
                        ) : (
                          <Lock className="w-5 h-5 text-gray-400 mr-3" />
                        )}
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {watchedIsPublic ? 'Public Project' : 'Private Project'}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {watchedIsPublic 
                              ? 'Anyone with the link can view this project'
                              : 'Only you and collaborators can access this project'
                            }
                          </p>
                        </div>
                      </div>
                      
                      {watchedIsPublic && (
                        <Button
                          size="sm"
                          variant="outline"
                          leftIcon={Copy}
                          onClick={() => {
                            navigator.clipboard.writeText(projectService.getPreviewURL(projectId))
                            toast.success('Preview URL copied to clipboard!')
                          }}
                        >
                          Copy Link
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Share with specific users */}
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                      Share with specific users
                    </h4>
                    
                    <form onSubmit={handleShare} className="flex mb-4">
                      <input
                        type="email"
                        value={shareEmail}
                        onChange={(e) => setShareEmail(e.target.value)}
                        placeholder="Enter email address..."
                        className="form-input rounded-r-none border-r-0"
                        required
                      />
                      <Button
                        type="submit"
                        size="md"
                        loading={isSharing}
                        className="rounded-l-none"
                      >
                        Share
                      </Button>
                    </form>

                    {/* Collaborators list */}
                    {collaborators.length > 0 && (
                      <div className="space-y-2">
                        <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Collaborators ({collaborators.length})
                        </h5>
                        {collaborators.map((collaborator) => (
                          <div
                            key={collaborator.id}
                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                          >
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mr-3">
                                <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                                  {collaborator.name?.[0] || collaborator.email[0]}
                                </span>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {collaborator.name || collaborator.email}
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                  {collaborator.permission}
                                </p>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRemoveCollaborator(collaborator.id)}
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Analytics */}
            {activeTab === 'analytics' && (
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Project Analytics
                  </h3>

                  {projectStats ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                        <div className="flex items-center">
                          <Eye className="w-5 h-5 text-blue-500 mr-2" />
                          <div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                              {projectStats.views || 0}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Views</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                        <div className="flex items-center">
                          <Users className="w-5 h-5 text-green-500 mr-2" />
                          <div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                              {projectStats.collaborators || 0}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Collaborators</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                        <div className="flex items-center">
                          <Calendar className="w-5 h-5 text-purple-500 mr-2" />
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              Created
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {new Date(project.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                        <div className="flex items-center">
                          <Calendar className="w-5 h-5 text-orange-500 mr-2" />
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              Last Updated
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {new Date(project.updated_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-600 dark:text-gray-400">Loading analytics...</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Danger Zone */}
            {activeTab === 'danger' && (
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-red-600 mb-4">
                    Danger Zone
                  </h3>

                  <div className="space-y-4">
                    {/* Duplicate Project */}
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            Duplicate Project
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Create a copy of this project with all its content
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          leftIcon={Copy}
                          onClick={handleDuplicate}
                        >
                          Duplicate
                        </Button>
                      </div>
                    </div>

                    {/* Archive Project */}
                    <div className="border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {project.status === 'archived' ? 'Unarchive Project' : 'Archive Project'}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {project.status === 'archived' 
                              ? 'Restore this project from archive'
                              : 'Hide this project from your active projects'
                            }
                          </p>
                        </div>
                        <Button
                          variant="warning"
                          leftIcon={Archive}
                          onClick={() => setShowArchiveConfirm(true)}
                        >
                          {project.status === 'archived' ? 'Unarchive' : 'Archive'}
                        </Button>
                      </div>
                    </div>

                    {/* Delete Project */}
                    <div className="border border-red-200 dark:border-red-800 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-red-600">Delete Project</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Permanently delete this project and all its data
                          </p>
                        </div>
                        <Button
                          variant="danger"
                          leftIcon={Trash2}
                          onClick={() => setShowDeleteConfirm(true)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </form>

          {/* Footer Actions */}
          {activeTab === 'general' && (
            <div className="border-t border-gray-200 dark:border-gray-700 p-4">
              <div className="flex justify-between">
                <Button
                  variant="ghost"
                  onClick={onClose}
                >
                  Cancel
                </Button>
                
                <Button
                  onClick={handleSubmit(handleSave)}
                  disabled={!isDirty || !isValid}
                  leftIcon={Save}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modals */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        maxWidth="md"
      >
        <div className="p-6">
          <div className="flex items-center mb-4">
            <AlertTriangle className="w-6 h-6 text-red-500 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Delete Project
            </h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Are you sure you want to delete "{project.name}"? This action cannot be undone and all project data will be permanently lost.
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="ghost"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
            >
              Delete Project
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showArchiveConfirm}
        onClose={() => setShowArchiveConfirm(false)}
        maxWidth="md"
      >
        <div className="p-6">
          <div className="flex items-center mb-4">
            <Archive className="w-6 h-6 text-yellow-500 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {project.status === 'archived' ? 'Unarchive Project' : 'Archive Project'}
            </h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {project.status === 'archived'
              ? `Are you sure you want to unarchive "${project.name}"? It will be restored to your active projects.`
              : `Are you sure you want to archive "${project.name}"? It will be hidden from your active projects but can be restored later.`
            }
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="ghost"
              onClick={() => setShowArchiveConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              variant="warning"
              onClick={handleArchive}
            >
              {project.status === 'archived' ? 'Unarchive' : 'Archive'}
            </Button>
          </div>
        </div>
      </Modal>
    </Modal>
  )
}

export default ProjectSettings