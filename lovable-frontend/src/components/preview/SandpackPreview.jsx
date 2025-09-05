import React, { useState, useEffect } from 'react'
import { 
  SandpackProvider, 
  SandpackPreview,
  SandpackCodeEditor,
  SandpackConsole,
  SandpackFileExplorer
} from '@codesandbox/sandpack-react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Play, 
  Square, 
  RotateCcw, 
  Monitor, 
  Tablet, 
  Smartphone, 
  Code2, 
  Terminal, 
  FolderTree,
  ExternalLink,
  Download,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react'
import Button, { IconButton } from '../ui/Button'
import { useSandpack } from '../../hooks/useSandpack'

/**
 * Sandpack Preview Component
 * Provides real-time code preview using CodeSandbox Sandpack
 */
const SandpackPreviewComponent = ({
  htmlCode = '',
  cssCode = '',
  jsCode = '',
  onCodeChange,
  className,
  showEditor = true,
  showConsole = false,
  showFileExplorer = false,
  autoPreview = true,
  template = 'vanilla',
  theme = 'dark'
}) => {
  const {
    sandbox,
    isLoading,
    error,
    settings,
    createSandbox,
    updateFile,
    changeTemplate,
    changeTheme,
    toggleConsole,
    toggleFileExplorer,
    exportSandbox,
    getSharableUrl
  } = useSandpack({ htmlCode, cssCode, jsCode }, { template, theme })

  const [activeView, setActiveView] = useState('preview')
  const [deviceMode, setDeviceMode] = useState('desktop')
  const [isPreviewVisible, setIsPreviewVisible] = useState(true)

  // Device viewport sizes
  const deviceSizes = {
    desktop: { width: '100%', height: '100%' },
    tablet: { width: '768px', height: '1024px' },
    mobile: { width: '375px', height: '667px' }
  }

  // Update sandbox when code changes
  useEffect(() => {
    if (htmlCode && autoPreview) {
      createSandbox({ htmlCode, cssCode, jsCode })
    }
  }, [htmlCode, cssCode, jsCode, autoPreview, createSandbox])

  // Handle code changes from editor
  const handleCodeChange = (updates) => {
    if (onCodeChange) {
      onCodeChange(updates)
    }
  }

  // Export sandbox as ZIP
  const handleExport = async () => {
    try {
      const blob = await exportSandbox()
      if (blob) {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `website-${Date.now()}.zip`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Failed to export:', error)
    }
  }

  // Open in new window
  const handleOpenExternal = () => {
    const url = getSharableUrl()
    if (url) {
      window.open(url, '_blank')
    }
  }

  if (!sandbox || isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading preview...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-red-50 dark:bg-red-900/20">
        <div className="text-center text-red-600 dark:text-red-400">
          <p className="font-medium">Preview Error</p>
          <p className="text-sm mt-1">{error}</p>
          <Button 
            size="sm" 
            variant="outline" 
            className="mt-3"
            onClick={() => createSandbox({ htmlCode, cssCode, jsCode })}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex flex-col h-full bg-white dark:bg-gray-900 ${className}`}>
      {/* Header Controls */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center space-x-2">
          {/* View Toggle */}
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-md p-1">
            <button
              onClick={() => setActiveView('preview')}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                activeView === 'preview'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              <Eye className="w-4 h-4 mr-1 inline" />
              Preview
            </button>
            {showEditor && (
              <button
                onClick={() => setActiveView('code')}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  activeView === 'code'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                <Code2 className="w-4 h-4 mr-1 inline" />
                Code
              </button>
            )}
          </div>

          {/* Device Toggle (Preview Mode Only) */}
          {activeView === 'preview' && (
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-md p-1">
              {Object.entries(deviceSizes).map(([device, size]) => {
                const Icon = device === 'desktop' ? Monitor : device === 'tablet' ? Tablet : Smartphone
                return (
                  <IconButton
                    key={device}
                    icon={Icon}
                    size="sm"
                    variant={deviceMode === device ? 'secondary' : 'ghost'}
                    onClick={() => setDeviceMode(device)}
                    className="!p-1.5"
                  />
                )
              })}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <IconButton
            icon={isPreviewVisible ? EyeOff : Eye}
            size="sm"
            variant="ghost"
            onClick={() => setIsPreviewVisible(!isPreviewVisible)}
            aria-label="Toggle preview visibility"
          />

          <IconButton
            icon={FolderTree}
            size="sm"
            variant={settings.showFileExplorer ? 'secondary' : 'ghost'}
            onClick={toggleFileExplorer}
            aria-label="Toggle file explorer"
          />

          <IconButton
            icon={Terminal}
            size="sm"
            variant={settings.showConsole ? 'secondary' : 'ghost'}
            onClick={toggleConsole}
            aria-label="Toggle console"
          />

          <IconButton
            icon={Download}
            size="sm"
            variant="ghost"
            onClick={handleExport}
            aria-label="Download code"
          />

          <IconButton
            icon={ExternalLink}
            size="sm"
            variant="ghost"
            onClick={handleOpenExternal}
            aria-label="Open in new window"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <SandpackProvider
          files={sandbox.files}
          template={sandbox.template}
          theme={sandbox.theme}
          options={{
            visibleFiles: Object.keys(sandbox.files),
            activeFile: Object.keys(sandbox.files)[0],
            ...sandbox.options
          }}
        >
          {/* File Explorer */}
          <AnimatePresence>
            {settings.showFileExplorer && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 200, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
              >
                <SandpackFileExplorer />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Code Editor */}
          <AnimatePresence mode="wait">
            {activeView === 'code' && showEditor && (
              <motion.div
                key="editor"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex-1 flex flex-col"
              >
                <div className="flex-1">
                  <SandpackCodeEditor 
                    showTabs
                    showLineNumbers
                    showInlineErrors
                    wrapContent
                    closableTabs
                    onCodeUpdate={handleCodeChange}
                  />
                </div>
                
                {/* Console */}
                {settings.showConsole && (
                  <div className="h-32 border-t border-gray-200 dark:border-gray-700">
                    <SandpackConsole />
                  </div>
                )}
              </motion.div>
            )}

            {/* Preview */}
            {activeView === 'preview' && isPreviewVisible && (
              <motion.div
                key="preview"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="flex-1 flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4"
              >
                <div 
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700"
                  style={{
                    width: deviceSizes[deviceMode].width,
                    height: deviceSizes[deviceMode].height,
                    maxWidth: '100%',
                    maxHeight: '100%'
                  }}
                >
                  <SandpackPreview
                    showOpenInCodeSandbox={false}
                    showRefreshButton
                    showRestartButton
                    actionsChildren={
                      <div className="flex items-center space-x-1 px-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {deviceMode}
                        </span>
                      </div>
                    }
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Split View (Code + Preview) */}
          {activeView === 'split' && (
            <div className="flex-1 flex">
              <div className="w-1/2 border-r border-gray-200 dark:border-gray-700">
                <SandpackCodeEditor 
                  showTabs
                  showLineNumbers
                  showInlineErrors
                  wrapContent
                  onCodeUpdate={handleCodeChange}
                />
              </div>
              <div className="w-1/2 bg-gray-100 dark:bg-gray-900">
                <SandpackPreview
                  showOpenInCodeSandbox={false}
                  showRefreshButton
                />
              </div>
            </div>
          )}
        </SandpackProvider>
      </div>
    </div>
  )
}

export default SandpackPreviewComponent