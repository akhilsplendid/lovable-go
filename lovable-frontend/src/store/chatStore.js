import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import toast from 'react-hot-toast'
import { aiService } from '../services/ai'
import { websocketService } from '../services/websocket'

/**
 * Chat Store
 * Manages chat conversations, AI interactions, and generation state
 */
export const useChatStore = create(
  subscribeWithSelector((set, get) => ({
    // State
    messages: [],
    isGenerating: false,
    generationProgress: 0,
    generationStage: '',
    currentProjectId: null,
    conversationHistory: [],
    isConnected: false,
    error: null,
    streamingMessage: '',
    aiTyping: false,
    lastGenerationResult: null,

    // Actions
    /**
     * Initialize WebSocket connection for real-time AI generation
     */
    initializeWebSocket: (userId) => {
      try {
        websocketService.connect(userId)
        
        // Set up WebSocket event listeners
        websocketService.on('connect', () => {
          set({ isConnected: true })
        })

        websocketService.on('disconnect', () => {
          set({ isConnected: false })
        })

        websocketService.on('generation_started', (data) => {
          set({ 
            isGenerating: true, 
            generationProgress: 0,
            generationStage: 'initializing',
            error: null 
          })
        })

        websocketService.on('generation_progress', (data) => {
          set({ 
            generationProgress: data.progress,
            generationStage: data.stage || 'generating'
          })
        })

        websocketService.on('generation_complete', (data) => {
          const { result } = data
          
          // Add AI response to messages
          const aiMessage = {
            id: `ai-${Date.now()}`,
            role: 'assistant',
            content: result.conversationalResponse,
            timestamp: new Date().toISOString(),
            htmlCode: result.htmlCode,
            tokensUsed: result.tokensUsed,
            responseTime: result.responseTime,
            conversationId: result.conversationId
          }

          set(state => ({
            messages: [...state.messages, aiMessage],
            isGenerating: false,
            generationProgress: 100,
            generationStage: 'complete',
            aiTyping: false,
            lastGenerationResult: result,
            conversationHistory: [
              ...state.conversationHistory,
              {
                role: 'user',
                content: state.messages[state.messages.length - 1]?.content || ''
              },
              {
                role: 'assistant',
                content: result.conversationalResponse
              }
            ]
          }))

          toast.success('Website generated successfully!')
        })

        websocketService.on('generation_error', (data) => {
          set({ 
            isGenerating: false,
            generationProgress: 0,
            generationStage: '',
            aiTyping: false,
            error: data.error 
          })
          
          toast.error(data.error || 'Generation failed')
        })

      } catch (error) {
        console.error('Failed to initialize WebSocket:', error)
        set({ error: error.message })
      }
    },

    /**
     * Disconnect WebSocket
     */
    disconnectWebSocket: () => {
      websocketService.disconnect()
      set({ isConnected: false })
    },

    /**
     * Set current project for chat context
     */
    setCurrentProject: (projectId) => {
      set({ currentProjectId: projectId })
    },

    /**
     * Send a message to AI for website generation
     */
    sendMessage: async (message) => {
      const { currentProjectId, conversationHistory, isConnected } = get()
      
      if (!currentProjectId) {
        toast.error('Please select a project first')
        return
      }

      // Add user message immediately
      const userMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: message,
        timestamp: new Date().toISOString()
      }

      set(state => ({
        messages: [...state.messages, userMessage],
        aiTyping: true,
        error: null
      }))

      try {
        if (isConnected) {
          // Use WebSocket for real-time generation
          websocketService.emit('generate_website', {
            type: 'generate_website',
            projectId: currentProjectId,
            message,
            conversationHistory
          })
        } else {
          // Fallback to HTTP API
          set({ isGenerating: true, generationProgress: 0 })
          
          const result = await aiService.generateWebsite({
            projectId: currentProjectId,
            message,
            conversationHistory
          })

          // Add AI response
          const aiMessage = {
            id: `ai-${Date.now()}`,
            role: 'assistant',
            content: result.result.conversationalResponse,
            timestamp: new Date().toISOString(),
            htmlCode: result.result.htmlCode,
            tokensUsed: result.result.tokensUsed,
            responseTime: result.result.responseTime,
            conversationId: result.result.conversationId
          }

          set(state => ({
            messages: [...state.messages, aiMessage],
            isGenerating: false,
            generationProgress: 100,
            aiTyping: false,
            lastGenerationResult: result.result,
            conversationHistory: [
              ...state.conversationHistory,
              { role: 'user', content: message },
              { role: 'assistant', content: result.result.conversationalResponse }
            ]
          }))

          toast.success('Website generated successfully!')
        }
      } catch (error) {
        set({ 
          isGenerating: false,
          generationProgress: 0,
          aiTyping: false,
          error: error.message 
        })
        
        const message = error.response?.data?.error || 'Failed to generate website'
        toast.error(message)
      }
    },

    /**
     * Refine existing website with new instructions
     */
    refineWebsite: async (refinementRequest, currentCode) => {
      const { currentProjectId } = get()
      
      if (!currentProjectId) {
        toast.error('Please select a project first')
        return
      }

      // Add refinement message
      const userMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: `Refine the website: ${refinementRequest}`,
        timestamp: new Date().toISOString(),
        isRefinement: true
      }

      set(state => ({
        messages: [...state.messages, userMessage],
        isGenerating: true,
        generationProgress: 0,
        aiTyping: true,
        error: null
      }))

      try {
        const result = await aiService.refineWebsite({
          projectId: currentProjectId,
          refinementRequest,
          currentCode
        })

        // Add AI response
        const aiMessage = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: result.result.conversationalResponse,
          timestamp: new Date().toISOString(),
          htmlCode: result.result.htmlCode,
          tokensUsed: result.result.tokensUsed,
          responseTime: result.result.responseTime,
          conversationId: result.result.conversationId,
          isRefinement: true
        }

        set(state => ({
          messages: [...state.messages, aiMessage],
          isGenerating: false,
          generationProgress: 100,
          aiTyping: false,
          lastGenerationResult: result.result,
          conversationHistory: [
            ...state.conversationHistory,
            { role: 'user', content: refinementRequest },
            { role: 'assistant', content: result.result.conversationalResponse }
          ]
        }))

        toast.success('Website refined successfully!')
        
      } catch (error) {
        set({ 
          isGenerating: false,
          generationProgress: 0,
          aiTyping: false,
          error: error.message 
        })
        
        const message = error.response?.data?.error || 'Failed to refine website'
        toast.error(message)
      }
    },

    /**
     * Generate from template
     */
    generateFromTemplate: async (templateData) => {
      const { currentProjectId } = get()
      
      if (!currentProjectId) {
        toast.error('Please select a project first')
        return
      }

      const { category, style, colorScheme } = templateData

      // Add template generation message
      const userMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: `Generate a ${category} website${style ? ` with ${style} style` : ''}${colorScheme ? ` using ${colorScheme} colors` : ''}`,
        timestamp: new Date().toISOString(),
        isTemplate: true
      }

      set(state => ({
        messages: [...state.messages, userMessage],
        isGenerating: true,
        generationProgress: 0,
        aiTyping: true,
        error: null
      }))

      try {
        const result = await aiService.generateFromTemplate(templateData)

        // Add AI response
        const aiMessage = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: result.template.description,
          timestamp: new Date().toISOString(),
          htmlCode: result.template.htmlCode,
          isTemplate: true
        }

        set(state => ({
          messages: [...state.messages, aiMessage],
          isGenerating: false,
          generationProgress: 100,
          aiTyping: false,
          lastGenerationResult: {
            conversationalResponse: result.template.description,
            htmlCode: result.template.htmlCode
          }
        }))

        toast.success('Template generated successfully!')
        
      } catch (error) {
        set({ 
          isGenerating: false,
          generationProgress: 0,
          aiTyping: false,
          error: error.message 
        })
        
        toast.error('Failed to generate from template')
      }
    },

    /**
     * Clear chat messages
     */
    clearMessages: () => {
      set({
        messages: [],
        conversationHistory: [],
        lastGenerationResult: null,
        error: null
      })
    },

    /**
     * Load conversation history for a project
     */
    loadConversationHistory: async (projectId) => {
      try {
        const conversations = await aiService.getConversations(projectId)
        
        const messages = []
        const history = []
        
        conversations.forEach(conv => {
          // Add user message
          messages.push({
            id: `user-${conv.id}`,
            role: 'user',
            content: conv.user_message,
            timestamp: conv.created_at
          })
          
          // Add AI response
          messages.push({
            id: `ai-${conv.id}`,
            role: 'assistant',
            content: conv.ai_response,
            timestamp: conv.created_at,
            htmlCode: conv.generated_code,
            tokensUsed: conv.tokens_used,
            responseTime: conv.response_time_ms,
            conversationId: conv.id
          })

          // Build conversation history for context
          history.push(
            { role: 'user', content: conv.user_message },
            { role: 'assistant', content: conv.ai_response }
          )
        })

        set({
          messages,
          conversationHistory: history,
          currentProjectId: projectId
        })
        
      } catch (error) {
        console.error('Failed to load conversation history:', error)
        set({ error: error.message })
      }
    },

    /**
     * Delete a specific message
     */
    deleteMessage: (messageId) => {
      set(state => ({
        messages: state.messages.filter(m => m.id !== messageId)
      }))
    },

    /**
     * Retry last generation
     */
    retryLastGeneration: () => {
      const { messages } = get()
      const lastUserMessage = messages.findLast(m => m.role === 'user')
      
      if (lastUserMessage) {
        get().sendMessage(lastUserMessage.content)
      }
    },

    /**
     * Get chat statistics
     */
    getChatStats: () => {
      const { messages, conversationHistory } = get()
      
      const totalMessages = messages.length
      const userMessages = messages.filter(m => m.role === 'user').length
      const aiMessages = messages.filter(m => m.role === 'assistant').length
      const totalTokens = messages.reduce((sum, m) => sum + (m.tokensUsed || 0), 0)
      const avgResponseTime = aiMessages > 0 
        ? messages.filter(m => m.responseTime).reduce((sum, m) => sum + m.responseTime, 0) / aiMessages
        : 0

      return {
        totalMessages,
        userMessages,
        aiMessages,
        totalTokens,
        avgResponseTime,
        conversationTurns: conversationHistory.length / 2
      }
    },

    /**
     * Export conversation history
     */
    exportConversation: () => {
      const { messages, currentProjectId } = get()
      
      const exportData = {
        projectId: currentProjectId,
        exportedAt: new Date().toISOString(),
        messages: messages.map(m => ({
          role: m.role,
          content: m.content,
          timestamp: m.timestamp,
          tokensUsed: m.tokensUsed,
          responseTime: m.responseTime
        }))
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      })
      
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `conversation-${currentProjectId}-${Date.now()}.json`
      document.body.appendChild(a)
      a.click()
      URL.revokeObjectURL(url)
      document.body.removeChild(a)
    },

    /**
     * Set AI typing indicator
     */
    setAITyping: (isTyping) => {
      set({ aiTyping: isTyping })
    },

    /**
     * Update streaming message content
     */
    updateStreamingMessage: (content) => {
      set({ streamingMessage: content })
    }
  }))
)