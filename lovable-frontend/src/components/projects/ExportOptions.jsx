import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Download,
  FileText,
  Archive,
  Code,
  Globe,
  Settings,
  CheckCircle,
  AlertCircle,
  X,
  Folder,
  Image,
  Smartphone,
  Monitor,
  Tablet
} from 'lucide-react'
import Button from '../ui/Button'
import Modal from '../ui/Modal'
import { projectService } from '../../services/projects'
import { useProjects } from '../../hooks/useProjects'
import toast from 'react-hot-toast'

// Export format options
const EXPORT_FORMATS = [
  {
    id: 'html',
    name: 'HTML File',
    description: 'Single HTML file with embedded CSS and JavaScript',
    icon: FileText,
    color: 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300',
    fileExtension: '.html',
    recommended: false
  },
  {
    id: 'zip',
    name: 'ZIP Package',
    description: 'Complete website package with organized files',
    icon: Archive,
    color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300',
    fileExtension: '.zip',
    recommended: true
  },
  {
    id: 'source',
    name: 'Source Code',
    description: 'Separate HTML, CSS, and JavaScript files',
    icon: Code,
    color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300',
    fileExtension: '.zip',
    recommended: false
  }
]

// Export options
const EXPORT_OPTIONS = {
  minify: {
    id: 'minify',
    name: 'Minify Code',
    description: 'Compress HTML, CSS, and JavaScript for smaller file size',
    default: false
  },
  includeAssets: {
    id: 'includeAssets',
    name: 'Include Assets',
    description: 'Include images, fonts, and other assets in the export',
    default: true
  },
  responsive: {
    id: 'responsive',
    name: 'Responsive Preview',
    description: 'Include mobile-responsive meta tags and CSS',
    default: true
  },
  documentation: {
    id: 'documentation',
    name: 'Include Documentation',
    description: 'Add README file with project information and setup instructions',
    default: true
  },
  analytics: {
    id: 'analytics',
    name: 'Analytics Code',
    description: 'Include placeholder for Google Analytics or other tracking',
    default: false
  }
}

/**
 * Export Options Component
 * Comprehensive export dialog with format selection and customization options
 */
