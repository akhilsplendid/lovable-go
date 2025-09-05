import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import toast from 'react-hot-toast'
import { projectService } from '../services/projects'

/**
 * Project Store
 * Manages project state, CRUD operations, and project-related UI state
 */
export const useProjectStore = create(
  subscribeWithSelector((set, get) => ({
    // State
    projects: [],
    currentProject: null,
    isLoading: false,
    error: null,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalCount: 0,
      hasNextPage: false,
      hasPrevPage: false
    },
    filters: {
      search: '',
      status: 'all',
      tags: [],
      sortBy: 'updated_at',
      sortOrder: 'desc'
    },
    selectedProjects: [],

    // Actions
    /**
     * Fetch projects with pagination and filters
     */
    fetchProjects: async (page = 1, limit = 20) => {
      set({ isLoading: true, error: null })
      
      try {
        const { filters } = get()
        const params = {
          page,
          limit,
          search: filters.search,
          status: filters.status !== 'all' ? filters.status : undefined,
          tags: filters.tags.length > 0 ? filters.tags.join(',') : undefined,
          sort: filters.sortBy,
          order: filters.sortOrder
        }

        const response = await projectService.getProjects(params)
        
        set({
          projects: response.projects,
          pagination: response.pagination,
          isLoading: false
        })
        
      } catch (error) {
        set({ isLoading: false, error: error.message })
        toast.error('Failed to load projects')
        throw error
      }
    },

    /**
     * Fetch a specific project by ID
     */
    fetchProject: async (projectId) => {
      set({ isLoading: true, error: null })
      
      try {
        const project = await projectService.getProject(projectId)
        
        set({
          currentProject: project,
          isLoading: false
        })
        
        return project
        
      } catch (error) {
        set({ isLoading: false, error: error.message })
        toast.error('Failed to load project')
        throw error
      }
    },

    /**
     * Create a new project
     */
    createProject: async (projectData) => {
      set({ isLoading: true, error: null })
      
      try {
        const newProject = await projectService.createProject(projectData)
        
        set(state => ({
          projects: [newProject, ...state.projects],
          currentProject: newProject,
          isLoading: false
        }))
        
        toast.success('Project created successfully!')
        return newProject
        
      } catch (error) {
        set({ isLoading: false, error: error.message })
        
        const message = error.response?.data?.error || 'Failed to create project'
        toast.error(message)
        throw error
      }
    },

    /**
     * Update an existing project
     */
    updateProject: async (projectId, updates) => {
      set({ isLoading: true, error: null })
      
      try {
        const updatedProject = await projectService.updateProject(projectId, updates)
        
        set(state => ({
          projects: state.projects.map(p => 
            p.id === projectId ? updatedProject : p
          ),
          currentProject: state.currentProject?.id === projectId 
            ? updatedProject 
            : state.currentProject,
          isLoading: false
        }))
        
        // Only show toast for manual updates, not auto-saves
        if (!updates._autoSave) {
          toast.success('Project updated successfully!')
        }
        
        return updatedProject
        
      } catch (error) {
        set({ isLoading: false, error: error.message })
        
        if (!updates._autoSave) {
          toast.error('Failed to update project')
        }
        throw error
      }
    },

    /**
     * Delete a project
     */
    deleteProject: async (projectId) => {
      set({ isLoading: true, error: null })
      
      try {
        await projectService.deleteProject(projectId)
        
        set(state => ({
          projects: state.projects.filter(p => p.id !== projectId),
          currentProject: state.currentProject?.id === projectId 
            ? null 
            : state.currentProject,
          selectedProjects: state.selectedProjects.filter(id => id !== projectId),
          isLoading: false
        }))
        
        toast.success('Project deleted successfully!')
        
      } catch (error) {
        set({ isLoading: false, error: error.message })
        toast.error('Failed to delete project')
        throw error
      }
    },

    /**
     * Duplicate a project
     */
    duplicateProject: async (projectId) => {
      set({ isLoading: true, error: null })
      
      try {
        const duplicatedProject = await projectService.duplicateProject(projectId)
        
        set(state => ({
          projects: [duplicatedProject, ...state.projects],
          isLoading: false
        }))
        
        toast.success('Project duplicated successfully!')
        return duplicatedProject
        
      } catch (error) {
        set({ isLoading: false, error: error.message })
        toast.error('Failed to duplicate project')
        throw error
      }
    },

    /**
     * Set current project
     */
    setCurrentProject: (project) => {
      set({ currentProject: project })
    },

    /**
     * Clear current project
     */
    clearCurrentProject: () => {
      set({ currentProject: null })
    },

    /**
     * Update project filters
     */
    updateFilters: (newFilters) => {
      set(state => ({
        filters: { ...state.filters, ...newFilters }
      }))
      
      // Auto-refresh projects when filters change
      setTimeout(() => {
        get().fetchProjects(1)
      }, 300) // Debounce
    },

    /**
     * Reset filters to default
     */
    resetFilters: () => {
      set({
        filters: {
          search: '',
          status: 'all',
          tags: [],
          sortBy: 'updated_at',
          sortOrder: 'desc'
        }
      })
      
      get().fetchProjects(1)
    },

    /**
     * Toggle project selection for batch operations
     */
    toggleProjectSelection: (projectId) => {
      set(state => ({
        selectedProjects: state.selectedProjects.includes(projectId)
          ? state.selectedProjects.filter(id => id !== projectId)
          : [...state.selectedProjects, projectId]
      }))
    },

    /**
     * Select all projects
     */
    selectAllProjects: () => {
      const { projects } = get()
      set({ selectedProjects: projects.map(p => p.id) })
    },

    /**
     * Clear project selection
     */
    clearSelection: () => {
      set({ selectedProjects: [] })
    },

    /**
     * Batch delete selected projects
     */
    batchDeleteProjects: async () => {
      const { selectedProjects } = get()
      if (selectedProjects.length === 0) return
      
      set({ isLoading: true })
      
      try {
        await Promise.all(
          selectedProjects.map(id => projectService.deleteProject(id))
        )
        
        set(state => ({
          projects: state.projects.filter(p => !selectedProjects.includes(p.id)),
          selectedProjects: [],
          isLoading: false
        }))
        
        toast.success(`${selectedProjects.length} projects deleted successfully!`)
        
      } catch (error) {
        set({ isLoading: false })
        toast.error('Failed to delete some projects')
        throw error
      }
    },

    /**
     * Export projects as ZIP
     */
    exportProjects: async (projectIds, includeAssets = false) => {
      set({ isLoading: true })
      
      try {
        const blob = await projectService.exportBatch(projectIds, includeAssets)
        
        // Create download link
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `projects-export-${Date.now()}.zip`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        
        set({ isLoading: false })
        toast.success('Projects exported successfully!')
        
      } catch (error) {
        set({ isLoading: false })
        toast.error('Failed to export projects')
        throw error
      }
    },

    /**
     * Auto-save project changes
     */
    autoSaveProject: async (projectId, changes) => {
      try {
        await get().updateProject(projectId, { ...changes, _autoSave: true })
      } catch (error) {
        console.warn('Auto-save failed:', error)
      }
    },

    /**
     * Search projects
     */
    searchProjects: (query) => {
      get().updateFilters({ search: query })
    },

    /**
     * Filter by status
     */
    filterByStatus: (status) => {
      get().updateFilters({ status })
    },

    /**
     * Filter by tags
     */
    filterByTags: (tags) => {
      get().updateFilters({ tags })
    },

    /**
     * Change sort order
     */
    changeSortOrder: (sortBy, sortOrder) => {
      get().updateFilters({ sortBy, sortOrder })
    },

    /**
     * Get project by ID from current projects list
     */
    getProjectById: (projectId) => {
      const { projects } = get()
      return projects.find(p => p.id === projectId)
    },

    /**
     * Check if project has unsaved changes
     */
    hasUnsavedChanges: (projectId) => {
      // This would typically track dirty state
      // For now, return false as auto-save handles this
      return false
    },

    /**
     * Get recent projects
     */
    getRecentProjects: (limit = 5) => {
      const { projects } = get()
      return [...projects]
        .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
        .slice(0, limit)
    },

    /**
     * Get project statistics
     */
    getProjectStats: () => {
      const { projects } = get()
      
      return {
        total: projects.length,
        published: projects.filter(p => p.status === 'published').length,
        draft: projects.filter(p => p.status === 'draft').length,
        archived: projects.filter(p => p.status === 'archived').length,
        withCode: projects.filter(p => p.has_code).length
      }
    }
  }))
)