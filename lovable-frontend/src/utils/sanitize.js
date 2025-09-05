import DOMPurify from 'dompurify'

/**
 * HTML Sanitization Utilities
 * Provides safe HTML sanitization using DOMPurify
 */

// Default sanitization configuration
const DEFAULT_CONFIG = {
  ALLOWED_TAGS: [
    // Structure
    'html', 'head', 'body', 'title', 'meta', 'link',
    // Content sections
    'header', 'nav', 'main', 'section', 'article', 'aside', 'footer',
    'div', 'span', 'p', 'br', 'hr',
    // Headings
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    // Lists
    'ul', 'ol', 'li', 'dl', 'dt', 'dd',
    // Text formatting
    'strong', 'b', 'em', 'i', 'u', 's', 'small', 'mark', 'del', 'ins', 'sub', 'sup',
    // Links and media
    'a', 'img', 'picture', 'source', 'video', 'audio', 'iframe',
    // Tables
    'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption', 'colgroup', 'col',
    // Forms (limited)
    'form', 'input', 'textarea', 'select', 'option', 'optgroup', 'button', 'label', 'fieldset', 'legend',
    // Interactive elements
    'details', 'summary', 'dialog',
    // Inline elements
    'code', 'pre', 'kbd', 'samp', 'var', 'time', 'abbr', 'cite', 'q', 'blockquote',
    // Style and script (controlled)
    'style'
  ],
  
  ALLOWED_ATTR: [
    // Global attributes
    'class', 'id', 'style', 'title', 'lang', 'dir',
    'data-*', 'aria-*', 'role',
    // Link attributes
    'href', 'target', 'rel', 'download',
    // Media attributes
    'src', 'alt', 'width', 'height', 'loading', 'decoding',
    'controls', 'autoplay', 'muted', 'loop', 'poster',
    'sizes', 'srcset', 'media', 'type',
    // Form attributes
    'name', 'value', 'placeholder', 'required', 'disabled', 'readonly',
    'type', 'accept', 'multiple', 'min', 'max', 'step', 'pattern',
    'autocomplete', 'autofocus', 'checked', 'selected',
    // Table attributes
    'colspan', 'rowspan', 'scope', 'headers',
    // Interactive attributes
    'open', 'hidden', 'contenteditable', 'spellcheck', 'translate',
    // Meta attributes
    'charset', 'content', 'name', 'property', 'http-equiv',
    // Viewport and responsive
    'viewport'
  ],
  
  ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|xxx):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
  
  KEEP_CONTENT: true,
  RETURN_DOM: false,
  RETURN_DOM_FRAGMENT: false,
  RETURN_DOM_IMPORT: false,
  SANITIZE_DOM: true,
  WHOLE_DOCUMENT: true
}

// Strict configuration for user-generated content
const STRICT_CONFIG = {
  ALLOWED_TAGS: [
    'p', 'br', 'strong', 'em', 'u', 'i', 'b', 'span', 'div',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li', 'blockquote', 'pre', 'code',
    'a', 'img'
  ],
  
  ALLOWED_ATTR: [
    'class', 'href', 'src', 'alt', 'title', 'target', 'rel'
  ],
  
  ALLOWED_URI_REGEXP: /^https?:\/\//i,
  KEEP_CONTENT: true
}

// Preview-only configuration (more permissive)
const PREVIEW_CONFIG = {
  ...DEFAULT_CONFIG,
  ALLOWED_TAGS: [
    ...DEFAULT_CONFIG.ALLOWED_TAGS,
    'script' // Allow scripts in preview mode
  ],
  ADD_TAGS: ['script'],
  ADD_ATTR: ['onclick', 'onload', 'onerror'], // Allow some event handlers
  WHOLE_DOCUMENT: true,
  RETURN_DOM: false
}

/**
 * Main sanitization functions
 */