const ExportOptions = ({ 
  isOpen, 
  onClose, 
  projectIds = [], 
  projectId = null,
  onSuccess 
}) => {
  const [selectedFormat, setSelectedFormat] = useState('zip')
  const [exportOptions, setExportOptions] = useState({
    minify: false,
    includeAssets: true,
    responsive: true,
    documentation: true,
    analytics: false
  })
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [exportStatus, setExportStatus] = useState('idle') // idle, preparing, exporting, complete, error
  const [previewSettings, setPreviewSettings] = useState({
    showDesktop: true,
    showTablet: true,
    showMobile: true
  })

  const { exportProjects } = useProjects()

  // Determine if we're exporting single or multiple projects
  const isBatchExport = projectIds.length > 1 || (projectIds.length === 1 && !projectId)
  const exportingProjectIds = projectId ? [projectId] : projectIds
  const projectCount = exportingProjectIds.length

  const handleOptionToggle = (optionId) => {
    setExportOptions(prev => ({
      ...prev,
      [optionId]: !prev[optionId]
    }))
  }

  const handlePreviewToggle = (device) => {
    setPreviewSettings(prev => ({
      ...prev,
      [device]: !prev[device]
    }))
  }

  const handleExport = async () => {
    if (exportingProjectIds.length === 0) {
      toast.error('No projects selected for export')
      return
    }

    setIsExporting(true)
    setExportStatus('preparing')
    setExportProgress(0)

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setExportProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      setExportStatus('exporting')

      let result
      if (selectedFormat === 'html') {
        if (isBatchExport) {
          // For batch HTML export, we'll export as ZIP with HTML files
          result = await projectService.exportBatch(
            exportingProjectIds, 
            exportOptions.includeAssets
          )
        } else {
          result = await projectService.exportHTML(
            exportingProjectIds[0], 
            exportOptions.minify
          )
        }
      } else {
        // ZIP or Source export
        if (isBatchExport) {
          result = await projectService.exportBatch(
            exportingProjectIds,
            exportOptions.includeAssets
          )
        } else {
          result = await projectService.exportZIP(
            exportingProjectIds[0],
            exportOptions.includeAssets
          )
        }
      }

      clearInterval(progressInterval)
      setExportProgress(100)
      setExportStatus('complete')

      // Trigger download
      if (result instanceof Blob) {
        const url = window.URL.createObjectURL(result)
        const a = document.createElement('a')
        a.href = url
        
        const format = EXPORT_FORMATS.find(f => f.id === selectedFormat)
        const timestamp = new Date().toISOString().slice(0, 10)
        const filename = isBatchExport 
          ? `projects-${timestamp}${format.fileExtension}`
          : `project-${timestamp}${format.fileExtension}`
        
        a.download = filename
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }

      toast.success(`${projectCount === 1 ? 'Project' : 'Projects'} exported successfully!`)
      onSuccess?.()
      
      // Auto-close after success
      setTimeout(() => {
        onClose()
      }, 1500)

    } catch (error) {
      console.error('Export failed:', error)
      setExportStatus('error')
      toast.error('Export failed. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  const handleReset = () => {
    setExportStatus('idle')
    setExportProgress(0)
    setSelectedFormat('zip')
    setExportOptions({
      minify: false,
      includeAssets: true,
      responsive: true,
      documentation: true,
      analytics: false
    })
  }

  const selectedFormatInfo = EXPORT_FORMATS.find(f => f.id === selectedFormat)

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="2xl">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg mr-3">
              <Download className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Export {isBatchExport ? 'Projects' : 'Project'}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {projectCount === 1 ? '1 project' : `${projectCount} projects`} selected for export
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {exportStatus === 'idle' && (
          <>
            {/* Format Selection */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Export Format
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {EXPORT_FORMATS.map((format) => {
                  const IconComponent = format.icon
                  return (
                    <div
                      key={format.id}
                      className={`
                        relative p-4 border-2 rounded-xl cursor-pointer transition-all hover:border-primary-300
                        ${selectedFormat === format.id 
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                          : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }
                      `}
                      onClick={() => setSelectedFormat(format.id)}
                    >
                      {format.recommended && (
                        <div className="absolute -top-2 -right-2">
                          <span className="bg-primary-600 text-white text-xs px-2 py-1 rounded-full">
                            Recommended
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${format.color}`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {format.name}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {format.description}
                          </p>
                        </div>
                        {selectedFormat === format.id && (
                          <CheckCircle className="w-5 h-5 text-primary-600" />
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Export Options */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Export Options
              </h3>
              <div className="space-y-3">
                {Object.values(EXPORT_OPTIONS).map((option) => (
                  <div
                    key={option.id}
                    className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <input
                      type="checkbox"
                      id={option.id}
                      checked={exportOptions[option.id]}
                      onChange={() => handleOptionToggle(option.id)}
                      className="w-4 h-4 mt-1 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <div className="flex-1">
                      <label
                        htmlFor={option.id}
                        className="font-medium text-gray-900 dark:text-white cursor-pointer"
                      >
                        {option.name}
                      </label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {option.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Preview Settings */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Include Device Previews
              </h3>
              <div className="flex space-x-4">
                {[
                  { key: 'showDesktop', label: 'Desktop', icon: Monitor },
                  { key: 'showTablet', label: 'Tablet', icon: Tablet },
                  { key: 'showMobile', label: 'Mobile', icon: Smartphone }
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => handlePreviewToggle(key)}
                    className={`
                      flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all
                      ${previewSettings[key]
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                        : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                Export Summary
              </h4>
              <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <p>Format: {selectedFormatInfo?.name}</p>
                <p>Projects: {projectCount}</p>
                <p>
                  Options: {Object.entries(exportOptions)
                    .filter(([_, enabled]) => enabled)
                    .map(([key]) => EXPORT_OPTIONS[key]?.name)
                    .join(', ') || 'None'
                  }
                </p>
              </div>
            </div>
          </>
        )}

        {/* Export Progress */}
        {(exportStatus === 'preparing' || exportStatus === 'exporting') && (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full mb-4">
              <Download className="w-8 h-8 text-primary-600 dark:text-primary-400 animate-bounce" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {exportStatus === 'preparing' ? 'Preparing Export...' : 'Exporting Projects...'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Please wait while we prepare your {selectedFormatInfo?.name.toLowerCase()}
            </p>
            
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
              <motion.div
                className="bg-primary-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${exportProgress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <p className="text-sm text-gray-500">{exportProgress}% complete</p>
          </div>
        )}

        {/* Success State */}
        {exportStatus === 'complete' && (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full mb-4">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Export Complete!
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Your {projectCount === 1 ? 'project has' : 'projects have'} been exported successfully.
              The download should start automatically.
            </p>
          </div>
        )}

        {/* Error State */}
        {exportStatus === 'error' && (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full mb-4">
              <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Export Failed
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Something went wrong during the export process.
            </p>
            <Button onClick={handleReset} variant="outline">
              Try Again
            </Button>
          </div>
        )}

        {/* Action Buttons */}
        {exportStatus === 'idle' && (
          <div className="flex justify-between">
            <Button
              variant="ghost"
              onClick={onClose}
            >
              Cancel
            </Button>
            
            <Button
              onClick={handleExport}
              loading={isExporting}
              loadingText="Exporting..."
              leftIcon={Download}
            >
              Export {projectCount === 1 ? 'Project' : `${projectCount} Projects`}
            </Button>
          </div>
        )}
      </div>
    </Modal>
  )
}

export default ExportOptions