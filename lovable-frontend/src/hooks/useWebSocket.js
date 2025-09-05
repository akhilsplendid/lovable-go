import { useEffect, useCallback, useRef } from 'react'
import { websocketService } from '../services/websocket'
import { useAuth } from './useAuth'
import { useChatStore } from '../store/chatStore'

/**
 * WebSocket Hook
 * Manages WebSocket connection and real-time events
 */
export const useWebSocket = (options = {}) => {
  const { user, isAuthenticated } = useAuth()
  const chatStore = useChatStore()
  const connectionRef = useRef(null)
  const eventHandlersRef = useRef(new Map())

  // Initialize WebSocket connection
  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      return
    }

    const initializeConnection = async () => {
      try {
        await websocketService.connect(user.id)
        connectionRef.current = websocketService
        
        // Initialize chat store WebSocket
        chatStore.initializeWebSocket(user.id)
        
        if (options.onConnect) {
          options.onConnect()
        }
      } catch (error) {
        console.error('Failed to initialize WebSocket:', error)
        
        if (options.onError) {
          options.onError(error)
        }
      }
    }

    initializeConnection()

    // Cleanup on unmount or auth change
    return () => {
      if (connectionRef.current) {
        chatStore.disconnectWebSocket()
        websocketService.disconnect()
        connectionRef.current = null
      }
    }
  }, [isAuthenticated, user?.id, options.onConnect, options.onError])

  // Connection status
  const isConnected = websocketService.getConnectionStatus()

  // Emit event to server
  const emit = useCallback(async (event, data) => {
    try {
      if (!connectionRef.current?.isConnected) {
        throw new Error('WebSocket not connected')
      }
      
      return await websocketService.emit(event, data)
    } catch (error) {
      console.error(`Failed to emit event '${event}':`, error)
      throw error
    }
  }, [])

  // Listen for events
  const on = useCallback((event, handler) => {
    websocketService.on(event, handler)
    eventHandlersRef.current.set(event, handler)
  }, [])

  // Remove event listener
  const off = useCallback((event) => {
    websocketService.off(event)
    eventHandlersRef.current.delete(event)
  }, [])

  // Listen for event once
  const once = useCallback((event, handler) => {
    websocketService.once(event, handler)
  }, [])

  // Join project room for collaboration
  const joinProjectRoom = useCallback(async (projectId) => {
    try {
      await websocketService.joinRoom(`project_${projectId}`)
    } catch (error) {
      console.error('Failed to join project room:', error)
      throw error
    }
  }, [])

  // Leave project room
  const leaveProjectRoom = useCallback(async (projectId) => {
    try {
      await websocketService.leaveRoom(`project_${projectId}`)
    } catch (error) {
      console.error('Failed to leave project room:', error)
    }
  }, [])

  // Send typing indicator
  const sendTyping = useCallback((projectId, isTyping) => {
    websocketService.sendTyping(`project_${projectId}`, isTyping)
  }, [])

  // Send cursor position for collaboration
  const sendCursorPosition = useCallback((projectId, cursor) => {
    websocketService.sendCursorPosition(`project_${projectId}`, cursor)
  }, [])

  // Send live code changes
  const sendCodeChanges = useCallback((projectId, changes) => {
    websocketService.sendCodeChanges(`project_${projectId}`, changes)
  }, [])

  // Generation-specific methods
  const generateWebsite = useCallback(async (projectId, message, conversationHistory = []) => {
    try {
      return await emit('generate_website', {
        type: 'generate_website',
        projectId,
        message,
        conversationHistory
      })
    } catch (error) {
      console.error('Failed to generate website:', error)
      throw error
    }
  }, [emit])

  const cancelGeneration = useCallback(async (projectId) => {
    try {
      await websocketService.cancelGeneration(projectId)
    } catch (error) {
      console.error('Failed to cancel generation:', error)
      throw error
    }
  }, [])

  const requestGenerationStatus = useCallback((projectId) => {
    websocketService.requestGenerationStatus(projectId)
  }, [])

  // Presence management
  const updatePresence = useCallback((presence) => {
    websocketService.updatePresence(presence)
  }, [])

  // Connection management
  const forceReconnect = useCallback(() => {
    websocketService.forceReconnect()
  }, [])

  const getConnectionStats = useCallback(() => {
    return websocketService.getStats()
  }, [])

  // Cleanup event handlers on unmount
  useEffect(() => {
    return () => {
      eventHandlersRef.current.forEach((handler, event) => {
        websocketService.off(event)
      })
      eventHandlersRef.current.clear()
    }
  }, [])

  return {
    // Connection state
    isConnected,
    connectionStats: getConnectionStats(),

    // Event methods
    emit,
    on,
    off,
    once,

    // Room management
    joinProjectRoom,
    leaveProjectRoom,

    // Real-time collaboration
    sendTyping,
    sendCursorPosition,
    sendCodeChanges,

    // AI Generation
    generateWebsite,
    cancelGeneration,
    requestGenerationStatus,

    // Presence
    updatePresence,

    // Connection management
    forceReconnect,
    getStats: getConnectionStats
  }
}

/**
 * Hook for real-time collaboration in a project
 */
export const useProjectCollaboration = (projectId) => {
  const { isConnected, joinProjectRoom, leaveProjectRoom, on, off, sendTyping, sendCursorPosition, sendCodeChanges } = useWebSocket()

  // Auto join/leave project room
  useEffect(() => {
    if (!isConnected || !projectId) return

    joinProjectRoom(projectId).catch(console.error)

    return () => {
      leaveProjectRoom(projectId).catch(console.error)
    }
  }, [isConnected, projectId, joinProjectRoom, leaveProjectRoom])

  // Typing indicator management
  const handleTyping = useCallback((isTyping) => {
    if (projectId) {
      sendTyping(projectId, isTyping)
    }
  }, [projectId, sendTyping])

  // Cursor position sharing
  const handleCursorMove = useCallback((cursor) => {
    if (projectId) {
      sendCursorPosition(projectId, cursor)
    }
  }, [projectId, sendCursorPosition])

  // Code changes sharing
  const handleCodeChange = useCallback((changes) => {
    if (projectId) {
      sendCodeChanges(projectId, changes)
    }
  }, [projectId, sendCodeChanges])

  return {
    isConnected,
    projectId,
    
    // Collaboration actions
    sendTyping: handleTyping,
    sendCursorPosition: handleCursorMove,
    sendCodeChanges: handleCodeChange,
    
    // Event listeners
    onTyping: (handler) => on('user_typing', handler),
    onCursorMove: (handler) => on('cursor_position', handler),
    onCodeChange: (handler) => on('code_changes', handler),
    onUserJoined: (handler) => on('user_joined', handler),
    onUserLeft: (handler) => on('user_left', handler),
    
    // Cleanup
    removeTypingListener: () => off('user_typing'),
    removeCursorListener: () => off('cursor_position'),
    removeCodeChangeListener: () => off('code_changes'),
    removeUserJoinedListener: () => off('user_joined'),
    removeUserLeftListener: () => off('user_left')
  }
}