export const sanitizer = {
  /**
   * Sanitize HTML with default safe configuration
   * @param {string} html - HTML string to sanitize
   * @param {Object} options - Custom configuration options
   * @returns {string} Sanitized HTML
   */
  sanitize: (html, options = {}) => {
    if (!html || typeof html !== 'string') return ''
    
    const config = { ...DEFAULT_CONFIG, ...options }
    return DOMPurify.sanitize(html, config)
  },

  /**
   * Sanitize HTML with strict configuration (for user content)
   * @param {string} html - HTML string to sanitize
   * @param {Object} options - Custom configuration options
   * @returns {string} Sanitized HTML
   */
  sanitizeStrict: (html, options = {}) => {
    if (!html || typeof html !== 'string') return ''
    
    const config = { ...STRICT_CONFIG, ...options }
    return DOMPurify.sanitize(html, config)
  },

  /**
   * Sanitize HTML for preview (more permissive)
   * @param {string} html - HTML string to sanitize
   * @param {Object} options - Custom configuration options
   * @returns {string} Sanitized HTML
   */
  sanitizeForPreview: (html, options = {}) => {
    if (!html || typeof html !== 'string') return ''
    
    const config = { ...PREVIEW_CONFIG, ...options }
    
    // Additional security measures for preview
    let sanitized = DOMPurify.sanitize(html, config)
    
    // Remove potentially dangerous JavaScript
    sanitized = sanitized.replace(/javascript:/gi, '')
    sanitized = sanitized.replace(/data:text\/html/gi, 'data:text/plain')
    
    return sanitized
  },

  /**
   * Extract plain text from HTML
   * @param {string} html - HTML string
   * @returns {string} Plain text content
   */
  stripTags: (html) => {
    if (!html || typeof html !== 'string') return ''
    
    const config = {
      ALLOWED_TAGS: [],
      KEEP_CONTENT: true
    }
    
    return DOMPurify.sanitize(html, config)
  },

  /**
   * Sanitize CSS content
   * @param {string} css - CSS string to sanitize
   * @returns {string} Sanitized CSS
   */
  sanitizeCSS: (css) => {
    if (!css || typeof css !== 'string') return ''
    
    // Remove potentially dangerous CSS
    let sanitized = css
      // Remove @import statements
      .replace(/@import\s+[^;]+;/gi, '')
      // Remove javascript: URLs
      .replace(/javascript:/gi, '')
      // Remove expression() calls (IE-specific)
      .replace(/expression\s*\([^)]*\)/gi, '')
      // Remove -moz-binding (Firefox-specific)
      .replace(/-moz-binding\s*:[^;]+;/gi, '')
      // Remove behavior property (IE-specific)
      .replace(/behavior\s*:[^;]+;/gi, '')
    
    return sanitized
  },

  /**
   * Validate and sanitize inline styles
   * @param {string} style - Inline style string
   * @returns {string} Sanitized style
   */
  sanitizeInlineStyle: (style) => {
    if (!style || typeof style !== 'string') return ''
    
    // List of allowed CSS properties
    const allowedProperties = [
      'color', 'background', 'background-color', 'background-image', 'background-position', 'background-repeat', 'background-size',
      'border', 'border-color', 'border-style', 'border-width', 'border-radius',
      'margin', 'padding', 'width', 'height', 'max-width', 'max-height', 'min-width', 'min-height',
      'font', 'font-family', 'font-size', 'font-weight', 'font-style', 'line-height',
      'text-align', 'text-decoration', 'text-transform', 'letter-spacing', 'word-spacing',
      'display', 'position', 'top', 'right', 'bottom', 'left', 'z-index',
      'float', 'clear', 'overflow', 'visibility', 'opacity', 'cursor',
      'flex', 'flex-direction', 'flex-wrap', 'justify-content', 'align-items', 'align-content',
      'grid', 'grid-template', 'grid-gap', 'box-shadow', 'text-shadow', 'transform', 'transition'
    ]
    
    const properties = style.split(';').filter(prop => {
      const [property] = prop.split(':').map(s => s.trim())
      return property && allowedProperties.some(allowed => 
        property === allowed || property.startsWith(allowed + '-')
      )
    })
    
    return properties.join('; ')
  },

  /**
   * Remove scripts and dangerous elements
   * @param {string} html - HTML string
   * @returns {string} HTML without scripts
   */
  removeScripts: (html) => {
    if (!html || typeof html !== 'string') return ''
    
    const config = {
      FORBID_TAGS: ['script', 'noscript', 'iframe', 'object', 'embed', 'applet'],
      FORBID_ATTR: ['onclick', 'onload', 'onerror', 'onmouseover', 'onfocus', 'onblur'],
      KEEP_CONTENT: true
    }
    
    return DOMPurify.sanitize(html, config)
  },

  /**
   * Sanitize for email content
   * @param {string} html - HTML string
   * @returns {string} Email-safe HTML
   */
  sanitizeForEmail: (html) => {
    if (!html || typeof html !== 'string') return ''
    
    const config = {
      ALLOWED_TAGS: [
        'p', 'br', 'strong', 'em', 'b', 'i', 'u', 'span', 'div',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
        'img', 'a'
      ],
      ALLOWED_ATTR: [
        'class', 'style', 'href', 'src', 'alt', 'title', 'width', 'height',
        'border', 'cellpadding', 'cellspacing', 'align', 'valign'
      ],
      ALLOWED_URI_REGEXP: /^https?:\/\//i,
      KEEP_CONTENT: true
    }
    
    return DOMPurify.sanitize(html, config)
  }
}

