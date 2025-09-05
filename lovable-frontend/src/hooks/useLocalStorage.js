import { useState, useEffect, useCallback } from 'react'

/**
 * LocalStorage Hook
 * Syncs state with localStorage with SSR support and error handling
 */
export const useLocalStorage = (key, initialValue, options = {}) => {
  const {
    serialize = JSON.stringify,
    deserialize = JSON.parse,
    syncAcrossTabs = true
  } = options

  // State to store our value
  const [storedValue, setStoredValue] = useState(() => {
    try {
      // Get from local storage by key
      if (typeof window === 'undefined') {
        return initialValue
      }
      
      const item = window.localStorage.getItem(key)
      return item ? deserialize(item) : initialValue
    } catch (error) {
      // If error also return initialValue
      console.warn(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = useCallback((value) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value
      
      // Save state
      setStoredValue(valueToStore)
      
      // Save to local storage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, serialize(valueToStore))
        
        // Dispatch custom event for cross-tab sync
        if (syncAcrossTabs) {
          window.dispatchEvent(new StorageEvent('storage', {
            key,
            newValue: serialize(valueToStore),
            oldValue: serialize(storedValue),
            storageArea: window.localStorage,
            url: window.location.href
          }))
        }
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }, [key, storedValue, serialize, syncAcrossTabs])

  // Remove value from localStorage
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue)
      
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key)
        
        if (syncAcrossTabs) {
          window.dispatchEvent(new StorageEvent('storage', {
            key,
            newValue: null,
            oldValue: serialize(storedValue),
            storageArea: window.localStorage,
            url: window.location.href
          }))
        }
      }
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error)
    }
  }, [key, initialValue, serialize, storedValue, syncAcrossTabs])

  // Listen for changes to this key in other tabs/windows
  useEffect(() => {
    if (!syncAcrossTabs || typeof window === 'undefined') {
      return
    }

    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue !== serialize(storedValue)) {
        try {
          const newValue = e.newValue ? deserialize(e.newValue) : initialValue
          setStoredValue(newValue)
        } catch (error) {
          console.warn(`Error deserializing localStorage key "${key}":`, error)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [key, storedValue, initialValue, serialize, deserialize, syncAcrossTabs])

  return [storedValue, setValue, removeValue]
}

/**
 * SessionStorage Hook
 * Similar to useLocalStorage but uses sessionStorage
 */
export const useSessionStorage = (key, initialValue, options = {}) => {
  const {
    serialize = JSON.stringify,
    deserialize = JSON.parse
  } = options

  const [storedValue, setStoredValue] = useState(() => {
    try {
      if (typeof window === 'undefined') {
        return initialValue
      }
      
      const item = window.sessionStorage.getItem(key)
      return item ? deserialize(item) : initialValue
    } catch (error) {
      console.warn(`Error reading sessionStorage key "${key}":`, error)
      return initialValue
    }
  })

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem(key, serialize(valueToStore))
      }
    } catch (error) {
      console.error(`Error setting sessionStorage key "${key}":`, error)
    }
  }, [key, storedValue, serialize])

  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue)
      
      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem(key)
      }
    } catch (error) {
      console.error(`Error removing sessionStorage key "${key}":`, error)
    }
  }, [key, initialValue])

  return [storedValue, setValue, removeValue]
}

/**
 * Storage utilities
 */
export const storageUtils = {
  /**
   * Check if localStorage is available
   */
  isLocalStorageAvailable: () => {
    try {
      if (typeof window === 'undefined') return false
      
      const test = '__localStorage_test__'
      window.localStorage.setItem(test, test)
      window.localStorage.removeItem(test)
      return true
    } catch {
      return false
    }
  },

  /**
   * Check if sessionStorage is available
   */
  isSessionStorageAvailable: () => {
    try {
      if (typeof window === 'undefined') return false
      
      const test = '__sessionStorage_test__'
      window.sessionStorage.setItem(test, test)
      window.sessionStorage.removeItem(test)
      return true
    } catch {
      return false
    }
  },

  /**
   * Get storage usage information
   */
  getStorageUsage: () => {
    if (typeof window === 'undefined') return { used: 0, available: 0 }

    try {
      let used = 0
      for (let key in window.localStorage) {
        if (window.localStorage.hasOwnProperty(key)) {
          used += window.localStorage[key].length + key.length
        }
      }

      // Estimate available space (rough approximation)
      const available = 1024 * 1024 * 5 // ~5MB typical limit

      return {
        used,
        available,
        percentage: (used / available) * 100
      }
    } catch {
      return { used: 0, available: 0, percentage: 0 }
    }
  },

  /**
   * Clear all localStorage data with optional prefix filter
   */
  clearLocalStorage: (prefix = '') => {
    if (typeof window === 'undefined') return

    try {
      if (prefix) {
        const keys = Object.keys(window.localStorage)
        keys.forEach(key => {
          if (key.startsWith(prefix)) {
            window.localStorage.removeItem(key)
          }
        })
      } else {
        window.localStorage.clear()
      }
    } catch (error) {
      console.error('Error clearing localStorage:', error)
    }
  },

  /**
   * Export localStorage data
   */
  exportLocalStorage: (prefix = '') => {
    if (typeof window === 'undefined') return {}

    try {
      const data = {}
      const keys = Object.keys(window.localStorage)
      
      keys.forEach(key => {
        if (!prefix || key.startsWith(prefix)) {
          data[key] = window.localStorage.getItem(key)
        }
      })

      return data
    } catch (error) {
      console.error('Error exporting localStorage:', error)
      return {}
    }
  },

  /**
   * Import localStorage data
   */
  importLocalStorage: (data, overwrite = false) => {
    if (typeof window === 'undefined') return

    try {
      Object.keys(data).forEach(key => {
        if (overwrite || !window.localStorage.getItem(key)) {
          window.localStorage.setItem(key, data[key])
        }
      })
    } catch (error) {
      console.error('Error importing localStorage:', error)
    }
  }
}