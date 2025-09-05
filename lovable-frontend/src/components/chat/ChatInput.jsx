import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, 
  Plus, 
  Image, 
  Code, 
  Template, 
  Sparkles, 
  Paperclip, 
  Mic, 
  X,
  Wand2
} from 'lucide-react'
import toast from 'react-hot-toast'

import { useAuth } from '../../hooks/useAuth'
import { useDebounce } from '../../hooks/useDebounce'
import { useChatStore } from '../../store/chatStore'
import { aiService } from '../../services/ai'

import Button from '../ui/Button'
import { IconButton } from '../ui/Button'

/**
 * Chat Input Component
 * Handles message input with support for text, files, templates, and voice
 */
const ChatInput = ({ 
  onSendMessage, 
  disabled = false, 
  placeholder = "Type your message...",
  currentProject,
  className = '' 
}) => {
  const { user, hasPermission } = useAuth()
  const chatStore = useChatStore()
  
  const [message, setMessage] = useState('')
  const [isComposing, setIsComposing] = useState(false)
  const [showActions, setShowActions] = useState(false)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [suggestedPrompts, setSuggestedPrompts] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [inputMode, setInputMode] = useState('text') // text, template, refinement
  
  const textareaRef = useRef(null)
  const fileInputRef = useRef(null)
  const debouncedMessage = useDebounce(message, 300)

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [message])

  // Load suggested prompts based on context
  useEffect(() => {
    if (debouncedMessage.length > 3 && currentProject) {
      loadSuggestedPrompts()
    } else {
      setSuggestedPrompts([])
    }
  }, [debouncedMessage, currentProject])

  // Focus textarea when component mounts
  useEffect(() => {
    if (textareaRef.current && !disabled) {
      textareaRef.current.focus()
    }
  }, [disabled])

  // Load AI-suggested prompts
  const loadSuggestedPrompts = async () => {
    try {
      const suggestions = await aiService.getSuggestedPrompts(
        currentProject.id, 
        debouncedMessage
      )
      setSuggestedPrompts(suggestions.slice(0, 3))
      setShowSuggestions(suggestions.length > 0)
    } catch (error) {
      console.error('Failed to load suggestions:', error)
    }
  }

  // Handle message submission
  const handleSubmit = async (e) => {
    e?.preventDefault()
    
    if (!message.trim() && !uploadedFile) return
    if (disabled) return
    
    const messageText = message.trim()
    const options = {
      isRefinement: inputMode === 'refinement',
      isTemplate: inputMode === 'template',
      currentCode: currentProject?.html_code
    }

    try {
      // Handle file upload with message
      if (uploadedFile) {
        options.file = uploadedFile
        // Convert image to website if it's a design
        if (uploadedFile.type.startsWith('image/')) {
          options.isDesignToCode = true
        }
      }

      await onSendMessage(messageText, options)
      
      // Clear input
      setMessage('')
      setUploadedFile(null)
      setInputMode('text')
      setShowSuggestions(false)
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
      
    } catch (error) {
      toast.error('Failed to send message')
    }
  }

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
    
    if (e.key === 'Escape') {
      setShowActions(false)
      setShowSuggestions(false)
    }
  }

  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type and size
    const maxSize = 10 * 1024 * 1024 // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'text/html', 'text/css', 'text/javascript']
    
    if (file.size > maxSize) {
      toast.error('File size must be less than 10MB')
      return
    }
    
    if (!allowedTypes.includes(file.type)) {
      toast.error('File type not supported')
      return
    }

    setUploadedFile(file)
    setShowActions(false)
  }

  // Remove uploaded file
  const handleRemoveFile = () => {
    setUploadedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Handle template mode
  const handleTemplateMode = () => {
    setInputMode('template')
    setMessage('Generate a website from template: ')
    setShowActions(false)
    textareaRef.current?.focus()
  }

  // Handle refinement mode
  const handleRefinementMode = () => {
    if (!currentProject?.html_code) {
      toast.error('No code to refine. Generate a website first.')
      return
    }
    
    setInputMode('refinement')
    setMessage('Refine the website: ')
    setShowActions(false)
    textareaRef.current?.focus()
  }

  // Use suggested prompt
  const useSuggestedPrompt = (prompt) => {
    setMessage(prompt)
    setShowSuggestions(false)
    textareaRef.current?.focus()
  }

  // Quick actions
  const quickActions = [
    {
      icon: Template,
      label: 'Use Template',
      action: handleTemplateMode,
      enabled: true,
      color: 'text-blue-600'
    },
    {
      icon: Code,
      label: 'Refine Code',
      action: handleRefinementMode,
      enabled: !!currentProject?.html_code,
      color: 'text-purple-600'
    },
    {
      icon: Image,
      label: 'Upload Design',
      action: () => fileInputRef.current?.click(),
      enabled: hasPermission('upload_files'),
      color: 'text-green-600'
    },
    {
      icon: Sparkles,
      label: 'AI Suggestions',
      action: () => setShowSuggestions(!showSuggestions),
      enabled: suggestedPrompts.length > 0,
      color: 'text-yellow-600'
    }
  ]

  const canSend = (message.trim() || uploadedFile) && !disabled
  const isGenerating = chatStore.isGenerating

  return (
    <div className={`relative bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Suggested Prompts */}
      <AnimatePresence>
        {showSuggestions && suggestedPrompts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="p-3 border-b border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                AI Suggestions
              </span>
              <IconButton
                icon={X}
                size="xs"
                variant="ghost"
                onClick={() => setShowSuggestions(false)}
              />
            </div>
            
            <div className="space-y-1">
              {suggestedPrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => useSuggestedPrompt(prompt)}
                  className="block w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Uploaded File Preview */}
      <AnimatePresence>
        {uploadedFile && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-3 border-b border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                {uploadedFile.type.startsWith('image/') ? (
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                    <Image className="w-6 h-6 text-gray-400" />
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                    <Paperclip className="w-6 h-6 text-gray-400" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {uploadedFile.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              
              <IconButton
                icon={X}
                size="sm"
                variant="ghost"
                onClick={handleRemoveFile}
                aria-label="Remove file"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Mode Indicator */}
      <AnimatePresence>
        {inputMode !== 'text' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 py-2 bg-primary-50 dark:bg-primary-900/20 border-b border-primary-200 dark:border-primary-800"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {inputMode === 'template' ? (
                  <>
                    <Template className="w-4 h-4 text-primary-600" />
                    <span className="text-sm text-primary-700 dark:text-primary-300">
                      Template Mode
                    </span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 text-primary-600" />
                    <span className="text-sm text-primary-700 dark:text-primary-300">
                      Refinement Mode
                    </span>
                  </>
                )}
              </div>
              
              <IconButton
                icon={X}
                size="xs"
                variant="ghost"
                onClick={() => {
                  setInputMode('text')
                  setMessage('')
                }}
                className="text-primary-600"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Input Area */}
      <div className="p-4">
        <div className="flex items-end space-x-3">
          {/* Quick Actions Button */}
          <div className="relative">
            <IconButton
              icon={Plus}
              size="md"
              variant="outline"
              onClick={() => setShowActions(!showActions)}
              disabled={disabled}
              className={`transition-transform ${showActions ? 'rotate-45' : ''}`}
              aria-label="Show quick actions"
            />
            
            {/* Quick Actions Menu */}
            <AnimatePresence>
              {showActions && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="absolute bottom-full left-0 mb-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-2"
                >
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={action.action}
                      disabled={!action.enabled}
                      className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-left rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <action.icon className={`w-4 h-4 ${action.color}`} />
                      <span className="text-gray-700 dark:text-gray-300">
                        {action.label}
                      </span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Text Input */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              onFocus={() => setIsComposing(true)}
              onBlur={() => setIsComposing(false)}
              placeholder={placeholder}
              disabled={disabled}
              rows={1}
              className="w-full max-h-32 px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            />
            
            {/* Character/Usage Indicator */}
            {(message.length > 100 || isComposing) && (
              <div className="absolute bottom-1 right-3 text-xs text-gray-400">
                {message.length}/2000
              </div>
            )}
          </div>

          {/* Send Button */}
          <IconButton
            icon={Send}
            size="md"
            variant="primary"
            onClick={handleSubmit}
            disabled={!canSend}
            loading={isGenerating}
            aria-label="Send message"
            className="flex-shrink-0"
          />
        </div>

        {/* Usage Warning */}
        {user?.isApproachingLimits?.() && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 text-xs text-warning-600 dark:text-warning-400"
          >
            ⚠️ Approaching daily usage limit. Consider upgrading your plan.
          </motion.div>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.html,.css,.js"
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  )
}

export default ChatInput