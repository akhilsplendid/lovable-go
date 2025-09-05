import { useProjectStore } from '../store/projectStore'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { projectService } from '../services/projects'
import { useCallback, useEffect } from 'react'
import { useDebounce } from './useDebounce'

/**
 * Projects Hook
 * Provides project state and actions with React Query integration
 */
export const useProjects = (options = {}) => {
  const store = useProjectStore()
  const queryClient = useQueryClient()
  
  // Debounce search term to avoid excessive API calls
  const debouncedSearch = useDebounce(store.filters.search, 300)

  // Projects query
  const {
    data: projectsData,
    isLoading,
    error,
    refetch: refetchProjects
  } = useQuery({
    queryKey: ['projects', store.pagination.currentPage, store.filters, debouncedSearch],
    queryFn: () => store.fetchProjects(store.pagination.currentPage),
    enabled: options.enabled !== false,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
    ...options.queryOptions
  })

  // Create project mutation
  const createProjectMutation = useMutation({
    mutationFn: store.createProject,
    onSuccess: (newProject) => {
      // Invalidate projects list
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      
      if (options.onProjectCreated) {
        options.onProjectCreated(newProject)
      }
    },
    onError: (error) => {
      if (options.onError) {
        options.onError(error)
      }
    }
  })

  // Update project mutation
  const updateProjectMutation = useMutation({
    mutationFn: ({ projectId, updates }) => store.updateProject(projectId, updates),
    onSuccess: (updatedProject) => {
      // Update cache
      queryClient.setQueryData(['project', updatedProject.id], updatedProject)
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      
      if (options.onProjectUpdated) {
        options.onProjectUpdated(updatedProject)
      }
    },
    onError: (error) => {
      if (options.onError) {
        options.onError(error)
      }
    }
  })

  // Delete project mutation
  const deleteProjectMutation = useMutation({
    mutationFn: store.deleteProject,
    onSuccess: (_, projectId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: ['project', projectId] })
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      
      if (options.onProjectDeleted) {
        options.onProjectDeleted(projectId)
      }
    },
    onError: (error) => {
      if (options.onError) {
        options.onError(error)
      }
    }
  })

  // Duplicate project mutation
  const duplicateProjectMutation = useMutation({
    mutationFn: store.duplicateProject,
    onSuccess: (duplicatedProject) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      
      if (options.onProjectDuplicated) {
        options.onProjectDuplicated(duplicatedProject)
      }
    },
    onError: (error) => {
      if (options.onError) {
        options.onError(error)
      }
    }
  })

  // Batch operations
  const batchDeleteMutation = useMutation({
    mutationFn: store.batchDeleteProjects,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    }
  })

  const exportProjectsMutation = useMutation({
    mutationFn: ({ projectIds, includeAssets }) => 
      store.exportProjects(projectIds, includeAssets)
  })

  // Auto-save functionality
  const autoSave = useCallback(async (projectId, changes) => {
    try {
      await store.autoSaveProject(projectId, changes)
      // Update cache optimistically
      queryClient.setQueryData(['project', projectId], (old) => 
        old ? { ...old, ...changes } : null
      )
    } catch (error) {
      console.warn('Auto-save failed:', error)
    }
  }, [store, queryClient])

  // Refresh projects data
  const refresh = useCallback(() => {
    refetchProjects()
  }, [refetchProjects])

  // Load more projects (pagination)
  const loadMore = useCallback(() => {
    if (store.pagination.hasNextPage && !isLoading) {
      store.fetchProjects(store.pagination.currentPage + 1)
    }
  }, [store, isLoading])

  return {
    // Data
    projects: store.projects,
    currentProject: store.currentProject,
    pagination: store.pagination,
    filters: store.filters,
    selectedProjects: store.selectedProjects,

    // Loading states
    isLoading: isLoading || store.isLoading,
    isCreating: createProjectMutation.isPending,
    isUpdating: updateProjectMutation.isPending,
    isDeleting: deleteProjectMutation.isPending,
    isDuplicating: duplicateProjectMutation.isPending,
    isBatchDeleting: batchDeleteMutation.isPending,
    isExporting: exportProjectsMutation.isPending,

    // Error states
    error: error || store.error,
    createError: createProjectMutation.error,
    updateError: updateProjectMutation.error,
    deleteError: deleteProjectMutation.error,

    // Actions
    createProject: createProjectMutation.mutate,
    updateProject: updateProjectMutation.mutate,
    deleteProject: deleteProjectMutation.mutate,
    duplicateProject: duplicateProjectMutation.mutate,
    
    // Batch actions
    batchDelete: batchDeleteMutation.mutate,
    exportProjects: exportProjectsMutation.mutate,

    // Navigation
    setCurrentProject: store.setCurrentProject,
    clearCurrentProject: store.clearCurrentProject,

    // Filtering & Search
    updateFilters: store.updateFilters,
    resetFilters: store.resetFilters,
    searchProjects: store.searchProjects,
    filterByStatus: store.filterByStatus,
    filterByTags: store.filterByTags,
    changeSortOrder: store.changeSortOrder,

    // Selection
    toggleSelection: store.toggleProjectSelection,
    selectAll: store.selectAllProjects,
    clearSelection: store.clearSelection,

    // Utilities
    getProjectById: store.getProjectById,
    hasUnsavedChanges: store.hasUnsavedChanges,
    getRecentProjects: store.getRecentProjects,
    getProjectStats: store.getProjectStats,
    autoSave,
    refresh,
    loadMore,

    // Computed values
    totalProjects: store.pagination.totalCount,
    hasProjects: store.projects.length > 0,
    hasSelectedProjects: store.selectedProjects.length > 0,
    canLoadMore: store.pagination.hasNextPage,
    isEmpty: !isLoading && store.projects.length === 0 && !store.filters.search,
    
    // Quick actions
    quickActions: {
      async createQuickProject(name) {
        return createProjectMutation.mutateAsync({
          name,
          description: `Quick project created on ${new Date().toLocaleDateString()}`,
          tags: []
        })
      },
      
      async deleteSelected() {
        if (store.selectedProjects.length > 0) {
          return batchDeleteMutation.mutateAsync()
        }
      },
      
      async exportSelected(includeAssets = false) {
        if (store.selectedProjects.length > 0) {
          return exportProjectsMutation.mutateAsync({
            projectIds: store.selectedProjects,
            includeAssets
          })
        }
      }
    }
  }
}

