/**
 * Validation utilities for user input, code, and project data
 */

export const validation = {
  /**
   * Validate email address
   */
  validateEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return {
      isValid: emailRegex.test(email),
      errors: emailRegex.test(email) ? [] : ['Please enter a valid email address']
    }
  },

  /**
   * Validate password strength
   */
  validatePassword: (password) => {
    const errors = []
    const warnings = []

    if (!password) {
      errors.push('Password is required')
      return { isValid: false, errors, warnings }
    }

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long')
    }

    if (!/[A-Z]/.test(password)) {
      warnings.push('Password should contain at least one uppercase letter')
    }

    if (!/[a-z]/.test(password)) {
      warnings.push('Password should contain at least one lowercase letter')
    }

    if (!/\d/.test(password)) {
      warnings.push('Password should contain at least one number')
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      warnings.push('Password should contain at least one special character')
    }

    const strength = this.calculatePasswordStrength(password)

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      strength,
      score: strength.score
    }
  },

  /**
   * Calculate password strength
   */
  calculatePasswordStrength: (password) => {
    let score = 0
    let feedback = []

    // Length scoring
    if (password.length >= 8) score += 1
    if (password.length >= 12) score += 1
    if (password.length >= 16) score += 1

    // Character variety scoring
    if (/[a-z]/.test(password)) score += 1
    if (/[A-Z]/.test(password)) score += 1
    if (/\d/.test(password)) score += 1
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1

    // Bonus points for variety
    const charTypes = [
      /[a-z]/.test(password),
      /[A-Z]/.test(password),
      /\d/.test(password),
      /[!@#$%^&*(),.?":{}|<>]/.test(password)
    ].filter(Boolean).length

    if (charTypes >= 3) score += 1
    if (charTypes >= 4) score += 1

    // Determine strength level
    let level = 'weak'
    let color = 'red'

    if (score >= 6) {
      level = 'strong'
      color = 'green'
    } else if (score >= 4) {
      level = 'medium'
      color = 'yellow'
    }

    // Generate feedback
    if (password.length < 8) {
      feedback.push('Use at least 8 characters')
    }
    if (!/[a-z]/.test(password)) {
      feedback.push('Add lowercase letters')
    }
    if (!/[A-Z]/.test(password)) {
      feedback.push('Add uppercase letters')
    }
    if (!/\d/.test(password)) {
      feedback.push('Add numbers')
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      feedback.push('Add special characters')
    }

    return {
      score,
      level,
      color,
      feedback,
      percentage: Math.min((score / 8) * 100, 100)
    }
  },

  /**
   * Validate project name
   */
  validateProjectName: (name) => {
    const errors = []
    
    if (!name || name.trim().length === 0) {
      errors.push('Project name is required')
    } else if (name.trim().length < 3) {
      errors.push('Project name must be at least 3 characters long')
    } else if (name.length > 50) {
      errors.push('Project name must be less than 50 characters')
    }

    // Check for invalid characters
    if (!/^[a-zA-Z0-9\s\-_]+$/.test(name)) {
      errors.push('Project name can only contain letters, numbers, spaces, hyphens, and underscores')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  },

  /**
   * Validate file upload
   */
  validateFile: (file, options = {}) => {
    const {
      maxSize = 5 * 1024 * 1024, // 5MB default
      allowedTypes = ['image/*', 'text/*', 'application/json'],
      allowedExtensions = ['html', 'css', 'js', 'json', 'txt', 'md']
    } = options

    const errors = []

    if (!file) {
      errors.push('No file selected')
      return { isValid: false, errors }
    }

    // Check file size
    if (file.size > maxSize) {
      errors.push(`File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`)
    }

    // Check file type
    const isTypeAllowed = allowedTypes.some(type => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.slice(0, -1))
      }
      return file.type === type
    })

    if (!isTypeAllowed) {
      errors.push(`File type ${file.type} is not supported`)
    }

    // Check file extension
    const extension = file.name.split('.').pop().toLowerCase()
    if (!allowedExtensions.includes(extension)) {
      errors.push(`File extension ${extension} is not supported`)
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  },

  /**
   * Validate HTML code
   */
  validateHTML: (html) => {
    const errors = []
    const warnings = []

    if (!html || html.trim().length === 0) {
      errors.push('HTML code is required')
      return { isValid: false, errors, warnings }
    }

    // Check for basic HTML structure
    if (!html.includes('<!DOCTYPE')) {
      warnings.push('HTML should include a DOCTYPE declaration')
    }

    if (!html.includes('<html')) {
      errors.push('HTML must include an <html> tag')
    }

    if (!html.includes('<head>')) {
      warnings.push('HTML should include a <head> section')
    }

    if (!html.includes('<body>')) {
      errors.push('HTML must include a <body> tag')
    }

    // Check for common security issues
    if (html.includes('<script') && (html.includes('eval(') || html.includes('document.write'))) {
      warnings.push('Potentially unsafe JavaScript detected')
    }

    if (html.includes('javascript:')) {
      warnings.push('JavaScript URLs detected - consider using event handlers instead')
    }

    // Check for accessibility
    if (html.includes('<img') && !html.includes('alt=')) {
      warnings.push('Images should include alt attributes for accessibility')
    }

    if (!html.includes('<title>')) {
      warnings.push('HTML should include a <title> tag')
    }

    // Check for semantic HTML
    const semanticTags = ['header', 'nav', 'main', 'article', 'section', 'aside', 'footer']
    const hasSemanticTags = semanticTags.some(tag => html.includes(`<${tag}`))
    if (!hasSemanticTags) {
      warnings.push('Consider using semantic HTML tags (header, nav, main, etc.)')
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      hasBasicStructure: html.includes('<html') && html.includes('<body>'),
      hasMetaTags: html.includes('<meta'),
      hasTitle: html.includes('<title>'),
      hasSemanticTags
    }
  },

  /**
   * Validate CSS code
   */
  validateCSS: (css) => {
    const errors = []
    const warnings = []

    if (!css || css.trim().length === 0) {
      return { isValid: true, errors, warnings } // CSS is optional
    }

    // Check for basic CSS syntax issues
    const openBraces = (css.match(/{/g) || []).length
    const closeBraces = (css.match(/}/g) || []).length
    
    if (openBraces !== closeBraces) {
      errors.push('Mismatched braces in CSS')
    }

    // Check for potentially problematic properties
    if (css.includes('!important')) {
      warnings.push('Consider avoiding !important declarations')
    }

    if (css.includes('position: fixed') || css.includes('position:fixed')) {
      warnings.push('Fixed positioning may cause layout issues on mobile')
    }

    // Check for vendor prefixes
    const vendorPrefixes = ['-webkit-', '-moz-', '-ms-', '-o-']
    const hasVendorPrefixes = vendorPrefixes.some(prefix => css.includes(prefix))
    if (hasVendorPrefixes) {
      warnings.push('Consider using autoprefixer instead of manual vendor prefixes')
    }

    // Check for deprecated properties
    const deprecatedProps = ['filter:', 'zoom:', '-webkit-box-reflect:']
    const usesDeprecated = deprecatedProps.some(prop => css.includes(prop))
    if (usesDeprecated) {
      warnings.push('Some CSS properties may be deprecated or have limited support')
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      hasBraceMismatch: openBraces !== closeBraces,
      hasVendorPrefixes,
      usesDeprecated
    }
  },

  /**
   * Validate JavaScript code
   */
  validateJS: (js) => {
    const errors = []
    const warnings = []

    if (!js || js.trim().length === 0) {
      return { isValid: true, errors, warnings } // JS is optional
    }

    try {
      // Basic syntax check (this is limited but catches obvious errors)
      new Function(js)
    } catch (error) {
      errors.push(`JavaScript syntax error: ${error.message}`)
    }

    // Check for potentially problematic patterns
    if (js.includes('eval(')) {
      warnings.push('Avoid using eval() - it can be a security risk')
    }

    if (js.includes('document.write(')) {
      warnings.push('document.write() is deprecated and can cause issues')
    }

    if (js.includes('innerHTML') && !js.includes('textContent')) {
      warnings.push('Consider using textContent instead of innerHTML for security')
    }

    // Check for modern JavaScript features
    if (js.includes('var ') && !js.includes('let ') && !js.includes('const ')) {
      warnings.push('Consider using let/const instead of var')
    }

    // Check for console statements (might want to remove in production)
    if (js.includes('console.log(') || js.includes('console.error(')) {
      warnings.push('Remove console statements before deploying to production')
    }

    // Check for proper error handling
    if (js.includes('try') && !js.includes('catch')) {
      warnings.push('Try blocks should include catch blocks for proper error handling')
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      hasEval: js.includes('eval('),
      hasConsoleStatements: js.includes('console.'),
      usesModernSyntax: js.includes('let ') || js.includes('const ') || js.includes('=>')
    }
  },

  /**
   * Validate URL
   */
  validateURL: (url) => {
    try {
      new URL(url)
      return {
        isValid: true,
        errors: []
      }
    } catch (error) {
      return {
        isValid: false,
        errors: ['Please enter a valid URL']
      }
    }
  },

  /**
   * Validate color hex code
   */
  validateColor: (color) => {
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
    const namedColors = ['red', 'blue', 'green', 'yellow', 'black', 'white', 'gray', 'purple', 'orange', 'pink']
    
    const isHex = hexRegex.test(color)
    const isNamed = namedColors.includes(color.toLowerCase())
    const isRGB = color.startsWith('rgb(') && color.endsWith(')')
    const isRGBA = color.startsWith('rgba(') && color.endsWith(')')
    
    return {
      isValid: isHex || isNamed || isRGB || isRGBA,
      errors: (isHex || isNamed || isRGB || isRGBA) ? [] : ['Please enter a valid color (hex, named, rgb, or rgba)']
    }
  },

  /**
   * Validate form data
   */
  validateForm: (data, rules) => {
    const errors = {}
    const warnings = {}
    let isValid = true

    for (const [field, fieldRules] of Object.entries(rules)) {
      const value = data[field]
      const fieldErrors = []
      const fieldWarnings = []

      // Required validation
      if (fieldRules.required && (!value || value.toString().trim().length === 0)) {
        fieldErrors.push(`${field} is required`)
        isValid = false
      }

      // Skip other validations if field is empty and not required
      if (!value && !fieldRules.required) continue

      // Length validations
      if (fieldRules.minLength && value.length < fieldRules.minLength) {
        fieldErrors.push(`${field} must be at least ${fieldRules.minLength} characters`)
        isValid = false
      }

      if (fieldRules.maxLength && value.length > fieldRules.maxLength) {
        fieldErrors.push(`${field} must be no more than ${fieldRules.maxLength} characters`)
        isValid = false
      }

      // Pattern validation
      if (fieldRules.pattern && !fieldRules.pattern.test(value)) {
        fieldErrors.push(`${field} format is invalid`)
        isValid = false
      }

      // Custom validation function
      if (fieldRules.validate) {
        const customResult = fieldRules.validate(value, data)
        if (!customResult.isValid) {
          fieldErrors.push(...customResult.errors)
          isValid = false
        }
        if (customResult.warnings) {
          fieldWarnings.push(...customResult.warnings)
        }
      }

      if (fieldErrors.length > 0) {
        errors[field] = fieldErrors
      }
      if (fieldWarnings.length > 0) {
        warnings[field] = fieldWarnings
      }
    }

    return {
      isValid,
      errors,
      warnings
    }
  },

  /**
   * Sanitize HTML to prevent XSS
   */
  sanitizeHTML: (html) => {
    // Create a temporary div to parse HTML
    const temp = document.createElement('div')
    temp.innerHTML = html

    // Remove dangerous elements
    const dangerousElements = ['script', 'iframe', 'object', 'embed', 'form', 'input']
    dangerousElements.forEach(tag => {
      const elements = temp.querySelectorAll(tag)
      elements.forEach(el => el.remove())
    })

    // Remove dangerous attributes
    const dangerousAttributes = ['onclick', 'onload', 'onerror', 'onmouseover', 'onfocus', 'onblur']
    const allElements = temp.querySelectorAll('*')
    allElements.forEach(el => {
      dangerousAttributes.forEach(attr => {
        if (el.hasAttribute(attr)) {
          el.removeAttribute(attr)
        }
      })
      
      // Remove javascript: URLs
      if (el.hasAttribute('href') && el.getAttribute('href').startsWith('javascript:')) {
        el.removeAttribute('href')
      }
      if (el.hasAttribute('src') && el.getAttribute('src').startsWith('javascript:')) {
        el.removeAttribute('src')
      }
    })

    return temp.innerHTML
  },

  /**
   * Check if content contains potentially harmful code
   */
  scanForThreats: (content) => {
    const threats = []
    const warnings = []

    // Check for script injections
    if (content.includes('<script') || content.includes('javascript:')) {
      threats.push('Potential script injection detected')
    }

    // Check for SQL injection patterns
    const sqlPatterns = ['DROP TABLE', 'DELETE FROM', 'INSERT INTO', 'UPDATE SET', 'UNION SELECT']
    if (sqlPatterns.some(pattern => content.toUpperCase().includes(pattern))) {
      warnings.push('Potential SQL injection pattern detected')
    }

    // Check for command injection
    if (content.includes('exec(') || content.includes('system(') || content.includes('shell_exec(')) {
      threats.push('Potential command injection detected')
    }

    // Check for file inclusion
    if (content.includes('include(') || content.includes('require(') || content.includes('../')) {
      warnings.push('Potential file inclusion detected')
    }

    return {
      hasThreats: threats.length > 0,
      threats,
      warnings
    }
  }
}

export default validation