import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import SandpackPreviewComponent from '../components/preview/SandpackPreview'
import { useSandpack } from '../hooks/useSandpack'
import { 
  MessageSquare,
  Code,
  Eye,
  Settings,
  Share,
  Download,
  Save,
  ArrowLeft,
  Smartphone,
  Tablet,
  Monitor,
  Maximize2,
  Minimize2,
  RefreshCw,
  ExternalLink,
  Zap,
  History,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react'

import { useProject } from '../hooks/useProjects'
import { useChatStore } from '../store/chatStore'
import { useWebSocket } from '../hooks/useWebSocket'
import { useUIStore } from '../store/uiStore'
import { useDebounce } from '../hooks/useDebounce'

import Button from '../components/ui/Button'
import ChatInterface from '../components/chat/ChatInterface'
import PreviewFrame from '../components/preview/PreviewFrame'
import CodeViewer from '../components/preview/CodeViewer'
import ExportOptions from '../components/projects/ExportOptions'
import ProjectSettings from '../components/projects/ProjectSettings'

/**
 * Project Editor Page Component
 * Main interface for editing projects with AI chat and live preview
 */
const ProjectEditorPage = () => {
  const { projectId } = useParams()
  const navigate = useNavigate()
  
  const {
    project,
    isLoading: projectLoading,
    error: projectError,
    updateProject,
    hasUnsavedChanges
  } = useProject(projectId)

  const {
    messages,
    isGenerating,
    generationProgress,
    isConnected,
    setCurrentProject,
    loadConversationHistory
  } = useChatStore()

  const { joinProjectRoom, leaveProjectRoom } = useWebSocket()
  
  const {
    preview,
    setPreviewDevice,
    activePanel,
    setActivePanel,
    isFullscreen,
    toggleFullscreen
  } = useUIStore()

  // Local state
  const [activeView, setActiveView] = useState('split') // 'chat', 'code', 'preview', 'split'
  const [deviceMode, setDeviceMode] = useState('desktop')
  const [autoSave, setAutoSave] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [showExportOptions, setShowExportOptions] = useState(false)
  const [lastSaved, setLastSaved] = useState(null)
  const [saveStatus, setSaveStatus] = useState('saved') // 'saving', 'saved', 'error'

  // Debounced project data for auto-save
  const debouncedProject = useDebounce(project, 2000)

  // Sandpack integration
  const {
    sandbox,
    isLoading: sandpackLoading,
    error: sandpackError,
    createSandbox,
    updateFile,
    exportSandbox,
    getSharableUrl
  } = useSandpack(
    {
      htmlCode: project?.htmlCode || '',
      cssCode: project?.cssCode || '',
      jsCode: project?.jsCode || ''
    },
    {
      template: project?.template || 'vanilla',
      theme: 'dark'
    }
  )

  // Initialize project context
  useEffect(() => {
    if (project) {
      setCurrentProject(project.id)
      loadConversationHistory(project.id)
      joinProjectRoom(project.id)
    }

    return () => {
      if (project) {
        leaveProjectRoom(project.id)
      }
    }
  }, [project, setCurrentProject, loadConversationHistory, joinProjectRoom, leaveProjectRoom])

  // Auto-save functionality
  useEffect(() => {
    if (debouncedProject && autoSave && hasUnsavedChanges) {
      handleSave()
    }
  }, [debouncedProject, autoSave, hasUnsavedChanges])

  // Handle project save
  const handleSave = useCallback(async () => {
    if (!project || !hasUnsavedChanges) return

    setSaveStatus('saving')
    try {
      await updateProject(project.id, {
        htmlCode: project.htmlCode,
        cssCode: project.cssCode,
        jsCode: project.jsCode,
        lastModified: new Date().toISOString()
      })
      setLastSaved(new Date())
      setSaveStatus('saved')
    } catch (error) {
      console.error('Failed to save project:', error)
      setSaveStatus('error')
    }
  }, [project, hasUnsavedChanges, updateProject])

  // Handle code changes from preview component
  const handleCodeChange = useCallback((updates) => {
    if (!project) return

    const updatedProject = {
      ...project,
      ...updates,
      lastModified: new Date().toISOString()
    }

    updateProject(project.id, updatedProject)
  }, [project, updateProject])

  // Handle export
  const handleExport = useCallback(async () => {
    try {
      const blob = await exportSandbox()
      if (blob) {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${project?.name || 'project'}-${Date.now()}.zip`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Failed to export:', error)
    }
  }, [exportSandbox, project])

  // Handle share
  const handleShare = useCallback(async () => {
    try {
      const url = getSharableUrl()
      if (url) {
        await navigator.clipboard.writeText(url)
        // You might want to show a toast notification here
      }
    } catch (error) {
      console.error('Failed to share:', error)
    }
  }, [getSharableUrl])

  // Navigation handler
  const handleBack = useCallback(() => {
    if (hasUnsavedChanges) {
      const shouldLeave = window.confirm('You have unsaved changes. Are you sure you want to leave?')
      if (!shouldLeave) return
    }
    navigate('/projects')
  }, [hasUnsavedChanges, navigate])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyboard = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 's':
            e.preventDefault()
            handleSave()
            break
          case '1':
            e.preventDefault()
            setActiveView('chat')
            break
          case '2':
            e.preventDefault()
            setActiveView('code')
            break
          case '3':
            e.preventDefault()
            setActiveView('preview')
            break
          case '4':
            e.preventDefault()
            setActiveView('split')
            break
        }
      }
    }

    document.addEventListener('keydown', handleKeyboard)
    return () => document.removeEventListener('keydown', handleKeyboard)
  }, [handleSave])

  if (projectLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading project...</p>
        </div>
      </div>
    )
  }

  if (projectError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Failed to load project
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{projectError}</p>
          <Button onClick={() => navigate('/projects')}>
            Back to Projects
          </Button>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Project not found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The project you're looking for doesn't exist or you don't have access to it.
          </p>
          <Button onClick={() => navigate('/projects')}>
            Back to Projects
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            
            <div className="border-l border-gray-200 dark:border-gray-700 pl-4">
              <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {project.name}
              </h1>
              <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <span>Last saved: {lastSaved ? lastSaved.toLocaleTimeString() : 'Never'}</span>
                {saveStatus === 'saving' && (
                  <div className="flex items-center space-x-1">
                    <div className="animate-spin w-3 h-3 border-2 border-primary-600 border-t-transparent rounded-full"></div>
                    <span>Saving...</span>
                  </div>
                )}
                {saveStatus === 'saved' && (
                  <div className="flex items-center space-x-1 text-green-600">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Saved</span>
                  </div>
                )}
                {saveStatus === 'error' && (
                  <div className="flex items-center space-x-1 text-red-600">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Error saving</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              {[
                { key: 'chat', icon: MessageSquare, label: 'Chat' },
                { key: 'code', icon: Code, label: 'Code' },
                { key: 'preview', icon: Eye, label: 'Preview' },
                { key: 'split', icon: Maximize2, label: 'Split' }
              ].map(view => (
                <button
                  key={view.key}
                  onClick={() => setActiveView(view.key)}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    activeView === view.key
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                >
                  <view.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{view.label}</span>
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={handleSave} disabled={!hasUnsavedChanges}>
                <Save className="w-4 h-4" />
              </Button>
              
              <Button variant="ghost" size="sm" onClick={handleShare}>
                <Share className="w-4 h-4" />
              </Button>
              
              <Button variant="ghost" size="sm" onClick={() => setShowExportOptions(true)}>
                <Download className="w-4 h-4" />
              </Button>
              
              <Button variant="ghost" size="sm" onClick={() => setShowSettings(true)}>
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Panel */}
        <AnimatePresence>
          {(activeView === 'chat' || activeView === 'split') && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ 
                width: activeView === 'split' ? '400px' : '100%', 
                opacity: 1 
              }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0"
            >
              <ChatInterface
                projectId={project.id}
                onCodeGenerated={handleCodeChange}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Code/Preview Panel */}
        <div className="flex-1 flex flex-col">
          {(activeView === 'code' || activeView === 'preview' || activeView === 'split') && (
            <div className="flex-1">
              <SandpackPreviewComponent
                htmlCode={project.htmlCode}
                cssCode={project.cssCode}
                jsCode={project.jsCode}
                onCodeChange={handleCodeChange}
                showEditor={activeView === 'code' || activeView === 'split'}
                autoPreview={true}
                template={project.template}
              />
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showSettings && (
          <ProjectSettings
            project={project}
            onClose={() => setShowSettings(false)}
            onUpdate={handleCodeChange}
          />
        )}
        
        {showExportOptions && (
          <ExportOptions
            project={project}
            onClose={() => setShowExportOptions(false)}
            onExport={handleExport}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default ProjectEditorPage