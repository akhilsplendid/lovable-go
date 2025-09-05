import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  SortAsc, 
  SortDesc,
  Plus,
  Archive,
  Trash2,
  Download,
  CheckSquare,
  Square
} from 'lucide-react'
import ProjectCard from './ProjectCard'
import CreateProjectModal from './CreateProjectModal'
import ExportOptions from './ExportOptions'
import Button from '../ui/Button'
import Input from '../ui/Input'
import { useProjects } from '../../hooks/useProjects'
import { useDebounce } from '../../hooks/useDebounce'

/**
 * Project Grid Component
 * Displays projects in a responsive grid with filtering and sorting
 */
const ProjectGrid = ({ 
  showHeader = true,
  showFilters = true,
  showBatchActions = true,
  showCreateButton = true,
  onProjectSelect
}) => {
  const [viewMode, setViewMode] = useState('grid') // 'grid' | 'list'
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [sortBy, setSortBy] = useState('updated_at')
  const [sortOrder, setSortOrder] = useState('desc')

  // Use debounced search to avoid excessive API calls
  const debouncedSearch = useDebounce(searchTerm, 300)

  const {
    projects,
    pagination,
    isLoading,
    error,
    selectedProjects,
    totalProjects,
    hasSelectedProjects,
    updateFilters,
    toggleSelection,
    selectAll,
    clearSelection,
    quickActions,
    loadMore,
    refresh
  } = useProjects({
    onProjectCreated: (project) => {
      setShowCreateModal(false)
      onProjectSelect?.(project)
    }
  })

  // Update filters when search or filters change
  React.useEffect(() => {
    updateFilters({
      search: debouncedSearch,
      status: selectedStatus === 'all' ? '' : selectedStatus,
      sortBy,
      sortOrder
    })
  }, [debouncedSearch, selectedStatus, sortBy, sortOrder, updateFilters])

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }

  const handleBatchAction = async (action) => {
    if (!hasSelectedProjects) return

    try {
      switch (action) {
        case 'delete':
          await quickActions.deleteSelected()
          break
        case 'export':
          setShowExportModal(true)
          break
        case 'archive':
          // Handle batch archive
          break
        default:
          break
      }
    } catch (error) {
      console.error('Batch action failed:', error)
    }
  }

  const handleProjectAction = async (action, project) => {
    try {
      switch (action) {
        case 'edit':
          onProjectSelect?.(project)
          break
        case 'duplicate':
          // Handle duplicate
          break
        case 'delete':
          // Handle delete
          break
        case 'export':
          // Handle export
          break
        case 'archive':
          // Handle archive
          break
        default:
          break
      }
    } catch (error) {
      console.error('Project action failed:', error)
    }
  }

  const isAllSelected = selectedProjects.length === projects.length && projects.length > 0
  const isSomeSelected = selectedProjects.length > 0 && selectedProjects.length < projects.length

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="card animate-pulse">
          <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-t-xl"></div>
          <div className="p-4 space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
            <div className="flex space-x-2">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  // Empty state
  const EmptyState = () => (
    <div className="text-center py-12">
      <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
        <Grid3X3 className="w-12 h-12 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        No projects found
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        {searchTerm ? 
          `No projects match "${searchTerm}". Try adjusting your search.` :
          "Get started by creating your first project."
        }
      </p>
      {showCreateButton && !searchTerm && (
        <Button onClick={() => setShowCreateModal(true)} leftIcon={Plus}>
          Create Project
        </Button>
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      {showHeader && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Projects
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {totalProjects > 0 && `${totalProjects} project${totalProjects === 1 ? '' : 's'}`}
            </p>
          </div>
          
          {showCreateButton && (
            <Button onClick={() => setShowCreateModal(true)} leftIcon={Plus}>
              New Project
            </Button>
          )}
        </div>
      )}

      {/* Filters and Search */}
      {showFilters && (
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <Input
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={Search}
              className="w-full"
            />
          </div>

          {/* Status filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="form-input w-full sm:w-auto min-w-[120px]"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>

          {/* Sort */}
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-')
              setSortBy(field)
              setSortOrder(order)
            }}
            className="form-input w-full sm:w-auto min-w-[160px]"
          >
            <option value="updated_at-desc">Last Updated</option>
            <option value="created_at-desc">Newest First</option>
            <option value="created_at-asc">Oldest First</option>
            <option value="name-asc">Name A-Z</option>
            <option value="name-desc">Name Z-A</option>
            <option value="view_count-desc">Most Viewed</option>
          </select>

          {/* View mode toggle */}
          <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${
                viewMode === 'grid' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${
                viewMode === 'list' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Batch Actions */}
      {showBatchActions && hasSelectedProjects && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => isAllSelected ? clearSelection() : selectAll()}
                className="flex items-center text-sm font-medium text-primary-700 dark:text-primary-300"
              >
                {isAllSelected ? (
                  <CheckSquare className="w-4 h-4 mr-2" />
                ) : isSomeSelected ? (
                  <CheckSquare className="w-4 h-4 mr-2" />
                ) : (
                  <Square className="w-4 h-4 mr-2" />
                )}
                {selectedProjects.length} selected
              </button>
              
              <button
                onClick={clearSelection}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Clear
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBatchAction('export')}
                leftIcon={Download}
              >
                Export
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBatchAction('archive')}
                leftIcon={Archive}
              >
                Archive
              </Button>
              
              <Button
                size="sm"
                variant="danger"
                onClick={() => handleBatchAction('delete')}
                leftIcon={Trash2}
              >
                Delete
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Content */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <Button onClick={refresh} variant="outline">
            Try Again
          </Button>
        </div>
      ) : projects.length === 0 ? (
        <EmptyState />
      ) : (
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-4'
        }>
          <AnimatePresence mode="popLayout">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                showSelection={showBatchActions}
                isSelected={selectedProjects.includes(project.id)}
                onToggleSelection={() => toggleSelection(project.id)}
                onEdit={(project) => handleProjectAction('edit', project)}
                onDuplicate={(project) => handleProjectAction('duplicate', project)}
                onDelete={(project) => handleProjectAction('delete', project)}
                onExport={(project) => handleProjectAction('export', project)}
                onArchive={(project) => handleProjectAction('archive', project)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Load More */}
      {pagination?.hasNextPage && (
        <div className="text-center">
          <Button
            onClick={loadMore}
            variant="outline"
            loading={isLoading}
            loadingText="Loading more..."
          >
            Load More Projects
          </Button>
        </div>
      )}

      {/* Modals */}
      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={(project) => {
          setShowCreateModal(false)
          onProjectSelect?.(project)
        }}
      />

      <ExportOptions
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        projectIds={selectedProjects}
        onSuccess={() => {
          setShowExportModal(false)
          clearSelection()
        }}
      />
    </div>
  )
}

export default ProjectGrid