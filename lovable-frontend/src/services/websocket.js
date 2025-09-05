import io from 'socket.io-client'

/**
 * WebSocket Service
 * Manages real-time communication for AI generation and collaboration
 */
class WebSocketService {
  constructor() {
    this.socket = null
    this.isConnected = false
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectInterval = 1000
    this.eventListeners = new Map()
    this.connectionPromise = null
    this.userId = null
    this.lastHeartbeat = null
    this.heartbeatInterval = null
  }

  /**
   * Connect to WebSocket server
   * @param {string} userId - User ID for authentication
   * @returns {Promise<void>}
   */
  async connect(userId) {
    if (this.connectionPromise) {
      return this.connectionPromise
    }

    this.userId = userId
    this.connectionPromise = this._establishConnection()
    
    try {
      await this.connectionPromise
    } catch (error) {
      this.connectionPromise = null
      throw error
    }
  }

  /**
   * Establish WebSocket connection
   * @private
   */
  _establishConnection() {
    return new Promise((resolve, reject) => {
      const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3001'
      
      // Get auth token for connection
      const token = this._getAuthToken()
      
      this.socket = io(wsUrl, {
        transports: ['websocket', 'polling'],
        timeout: 10000,
        auth: {
          token,
          userId: this.userId
        },
        query: {
          clientVersion: '1.0.0',
          platform: navigator.platform,
          userAgent: navigator.userAgent.slice(0, 100)
        }
      })

      // Connection success
      this.socket.on('connect', () => {
        console.log('WebSocket connected')
        this.isConnected = true
        this.reconnectAttempts = 0
        this._startHeartbeat()
        resolve()
        
        // Emit stored event listeners
        this.eventListeners.forEach((callback, event) => {
          this.socket.on(event, callback)
        })
      })

      // Connection error
      this.socket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error)
        this.isConnected = false
        
        if (this.reconnectAttempts === 0) {
          reject(error)
        }
        
        this._handleReconnection()
      })

      // Disconnection
      this.socket.on('disconnect', (reason) => {
        console.log('WebSocket disconnected:', reason)
        this.isConnected = false
        this._stopHeartbeat()
        
        // Auto-reconnect unless it's intentional
        if (reason !== 'io client disconnect') {
          this._handleReconnection()
        }
      })

      // Authentication error
      this.socket.on('auth_error', (error) => {
        console.error('WebSocket auth error:', error)
        this.isConnected = false
        reject(new Error('Authentication failed'))
      })

      // Handle server-side errors
      this.socket.on('error', (error) => {
        console.error('WebSocket server error:', error)
      })

