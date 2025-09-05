/**
 * Formatting Utilities
 * Functions for formatting text, numbers, dates, and other data
 */

/**
 * Text formatting functions
 */
export const textFormatter = {
  /**
   * Convert string to title case
   * @param {string} str - String to convert
   * @returns {string} Title case string
   */
  toTitleCase: (str) => {
    if (!str) return ''
    
    return str.replace(/\w\S*/g, (txt) => 
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    )
  },

  /**
   * Convert string to sentence case
   * @param {string} str - String to convert
   * @returns {string} Sentence case string
   */
  toSentenceCase: (str) => {
    if (!str) return ''
    
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
  },

  /**
   * Convert camelCase to kebab-case
   * @param {string} str - String to convert
   * @returns {string} Kebab case string
   */
  camelToKebab: (str) => {
    if (!str) return ''
    
    return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
  },

  /**
   * Convert kebab-case to camelCase
   * @param {string} str - String to convert
   * @returns {string} Camel case string
   */
  kebabToCamel: (str) => {
    if (!str) return ''
    
    return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase())
  },

  /**
   * Convert snake_case to camelCase
   * @param {string} str - String to convert
   * @returns {string} Camel case string
   */
  snakeToCamel: (str) => {
    if (!str) return ''
    
    return str.replace(/_([a-z])/g, (g) => g[1].toUpperCase())
  },

  /**
   * Truncate text with ellipsis
   * @param {string} text - Text to truncate
   * @param {number} maxLength - Maximum length
   * @param {string} suffix - Suffix to add (default: '...')
   * @returns {string} Truncated text
   */
  truncate: (text, maxLength, suffix = '...') => {
    if (!text || text.length <= maxLength) return text || ''
    return text.substring(0, maxLength - suffix.length) + suffix
  },

  /**
   * Wrap text at word boundaries
   * @param {string} text - Text to wrap
   * @param {number} width - Line width
   * @returns {string} Wrapped text
   */
  wordWrap: (text, width = 80) => {
    if (!text) return ''
    
    const regex = new RegExp(`(.{1,${width}})(?:\\s|$)`, 'g')
    return text.match(regex)?.join('\n') || text
  },

  /**
   * Remove extra whitespace
   * @param {string} str - String to clean
   * @returns {string} Cleaned string
   */
  cleanWhitespace: (str) => {
    if (!str) return ''
    
    return str.replace(/\s+/g, ' ').trim()
  },

  /**
   * Extract words from text
   * @param {string} text - Text to extract words from
   * @returns {string[]} Array of words
   */
  extractWords: (text) => {
    if (!text) return []
    
    return text.match(/\b\w+\b/g) || []
  },

  /**
   * Count words in text
   * @param {string} text - Text to count
   * @returns {number} Word count
   */
  wordCount: (text) => {
    if (!text) return 0
    
    return textFormatter.extractWords(text).length
  },

  /**
   * Estimate reading time
   * @param {string} text - Text to analyze
   * @param {number} wpm - Words per minute (default: 200)
   * @returns {Object} Reading time info
   */
  readingTime: (text, wpm = 200) => {
    if (!text) return { minutes: 0, words: 0, text: '0 min read' }
    
    const words = textFormatter.wordCount(text)
    const minutes = Math.ceil(words / wpm)
    
    return {
      minutes,
      words,
      text: `${minutes} min read`
    }
  }
}

/**
 * Number formatting functions
 */
