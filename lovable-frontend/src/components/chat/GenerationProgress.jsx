import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Zap, 
  Code, 
  Palette, 
  Smartphone, 
  CheckCircle, 
  AlertCircle,
  X,
  Loader2
} from 'lucide-react'

import { useChatStore } from '../../store/chatStore'
import { IconButton } from '../ui/Button'

/**
 * Generation Progress Component
 * Shows real-time progress of AI website generation
 */
const GenerationProgress = ({ 
  onCancel,
  showDetails = true,
  className = ''
}) => {
  const { 
    generationProgress, 
    generationStage, 
    isGenerating,
    error
  } = useChatStore()
  
  const [estimatedTime, setEstimatedTime] = useState(30)
  const [elapsedTime, setElapsedTime] = useState(0)

  // Timer for elapsed time
  useEffect(() => {
    if (!isGenerating) {
      setElapsedTime(0)
      return
    }

    const timer = setInterval(() => {
      setElapsedTime(prev => prev + 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [isGenerating])

  // Update estimated time based on progress
  useEffect(() => {
    if (generationProgress > 0) {
      const timePerPercent = elapsedTime / generationProgress
      const remainingProgress = 100 - generationProgress
      const estimated = Math.max(5, Math.round(timePerPercent * remainingProgress))
      setEstimatedTime(estimated)
    }
  }, [generationProgress, elapsedTime])

  // Generation stages configuration
  const stages = [
    {
      key: 'initializing',
      label: 'Analyzing request',
      icon: Zap,
      color: 'text-blue-500',
      description: 'Understanding your requirements'
    },
    {
      key: 'generating',
      label: 'Creating structure',
      icon: Code,
      color: 'text-purple-500',
      description: 'Building the website foundation'
    },
    {
      key: 'styling',
      label: 'Applying design',
      icon: Palette,
      color: 'text-pink-500',
      description: 'Adding colors and typography'
    },
    {
      key: 'responsive',
      label: 'Making responsive',
      icon: Smartphone,
      color: 'text-green-500',
      description: 'Optimizing for all devices'
    },
    {
      key: 'finalizing',
      label: 'Final touches',
      icon: CheckCircle,
      color: 'text-emerald-500',
      description: 'Polishing and optimizing'
    }
  ]

  const currentStageIndex = stages.findIndex(stage => stage.key === generationStage)
  const currentStage = stages[currentStageIndex] || stages[0]

  // Format time
  const formatTime = (seconds) => {
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  if (!isGenerating && !error) return null

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className={`bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 border-b border-primary-200 dark:border-primary-800 ${className}`}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <motion.div
              animate={{ 
                rotate: 360,
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                scale: { duration: 1.5, repeat: Infinity }
              }}
              className="p-2 bg-primary-100 dark:bg-primary-900/40 rounded-full"
            >
              <Zap className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </motion.div>
            
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                Generating Your Website
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {currentStage.description}
              </p>
            </div>
          </div>

          {onCancel && (
            <IconButton
              icon={X}
              size="sm"
              variant="ghost"
              onClick={onCancel}
              aria-label="Cancel generation"
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            />
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Progress
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {Math.round(generationProgress)}%
            </span>
          </div>
          
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${generationProgress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-primary-500 to-blue-500 rounded-full relative"
            >
              {/* Animated shine effect */}
              <motion.div
                animate={{ x: [-100, 200] }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity,
                  ease: "linear"
                }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                style={{ width: '100px' }}
              />
            </motion.div>
          </div>
        </div>

        {/* Stage Indicators */}
        {showDetails && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {stages.map((stage, index) => {
                const isActive = index === currentStageIndex
                const isCompleted = index < currentStageIndex
                const Icon = stage.icon

                return (
                  <motion.div
                    key={stage.key}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-center space-x-2 p-2 rounded-lg transition-all ${
                      isActive 
                        ? 'bg-white dark:bg-gray-800 shadow-sm ring-2 ring-primary-200 dark:ring-primary-800' 
                        : isCompleted
                        ? 'bg-green-50 dark:bg-green-900/20'
                        : 'bg-gray-50 dark:bg-gray-800/50'
                    }`}
                  >
                    <div className={`flex-shrink-0 ${isActive ? 'animate-pulse' : ''}`}>
                      {isCompleted ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : isActive ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        >
                          <Icon className={`w-4 h-4 ${stage.color}`} />
                        </motion.div>
                      ) : (
                        <Icon className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                    
                    <span className={`text-sm font-medium ${
                      isActive 
                        ? 'text-gray-900 dark:text-gray-100' 
                        : isCompleted
                        ? 'text-green-700 dark:text-green-300'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {stage.label}
                    </span>
                  </motion.div>
                )
              })}
            </div>
          </div>
        )}

        {/* Time and Stats */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-primary-200 dark:border-primary-800">
          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center space-x-1">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Elapsed: {formatTime(elapsedTime)}</span>
            </div>
            
            {generationProgress > 0 && (
              <div className="flex items-center space-x-1">
                <span>~{formatTime(estimatedTime)} remaining</span>
              </div>
            )}
          </div>

          {/* Current stage indicator */}
          <div className="flex items-center space-x-2">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-2 h-2 bg-primary-500 rounded-full"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {currentStage.label}
            </span>
          </div>
        </div>
      </div>

      {/* Error State */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 pb-4"
          >
            <div className="bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-error-500" />
                <span className="text-sm font-medium text-error-700 dark:text-error-300">
                  Generation failed
                </span>
              </div>
              <p className="text-sm text-error-600 dark:text-error-400 mt-1">
                {error}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/**
 * Simplified Progress Bar Component
 */
export const SimpleProgressBar = ({ 
  progress = 0, 
  showPercentage = true,
  color = 'primary',
  size = 'md',
  className = ''
}) => {
  const colors = {
    primary: 'bg-primary-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500'
  }

  const sizes = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  }

  return (
    <div className={className}>
      {showPercentage && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Progress
          </span>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {Math.round(progress)}%
          </span>
        </div>
      )}
      
      <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden ${sizes[size]}`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={`${sizes[size]} ${colors[color]} rounded-full`}
        />
      </div>
    </div>
  )
}

export default GenerationProgress