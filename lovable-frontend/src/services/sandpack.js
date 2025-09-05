/**
 * CodeSandbox Sandpack Service
 * Handles real-time code preview using Sandpack
 */


import JSZip from 'jszip' // You'll need to install jszip
/**
 * Sandpack Service for managing code sandboxes
 */
export const sandpackService = {
  /**
   * Create a new sandbox with HTML/CSS/JS code
   * @param {Object} files - Code files
   * @param {string} files.htmlCode - HTML code
   * @param {string} files.cssCode - CSS code
   * @param {string} files.jsCode - JavaScript code
   * @param {Object} options - Sandbox options
   * @returns {Object} Sandbox configuration
   */
  createSandbox: (files, options = {}) => {
    const { htmlCode, cssCode, jsCode } = files
    const { template = 'vanilla', theme = 'dark' } = options

    // Convert our code to Sandpack file format
    const sandpackFiles = {}

    // Main HTML file
    if (htmlCode) {
      sandpackFiles['/index.html'] = {
        code: htmlCode,
        active: true
      }
    }

    // CSS file (extract from HTML or use separate)
    if (cssCode) {
      sandpackFiles['/styles.css'] = {
        code: cssCode
      }
    } else if (htmlCode) {
      // Extract CSS from HTML <style> tags
      const cssMatch = htmlCode.match(/<style[^>]*>([\s\S]*?)<\/style>/gi)
      if (cssMatch) {
        const extractedCSS = cssMatch
          .map(match => match.replace(/<\/?style[^>]*>/gi, ''))
          .join('\n')
        sandpackFiles['/styles.css'] = {
          code: extractedCSS
        }
      }
    }

    // JavaScript file (extract from HTML or use separate)
    if (jsCode) {
      sandpackFiles['/script.js'] = {
        code: jsCode
      }
    } else if (htmlCode) {
      // Extract JS from HTML <script> tags
      const jsMatch = htmlCode.match(/<script[^>]*>([\s\S]*?)<\/script>/gi)
      if (jsMatch) {
        const extractedJS = jsMatch
          .map(match => match.replace(/<\/?script[^>]*>/gi, ''))
          .join('\n')
        sandpackFiles['/script.js'] = {
          code: extractedJS
        }
      }
    }

    // Package.json for dependencies
    sandpackFiles['/package.json'] = {
      code: JSON.stringify({
        name: 'generated-website',
        version: '1.0.0',
        main: 'index.html',
        scripts: {
          start: 'parcel index.html --open',
          build: 'parcel build index.html'
        },
        dependencies: {
          // Add any detected dependencies here
        }
      }, null, 2)
    }

    return {
      files: sandpackFiles,
      template,
      theme,
      options: {
        showNavigator: false,
        showTabs: true,
        showLineNumbers: true,
        showInlineErrors: true,
        wrapContent: true,
        editorHeight: 400,
        editorWidthPercentage: 50,
        ...options
      }
    }
  },

  /**
   * Update sandbox files
   * @param {Object} currentFiles - Current files
   * @param {Object} updates - File updates
   * @returns {Object} Updated files
   */
  updateSandbox: (currentFiles, updates) => {
    return {
      ...currentFiles,
      ...updates
    }
  },

  /**
   * Get sandbox URL for sharing
   * @param {Object} sandbox - Sandbox configuration
   * @returns {string} Shareable URL
   */
  getSharableURL: (sandbox) => {
    // Create a CodeSandbox URL from files
    const parameters = {
      files: sandbox.files,
      template: sandbox.template
    }
    
    const compressed = btoa(JSON.stringify(parameters))
    return `https://codesandbox.io/s/${compressed}`
  },

  /**
   * Export sandbox as downloadable files
   * @param {Object} sandbox - Sandbox configuration
   * @returns {Blob} ZIP file blob
   */
  exportSandbox: (sandbox) => {
    const files = sandbox.files
    const zip = new JSZip() // You'll need to install jszip
    
    Object.entries(files).forEach(([path, file]) => {
      zip.file(path.replace('/', ''), file.code)
    })
    
    return zip.generateAsync({ type: 'blob' })
  },

  /**
   * Get available templates
   * @returns {Array} Available templates
   */
  getTemplates: () => [
    { id: 'vanilla', name: 'HTML/CSS/JS', description: 'Pure HTML, CSS, and JavaScript' },
    { id: 'react', name: 'React', description: 'React application' },
    { id: 'vue', name: 'Vue', description: 'Vue.js application' },
    { id: 'angular', name: 'Angular', description: 'Angular application' },
    { id: 'svelte', name: 'Svelte', description: 'Svelte application' }
  ],

  /**
   * Get available themes
   * @returns {Array} Available themes
   */
  getThemes: () => [
    { id: 'light', name: 'Light', description: 'Light theme' },
    { id: 'dark', name: 'Dark', description: 'Dark theme' },
    { id: 'github-light', name: 'GitHub Light', description: 'GitHub light theme' },
    { id: 'github-dark', name: 'GitHub Dark', description: 'GitHub dark theme' },
    { id: 'monokai-pro', name: 'Monokai Pro', description: 'Monokai Pro theme' }
  ],

  /**
   * Create React component for Sandpack
   * @param {Object} config - Sandpack configuration
   * @returns {Object} React component props
   */
  createSandpackProps: (config) => ({
    files: config.files,
    template: config.template,
    theme: config.theme,
    options: config.options,
    customSetup: {
      dependencies: {
        // Add any required dependencies
      }
    }
  }),

  /**
   * Convert HTML to React-friendly format
   * @param {string} htmlCode - HTML code
   * @returns {Object} React component files
   */
  convertToReact: (htmlCode) => {
    // Basic HTML to React conversion
    let reactCode = htmlCode
      .replace(/class=/g, 'className=')
      .replace(/for=/g, 'htmlFor=')
      .replace(/onclick=/g, 'onClick=')
      .replace(/onchange=/g, 'onChange=')
      .replace(/style="([^"]*)"/g, (match, styles) => {
        const styleObj = styles.split(';').reduce((obj, style) => {
          const [key, value] = style.split(':')
          if (key && value) {
            const camelKey = key.trim().replace(/-([a-z])/g, (g) => g[1].toUpperCase())
            obj[camelKey] = value.trim()
          }
          return obj
        }, {})
        return `style={${JSON.stringify(styleObj)}}`
      })

    return {
      '/App.js': {
        code: `
export default function App() {
  return (
    <div>
      ${reactCode}
    </div>
  );
}
        `.trim()
      },
      '/index.js': {
        code: `
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
        `.trim()
      },
      '/public/index.html': {
        code: `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Generated Website</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
        `.trim()
      }
    }
  }
}