export const numberFormatter = {
  /**
   * Format number with commas
   * @param {number} num - Number to format
   * @param {string} locale - Locale (default: 'en-US')
   * @returns {string} Formatted number
   */
  withCommas: (num, locale = 'en-US') => {
    if (typeof num !== 'number') return '0'
    
    return new Intl.NumberFormat(locale).format(num)
  },

  /**
   * Format number as currency
   * @param {number} amount - Amount to format
   * @param {string} currency - Currency code (default: 'USD')
   * @param {string} locale - Locale (default: 'en-US')
   * @returns {string} Formatted currency
   */
  currency: (amount, currency = 'USD', locale = 'en-US') => {
    if (typeof amount !== 'number') return '$0.00'
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency
    }).format(amount)
  },

  /**
   * Format number as percentage
   * @param {number} num - Number to format (0-1 range)
   * @param {number} decimals - Decimal places (default: 1)
   * @param {string} locale - Locale (default: 'en-US')
   * @returns {string} Formatted percentage
   */
  percentage: (num, decimals = 1, locale = 'en-US') => {
    if (typeof num !== 'number') return '0%'
    
    return new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(num)
  },

  /**
   * Format large numbers with units (K, M, B)
   * @param {number} num - Number to format
   * @param {number} decimals - Decimal places (default: 1)
   * @returns {string} Formatted number
   */
  compact: (num, decimals = 1) => {
    if (typeof num !== 'number') return '0'
    
    const units = ['', 'K', 'M', 'B', 'T']
    let unitIndex = 0
    let value = num
    
    while (value >= 1000 && unitIndex < units.length - 1) {
      value /= 1000
      unitIndex++
    }
    
    return `${value.toFixed(decimals).replace(/\.0$/, '')}${units[unitIndex]}`
  },

  /**
   * Format file size
   * @param {number} bytes - Size in bytes
   * @param {number} decimals - Decimal places (default: 2)
   * @returns {string} Formatted file size
   */
  fileSize: (bytes, decimals = 2) => {
    if (!bytes || bytes === 0) return '0 B'
    
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`
  },

  /**
   * Format number with ordinal suffix
   * @param {number} num - Number to format
   * @returns {string} Number with ordinal suffix
   */
  ordinal: (num) => {
    if (typeof num !== 'number') return '0th'
    
    const suffixes = ['th', 'st', 'nd', 'rd']
    const value = num % 100
    
    return num + (suffixes[(value - 20) % 10] || suffixes[value] || suffixes[0])
  }
}

/**
 * Date formatting functions
 */
export const dateFormatter = {
  /**
   * Format date for display
   * @param {Date|string} date - Date to format
   * @param {Object} options - Formatting options
   * @param {string} locale - Locale (default: 'en-US')
   * @returns {string} Formatted date
   */
  format: (date, options = {}, locale = 'en-US') => {
    if (!date) return ''
    
    const dateObj = typeof date === 'string' ? new Date(date) : date
    
    const defaultOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...options
    }
    
    try {
      return dateObj.toLocaleDateString(locale, defaultOptions)
    } catch (error) {
      console.warn('Date formatting error:', error)
      return 'Invalid Date'
    }
  },

  /**
   * Format time for display
   * @param {Date|string} date - Date to format
   * @param {Object} options - Formatting options
   * @param {string} locale - Locale (default: 'en-US')
   * @returns {string} Formatted time
   */
  time: (date, options = {}, locale = 'en-US') => {
    if (!date) return ''
    
    const dateObj = typeof date === 'string' ? new Date(date) : date
    
    const defaultOptions = {
      hour: '2-digit',
      minute: '2-digit',
      ...options
    }
    
    try {
      return dateObj.toLocaleTimeString(locale, defaultOptions)
    } catch (error) {
      console.warn('Time formatting error:', error)
      return 'Invalid Time'
    }
  },

  /**
   * Format date and time
   * @param {Date|string} date - Date to format
   * @param {string} locale - Locale (default: 'en-US')
   * @returns {string} Formatted date and time
   */
  dateTime: (date, locale = 'en-US') => {
    if (!date) return ''
    
    const dateObj = typeof date === 'string' ? new Date(date) : date
    
    try {
      return dateObj.toLocaleString(locale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (error) {
      console.warn('DateTime formatting error:', error)
      return 'Invalid DateTime'
    }
  },

  /**
   * Format relative time (e.g., "2 hours ago")
   * @param {Date|string} date - Date to format
   * @returns {string} Relative time string
   */
  relative: (date) => {
    if (!date) return ''
    
    const dateObj = typeof date === 'string' ? new Date(date) : date
    const now = new Date()
    const diffMs = now - dateObj
    
    const diffSeconds = Math.floor(diffMs / 1000)
    const diffMinutes = Math.floor(diffSeconds / 60)
    const diffHours = Math.floor(diffMinutes / 60)
    const diffDays = Math.floor(diffHours / 24)
    const diffWeeks = Math.floor(diffDays / 7)
    const diffMonths = Math.floor(diffDays / 30)
    const diffYears = Math.floor(diffDays / 365)
    
    if (diffSeconds < 60) return 'just now'
    if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`
    if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks === 1 ? '' : 's'} ago`
    if (diffMonths < 12) return `${diffMonths} month${diffMonths === 1 ? '' : 's'} ago`
    return `${diffYears} year${diffYears === 1 ? '' : 's'} ago`
  },

  /**
   * Format ISO date string
   * @param {Date|string} date - Date to format
   * @returns {string} ISO date string
   */
  iso: (date) => {
    if (!date) return ''
    
    const dateObj = typeof date === 'string' ? new Date(date) : date
    
    try {
      return dateObj.toISOString()
    } catch (error) {
      console.warn('ISO date formatting error:', error)
      return ''
    }
  },

  /**
   * Format date for input fields
   * @param {Date|string} date - Date to format
   * @returns {string} Date string for inputs (YYYY-MM-DD)
   */
  forInput: (date) => {
    if (!date) return ''
    
    const dateObj = typeof date === 'string' ? new Date(date) : date
    
    try {
      return dateObj.toISOString().split('T')[0]
    } catch (error) {
      console.warn('Input date formatting error:', error)
      return ''
    }
  }
}

/**
 * Code formatting functions
 */
export const codeFormatter = {
  /**
   * Format HTML code with basic indentation
   * @param {string} html - HTML code to format
   * @param {string} indent - Indentation string (default: '  ')
   * @returns {string} Formatted HTML
   */
  html: (html, indent = '  ') => {
    if (!html) return ''
    
    let formatted = ''
    let indentLevel = 0
    const tokens = html.split(/(<\/?[^>]+>)/).filter(token => token.trim())
    
    tokens.forEach(token => {
      if (token.match(/<\/[^>]+>/)) {
        indentLevel--
        formatted += indent.repeat(Math.max(0, indentLevel)) + token + '\n'
      } else if (token.match(/<[^/>]+>/)) {
        formatted += indent.repeat(indentLevel) + token + '\n'
        if (!token.match(/<(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)/)) {
          indentLevel++
        }
      } else if (token.trim()) {
        formatted += indent.repeat(indentLevel) + token.trim() + '\n'
      }
    })
    
    return formatted.trim()
  },

  /**
   * Format CSS code with basic indentation
   * @param {string} css - CSS code to format
   * @param {string} indent - Indentation string (default: '  ')
   * @returns {string} Formatted CSS
   */
  css: (css, indent = '  ') => {
    if (!css) return ''
    
    return css
      .replace(/\{/g, ' {\n')
      .replace(/\}/g, '\n}\n')
      .replace(/;/g, ';\n')
      .split('\n')
      .map(line => {
        const trimmed = line.trim()
        if (!trimmed) return ''
        if (trimmed.endsWith('{')) return trimmed
        if (trimmed === '}') return trimmed
        return indent + trimmed
      })
      .filter(line => line.length > 0)
      .join('\n')
  },

  /**
   * Format JavaScript code with basic indentation
   * @param {string} js - JavaScript code to format
   * @param {string} indent - Indentation string (default: '  ')
   * @returns {string} Formatted JavaScript
   */
  javascript: (js, indent = '  ') => {
    if (!js) return ''
    
    // Basic formatting - not a full parser
    let formatted = js
      .replace(/\{/g, ' {\n')
      .replace(/\}/g, '\n}\n')
      .replace(/;/g, ';\n')
      .replace(/,/g, ',\n')
    
    const lines = formatted.split('\n')
    let indentLevel = 0
    
    return lines.map(line => {
      const trimmed = line.trim()
      if (!trimmed) return ''
      
      if (trimmed.includes('}')) indentLevel--
      const result = indent.repeat(Math.max(0, indentLevel)) + trimmed
      if (trimmed.includes('{')) indentLevel++
      
      return result
    }).filter(line => line.length > 0).join('\n')
  },

  /**
   * Minify HTML code
   * @param {string} html - HTML code to minify
   * @returns {string} Minified HTML
   */
  minifyHtml: (html) => {
    if (!html) return ''
    
    return html
      .replace(/\s+/g, ' ')
      .replace(/>\s+</g, '><')
      .replace(/^\s+|\s+$/g, '')
  },

  /**
   * Minify CSS code
   * @param {string} css - CSS code to minify
   * @returns {string} Minified CSS
   */
  minifyCss: (css) => {
    if (!css) return ''
    
    return css
      .replace(/\s+/g, ' ')
      .replace(/;\s*}/g, '}')
      .replace(/\s*{\s*/g, '{')
      .replace(/;\s*/g, ';')
      .replace(/,\s*/g, ',')
      .replace(/:\s*/g, ':')
      .trim()
  }
}

/**
 * URL formatting functions
 */
export const urlFormatter = {
  /**
   * Add protocol to URL if missing
   * @param {string} url - URL to format
   * @param {string} protocol - Protocol to add (default: 'https://')
   * @returns {string} Formatted URL
   */
  addProtocol: (url, protocol = 'https://') => {
    if (!url) return ''
    
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url
    }
    
    return protocol + url
  },

  /**
   * Extract domain from URL
   * @param {string} url - URL to extract from
   * @returns {string} Domain name
   */
  extractDomain: (url) => {
    if (!url) return ''
    
    try {
      const urlObj = new URL(urlFormatter.addProtocol(url))
      return urlObj.hostname
    } catch {
      return ''
    }
  },

  /**
   * Create query string from object
   * @param {Object} params - Parameters object
   * @returns {string} Query string
   */
  buildQuery: (params) => {
    if (!params || typeof params !== 'object') return ''
    
    const searchParams = new URLSearchParams()
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(v => searchParams.append(key, String(v)))
        } else {
          searchParams.append(key, String(value))
        }
      }
    })
    
    return searchParams.toString()
  },

  /**
   * Parse query string to object
   * @param {string} query - Query string
   * @returns {Object} Parameters object
   */
  parseQuery: (query) => {
    if (!query) return {}
    
    const params = new URLSearchParams(query.startsWith('?') ? query.slice(1) : query)
    const result = {}
    
    for (const [key, value] of params) {
      if (result[key]) {
        if (Array.isArray(result[key])) {
          result[key].push(value)
        } else {
          result[key] = [result[key], value]
        }
      } else {
        result[key] = value
      }
    }
    
    return result
  }
}

// Export all formatters
export default {
  text: textFormatter,
  number: numberFormatter,
  date: dateFormatter,
  code: codeFormatter,
  url: urlFormatter
}