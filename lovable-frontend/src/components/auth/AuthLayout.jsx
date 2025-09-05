import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, Moon, Sun, Github, Twitter, Globe } from 'lucide-react'
import { useUIStore } from '../../store/uiStore'
import { IconButton } from '../ui/Button'

/**
 * AuthLayout Component
 * Layout wrapper for authentication pages (login, register, etc.)
 */
const AuthLayout = ({ children, title, description }) => {
  const { theme, toggleTheme } = useUIStore()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex">
      {/* Left Side - Branding & Info */}
      <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-between p-12 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5 dark:opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-purple-600" />
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-3 text-2xl font-bold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-xl">
              <Sparkles className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            Lovable
          </Link>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative z-10"
        >
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Build beautiful websites with AI
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
            Transform your ideas into stunning websites through natural conversation. 
            No coding required – just describe what you want, and watch it come to life.
          </p>

          {/* Features List */}
          <div className="space-y-4">
            {[
              { icon: '🤖', title: 'AI-Powered Generation', desc: 'Describe your vision and watch AI create your website' },
              { icon: '⚡', title: 'Real-time Preview', desc: 'See your website update instantly as you chat' },
              { icon: '📱', title: 'Responsive Design', desc: 'Every website works perfectly on all devices' },
              { icon: '🚀', title: 'One-Click Deploy', desc: 'Publish your website with a single click' }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                className="flex items-start gap-3"
              >
                <span className="text-xl" role="img" aria-label={feature.title}>
                  {feature.icon}
                </span>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {feature.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="relative z-10"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/about"
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                About
              </Link>
              <Link
                to="/privacy"
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                Privacy
              </Link>
              <Link
                to="/terms"
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                Terms
              </Link>
            </div>

            <div className="flex items-center gap-2">
              <IconButton
                icon={Github}
                size="sm"
                variant="ghost"
                aria-label="GitHub"
                onClick={() => window.open('https://github.com/lovable-dev', '_blank')}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              />
              <IconButton
                icon={Twitter}
                size="sm"
                variant="ghost"
                aria-label="Twitter"
                onClick={() => window.open('https://twitter.com/lovable_dev', '_blank')}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              />
              <IconButton
                icon={Globe}
                size="sm"
                variant="ghost"
                aria-label="Website"
                onClick={() => window.open('https://lovable.dev', '_blank')}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              />
            </div>
          </div>
          
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">
            © 2024 Lovable. All rights reserved.
          </p>
        </motion.div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 lg:flex-none lg:px-20 xl:px-24 relative">
        {/* Theme Toggle */}
        <div className="absolute top-6 right-6">
          <IconButton
            icon={theme === 'dark' ? Sun : Moon}
            size="md"
            variant="ghost"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          />
        </div>

        {/* Mobile Logo */}
        <div className="lg:hidden mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-3 text-2xl font-bold text-gray-900 dark:text-white"
          >
            <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-xl">
              <Sparkles className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            Lovable
          </Link>
        </div>

        {/* Auth Form Container */}
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-8 lg:shadow-2xl"
          >
            {children}
          </motion.div>

          {/* Help Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="mt-8 text-center"
          >
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Need help?{' '}
              <Link
                to="/support"
                className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 hover:underline transition-colors"
              >
                Contact Support
              </Link>
            </p>
          </motion.div>
        </div>

        {/* Mobile Footer */}
        <div className="lg:hidden mt-12">
          <div className="flex items-center justify-center gap-6">
            <Link
              to="/about"
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              About
            </Link>
            <Link
              to="/privacy"
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              Privacy
            </Link>
            <Link
              to="/terms"
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Simple Auth Layout (for modal-style auth)
 */
export const SimpleAuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-3 text-2xl font-bold text-gray-900 dark:text-white"
          >
            <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-xl">
              <Sparkles className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            Lovable
          </Link>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-8"
        >
          {children}
        </motion.div>
      </div>
    </div>
  )
}

export default AuthLayout