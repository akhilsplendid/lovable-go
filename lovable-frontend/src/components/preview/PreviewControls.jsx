import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Monitor, 
  Tablet, 
  Smartphone, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  Grid3X3,
  Ruler,
  Settings,
  Maximize,
  Minimize
} from 'lucide-react'
import Button, { IconButton, ButtonGroup } from '../ui/Button'
import { useUIStore } from '../../store/uiStore'

/**
 * PreviewControls Component
 * Provides controls for preview customization (device, zoom, etc.)
 */
export const PreviewControls = ({ 
  className = '',
  compact = false,
  showDeviceControls = true,
  showZoomControls = true,
  showViewControls = true,
  onDeviceChange,
  onZoomChange,
  onToggleResponsive,
  onToggleGrid,
  onToggleRulers
}) => {
  const { 
    preview: previewSettings, 
    updatePreviewSettings,
    setPreviewDevice,
    setPreviewZoom,
    toggleResponsiveMode
  } = useUIStore()
  
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Device options
  const devices = [
    { id: 'desktop', name: 'Desktop', icon: Monitor, width: '100%', height: '100%' },
    { id: 'tablet', name: 'Tablet', icon: Tablet, width: '768px', height: '1024px' },
    { id: 'mobile', name: 'Mobile', icon: Smartphone, width: '375px', height: '667px' }
  ]

  // Zoom presets
  const zoomLevels = [25, 50, 75, 100, 125, 150, 200]

  /**
   * Handle device selection
   */
  const handleDeviceSelect = (deviceId) => {
    setPreviewDevice(deviceId)
    onDeviceChange?.(deviceId)
  }

  /**
   * Handle zoom change
   */
  const handleZoomChange = (newZoom) => {
    const clampedZoom = Math.max(25, Math.min(200, newZoom))
    setPreviewZoom(clampedZoom)
    onZoomChange?.(clampedZoom)
  }

  /**
   * Handle zoom in/out
   */
  const handleZoomIn = () => {
    const currentIndex = zoomLevels.indexOf(previewSettings.zoom)
    const nextIndex = Math.min(currentIndex + 1, zoomLevels.length - 1)
    handleZoomChange(zoomLevels[nextIndex])
  }

  const handleZoomOut = () => {
    const currentIndex = zoomLevels.indexOf(previewSettings.zoom)
    const nextIndex = Math.max(currentIndex - 1, 0)
    handleZoomChange(zoomLevels[nextIndex])
  }

  /**
   * Reset zoom to 100%
   */
  const resetZoom = () => {
    handleZoomChange(100)
  }

  /**
   * Toggle responsive mode
   */
  const handleToggleResponsive = () => {
    toggleResponsiveMode()
    onToggleResponsive?.(!previewSettings.responsive)
  }

  /**
   * Toggle grid overlay
   */
  const handleToggleGrid = () => {
    const newValue = !previewSettings.showGrid
    updatePreviewSettings({ showGrid: newValue })
    onToggleGrid?.(newValue)
  }

  /**
   * Toggle rulers
   */
  const handleToggleRulers = () => {
    const newValue = !previewSettings.showRulers
    updatePreviewSettings({ showRulers: newValue })
    onToggleRulers?.(newValue)
  }

  if (compact) {
    return (
      <div className={`flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 ${className}`}>
        {/* Device selector */}
        {showDeviceControls && (
          <ButtonGroup orientation="horizontal">
            {devices.map(device => {
              const Icon = device.icon
              return (
                <IconButton
                  key={device.id}
                  icon={Icon}
                  size="sm"
                  variant={previewSettings.device === device.id ? 'primary' : 'outline'}
                  onClick={() => handleDeviceSelect(device.id)}
                  aria-label={`Switch to ${device.name} view`}
                />
              )
            })}
          </ButtonGroup>
        )}

        {/* Zoom controls */}
        {showZoomControls && (
          <div className="flex items-center space-x-1">
            <IconButton
              icon={ZoomOut}
              size="sm"
              variant="ghost"
              onClick={handleZoomOut}
              disabled={previewSettings.zoom <= 25}
              aria-label="Zoom out"
            />
            
            <button
              onClick={resetZoom}
              className="px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 min-w-[3rem] text-center"
            >
              {previewSettings.zoom}%
            </button>
            
            <IconButton
              icon={ZoomIn}
              size="sm"
              variant="ghost"
              onClick={handleZoomIn}
              disabled={previewSettings.zoom >= 200}
              aria-label="Zoom in"
            />
          </div>
        )}

        {/* View controls */}
        {showViewControls && (
          <div className="flex items-center space-x-1">
            <IconButton
              icon={Grid3X3}
              size="sm"
              variant={previewSettings.showGrid ? 'primary' : 'ghost'}
              onClick={handleToggleGrid}
              aria-label="Toggle grid"
            />
          </div>
        )}
      </div>
    )
  }

  return (
    <motion.div 
      className={`preview-controls bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 ${className}`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center justify-between p-4">
        {/* Left side - Device and view controls */}
        <div className="flex items-center space-x-4">
          {/* Device selector */}
          {showDeviceControls && (
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Device:
              </span>
              <ButtonGroup orientation="horizontal">
                {devices.map(device => {
                  const Icon = device.icon
                  return (
                    <Button
                      key={device.id}
                      variant={previewSettings.device === device.id ? 'primary' : 'outline'}
                      size="sm"
                      leftIcon={Icon}
                      onClick={() => handleDeviceSelect(device.id)}
                      className="px-3"
                    >
                      {device.name}
                    </Button>
                  )
                })}
              </ButtonGroup>
            </div>
          )}

          {/* Responsive toggle */}
          <Button
            variant={previewSettings.responsive ? 'primary' : 'ghost'}
            size="sm"
            leftIcon={previewSettings.responsive ? Minimize : Maximize}
            onClick={handleToggleResponsive}
          >
            Responsive
          </Button>
        </div>

        {/* Right side - Zoom and view options */}
        <div className="flex items-center space-x-4">
          {/* Zoom controls */}
          {showZoomControls && (
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Zoom:
              </span>
              
              <div className="flex items-center space-x-1">
                <IconButton
                  icon={ZoomOut}
                  size="sm"
                  variant="ghost"
                  onClick={handleZoomOut}
                  disabled={previewSettings.zoom <= 25}
                  aria-label="Zoom out"
                />
                
                <div className="flex items-center space-x-1">
                  <input
                    type="range"
                    min="25"
                    max="200"
                    step="25"
                    value={previewSettings.zoom}
                    onChange={(e) => handleZoomChange(parseInt(e.target.value))}
                    className="w-20 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                  />
                  
                  <button
                    onClick={resetZoom}
                    className="px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 min-w-[3rem] text-center rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {previewSettings.zoom}%
                  </button>
                </div>
                
                <IconButton
                  icon={ZoomIn}
                  size="sm"
                  variant="ghost"
                  onClick={handleZoomIn}
                  disabled={previewSettings.zoom >= 200}
                  aria-label="Zoom in"
                />
                
                <IconButton
                  icon={RotateCcw}
                  size="sm"
                  variant="ghost"
                  onClick={resetZoom}
                  aria-label="Reset zoom"
                />
              </div>
            </div>
          )}

          {/* View options */}
          {showViewControls && (
            <div className="flex items-center space-x-1">
              <IconButton
                icon={Grid3X3}
                size="sm"
                variant={previewSettings.showGrid ? 'primary' : 'ghost'}
                onClick={handleToggleGrid}
                aria-label="Toggle grid overlay"
                title="Show/hide grid overlay"
              />
              
              <IconButton
                icon={Ruler}
                size="sm"
                variant={previewSettings.showRulers ? 'primary' : 'ghost'}
                onClick={handleToggleRulers}
                aria-label="Toggle rulers"
                title="Show/hide rulers"
              />
              
              <IconButton
                icon={Settings}
                size="sm"
                variant={showAdvanced ? 'primary' : 'ghost'}
                onClick={() => setShowAdvanced(!showAdvanced)}
                aria-label="Advanced settings"
                title="Advanced preview settings"
              />
            </div>
          )}
        </div>
      </div>

      {/* Advanced settings panel */}
      {showAdvanced && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Custom zoom input */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Custom Zoom
              </label>
              <div className="flex items-center space-x-1">
                <input
                  type="number"
                  min="25"
                  max="200"
                  value={previewSettings.zoom}
                  onChange={(e) => handleZoomChange(parseInt(e.target.value))}
                  className="w-16 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                />
                <span className="text-xs text-gray-500">%</span>
              </div>
            </div>

            {/* Device info */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Dimensions
              </label>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {devices.find(d => d.id === previewSettings.device)?.width} × {devices.find(d => d.id === previewSettings.device)?.height}
              </div>
            </div>

            {/* Grid options */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Grid Size
              </label>
              <select
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                defaultValue="20"
              >
                <option value="10">10px</option>
                <option value="20">20px</option>
                <option value="50">50px</option>
              </select>
            </div>

            {/* Background */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Background
              </label>
              <select
                className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                defaultValue="white"
              >
                <option value="white">White</option>
                <option value="gray">Gray</option>
                <option value="transparent">Transparent</option>
                <option value="pattern">Pattern</option>
              </select>
            </div>
          </div>
        </motion.div>
      )}

      {/* Device info bar */}
      <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>
          Preview: {devices.find(d => d.id === previewSettings.device)?.name} 
          {previewSettings.zoom !== 100 && ` (${previewSettings.zoom}%)`}
          {previewSettings.responsive && ' - Responsive'}
        </span>
        
        <div className="flex items-center space-x-3">
          {previewSettings.showGrid && (
            <span className="flex items-center">
              <Grid3X3 className="w-3 h-3 mr-1" />
              Grid
            </span>
          )}
          {previewSettings.showRulers && (
            <span className="flex items-center">
              <Ruler className="w-3 h-3 mr-1" />
              Rulers
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default PreviewControls