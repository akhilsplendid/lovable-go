import { useState, useEffect } from 'react'

/**
 * Debounce Hook
 * Delays updating a value until after wait milliseconds have elapsed since the last time it was invoked
 */
export const useDebounce = (value, wait, options = {}) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    // Update debounced value after delay
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, wait)

    // Cleanup timeout if value changes before delay
    return () => {
      clearTimeout(handler)
    }
  }, [value, wait])

  // Allow immediate update if specified
  useEffect(() => {
    if (options.immediate && value !== debouncedValue) {
      setDebouncedValue(value)
    }
  }, [value, debouncedValue, options.immediate])

  return debouncedValue
}

/**
 * Debounced callback hook
 * Returns a memoized function that will only call the callback after wait milliseconds
 */
export const useDebounceCallback = (callback, wait, dependencies = []) => {
  const [debounceTimer, setDebounceTimer] = useState(null)

  const debouncedCallback = (...args) => {
    // Clear existing timer
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }

    // Set new timer
    const timer = setTimeout(() => {
      callback(...args)
      setDebounceTimer(null)
    }, wait)

    setDebounceTimer(timer)
  }

  // Cleanup on unmount or dependency changes
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer)
      }
    }
  }, [...dependencies, debounceTimer])

  return debouncedCallback
}

/**
 * Throttle Hook
 * Limits the rate at which a function can be called
 */
export const useThrottle = (value, limit) => {
  const [throttledValue, setThrottledValue] = useState(value)
  const [lastRan, setLastRan] = useState(Date.now())

  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan >= limit) {
        setThrottledValue(value)
        setLastRan(Date.now())
      }
    }, limit - (Date.now() - lastRan))

    return () => {
      clearTimeout(handler)
    }
  }, [value, limit, lastRan])

  return throttledValue
}

/**
 * Throttled callback hook
 * Returns a function that will only execute at most once per limit milliseconds
 */
export const useThrottleCallback = (callback, limit, dependencies = []) => {
  const [lastRan, setLastRan] = useState(Date.now())
  const [throttleTimer, setThrottleTimer] = useState(null)

  const throttledCallback = (...args) => {
    const now = Date.now()

    if (now - lastRan >= limit) {
      // Execute immediately
      callback(...args)
      setLastRan(now)
    } else {
      // Schedule for later
      if (throttleTimer) {
        clearTimeout(throttleTimer)
      }

      const timer = setTimeout(() => {
        callback(...args)
        setLastRan(Date.now())
        setThrottleTimer(null)
      }, limit - (now - lastRan))

      setThrottleTimer(timer)
    }
  }

  // Cleanup
  useEffect(() => {
    return () => {
      if (throttleTimer) {
        clearTimeout(throttleTimer)
      }
    }
  }, [...dependencies, throttleTimer])

  return throttledCallback
}