      // Heartbeat response
      this.socket.on('pong', (timestamp) => {
        this.lastHeartbeat = timestamp
      })
    })
  }

  /**
   * Handle reconnection logic
   * @private
   */
  _handleReconnection() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached')
      return
    }

    this.reconnectAttempts++
    const delay = this.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1) // Exponential backoff
    
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
    
    setTimeout(() => {
      if (!this.isConnected && this.socket) {
        this.socket.connect()
      }
    }, delay)
  }

  /**
   * Start heartbeat to keep connection alive
   * @private
   */
  _startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected && this.socket) {
        this.socket.emit('ping', Date.now())
      }
    }, 30000) // Every 30 seconds
  }

  /**
   * Stop heartbeat
   * @private
   */
  _stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  /**
   * Get authentication token from storage
   * @private
   */
  _getAuthToken() {
    try {
      const authStorage = localStorage.getItem('auth-storage')
      if (authStorage) {
        const parsed = JSON.parse(authStorage)
        return parsed.state?.accessToken
      }
    } catch (error) {
      console.warn('Failed to get auth token for WebSocket:', error)
    }
    return null
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
    
    this.isConnected = false
    this.connectionPromise = null
    this.reconnectAttempts = 0
    this._stopHeartbeat()
    
    console.log('WebSocket disconnected')
  }

  /**
   * Emit an event to the server
   * @param {string} event - Event name
   * @param {any} data - Event data
   * @returns {Promise<void>}
   */
  async emit(event, data) {
    if (!this.isConnected || !this.socket) {
      throw new Error('WebSocket not connected')
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Event '${event}' timed out`))
      }, 10000) // 10 second timeout

      this.socket.emit(event, data, (response) => {
        clearTimeout(timeout)
        
        if (response && response.error) {
          reject(new Error(response.error))
        } else {
          resolve(response)
        }
      })
    })
  }

  /**
   * Listen for events from the server
   * @param {string} event - Event name
   * @param {Function} callback - Event handler
   */
  on(event, callback) {
    // Store the listener for reconnection
    this.eventListeners.set(event, callback)
    
    if (this.socket && this.isConnected) {
      this.socket.on(event, callback)
    }
  }

  /**
   * Remove event listener
   * @param {string} event - Event name
   */
  off(event) {
    this.eventListeners.delete(event)
    
    if (this.socket) {
      this.socket.off(event)
    }
  }

  /**
   * Listen for an event once
   * @param {string} event - Event name
   * @param {Function} callback - Event handler
   */
  once(event, callback) {
    if (this.socket && this.isConnected) {
      this.socket.once(event, callback)
    }
  }

  /**
   * Check if WebSocket is connected
   * @returns {boolean}
   */
  getConnectionStatus() {
    return this.isConnected && this.socket && this.socket.connected
  }

  /**
   * Get connection statistics
   * @returns {Object}
   */
  getStats() {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      lastHeartbeat: this.lastHeartbeat,
      socketId: this.socket?.id || null,
      transport: this.socket?.io?.engine?.transport?.name || null
    }
  }

  /**
   * Join a room for real-time collaboration
   * @param {string} roomId - Room ID (usually project ID)
   */
  async joinRoom(roomId) {
    try {
      await this.emit('join_room', { roomId })
      console.log(`Joined room: ${roomId}`)
    } catch (error) {
      console.error('Failed to join room:', error)
      throw error
    }
  }

  /**
   * Leave a room
   * @param {string} roomId - Room ID
   */
  async leaveRoom(roomId) {
    try {
      await this.emit('leave_room', { roomId })
      console.log(`Left room: ${roomId}`)
    } catch (error) {
      console.error('Failed to leave room:', error)
    }
  }

  /**
   * Send typing indicator to room
   * @param {string} roomId - Room ID
   * @param {boolean} isTyping - Whether user is typing
   */
  sendTyping(roomId, isTyping) {
    if (this.isConnected) {
      this.emit('typing', { roomId, isTyping }).catch(console.error)
    }
  }

  /**
   * Send real-time cursor position for collaboration
   * @param {string} roomId - Room ID
   * @param {Object} cursor - Cursor position data
   */
  sendCursorPosition(roomId, cursor) {
    if (this.isConnected) {
      this.emit('cursor_position', { roomId, cursor }).catch(console.error)
    }
  }

  /**
   * Send live code changes for collaboration
   * @param {string} roomId - Room ID
   * @param {Object} changes - Code changes
   */
  sendCodeChanges(roomId, changes) {
    if (this.isConnected) {
      this.emit('code_changes', { roomId, changes }).catch(console.error)
    }
  }

  /**
   * Request generation status update
   * @param {string} projectId - Project ID
   */
  requestGenerationStatus(projectId) {
    if (this.isConnected) {
      this.emit('get_generation_status', { projectId }).catch(console.error)
    }
  }

  /**
   * Cancel ongoing generation
   * @param {string} projectId - Project ID
   */
  async cancelGeneration(projectId) {
    try {
      await this.emit('cancel_generation', { projectId })
      console.log(`Cancelled generation for project: ${projectId}`)
    } catch (error) {
      console.error('Failed to cancel generation:', error)
      throw error
    }
  }

  /**
   * Send user presence update
   * @param {Object} presence - Presence data
   */
  updatePresence(presence) {
    if (this.isConnected) {
      this.emit('presence_update', presence).catch(console.error)
    }
  }

  /**
   * Force reconnection
   */
  forceReconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket.connect()
    }
  }
}

// Create singleton instance
export const websocketService = new WebSocketService()

// Export class for testing
export { WebSocketService }