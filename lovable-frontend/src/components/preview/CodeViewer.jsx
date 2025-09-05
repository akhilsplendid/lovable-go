import React, { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Editor from '@monaco-editor/react'
import { 
  Code2, 
  Copy, 
  Download, 
  Eye, 
  EyeOff, 
  Maximize2, 
  Minimize2,
  Settings,
  FileCode,
  Palette,
  Braces,
  Check
} from 'lucide-react'
import Button, { IconButton, ButtonGroup } from '../ui/Button'
import { useUIStore } from '../../store/uiStore'
import toast from 'react-hot-toast'

/**
 * CodeViewer Component
 * Displays and allows editing of HTML, CSS, and JavaScript code with Monaco Editor
 */
export const CodeViewer = ({
  htmlCode = '',
  cssCode = '',
  jsCode = '',
  readOnly = false,
  onCodeChange,
  className = '',
  showLineNumbers = true,
  showMinimap = false,
  theme: propTheme
}) => {
  const { editor: editorSettings, theme: uiTheme } = useUIStore()
  const [activeTab, setActiveTab] = useState('html')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [copied, setCopied] = useState('')
  
  const editorRef = useRef(null)
  const monacoRef = useRef(null)

  // Determine editor theme
  const editorTheme = propTheme || (uiTheme === 'dark' ? 'vs-dark' : 'vs-light')

  // Code tabs configuration
  const tabs = [
    { id: 'html', label: 'HTML', icon: FileCode, language: 'html', code: htmlCode },
    { id: 'css', label: 'CSS', icon: Palette, language: 'css', code: cssCode },
    { id: 'js', label: 'JavaScript', icon: Braces, language: 'javascript', code: jsCode }
  ]

  const activeTabData = tabs.find(tab => tab.id === activeTab)

  /**
   * Handle editor mount
   */
  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor
    monacoRef.current = monaco

    // Configure editor
    editor.updateOptions({
      fontSize: editorSettings.fontSize,
      wordWrap: editorSettings.wordWrap ? 'on' : 'off',
      minimap: { enabled: editorSettings.minimap },
      lineNumbers: showLineNumbers ? 'on' : 'off',
      readOnly,
      scrollBeyondLastLine: false,
      automaticLayout: true,
      formatOnPaste: true,
      formatOnType: true
    })

    // Add custom commands
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S, () => {
      handleSave()
    })

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_D, () => {
      handleFormat()
    })

    // Auto-save setup
    if (editorSettings.autoSave && !readOnly) {
      const saveTimer = setInterval(() => {
        handleSave()
      }, editorSettings.autoSaveDelay)

      return () => clearInterval(saveTimer)
    }
  }

  /**
   * Handle code change
   */
  const handleCodeChange = useCallback((value) => {
    if (readOnly) return

    onCodeChange?.({
      type: activeTab,
      code: value,
      language: activeTabData.language
    })
  }, [activeTab, activeTabData, onCodeChange, readOnly])

  /**
   * Copy code to clipboard
   */
  const handleCopy = async (tabId = activeTab) => {
    const tab = tabs.find(t => t.id === tabId)
    if (!tab || !tab.code) return

    try {
      await navigator.clipboard.writeText(tab.code)
      setCopied(tabId)
      toast.success(`${tab.label} code copied to clipboard`)
      
      setTimeout(() => setCopied(''), 2000)
    } catch (error) {
      toast.error('Failed to copy code')
    }
  }

  /**
   * Download code as file
   */
  const handleDownload = (tabId = activeTab) => {
    const tab = tabs.find(t => t.id === tabId)
    if (!tab || !tab.code) return

    const extensions = { html: 'html', css: 'css', js: 'js' }
    const filename = `code.${extensions[tabId] || 'txt'}`
    
    const blob = new Blob([tab.code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast.success(`${tab.label} code downloaded`)
  }

  /**
   * Format code
   */
  const handleFormat = () => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.formatDocument').run()
    }
  }

  /**
   * Save code (trigger callback)
   */
  const handleSave = () => {
    if (editorRef.current && onCodeChange) {
      const value = editorRef.current.getValue()
      handleCodeChange(value)
    }
  }

  /**
   * Toggle fullscreen mode
   */
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  /**
   * Get code statistics
   */
  const getCodeStats = () => {
    const code = activeTabData?.code || ''
    return {
      lines: code.split('\n').length,
      characters: code.length,
      words: code.trim().split(/\s+/).length
    }
  }

  const stats = getCodeStats()

  return (
    <motion.div 
      className={`code-viewer bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className} ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          {/* Tab selector */}
          <ButtonGroup orientation="horizontal">
            {tabs.map(tab => {
              const Icon = tab.icon
              const hasCode = tab.code && tab.code.trim().length > 0
              
              return (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? 'primary' : 'outline'}
                  size="sm"
                  leftIcon={Icon}
                  onClick={() => setActiveTab(tab.id)}
                  className="relative"
                >
                  {tab.label}
                  {hasCode && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-success-500 rounded-full" />
                  )}
                </Button>
              )
            })}
          </ButtonGroup>

          {/* Code stats */}
          <div className="text-xs text-gray-500 dark:text-gray-400 space-x-3">
            <span>{stats.lines} lines</span>
            <span>{stats.characters} chars</span>
            <span>{stats.words} words</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <IconButton
            icon={copied === activeTab ? Check : Copy}
            size="sm"
            variant="ghost"
            onClick={() => handleCopy()}
            disabled={!activeTabData?.code}
            aria-label="Copy code"
            className={copied === activeTab ? 'text-success-600' : ''}
          />
          
          <IconButton
            icon={Download}
            size="sm"
            variant="ghost"
            onClick={() => handleDownload()}
            disabled={!activeTabData?.code}
            aria-label="Download code"
          />
          
          <IconButton
            icon={Settings}
            size="sm"
            variant={showSettings ? 'primary' : 'ghost'}
            onClick={() => setShowSettings(!showSettings)}
            aria-label="Editor settings"
          />
          
          <IconButton
            icon={isFullscreen ? Minimize2 : Maximize2}
            size="sm"
            variant="ghost"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          />
        </div>
      </div>

      {/* Settings panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-b border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  Font Size
                </label>
                <select
                  value={editorSettings.fontSize}
                  onChange={(e) => {
                    const fontSize = parseInt(e.target.value)
                    if (editorRef.current) {
                      editorRef.current.updateOptions({ fontSize })
                    }
                  }}
                  className="w-full text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 dark:bg-gray-700"
                >
                  {[10, 12, 14, 16, 18, 20, 24].map(size => (
                    <option key={size} value={size}>{size}px</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  Theme
                </label>
                <select
                  value={editorTheme}
                  onChange={(e) => {
                    if (monacoRef.current) {
                      monacoRef.current.editor.setTheme(e.target.value)
                    }
                  }}
                  className="w-full text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 dark:bg-gray-700"
                >
                  <option value="vs-light">Light</option>
                  <option value="vs-dark">Dark</option>
                  <option value="hc-black">High Contrast</option>
                </select>
              </div>

              <div>
                <label className="flex items-center space-x-2 text-xs font-medium text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={editorSettings.wordWrap}
                    onChange={(e) => {
                      if (editorRef.current) {
                        editorRef.current.updateOptions({ 
                          wordWrap: e.target.checked ? 'on' : 'off' 
                        })
                      }
                    }}
                    className="form-checkbox"
                  />
                  <span>Word Wrap</span>
                </label>
              </div>

              <div>
                <label className="flex items-center space-x-2 text-xs font-medium text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={editorSettings.minimap}
                    onChange={(e) => {
                      if (editorRef.current) {
                        editorRef.current.updateOptions({ 
                          minimap: { enabled: e.target.checked }
                        })
                      }
                    }}
                    className="form-checkbox"
                  />
                  <span>Minimap</span>
                </label>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Editor */}
      <div className={`editor-container ${isFullscreen ? 'h-full' : 'h-96'}`}>
        {activeTabData?.code ? (
          <Editor
            language={activeTabData.language}
            value={activeTabData.code}
            theme={editorTheme}
            onChange={handleCodeChange}
            onMount={handleEditorDidMount}
            options={{
              fontSize: editorSettings.fontSize,
              wordWrap: editorSettings.wordWrap ? 'on' : 'off',
              minimap: { enabled: editorSettings.minimap },
              lineNumbers: showLineNumbers ? 'on' : 'off',
              readOnly,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              formatOnPaste: true,
              formatOnType: true,
              suggestOnTriggerCharacters: true,
              quickSuggestions: true,
              folding: true,
              foldingHighlight: true,
              showFoldingControls: 'always',
              renderLineHighlight: 'all',
              selectionHighlight: false,
              occurrencesHighlight: false,
              overviewRulerBorder: false,
              hideCursorInOverviewRuler: true,
              contextmenu: true,
              mouseWheelZoom: true
            }}
            loading={
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            }
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <Code2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No {activeTabData?.label} Code</p>
              <p className="text-sm">
                {readOnly 
                  ? `No ${activeTabData?.label.toLowerCase()} code has been generated yet.`
                  : `Start generating content to see ${activeTabData?.label} code here.`
                }
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-700/50 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
        <span>
          {activeTabData?.language?.toUpperCase()} • {readOnly ? 'Read Only' : 'Editable'}
        </span>
        
        <div className="flex items-center space-x-4">
          {!readOnly && editorSettings.autoSave && (
            <span className="flex items-center">
              <div className="w-2 h-2 bg-success-500 rounded-full mr-1 animate-pulse"></div>
              Auto-save enabled
            </span>
          )}
          
          <span>Monaco Editor</span>
        </div>
      </div>
    </motion.div>
  )
}

export default CodeViewer