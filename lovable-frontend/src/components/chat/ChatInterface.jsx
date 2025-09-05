import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, Zap, History, Settings } from 'lucide-react'

import { useChatStore } from '../../store/chatStore'
import { useUIStore } from '../../store/uiStore'
import { useProjectStore } from '../../store/projectStore'
import { useWebSocket } from '../../hooks/useWebSocket'

import MessageBubble from './MessageBubble'
import ChatInput from './ChatInput'
import TypingIndicator from './TypingIndicator'
import GenerationProgress from './GenerationProgress'
import ConversationHistory from './ConversationHistory'

import Button from '../ui/Button'
import { IconButton } from '../ui/Button'

/**
 * Main Chat Interface Component
 * Handles the conversational AI interface for website generation
 */
const ChatInterface = ({ projectId, className = '' }) => {
  const chatStore = useChatStore()
  const uiStore = useUIStore()
  const projectStore = useProjectStore()
  const { isConnected } = useWebSocket()
  
  const [showHistory, setShowHistory] = useState(false)
  const [autoScroll, setAutoScroll] = useState(true)
  
  const messagesEndRef = useRef(null)
  const chatContainerRef = useRef(null)

  // Set current project in chat store
  useEffect(() => {
    if (projectId) {
      chatStore.setCurrentProject(projectId)
      chatStore.loadConversationHistory(projectId)
    }
  }, [projectId, chatStore])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      })
    }
  }, [chatStore.messages, autoScroll])

  // Handle scroll to detect if user scrolled up
  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100
    setAutoScroll(isNearBottom)
  }

  // Send message handler
  const handleSendMessage = async (message, options = {}) => {
    try {
      if (options.isRefinement && options.currentCode) {
        await chatStore.refineWebsite(message, options.currentCode)
      } else if (options.isTemplate) {
        await chatStore.generateFromTemplate(options.templateData)
      } else {
        await chatStore.sendMessage(message)
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  // Clear conversation
  const handleClearConversation = () => {
    if (window.confirm('Are you sure you want to clear this conversation?')) {
      chatStore.clearMessages()
    }
  }

  // Export conversation
  const handleExportConversation = () => {
    chatStore.exportConversation()
  }

  const { messages, isGenerating, aiTyping, error } = chatStore
  const hasMessages = messages.length > 0
  const currentProject = projectStore.currentProject

  return (
    <div className={`flex flex-col h-full bg-white dark:bg-gray-900 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5 text-primary-600" />
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">
              AI Assistant
            </h2>
          </div>
          
          {/* Connection status */}
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-success-500' : 'bg-error-500'
            }`} />
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <IconButton
            icon={History}
            size="sm"
            variant="ghost"
            aria-label="Show conversation history"
            onClick={() => setShowHistory(!showHistory)}
            className={showHistory ? 'bg-gray-100 dark:bg-gray-800' : ''}
          />
          
          {hasMessages && (
            <>
              <IconButton
                icon={Settings}
                size="sm"
                variant="ghost"
                aria-label="Chat settings"
                onClick={() => uiStore.openModal('chatSettings')}
              />
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearConversation}
                className="text-xs"
              >
                Clear
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 py-3 bg-error-50 dark:bg-error-900/20 border-b border-error-200 dark:border-error-800"
          >
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-error-500 rounded-full" />
              <span className="text-sm text-error-700 dark:text-error-300">
                {error}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generation Progress */}
      <AnimatePresence>
        {isGenerating && (
          <GenerationProgress />
        )}
      </AnimatePresence>

      {/* Chat Messages */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        onScroll={handleScroll}
      >
        {/* Welcome Message */}
        {!hasMessages && !showHistory && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="max-w-md mx-auto">
              <Zap className="w-12 h-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Ready to build your website?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Describe what you want to create and I'll generate a beautiful, functional website for you.
              </p>
              
              {/* Quick Start Suggestions */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Try saying:
                </p>
                <div className="space-y-2">
                  {[
                    "Create a modern portfolio website",
                    "Build a landing page for my SaaS product",
                    "Make a restaurant website with a menu",
                    "Design a blog homepage"
                  ].map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSendMessage(suggestion)}
                      className="block w-full px-4 py-2 text-sm text-left text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      "{suggestion}"
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Conversation History Sidebar */}
        <AnimatePresence>
          {showHistory && (
            <ConversationHistory 
              projectId={projectId}
              onClose={() => setShowHistory(false)}
            />
          )}
        </AnimatePresence>

        {/* Messages */}
        <AnimatePresence mode="popLayout">
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              onRetry={message.role === 'user' ? () => handleSendMessage(message.content) : undefined}
              onRate={(rating) => {
                // Handle rating
                console.log('Rate message:', message.id, rating)
              }}
            />
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        <AnimatePresence>
          {aiTyping && (
            <TypingIndicator />
          )}
        </AnimatePresence>

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="border-t border-gray-200 dark:border-gray-700">
        <ChatInput
          onSendMessage={handleSendMessage}
          disabled={isGenerating}
          placeholder={
            !currentProject 
              ? "Please select a project first..."
              : isGenerating 
                ? "Generating your website..."
                : "Describe what you want to create..."
          }
          currentProject={currentProject}
        />
      </div>

      {/* Scroll to bottom button */}
      <AnimatePresence>
        {!autoScroll && hasMessages && (
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            onClick={() => {
              messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
              setAutoScroll(true)
            }}
            className="fixed bottom-24 right-6 w-10 h-10 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg flex items-center justify-center z-10 transition-colors"
            aria-label="Scroll to bottom"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ChatInterface