/**
 * Hook for a single project
 */
export const useProject = (projectId, options = {}) => {
  const store = useProjectStore()
  const queryClient = useQueryClient()

  const {
    data: project,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => store.fetchProject(projectId),
    enabled: !!projectId && options.enabled !== false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options.queryOptions
  })

  // Conversations query
  const {
    data: conversations,
    isLoading: isLoadingConversations
  } = useQuery({
    queryKey: ['conversations', projectId],
    queryFn: () => projectService.getConversations(projectId),
    enabled: !!projectId && options.loadConversations !== false,
    staleTime: 2 * 60 * 1000
  })

  // Update project effect
  useEffect(() => {
    if (project && project.id === projectId) {
      store.setCurrentProject(project)
    }
  }, [project, projectId, store])

  return {
    project,
    conversations: conversations || [],
    isLoading,
    isLoadingConversations,
    error,
    refetch,
    
    // Quick access to project properties
    hasCode: !!project?.html_code,
    isPublic: project?.is_public || false,
    status: project?.status || 'draft',
    tags: project?.tags || [],
    
    // Project actions
    async updateProject(updates) {
      if (!projectId) return
      
      const response = await projectService.updateProject(projectId, updates)
      
      // Update cache
      queryClient.setQueryData(['project', projectId], response)
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      
      return response
    },
    
    async deleteProject() {
      if (!projectId) return
      
      await projectService.deleteProject(projectId)
      
      // Remove from cache
      queryClient.removeQueries({ queryKey: ['project', projectId] })
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    }
  }
}