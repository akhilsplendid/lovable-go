import  { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  RefreshCw, 
  ExternalLink,  
  Maximize2, 
  Minimize2,
  AlertTriangle,
  Monitor,
  Tablet,
  Smartphone
} from 'lucide-react'
import { IconButton } from '../ui/Button'
import SandpackPreviewComponent from './SandpackPreview'

/**
 * Preview Frame Component
 * Wrapper for the Sandpack preview with additional controls
 */
const PreviewFrame = ({
  htmlCode,
  cssCode,
  jsCode,
  projectId,
  isLoading = false,
  error = null,
  onRefresh,
  onExternalOpen,
  className,
  showControls = true,
  autoRefresh = true
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [device, setDevice] = useState('desktop')
  const [refreshKey, setRefreshKey] = useState(0)
  const iframeRef = useRef(null)

  // Device configurations
  const devices = {
    desktop: {
      name: 'Desktop',
      icon: Monitor,
      width: '100%',
      height: '100%',
      className: 'w-full h-full'
    },
    tablet: {
      name: 'Tablet',
      icon: Tablet,
      width: '768px',
      height: '1024px',
      className: 'w-96 h-[600px] mx-auto'
    },
    mobile: {
      name: 'Mobile',
      icon: Smartphone,
      width: '375px',
      height: '667px',
      className: 'w-80 h-[500px] mx-auto'
    }
  }

  // Handle refresh
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
    if (onRefresh) {
      onRefresh()
    }
  }

  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    setIsFullscreen(prev => !prev)
  }

  // Handle external open
  const handleExternalOpen = () => {
    if (onExternalOpen) {
      onExternalOpen()
    }
  }

  // Generate blob URL for preview
  const generatePreviewContent = () => {
    if (!htmlCode) return null

    let fullHTML = htmlCode

    // Inject CSS if provided separately
    if (cssCode && !htmlCode.includes('<style>')) {
      const headEndIndex = fullHTML.indexOf('</head>')
      if (headEndIndex !== -1) {
        fullHTML = fullHTML.slice(0, headEndIndex) + 
          `<style>${cssCode}</style>` + 
          fullHTML.slice(headEndIndex)
      }
    }

    // Inject JS if provided separately
    if (jsCode && !htmlCode.includes('<script>')) {
      const bodyEndIndex = fullHTML.lastIndexOf('</body>')
      if (bodyEndIndex !== -1) {
        fullHTML = fullHTML.slice(0, bodyEndIndex) + 
          `<script>${jsCode}</script>` + 
          fullHTML.slice(bodyEndIndex)
      }
    }

    return fullHTML
  }

  const previewContent = generatePreviewContent()

  // Error state
  if (error) {
    return (
      <div className={`preview-container ${className}`}>
        {showControls && (
          <div className="preview-header">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-error-500" />
              <span className="text-sm font-medium text-error-700 dark:text-error-300">
                Preview Error
              </span>
            </div>
            <IconButton
              icon={RefreshCw}
              size="sm"
              variant="ghost"
              onClick={handleRefresh}
              aria-label="Refresh preview"
            />
          </div>
        )}
        <div className="flex-1 flex items-center justify-center bg-error-50 dark:bg-error-900/20">
          <div className="text-center text-error-600 dark:text-error-400">
            <AlertTriangle className="w-12 h-12 mx-auto mb-3" />
            <p className="font-medium mb-1">Failed to load preview</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <div className={`preview-container ${className}`}>
        {showControls && (
          <div className="preview-header">
            <div className="flex items-center space-x-2">
              <div className="loading-spinner w-4 h-4"></div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Loading Preview...
              </span>
            </div>
          </div>
        )}
        <div className="preview-loading">
          <div className="loading-spinner w-8 h-8"></div>
        </div>
      </div>
    )
  }

  return (
    <motion.div 
      className={`preview-container ${isFullscreen ? 'fixed inset-0 z-50 bg-white dark:bg-gray-900' : ''} ${className}`}
      layout
    >
      {/* Controls Header */}
      {showControls && (
        <div className="preview-header">
          <div className="flex items-center space-x-2">
            {/* Device Selector */}
            <div className="preview-device-selector">
              {Object.entries(devices).map(([key, config]) => {
                const Icon = config.icon
                return (
                  <button
                    key={key}
                    onClick={() => setDevice(key)}
                    className={`preview-device-button ${device === key ? 'active' : ''}`}
                    title={config.name}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                )
              })}
            </div>

            <div className="text-xs text-gray-500 dark:text-gray-400">
              {devices[device].name}
            </div>
          </div>

          <div className="preview-controls">
            <IconButton
              icon={RefreshCw}
              size="sm"
              variant="ghost"
              onClick={handleRefresh}
              aria-label="Refresh preview"
              className={refreshKey > 0 ? 'animate-spin' : ''}
            />

            <IconButton
              icon={ExternalLink}
              size="sm"
              variant="ghost"
              onClick={handleExternalOpen}
              aria-label="Open in new window"
            />

            <IconButton
              icon={isFullscreen ? Minimize2 : Maximize2}
              size="sm"
              variant="ghost"
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            />
          </div>
        </div>
      )}

      {/* Preview Content */}
      <div className="flex-1 flex items-center justify-center p-4 bg-gray-100 dark:bg-gray-900">
        <div 
          className={`${devices[device].className} transition-all duration-300`}
          style={{
            maxWidth: '100%',
            maxHeight: '100%'
          }}
        >
          {previewContent ? (
            <SandpackPreviewComponent
              key={refreshKey}
              htmlCode={htmlCode}
              cssCode={cssCode}
              jsCode={jsCode}
              showEditor={false}
              showConsole={false}
              showFileExplorer={false}
              autoPreview={autoRefresh}
              className="w-full h-full rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-lg"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <Monitor className="w-12 h-12 mx-auto mb-3" />
                <p className="font-medium mb-1">No content to preview</p>
                <p className="text-sm">Start a conversation with AI to generate your website</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default PreviewFrame