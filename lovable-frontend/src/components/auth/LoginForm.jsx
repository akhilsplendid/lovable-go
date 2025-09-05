import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react'
import Button from '../ui/Button'
import Input from '../ui/Input'
import { useAuth } from '../../hooks/useAuth'

// Validation schema
const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters')
})

/**
 * LoginForm Component
 * Handles user authentication with validation and error handling
 */
const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false)
  const { login, isLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Get redirect path from location state or default to dashboard
  const from = location.state?.from?.pathname || '/dashboard'

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    clearErrors
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  })

  /**
   * Handle form submission
   */
  const onSubmit = async (data) => {
    try {
      clearErrors()
      await login(data)
      navigate(from, { replace: true })
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message
      
      // Handle specific error types
      if (errorMessage.includes('email')) {
        setError('email', { 
          type: 'manual', 
          message: 'Invalid email address' 
        })
      } else if (errorMessage.includes('password')) {
        setError('password', { 
          type: 'manual', 
          message: 'Invalid password' 
        })
      } else {
        setError('root', { 
          type: 'manual', 
          message: errorMessage 
        })
      }
    }
  }

  /**
   * Toggle password visibility
   */
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const isFormLoading = isLoading || isSubmitting

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Sign in to your Lovable account
          </p>
        </motion.div>
      </div>

      <motion.form
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6"
        noValidate
      >
        {/* Global Error Message */}
        {errors.root && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-error-50 border border-error-200 text-error-800 px-4 py-3 rounded-lg flex items-center gap-3 dark:bg-error-900 dark:border-error-700 dark:text-error-200"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{errors.root.message}</span>
          </motion.div>
        )}

        {/* Email Field */}
        <div className="form-group">
          <label htmlFor="email" className="form-label">
            Email address
          </label>
          <div className="relative">
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              autoComplete="email"
              leftIcon={Mail}
              error={errors.email?.message}
              disabled={isFormLoading}
              {...register('email')}
              className="pl-10"
            />
          </div>
          {errors.email && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="form-error mt-1"
            >
              {errors.email.message}
            </motion.p>
          )}
        </div>

        {/* Password Field */}
        <div className="form-group">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-sm text-primary-600 hover:text-primary-700 hover:underline focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              autoComplete="current-password"
              leftIcon={Lock}
              error={errors.password?.message}
              disabled={isFormLoading}
              {...register('password')}
              className="pl-10 pr-10"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 dark:hover:text-gray-300 dark:focus:text-gray-300"
              disabled={isFormLoading}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          {errors.password && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="form-error mt-1"
            >
              {errors.password.message}
            </motion.p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={isFormLoading}
          loadingText="Signing in..."
          disabled={isFormLoading}
        >
          Sign in
        </Button>

        {/* Sign up link */}
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <Link
              to="/register"
              state={{ from: location.state?.from }}
              className="font-medium text-primary-600 hover:text-primary-700 hover:underline focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded"
            >
              Sign up
            </Link>
          </p>
        </div>
      </motion.form>

      {/* Demo Credentials (Development Only) */}
      {import.meta.env.DEV && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.3 }}
          className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-900/20 dark:border-blue-800"
        >
          <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
            Demo Credentials
          </h3>
          <div className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
            <div>Email: demo@lovable.dev</div>
            <div>Password: demo123456</div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

export default LoginForm