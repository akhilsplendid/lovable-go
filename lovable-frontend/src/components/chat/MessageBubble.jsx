import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  User, 
  Bot, 
  Code, 
  Copy, 
  Eye, 
  ThumbsUp, 
  ThumbsDown, 
  RotateCcw,
  Clock,
  Zap,
  Star,
  AlertCircle
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'

import { IconButton } from '../ui/Button'
import Button from '../ui/Button'
import CodeViewer from '../preview/CodeViewer'

/**
 * Message Bubble Component
 * Displays individual chat messages with user/AI styling and actions
 */
const MessageBubble = ({ 
  message, 
  onRetry, 
  onRate, 
  onPreview,
  showTimestamp = true,
  className = '' 
}) => {
  const [showCode, setShowCode] = useState(false)
  const [showTimestampFull, setShowTimestampFull] = useState(false)
  const [rating, setRating] = useState(null)
  const [isRating, setIsRating] = useState(false)

  const isUser = message.role === 'user'
  const isAI = message.role === 'assistant'
  const hasCode = message.htmlCode && message.htmlCode.trim().length > 0
  const hasStats = message.tokensUsed || message.responseTime

  // Copy message content to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      toast.success('Message copied to clipboard')
    } catch (error) {
      toast.error('Failed to copy message')
    }
  }

  // Copy code to clipboard
  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(message.htmlCode)
      toast.success('Code copied to clipboard')
    } catch (error) {
      toast.error('Failed to copy code')
    }
  }

  // Handle rating
  const handleRate = (newRating) => {
    setRating(newRating)
    setIsRating(false)
    onRate?.(newRating)
    toast.success(`Thanks for your feedback!`)
  }

  // Format timestamp
  const getTimestamp = () => {
    const date = new Date(message.timestamp)
    return showTimestampFull 
      ? format(date, 'MMM d, yyyy at h:mm a')
      : formatDistanceToNow(date, { addSuffix: true })
  }

  // Message variants
  const messageVariants = {
    initial: { opacity: 0, y: 20, scale: 0.95 },
    animate: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 300
      }
    },
    exit: { opacity: 0, y: -20, scale: 0.95 }
  }

  return (
    <motion.div
      variants={messageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} ${className}`}
    >
      <div className={`flex max-w-4xl ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start space-x-3 ${isUser ? 'space-x-reverse' : ''}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser 
            ? 'bg-primary-600 text-white' 
            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
        }`}>
          {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
        </div>

        {/* Message Content */}
        <div className={`flex-1 min-w-0 ${isUser ? 'text-right' : 'text-left'}`}>
          {/* Message Bubble */}
          <div
            className={`inline-block max-w-full px-4 py-3 rounded-2xl shadow-sm ${
              isUser
                ? 'bg-primary-600 text-white'
                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100'
            } ${isUser ? 'rounded-br-md' : 'rounded-bl-md'}`}
          >
            {/* Special message indicators */}
            <div className="flex items-center space-x-2 mb-2">
              {message.isRefinement && (
                <div className="flex items-center space-x-1 text-xs">
                  <RotateCcw className="w-3 h-3" />
                  <span className={isUser ? 'text-primary-100' : 'text-gray-500'}>
                    Refinement
                  </span>
                </div>
              )}
              
              {message.isTemplate && (
                <div className="flex items-center space-x-1 text-xs">
                  <Star className="w-3 h-3" />
                  <span className={isUser ? 'text-primary-100' : 'text-gray-500'}>
                    Template
                  </span>
                </div>
              )}

              {message.fromCache && isAI && (
                <div className="flex items-center space-x-1 text-xs">
                  <Zap className="w-3 h-3" />
                  <span className={isUser ? 'text-primary-100' : 'text-gray-500'}>
                    Cached
                  </span>
                </div>
              )}
            </div>

            {/* Message Text */}
            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-wrap break-words m-0">
                {message.content}
              </p>
            </div>

            {/* Code Preview Button */}
            {hasCode && (
              <div className="mt-3 pt-3 border-t border-opacity-20 border-current">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs opacity-80">
                    <Code className="w-3 h-3" />
                    <span>Website code generated</span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <IconButton
                      icon={Eye}
                      size="xs"
                      variant="ghost"
                      aria-label="Preview code"
                      onClick={() => setShowCode(!showCode)}
                      className={isUser ? 'text-white hover:bg-primary-700' : ''}
                    />
                    
                    <IconButton
                      icon={Copy}
                      size="xs"
                      variant="ghost"
                      aria-label="Copy code"
                      onClick={handleCopyCode}
                      className={isUser ? 'text-white hover:bg-primary-700' : ''}
                    />
                    
                    {onPreview && (
                      <Button
                        size="xs"
                        variant={isUser ? "secondary" : "primary"}
                        onClick={() => onPreview(message.htmlCode)}
                      >
                        Preview
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Expanded Code View */}
          {showCode && hasCode && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2"
            >
              <CodeViewer 
                code={message.htmlCode}
                language="html"
                maxHeight="300px"
                showLineNumbers={true}
              />
            </motion.div>
          )}

          {/* Message Meta Info */}
          <div className={`flex items-center justify-between mt-2 text-xs text-gray-500 dark:text-gray-400 ${isUser ? 'flex-row-reverse' : ''}`}>
            {/* Timestamp */}
            {showTimestamp && (
              <button
                onClick={() => setShowTimestampFull(!showTimestampFull)}
                className="hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              >
                <Clock className="w-3 h-3 inline mr-1" />
                {getTimestamp()}
              </button>
            )}

            {/* Stats and Actions */}
            <div className={`flex items-center space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
              {/* AI Message Stats */}
              {hasStats && isAI && (
                <div className="flex items-center space-x-2 text-2xs">
                  {message.tokensUsed && (
                    <span>{message.tokensUsed} tokens</span>
                  )}
                  {message.responseTime && (
                    <span>{message.responseTime}ms</span>
                  )}
                </div>
              )}

              {/* Message Actions */}
              <div className="flex items-center space-x-1">
                {/* Copy Message */}
                <IconButton
                  icon={Copy}
                  size="xs"
                  variant="ghost"
                  aria-label="Copy message"
                  onClick={handleCopy}
                  className="opacity-60 hover:opacity-100"
                />

                {/* Retry (User messages only) */}
                {isUser && onRetry && (
                  <IconButton
                    icon={RotateCcw}
                    size="xs"
                    variant="ghost"
                    aria-label="Retry message"
                    onClick={onRetry}
                    className="opacity-60 hover:opacity-100"
                  />
                )}

                {/* Rating (AI messages only) */}
                {isAI && !isRating && !rating && (
                  <IconButton
                    icon={ThumbsUp}
                    size="xs"
                    variant="ghost"
                    aria-label="Rate message"
                    onClick={() => setIsRating(true)}
                    className="opacity-60 hover:opacity-100"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Rating Interface */}
          {isRating && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg ${isUser ? 'text-right' : ''}`}
            >
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                How was this response?
              </p>
              <div className={`flex space-x-1 ${isUser ? 'justify-end' : ''}`}>
                <IconButton
                  icon={ThumbsUp}
                  size="sm"
                  variant="ghost"
                  aria-label="Good response"
                  onClick={() => handleRate('positive')}
                  className="text-success-600 hover:bg-success-50 dark:hover:bg-success-900/20"
                />
                <IconButton
                  icon={ThumbsDown}
                  size="sm"
                  variant="ghost"
                  aria-label="Poor response"
                  onClick={() => handleRate('negative')}
                  className="text-error-600 hover:bg-error-50 dark:hover:bg-error-900/20"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsRating(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          )}

          {/* Rating Display */}
          {rating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`mt-1 text-xs text-gray-500 dark:text-gray-400 ${isUser ? 'text-right' : ''}`}
            >
              Thanks for your feedback! 
              {rating === 'positive' ? (
                <ThumbsUp className="w-3 h-3 inline ml-1 text-success-600" />
              ) : (
                <ThumbsDown className="w-3 h-3 inline ml-1 text-error-600" />
              )}
            </motion.div>
          )}

          {/* Error State */}
          {message.error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-2 flex items-center space-x-2 text-error-600 dark:text-error-400"
            >
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">Failed to send message</span>
              {onRetry && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onRetry}
                  className="ml-2"
                >
                  Retry
                </Button>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default MessageBubble