/**
 * Security validation functions
 */
export const securityValidator = {
  /**
   * Check if HTML contains potentially dangerous content
   * @param {string} html - HTML to check
   * @returns {Object} Security analysis
   */
  analyzeHtml: (html) => {
    if (!html || typeof html !== 'string') {
      return { isSafe: true, issues: [] }
    }
    
    const issues = []
    const lowercaseHtml = html.toLowerCase()
    
    // Check for script tags
    if (lowercaseHtml.includes('<script')) {
      issues.push('Contains script tags')
    }
    
    // Check for event handlers
    const eventHandlers = ['onclick', 'onload', 'onerror', 'onmouseover', 'onfocus', 'onblur']
    eventHandlers.forEach(handler => {
      if (lowercaseHtml.includes(handler)) {
        issues.push(`Contains ${handler} event handler`)
      }
    })
    
    // Check for javascript: URLs
    if (lowercaseHtml.includes('javascript:')) {
      issues.push('Contains javascript: URLs')
    }
    
    // Check for data: URLs with HTML content
    if (lowercaseHtml.includes('data:text/html')) {
      issues.push('Contains data URLs with HTML content')
    }
    
    // Check for potentially dangerous tags
    const dangerousTags = ['iframe', 'object', 'embed', 'applet', 'form']
    dangerousTags.forEach(tag => {
      if (lowercaseHtml.includes(`<${tag}`)) {
        issues.push(`Contains ${tag} tag`)
      }
    })
    
    return {
      isSafe: issues.length === 0,
      issues,
      riskLevel: issues.length === 0 ? 'low' : issues.length < 3 ? 'medium' : 'high'
    }
  },

  /**
   * Check if CSS contains potentially dangerous content
   * @param {string} css - CSS to check
   * @returns {Object} Security analysis
   */
  analyzeCss: (css) => {
    if (!css || typeof css !== 'string') {
      return { isSafe: true, issues: [] }
    }
    
    const issues = []
    const lowercaseCss = css.toLowerCase()
    
    // Check for @import statements
    if (lowercaseCss.includes('@import')) {
      issues.push('Contains @import statements')
    }
    
    // Check for expression() calls
    if (lowercaseCss.includes('expression(')) {
      issues.push('Contains expression() calls')
    }
    
    // Check for javascript: URLs
    if (lowercaseCss.includes('javascript:')) {
      issues.push('Contains javascript: URLs')
    }
    
    // Check for -moz-binding
    if (lowercaseCss.includes('-moz-binding')) {
      issues.push('Contains -moz-binding property')
    }
    
    // Check for behavior property
    if (lowercaseCss.includes('behavior:')) {
      issues.push('Contains behavior property')
    }
    
    return {
      isSafe: issues.length === 0,
      issues,
      riskLevel: issues.length === 0 ? 'low' : 'medium'
    }
  }
}

/**
 * Utility functions for sanitization
 */
export const sanitizeUtils = {
  /**
   * Get sanitization statistics
   * @param {string} original - Original HTML
   * @param {string} sanitized - Sanitized HTML
   * @returns {Object} Statistics
   */
  getStats: (original, sanitized) => {
    const originalLength = original?.length || 0
    const sanitizedLength = sanitized?.length || 0
    const reduction = originalLength > 0 ? ((originalLength - sanitizedLength) / originalLength) * 100 : 0
    
    return {
      originalLength,
      sanitizedLength,
      reduction: Math.round(reduction * 100) / 100,
      wasModified: original !== sanitized
    }
  },

  /**
   * Check if DOMPurify is supported
   * @returns {boolean} Whether DOMPurify is available
   */
  isSupported: () => {
    return typeof DOMPurify !== 'undefined' && DOMPurify.sanitize
  },

  /**
   * Get DOMPurify version info
   * @returns {Object} Version information
   */
  getVersion: () => {
    return {
      version: DOMPurify.version || 'unknown',
      isSupported: sanitizeUtils.isSupported()
    }
  }
}

// Export default sanitization function
export default sanitizer.sanitize