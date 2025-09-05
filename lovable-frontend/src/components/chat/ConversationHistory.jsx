import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  History, 
  MessageSquare, 
  Calendar, 
  Clock, 
  Search, 
  Filter,
  ChevronRight,
  Code,
  User,
  Bot,
  X,
  Download,
  Trash2,
  Star,
  StarOff
} from 'lucide-react'
import { format, formatDistanceToNow, isToday, isYesterday, isThisWeek } from 'date-fns'

import { useChatStore } from '../../store/chatStore'
import { useProjects } from '../../hooks/useProjects'
import { useDebounce } from '../../hooks/useDebounce'
import { projectService } from '../../services/projects'

import Button from '../ui/Button'
import { IconButton } from '../ui/Button'

/**
 * Conversation History Component
 * Shows and manages chat history for projects
 */
const ConversationHistory = ({ 
  projectId, 
  onClose,
  onSelectConversation,
  className = '' 
}) => {
  const chatStore = useChatStore()
  const { getProjectById } = useProjects()
  
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all') // all, user, ai, code
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [favorites, setFavorites] = useState(new Set())
  
  const debouncedSearch = useDebounce(searchQuery, 300)
  const currentProject = getProjectById(projectId)

  // Load conversation history
  useEffect(() => {
    loadConversations()
  }, [projectId])

  // Filter conversations based on search and type
  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = !debouncedSearch || 
      conv.user_message.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      conv.ai_response.toLowerCase().includes(debouncedSearch.toLowerCase())
    
    const matchesType = filterType === 'all' || 
      (filterType === 'code' && conv.generated_code) ||
      filterType === conv.message_type

    return matchesSearch && matchesType
  })

  // Group conversations by date
  const groupedConversations = groupConversationsByDate(filteredConversations)

  // Load conversations from API
  const loadConversations = async () => {
    if (!projectId) return
    
    setLoading(true)
    try {
      const data = await projectService.getConversations(projectId)
      setConversations(data || [])
    } catch (error) {
      console.error('Failed to load conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  // Group conversations by date
  function groupConversationsByDate(conversations) {
    const groups = {}
    
    conversations.forEach(conv => {
      const date = new Date(conv.created_at)
      let groupKey
      
      if (isToday(date)) {
        groupKey = 'Today'
      } else if (isYesterday(date)) {
        groupKey = 'Yesterday'
      } else if (isThisWeek(date)) {
        groupKey = 'This Week'
      } else {
        groupKey = format(date, 'MMMM dd, yyyy')
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = []
      }
      groups[groupKey].push(conv)
    })
    
    return groups
  }

  // Toggle favorite conversation
  const toggleFavorite = (conversationId) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev)
      if (newFavorites.has(conversationId)) {
        newFavorites.delete(conversationId)
      } else {
        newFavorites.add(conversationId)
      }
      return newFavorites
    })
  }

  // Select conversation and load it into chat
  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation)
    
    // Load this conversation into the chat
    if (onSelectConversation) {
      onSelectConversation(conversation)
    }
    
    // Scroll to this conversation in the chat
    chatStore.loadConversationHistory(projectId)
  }

  // Export conversation history
  const handleExportHistory = () => {
    const exportData = {
      project: currentProject?.name || 'Unknown Project',
      projectId,
      exportedAt: new Date().toISOString(),
      conversations: conversations.map(conv => ({
        id: conv.id,
        userMessage: conv.user_message,
        aiResponse: conv.ai_response,
        hasCode: !!conv.generated_code,
        tokensUsed: conv.tokens_used,
        responseTime: conv.response_time_ms,
        createdAt: conv.created_at
      }))
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    })
    
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `conversation-history-${projectId}-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <History className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              Conversation History
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {currentProject?.name || 'Project conversations'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <IconButton
            icon={Download}
            size="sm"
            variant="ghost"
            onClick={handleExportHistory}
            aria-label="Export history"
            disabled={conversations.length === 0}
          />
          
          <IconButton
            icon={X}
            size="sm"
            variant="ghost"
            onClick={onClose}
            aria-label="Close history"
          />
        </div>
      </div>

      {/* Search and Filters */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex space-x-2 overflow-x-auto">
          {[
            { key: 'all', label: 'All', icon: MessageSquare },
            { key: 'generation', label: 'Generation', icon: Bot },
            { key: 'refinement', label: 'Refinement', icon: User },
            { key: 'code', label: 'With Code', icon: Code }
          ].map((filter) => {
            const Icon = filter.icon
            return (
              <button
                key={filter.key}
                onClick={() => setFilterType(filter.key)}
                className={`flex items-center space-x-1 px-3 py-1.5 text-xs rounded-full transition-colors whitespace-nowrap ${
                  filterType === filter.key
                    ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 ring-1 ring-primary-200 dark:ring-primary-800'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{filter.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto max-h-96">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Loading conversations...
            </p>
          </div>
        ) : Object.keys(groupedConversations).length === 0 ? (
          <div className="p-8 text-center">
            <MessageSquare className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
              {debouncedSearch ? 'No matching conversations' : 'No conversations yet'}
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {debouncedSearch 
                ? 'Try adjusting your search or filters'
                : 'Start chatting to build your conversation history'
              }
            </p>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            <AnimatePresence mode="popLayout">
              {Object.entries(groupedConversations).map(([dateGroup, convs]) => (
                <motion.div
                  key={dateGroup}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  {/* Date Header */}
                  <div className="flex items-center space-x-2 mb-3">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {dateGroup}
                    </h4>
                    <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                  </div>

                  {/* Conversations */}
                  <div className="space-y-2 ml-6">
                    {convs.map((conversation) => (
                      <ConversationItem
                        key={conversation.id}
                        conversation={conversation}
                        isSelected={selectedConversation?.id === conversation.id}
                        isFavorite={favorites.has(conversation.id)}
                        onSelect={() => handleSelectConversation(conversation)}
                        onToggleFavorite={() => toggleFavorite(conversation.id)}
                      />
                    ))}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Footer Stats */}
      {conversations.length > 0 && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>
              {filteredConversations.length} of {conversations.length} conversations
            </span>
            <span>
              {conversations.reduce((sum, conv) => sum + (conv.tokens_used || 0), 0)} tokens used
            </span>
          </div>
        </div>
      )}
    </motion.div>
  )
}

