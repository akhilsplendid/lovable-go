import { useState, useCallback, useEffect } from 'react'
import { sandpackService } from '../services/sandpack'
import { useLocalStorage } from './useLocalStorage'

/**
 * Sandpack Hook
 * Manages CodeSandbox Sandpack integration for real-time code preview
 */
export const useSandpack = (initialCode = {}, options = {}) => {
  const [sandbox, setSandbox] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  
  // Persist settings
  const [settings, setSettings] = useLocalStorage('sandpack-settings', {
    template: 'vanilla',
    theme: 'dark',
    showConsole: false,
    showTests: false,
    showFileExplorer: false,
    autoReload: true
  })

  /**
   * Create a new sandbox
   */
  const createSandbox = useCallback(async (code, customOptions = {}) => {
    setIsLoading(true)
    setError(null)

    try {
      const sandboxConfig = sandpackService.createSandbox(code, {
        ...settings,
        ...customOptions
      })

      setSandbox(sandboxConfig)
      
      // Generate preview URL if needed
      if (customOptions.generateUrl) {
        const url = sandpackService.getSharableURL(sandboxConfig)
        setPreviewUrl(url)
      }

    } catch (err) {
      console.error('Failed to create sandbox:', err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [settings])

  /**
   * Update sandbox files
   */
  const updateSandbox = useCallback((updates) => {
    if (!sandbox) return

    try {
      const updatedFiles = sandpackService.updateSandbox(sandbox.files, updates)
      setSandbox(prev => ({
        ...prev,
        files: updatedFiles
      }))
    } catch (err) {
      console.error('Failed to update sandbox:', err)
      setError(err.message)
    }
  }, [sandbox])

  /**
   * Update a specific file in the sandbox
   */
  const updateFile = useCallback((fileName, code) => {
    if (!sandbox) return

    try {
      const updatedFiles = {
        ...sandbox.files,
        [fileName]: {
          ...sandbox.files[fileName],
          code
        }
      }
      
      setSandbox(prev => ({
        ...prev,
        files: updatedFiles
      }))
    } catch (err) {
      console.error('Failed to update file:', err)
      setError(err.message)
    }
  }, [sandbox])

  /**
   * Change sandbox template
   */
  const changeTemplate = useCallback(async (template) => {
    if (!sandbox) return

    setIsLoading(true)
    try {
      const updatedSandbox = await sandpackService.changeTemplate(sandbox, template)
      setSandbox(updatedSandbox)
      
      // Update settings
      setSettings(prev => ({
        ...prev,
        template
      }))
    } catch (err) {
      console.error('Failed to change template:', err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [sandbox, setSettings])

  /**
   * Change sandbox theme
   */
  const changeTheme = useCallback((theme) => {
    if (!sandbox) return

    setSandbox(prev => ({
      ...prev,
      theme
    }))
    
    // Update settings
    setSettings(prev => ({
      ...prev,
      theme
    }))
  }, [sandbox, setSettings])

  /**
   * Toggle console visibility
   */
  const toggleConsole = useCallback(() => {
    setSettings(prev => ({
      ...prev,
      showConsole: !prev.showConsole
    }))
  }, [setSettings])

  /**
   * Toggle tests visibility
   */
  const toggleTests = useCallback(() => {
    setSettings(prev => ({
      ...prev,
      showTests: !prev.showTests
    }))
  }, [setSettings])

  /**
   * Toggle file explorer visibility
   */
  const toggleFileExplorer = useCallback(() => {
    setSettings(prev => ({
      ...prev,
      showFileExplorer: !prev.showFileExplorer
    }))
  }, [setSettings])

  /**
   * Export sandbox as ZIP
   */
  const exportSandbox = useCallback(async () => {
    if (!sandbox) return null

    try {
      const blob = await sandpackService.exportSandbox(sandbox)
      return blob
    } catch (err) {
      console.error('Failed to export sandbox:', err)
      setError(err.message)
      return null
    }
  }, [sandbox])

  /**
   * Get shareable URL
   */
  const getSharableUrl = useCallback(() => {
    if (!sandbox) return null
    return sandpackService.getSharableURL(sandbox)
  }, [sandbox])

  /**
   * Reset sandbox
   */
  const resetSandbox = useCallback(() => {
    setSandbox(null)
    setPreviewUrl(null)
    setError(null)
  }, [])

  /**
   * Get sandbox statistics
   */
  const getStats = useCallback(() => {
    if (!sandbox) return null

    const fileCount = Object.keys(sandbox.files).length
    const totalLines = Object.values(sandbox.files)
      .reduce((total, file) => total + (file.code?.split('\n').length || 0), 0)
    const totalChars = Object.values(sandbox.files)
      .reduce((total, file) => total + (file.code?.length || 0), 0)

    return {
      fileCount,
      totalLines,
      totalChars,
      template: sandbox.template,
      theme: sandbox.theme
    }
  }, [sandbox])

  /**
   * Add a new file to the sandbox
   */
  const addFile = useCallback((fileName, code = '', options = {}) => {
    if (!sandbox) return

    try {
      const newFile = {
        code,
        hidden: options.hidden || false,
        active: options.active || false,
        readOnly: options.readOnly || false
      }

      setSandbox(prev => ({
        ...prev,
        files: {
          ...prev.files,
          [fileName]: newFile
        }
      }))
    } catch (err) {
      console.error('Failed to add file:', err)
      setError(err.message)
    }
  }, [sandbox])

  /**
   * Remove a file from the sandbox
   */
  const removeFile = useCallback((fileName) => {
    if (!sandbox) return

    try {
      const { [fileName]: removed, ...remainingFiles } = sandbox.files
      
      setSandbox(prev => ({
        ...prev,
        files: remainingFiles
      }))
    } catch (err) {
      console.error('Failed to remove file:', err)
      setError(err.message)
    }
  }, [sandbox])

  /**
   * Rename a file in the sandbox
   */
  const renameFile = useCallback((oldName, newName) => {
    if (!sandbox || !sandbox.files[oldName]) return

    try {
      const fileData = sandbox.files[oldName]
      const { [oldName]: removed, ...otherFiles } = sandbox.files
      
      setSandbox(prev => ({
        ...prev,
        files: {
          ...otherFiles,
          [newName]: fileData
        }
      }))
    } catch (err) {
      console.error('Failed to rename file:', err)
      setError(err.message)
    }
  }, [sandbox])

  /**
   * Fork the current sandbox
   */
  const forkSandbox = useCallback(async () => {
    if (!sandbox) return null

    try {
      const forkedSandbox = await sandpackService.forkSandbox(sandbox)
      return forkedSandbox
    } catch (err) {
      console.error('Failed to fork sandbox:', err)
      setError(err.message)
      return null
    }
  }, [sandbox])

  // Initialize sandbox with initial code
  useEffect(() => {
    if (initialCode.htmlCode && !sandbox) {
      createSandbox(initialCode, options)
    }
  }, [initialCode.htmlCode, sandbox, createSandbox, options])

  // Auto-save changes
  useEffect(() => {
    if (sandbox && settings.autoReload) {
      // Debounced auto-save logic could go here
      // For now, we'll just ensure the sandbox is kept in sync
    }
  }, [sandbox, settings.autoReload])

  return {
    // State
    sandbox,
    isLoading,
    error,
    previewUrl,
    settings,

    // Actions
    createSandbox,
    updateSandbox,
    updateFile,
    addFile,
    removeFile,
    renameFile,
    changeTemplate,
    changeTheme,
    toggleConsole,
    toggleTests,
    toggleFileExplorer,
    exportSandbox,
    getSharableUrl,
    resetSandbox,
    forkSandbox,

    // Utilities
    getStats,
    templates: sandpackService?.getTemplates?.() || ['vanilla', 'react', 'vue', 'angular'],
    themes: sandpackService?.getThemes?.() || ['light', 'dark', 'auto'],

    // Computed values
    hasFiles: sandbox && Object.keys(sandbox.files).length > 0,
    isReady: sandbox && !isLoading && !error,
    fileCount: sandbox ? Object.keys(sandbox.files).length : 0,
    isEmpty: !sandbox || Object.keys(sandbox.files).length === 0
  }
}

/**
 * Hook for managing multiple sandboxes
 */
export const useSandboxManager = () => {
  const [sandboxes, setSandboxes] = useState(new Map())
  const [activeSandboxId, setActiveSandboxId] = useState(null)

  const createSandbox = useCallback((id, code, options = {}) => {
    try {
      const sandboxConfig = sandpackService.createSandbox(code, options)
      setSandboxes(prev => new Map(prev.set(id, sandboxConfig)))
      return sandboxConfig
    } catch (err) {
      console.error('Failed to create sandbox:', err)
      return null
    }
  }, [])

  const removeSandbox = useCallback((id) => {
    setSandboxes(prev => {
      const newMap = new Map(prev)
      newMap.delete(id)
      return newMap
    })
    
    if (activeSandboxId === id) {
      setActiveSandboxId(null)
    }
  }, [activeSandboxId])

  const updateSandbox = useCallback((id, updates) => {
    setSandboxes(prev => {
      const sandbox = prev.get(id)
      if (!sandbox) return prev
      
      try {
        const updatedFiles = sandpackService.updateSandbox(sandbox.files, updates)
        const updatedSandbox = { ...sandbox, files: updatedFiles }
        
        return new Map(prev.set(id, updatedSandbox))
      } catch (err) {
        console.error('Failed to update sandbox:', err)
        return prev
      }
    })
  }, [])

  const getActiveSandbox = useCallback(() => {
    return activeSandboxId ? sandboxes.get(activeSandboxId) : null
  }, [sandboxes, activeSandboxId])

  const clearAll = useCallback(() => {
    setSandboxes(new Map())
    setActiveSandboxId(null)
  }, [])

  const getSandboxById = useCallback((id) => {
    return sandboxes.get(id)
  }, [sandboxes])

  const getAllSandboxes = useCallback(() => {
    return Array.from(sandboxes.entries())
  }, [sandboxes])

  return {
    sandboxes: getAllSandboxes(),
    activeSandboxId,
    activeSandbox: getActiveSandbox(),
    createSandbox,
    removeSandbox,
    updateSandbox,
    getSandboxById,
    setActiveSandboxId,
    clearAll,
    count: sandboxes.size
  }
}