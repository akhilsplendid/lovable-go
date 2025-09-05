import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { 
  Plus,
  Search,
  Filter,
  Grid3X3,
  List,
  SortAsc,
  SortDesc,
  MoreVertical,
  Folder,
  FolderOpen,
  Star,
  Eye,
  Calendar,
  Tag,
  Trash2,
  Copy,
  Edit,
  ExternalLink,
  Download
} from 'lucide-react'

import { useProjects } from '../hooks/useProjects'
import { useUIStore } from '../store/uiStore'
import { useDebounce } from '../hooks/useDebounce'
import Button from '../components/ui/Button'
import ProjectGrid from '../components/projects/ProjectGrid'
import CreateProjectModal from '../components/projects/CreateProjectModal'

/**
 * Projects Page Component
 * Displays user's projects with search, filter, and management capabilities
 */
const ProjectsPage = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { openModal } = useUIStore()
  
  const {
    projects,
    isLoading,
    pagination,
    filters,
    selectedProjects,
    updateFilters,
    resetFilters,
    toggleSelection,
    selectAll,
    clearSelection,
    hasSelectedProjects,
    quickActions
  } = useProjects()

  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  const [searchTerm, setSearchTerm] = useState(filters.search)
  const [showFilters, setShowFilters] = useState(false)
  const debouncedSearch = useDebounce(searchTerm, 300)

  // Sync search with URL params
  useEffect(() => {
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const sort = searchParams.get('sort')
    
    if (search) setSearchTerm(search)
    
    updateFilters({
      search: search || '',
      status: status || 'all',
      sortBy: sort || 'updated_at'
    })
  }, [searchParams])

  // Update search filter when debounced search changes
  useEffect(() => {
    updateFilters({ search: debouncedSearch })
    
    // Update URL params
    const params = new URLSearchParams(searchParams)
    if (debouncedSearch) {
      params.set('search', debouncedSearch)
    } else {
      params.delete('search')
    }
    setSearchParams(params)
  }, [debouncedSearch])

  const handleStatusFilter = (status) => {
    updateFilters({ status })
    
    const params = new URLSearchParams(searchParams)
    if (status !== 'all') {
      params.set('status', status)
    } else {
      params.delete('status')
    }
    setSearchParams(params)
  }

  const handleSortChange = (sortBy, sortOrder) => {
    updateFilters({ sortBy, sortOrder })
    
    const params = new URLSearchParams(searchParams)
    params.set('sort', sortBy)
    params.set('order', sortOrder)
    setSearchParams(params)
  }

  const projectStatusCounts = {
    all: projects.length,
    draft: projects.filter(p => p.status === 'draft').length,
    published: projects.filter(p => p.status === 'published').length,
    archived: projects.filter(p => p.status === 'archived').length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Projects
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {pagination.totalCount} projects total
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex items-center gap-3 mt-4 sm:mt-0"
        >
          {hasSelectedProjects && (
            <>
              <Button
                onClick={quickActions.exportSelected}
                variant="outline"
                size="sm"
                leftIcon={Download}
              >
                Export ({selectedProjects.length})
              </Button>
              <Button
                onClick={quickActions.deleteSelected}
                variant="danger"
                size="sm"
                leftIcon={Trash2}
              >
                Delete ({selectedProjects.length})
              </Button>
            </>
          )}
          
          <Button
            onClick={() => openModal('createProject')}
            leftIcon={Plus}
          >
            New Project
          </Button>
        </motion.div>
      </div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="card p-6"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search projects..."
                className="form-input pl-10 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {[
              { key: 'all', label: 'All', count: projectStatusCounts.all },
              { key: 'draft', label: 'Draft', count: projectStatusCounts.draft },
              { key: 'published', label: 'Published', count: projectStatusCounts.published },
              { key: 'archived', label: 'Archived', count: projectStatusCounts.archived }
            ].map((status) => (
              <button
                key={status.key}
                onClick={() => handleStatusFilter(status.key)}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  filters.status === status.key
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                {status.label} ({status.count})
              </button>
            ))}
          </div>

          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('-')
                handleSortChange(sortBy, sortOrder)
              }}
              className="form-input pr-10 min-w-[140px]"
            >
              <option value="updated_at-desc">Recently Updated</option>
              <option value="created_at-desc">Recently Created</option>
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="view_count-desc">Most Viewed</option>
            </select>
          </div>

          {/* Advanced Filters Toggle */}
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="outline"
            leftIcon={Filter}
          >
            Filters
          </Button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Tags Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {/* Common tags */}
                  {['portfolio', 'business', 'landing', 'blog', 'ecommerce'].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => {
                        const newTags = filters.tags.includes(tag)
                          ? filters.tags.filter(t => t !== tag)
                          : [...filters.tags, tag]
                        updateFilters({ tags: newTags })
                      }}
                      className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                        filters.tags.includes(tag)
                          ? 'bg-primary-100 border-primary-300 text-primary-800 dark:bg-primary-800 dark:border-primary-600 dark:text-primary-200'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Created
                </label>
                <select className="form-input w-full">
                  <option>All time</option>
                  <option>Last week</option>
                  <option>Last month</option>
                  <option>Last 3 months</option>
                  <option>Last year</option>
                </select>
              </div>

              {/* Has Code Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Content
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                      Has generated code
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                      Public projects
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center mt-4">
              <Button
                onClick={resetFilters}
                variant="ghost"
                size="sm"
              >
                Clear all filters
              </Button>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {projects.length} projects match your filters
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Bulk Actions Bar */}
      {hasSelectedProjects && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="card p-4 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-700"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-sm font-medium text-primary-800 dark:text-primary-200">
                {selectedProjects.length} project{selectedProjects.length > 1 ? 's' : ''} selected
              </span>
              <Button
                onClick={clearSelection}
                variant="ghost"
                size="sm"
                className="ml-4"
              >
                Clear selection
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => selectAll()}
                variant="ghost"
                size="sm"
              >
                Select all
              </Button>
              <Button
                onClick={quickActions.exportSelected}
                variant="outline"
                size="sm"
                leftIcon={Download}
              >
                Export
              </Button>
              <Button
                onClick={quickActions.deleteSelected}
                variant="danger"
                size="sm"
                leftIcon={Trash2}
              >
                Delete
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Projects Grid/List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <ProjectGrid
          projects={projects}
          isLoading={isLoading}
          viewMode={viewMode}
          selectedProjects={selectedProjects}
          onProjectClick={(project) => navigate(`/projects/${project.id}`)}
          onProjectSelect={toggleSelection}
          onProjectDuplicate={(project) => console.log('Duplicate:', project)}
          onProjectDelete={(project) => console.log('Delete:', project)}
          onProjectExport={(project) => console.log('Export:', project)}
        />
      </motion.div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex items-center justify-between"
        >
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Showing {((pagination.currentPage - 1) * 20) + 1} to{' '}
            {Math.min(pagination.currentPage * 20, pagination.totalCount)} of{' '}
            {pagination.totalCount} projects
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={() => updateFilters({ page: pagination.currentPage - 1 })}
              disabled={!pagination.hasPrevPage}
              variant="outline"
              size="sm"
            >
              Previous
            </Button>
            
            <div className="flex items-center gap-1">
              {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                const page = i + 1
                return (
                  <button
                    key={page}
                    onClick={() => updateFilters({ page })}
                    className={`w-8 h-8 text-sm rounded-md transition-colors ${
                      pagination.currentPage === page
                        ? 'bg-primary-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                    }`}
                  >
                    {page}
                  </button>
                )
              })}
              {pagination.totalPages > 5 && (
                <>
                  <span className="px-2 text-gray-500">...</span>
                  <button
                    onClick={() => updateFilters({ page: pagination.totalPages })}
                    className="w-8 h-8 text-sm rounded-md text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    {pagination.totalPages}
                  </button>
                </>
              )}
            </div>
            
            <Button
              onClick={() => updateFilters({ page: pagination.currentPage + 1 })}
              disabled={!pagination.hasNextPage}
              variant="outline"
              size="sm"
            >
              Next
            </Button>
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {!isLoading && projects.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center py-12"
        >
          <Folder className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
            {filters.search ? 'No projects found' : 'No projects yet'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
            {filters.search 
              ? 'Try adjusting your search or filters to find what you\'re looking for.'
              : 'Create your first project to start building amazing websites with AI.'
            }
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {filters.search && (
              <Button
                onClick={() => {
                  setSearchTerm('')
                  resetFilters()
                }}
                variant="outline"
              >
                Clear filters
              </Button>
            )}
            <Button
              onClick={() => openModal('createProject')}
              leftIcon={Plus}
            >
              Create Your First Project
            </Button>
          </div>
        </motion.div>
      )}

      {/* Create Project Modal */}
      <CreateProjectModal />
    </div>
  )
}

export default ProjectsPage