/**
 * Individual Conversation Item Component
 */
const ConversationItem = ({ 
  conversation, 
  isSelected, 
  isFavorite,
  onSelect, 
  onToggleFavorite 
}) => {
  const [showPreview, setShowPreview] = useState(false)

  const hasCode = !!conversation.generated_code
  const timestamp = new Date(conversation.created_at)
  
  // Truncate text for preview
  const truncateText = (text, maxLength = 60) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  return (
    <motion.div
      layout
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className={`group p-3 rounded-lg border transition-all cursor-pointer ${
        isSelected
          ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800'
          : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          {/* User Message */}
          <div className="flex items-start space-x-2 mb-2">
            <User className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
              {truncateText(conversation.user_message)}
            </p>
          </div>

          {/* AI Response */}
          <div className="flex items-start space-x-2 mb-2">
            <Bot className="w-3 h-3 text-primary-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1">
              {truncateText(conversation.ai_response)}
            </p>
          </div>

          {/* Meta Info */}
          <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{formatDistanceToNow(timestamp, { addSuffix: true })}</span>
            </div>
            
            {hasCode && (
              <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
                <Code className="w-3 h-3" />
                <span>Code</span>
              </div>
            )}
            
            {conversation.tokens_used && (
              <span>{conversation.tokens_used} tokens</span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <IconButton
            icon={isFavorite ? Star : StarOff}
            size="xs"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation()
              onToggleFavorite()
            }}
            className={isFavorite ? 'text-yellow-500' : 'text-gray-400'}
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          />
          
          <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${
            isSelected ? 'rotate-90' : ''
          }`} />
        </div>
      </div>

      {/* Expanded Preview */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700"
          >
            {hasCode && (
              <div className="text-xs font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded max-h-20 overflow-y-auto">
                {conversation.generated_code?.substring(0, 200)}...
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default ConversationHistory