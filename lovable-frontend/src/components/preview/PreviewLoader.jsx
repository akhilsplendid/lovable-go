import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Loader2, 
  Code2, 
  Palette, 
  Braces, 
  Globe, 
  Sparkles,
  Zap,
  Cpu
} from 'lucide-react'

/**
 * PreviewLoader Component
 * Shows loading states for preview generation with animated progress
 */
export const PreviewLoader = ({ 
  message = 'Loading preview...', 
  progress = null,
  stage = '',
  showSteps = true,
  variant = 'default',
  className = ''
}) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [dots, setDots] = useState('')

  // Loading steps for preview creation
  const steps = [
    { icon: Code2, label: 'Processing HTML', color: 'text-blue-500', description: 'Parsing and validating markup' },
    { icon: Palette, label: 'Applying Styles', color: 'text-purple-500', description: 'Rendering CSS and layouts' },
    { icon: Braces, label: 'Running Scripts', color: 'text-yellow-500', description: 'Executing JavaScript code' },
    { icon: Globe, label: 'Creating Preview', color: 'text-green-500', description: 'Setting up sandbox environment' }
  ]

  // Animate loading dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === '...') return ''
        return prev + '.'
      })
    }, 500)

    return () => clearInterval(interval)
  }, [])

  // Auto-advance steps based on progress
  useEffect(() => {
    if (progress !== null) {
      const stepIndex = Math.floor((progress / 100) * steps.length)
      setCurrentStep(Math.min(stepIndex, steps.length - 1))
    }
  }, [progress, steps.length])

  // Auto-advance steps without progress (for demo/loading effect)
  useEffect(() => {
    if (progress === null && showSteps) {
      const interval = setInterval(() => {
        setCurrentStep(prev => (prev + 1) % steps.length)
      }, 1500)

      return () => clearInterval(interval)
    }
  }, [progress, showSteps, steps.length])

  const currentStepData = steps[currentStep]

  return (
    <div className={`flex flex-col items-center justify-center space-y-6 p-8 ${className}`}>
      {/* Main loading animation */}
      <div className="relative">
        {variant === 'minimal' ? (
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        ) : (
          <div className="relative">
            {/* Outer ring */}
            <div className="w-24 h-24 rounded-full border-4 border-gray-200 dark:border-gray-700"></div>
            
            {/* Progress ring */}
            {progress !== null && (
              <div 
                className="absolute top-0 left-0 w-24 h-24 rounded-full border-4 border-primary-500 border-t-transparent animate-pulse"
                style={{
                  transform: `rotate(${(progress / 100) * 360}deg)`,
                  transition: 'transform 0.5s ease-in-out'
                }}
              ></div>
            )}
            
            {/* Center icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              {currentStepData && (
                <motion.div
                  key={currentStep}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 180 }}
                  transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
                >
                  <currentStepData.icon className={`w-8 h-8 ${currentStepData.color}`} />
                </motion.div>
              )}
            </div>
          </div>
        )}
        
        {/* Floating particles */}
        <div className="absolute -inset-4">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-primary-400 rounded-full"
              animate={{
                x: [0, Math.cos(i * 60) * 40, 0],
                y: [0, Math.sin(i * 60) * 40, 0],
                opacity: [0.3, 1, 0.3],
                scale: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.5,
                ease: 'easeInOut'
              }}
              style={{
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)'
              }}
            />
          ))}
        </div>
      </div>

      {/* Progress percentage */}
      {progress !== null && (
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {Math.round(progress)}%
          </div>
        </div>
      )}

      {/* Message */}
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          {message}{dots}
        </h3>
        
        {stage && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {stage}
          </p>
        )}
      </div>

      {/* Steps indicator */}
      {showSteps && (
        <div className="space-y-3 w-full max-w-sm">
          {steps.map((step, index) => {
            const isActive = index === currentStep
            const isCompleted = progress !== null ? (progress / 100) * steps.length > index : index < currentStep
            
            return (
              <motion.div
                key={index}
                className={`flex items-center space-x-3 p-2 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800' 
                    : 'bg-gray-50 dark:bg-gray-800/50'
                }`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className={`flex-shrink-0 p-1.5 rounded-full ${
                  isCompleted
                    ? 'bg-green-100 dark:bg-green-900/20 text-green-600'
                    : isActive
                    ? `bg-primary-100 dark:bg-primary-900/20 ${step.color}`
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-400'
                }`}>
                  <step.icon className="w-4 h-4" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${
                    isActive ? step.color : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    {step.label}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {step.description}
                  </p>
                </div>
                
                {isActive && (
                  <motion.div
                    className="flex-shrink-0"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <Loader2 className="w-4 h-4 text-primary-500" />
                  </motion.div>
                )}
                
                {isCompleted && !isActive && (
                  <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full"></div>
                )}
              </motion.div>
            )
          })}
        </div>
      )}
      
      {/* Additional info */}
      <div className="text-xs text-gray-500 dark:text-gray-400 text-center max-w-xs">
        {variant === 'default' && 'Setting up your preview environment...'}
      </div>
    </div>
  )
}

/**
 * Loading Skeleton Component
 */
export const LoadingSkeleton = ({ className = '' }) => (
  <div className={`animate-pulse space-y-4 p-4 ${className}`}>
    {/* Header skeleton */}
    <div className="flex justify-between items-center">
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
    </div>

    {/* Content skeleton */}
    <div className="space-y-2">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
    </div>

    {/* Image skeleton */}
    <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded"></div>

    {/* Footer skeleton */}
    <div className="flex justify-between items-center">
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
    </div>
  </div>
)

/**
 * Progress Ring Component
 */
export const ProgressRing = ({ progress = 0, size = 120, strokeWidth = 8, className = '' }) => {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDasharray = `${circumference} ${circumference}`
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <svg
        className="transform -rotate-90"
        width={size}
        height={size}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-gray-200 dark:text-gray-700"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="text-primary-600"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.5 }}
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          {Math.round(progress)}%
        </span>
      </div>
    </div>
  )
}

export default PreviewLoader