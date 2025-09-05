import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * UI Store
 * Manages UI state including theme, modals, sidebar, and global UI settings
 */
export const useUIStore = create(
  persist(
    (set, get) => ({
      // Theme settings
      theme: 'light',
      systemTheme: false,

      // Layout settings
      sidebarOpen: true,
      sidebarCollapsed: false,
      mobileMenuOpen: false,

      // Modal states
      modals: {
        createProject: false,
        deleteProject: false,
        exportProject: false,
        userProfile: false,
        settings: false,
        feedback: false,
        shortcuts: false
      },

      // Loading states
      globalLoading: false,
      loadingMessage: '',

      // Notification settings
      notifications: {
        enabled: true,
        sound: false,
        desktop: false,
        email: true
      },

      // Editor settings
      editor: {
        fontSize: 14,
        theme: 'vs-dark',
        wordWrap: true,
        minimap: false,
        lineNumbers: true,
        autoSave: true,
        autoSaveDelay: 2000
      },

      // Preview settings
      preview: {
        responsive: false,
        device: 'desktop', // desktop, tablet, mobile
        zoom: 100,
        showGrid: false,
        showRulers: false
      },

      // Chat settings
      chat: {
        soundEnabled: true,
        autoScroll: true,
        showTimestamps: false,
        compactMode: false
      },

      // Accessibility settings
      accessibility: {
        reducedMotion: false,
        highContrast: false,
        fontSize: 'normal', // small, normal, large
        focusIndicators: true
      },

      // Actions
      /**
       * Initialize theme based on system preference or stored value
       */
      initializeTheme: () => {
        const { systemTheme } = get()
        
        if (systemTheme) {
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
          set({ theme: prefersDark ? 'dark' : 'light' })
          
          // Listen for system theme changes
          const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
          mediaQuery.addEventListener('change', (e) => {
            if (get().systemTheme) {
              set({ theme: e.matches ? 'dark' : 'light' })
            }
          })
        }
      },

      /**
       * Toggle theme between light and dark
       */
      toggleTheme: () => {
        set(state => ({
          theme: state.theme === 'light' ? 'dark' : 'light',
          systemTheme: false
        }))
      },

      /**
       * Set specific theme
       */
      setTheme: (theme) => {
        set({ theme, systemTheme: false })
      },

      /**
       * Use system theme preference
       */
      useSystemTheme: () => {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        set({ 
          theme: prefersDark ? 'dark' : 'light',
          systemTheme: true 
        })
      },

      /**
       * Toggle sidebar visibility
       */
      toggleSidebar: () => {
        set(state => ({ sidebarOpen: !state.sidebarOpen }))
      },

      /**
       * Toggle sidebar collapse state
       */
      toggleSidebarCollapse: () => {
        set(state => ({ sidebarCollapsed: !state.sidebarCollapsed }))
      },

      /**
       * Set sidebar state
       */
      setSidebarOpen: (open) => {
        set({ sidebarOpen: open })
      },

      /**
       * Toggle mobile menu
       */
      toggleMobileMenu: () => {
        set(state => ({ mobileMenuOpen: !state.mobileMenuOpen }))
      },

      /**
       * Close mobile menu
       */
      closeMobileMenu: () => {
        set({ mobileMenuOpen: false })
      },

      /**
       * Open modal by name
       */
      openModal: (modalName) => {
        set(state => ({
          modals: { ...state.modals, [modalName]: true }
        }))
      },

      /**
       * Close modal by name
       */
      closeModal: (modalName) => {
        set(state => ({
          modals: { ...state.modals, [modalName]: false }
        }))
      },

      /**
       * Close all modals
       */
      closeAllModals: () => {
        set(state => ({
          modals: Object.keys(state.modals).reduce((acc, key) => {
            acc[key] = false
            return acc
          }, {})
        }))
      },

      /**
       * Set global loading state
       */
      setGlobalLoading: (loading, message = '') => {
        set({ globalLoading: loading, loadingMessage: message })
      },

      /**
       * Update notification settings
       */
      updateNotifications: (settings) => {
        set(state => ({
          notifications: { ...state.notifications, ...settings }
        }))
      },

      /**
       * Update editor settings
       */
      updateEditorSettings: (settings) => {
        set(state => ({
          editor: { ...state.editor, ...settings }
        }))
      },

      /**
       * Update preview settings
       */
      updatePreviewSettings: (settings) => {
        set(state => ({
          preview: { ...state.preview, ...settings }
        }))
      },

      /**
       * Set preview device
       */
      setPreviewDevice: (device) => {
        set(state => ({
          preview: { ...state.preview, device }
        }))
      },

      /**
       * Set preview zoom
       */
      setPreviewZoom: (zoom) => {
        set(state => ({
          preview: { ...state.preview, zoom: Math.max(25, Math.min(200, zoom)) }
        }))
      },

      /**
       * Toggle preview responsive mode
       */
      toggleResponsiveMode: () => {
        set(state => ({
          preview: { ...state.preview, responsive: !state.preview.responsive }
        }))
      },

      /**
       * Update chat settings
       */
      updateChatSettings: (settings) => {
        set(state => ({
          chat: { ...state.chat, ...settings }
        }))
      },

      /**
       * Update accessibility settings
       */
      updateAccessibility: (settings) => {
        set(state => ({
          accessibility: { ...state.accessibility, ...settings }
        }))
        
        // Apply accessibility changes to document
        const { accessibility } = { ...get().accessibility, ...settings }
        
        if (accessibility.reducedMotion) {
          document.documentElement.style.setProperty('--animation-duration', '0.01ms')
        } else {
          document.documentElement.style.removeProperty('--animation-duration')
        }
        
        if (accessibility.highContrast) {
          document.documentElement.classList.add('high-contrast')
        } else {
          document.documentElement.classList.remove('high-contrast')
        }
        
        document.documentElement.setAttribute('data-font-size', accessibility.fontSize)
      },

      /**
       * Get responsive breakpoints
       */
      getBreakpoints: () => ({
        sm: 640,
        md: 768,
        lg: 1024,
        xl: 1280,
        '2xl': 1536
      }),

      /**
       * Check if screen size matches breakpoint
       */
      isScreenSize: (breakpoint) => {
        const breakpoints = get().getBreakpoints()
        return window.innerWidth >= (breakpoints[breakpoint] || 0)
      },

      /**
       * Get current device type based on screen size
       */
      getCurrentDevice: () => {
        const width = window.innerWidth
        if (width < 768) return 'mobile'
        if (width < 1024) return 'tablet'
        return 'desktop'
      },

      /**
       * Check if user prefers reduced motion
       */
      prefersReducedMotion: () => {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches
      },

      /**
       * Show keyboard shortcuts
       */
      showShortcuts: () => {
        get().openModal('shortcuts')
      },

      /**
       * Handle escape key press
       */
      handleEscape: () => {
        const { modals, mobileMenuOpen } = get()
        const openModal = Object.keys(modals).find(key => modals[key])
        
        if (openModal) {
          get().closeModal(openModal)
        } else if (mobileMenuOpen) {
          get().closeMobileMenu()
        }
      },

      /**
       * Reset UI settings to defaults
       */
      resetUISettings: () => {
        set({
          theme: 'light',
          systemTheme: false,
          sidebarOpen: true,
          sidebarCollapsed: false,
          notifications: {
            enabled: true,
            sound: false,
            desktop: false,
            email: true
          },
          editor: {
            fontSize: 14,
            theme: 'vs-dark',
            wordWrap: true,
            minimap: false,
            lineNumbers: true,
            autoSave: true,
            autoSaveDelay: 2000
          },
          preview: {
            responsive: false,
            device: 'desktop',
            zoom: 100,
            showGrid: false,
            showRulers: false
          },
          chat: {
            soundEnabled: true,
            autoScroll: true,
            showTimestamps: false,
            compactMode: false
          },
          accessibility: {
            reducedMotion: false,
            highContrast: false,
            fontSize: 'normal',
            focusIndicators: true
          }
        })
      },

      /**
       * Export UI settings
       */
      exportSettings: () => {
        const settings = {
          theme: get().theme,
          systemTheme: get().systemTheme,
          notifications: get().notifications,
          editor: get().editor,
          preview: get().preview,
          chat: get().chat,
          accessibility: get().accessibility,
          exportedAt: new Date().toISOString()
        }

        const blob = new Blob([JSON.stringify(settings, null, 2)], {
          type: 'application/json'
        })
        
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `lovable-settings-${Date.now()}.json`
        document.body.appendChild(a)
        a.click()
        URL.revokeObjectURL(url)
        document.body.removeChild(a)
      },

      /**
       * Import UI settings
       */
      importSettings: (settingsData) => {
        try {
          const {
            theme,
            systemTheme,
            notifications,
            editor,
            preview,
            chat,
            accessibility
          } = settingsData

          set({
            theme: theme || 'light',
            systemTheme: systemTheme || false,
            notifications: { ...get().notifications, ...notifications },
            editor: { ...get().editor, ...editor },
            preview: { ...get().preview, ...preview },
            chat: { ...get().chat, ...chat },
            accessibility: { ...get().accessibility, ...accessibility }
          })

          // Apply accessibility settings
          get().updateAccessibility(accessibility || {})
          
          return true
        } catch (error) {
          console.error('Failed to import settings:', error)
          return false
        }
      }
    }),
    {
      name: 'ui-settings',
      partialize: (state) => ({
        theme: state.theme,
        systemTheme: state.systemTheme,
        sidebarCollapsed: state.sidebarCollapsed,
        notifications: state.notifications,
        editor: state.editor,
        preview: state.preview,
        chat: state.chat,
        accessibility: state.accessibility
      })
    }
  )
)