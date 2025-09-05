import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, Check } from 'lucide-react'
import Button from '../ui/Button'
import Input from '../ui/Input'
import { Checkbox } from '../ui/Input'
import { useAuth } from '../../hooks/useAuth'

// Password strength requirements
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character')

// Validation schema
const registerSchema = z.object({
  name: z
    .string()
    .min(1, 'Full name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: passwordSchema,
  confirmPassword: z
    .string()
    .min(1, 'Please confirm your password'),
  acceptTerms: z
    .boolean()
    .refine(val => val === true, 'You must accept the terms and conditions')
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
})

// Password strength checker
const checkPasswordStrength = (password) => {
  const requirements = [
    { test: /.{8,}/, label: 'At least 8 characters' },
    { test: /[a-z]/, label: 'One lowercase letter' },
    { test: /[A-Z]/, label: 'One uppercase letter' },
    { test: /[0-9]/, label: 'One number' },
    { test: /[^a-zA-Z0-9]/, label: 'One special character' }
  ]

  return requirements.map(req => ({
    ...req,
    met: req.test.test(password)
  }))
}

/**
 * RegisterForm Component
 * Handles user registration with validation, password strength checking, and error handling
 */
const RegisterForm = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)
  
  const { register: registerUser, isLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Get redirect path from location state or default to dashboard
  const from = location.state?.from?.pathname || '/dashboard'

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    setError,
    clearErrors
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false
    }
  })

  const watchedPassword = watch('password', '')
  const passwordRequirements = checkPasswordStrength(watchedPassword)
  const passwordStrength = passwordRequirements.filter(req => req.met).length

  /**
   * Handle form submission
   */
  const onSubmit = async (data) => {
    try {
      clearErrors()
      await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword
      })
      navigate(from, { replace: true })
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message
      
      // Handle specific error types
      if (errorMessage.includes('email')) {
        setError('email', { 
          type: 'manual', 
          message: 'Email address is already registered' 
        })
      } else if (errorMessage.includes('password')) {
        setError('password', { 
          type: 'manual', 
          message: errorMessage 
        })
      } else {
        setError('root', { 
          type: 'manual', 
          message: errorMessage 
        })
      }
    }
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
            Create your account
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Join Lovable and start building amazing websites
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

        {/* Name Field */}
        <div className="form-group">
          <label htmlFor="name" className="form-label">
            Full name
          </label>
          <div className="relative">
            <Input
              id="name"
              type="text"
              placeholder="Enter your full name"
              autoComplete="name"
              leftIcon={User}
              error={errors.name?.message}
              disabled={isFormLoading}
              {...register('name')}
              className="pl-10"
            />
          </div>
          {errors.name && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="form-error mt-1"
            >
              {errors.name.message}
            </motion.p>
          )}
        </div>

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
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a strong password"
              autoComplete="new-password"
              leftIcon={Lock}
              error={errors.password?.message}
              disabled={isFormLoading}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
              {...register('password')}
              className="pl-10 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
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
          
          {/* Password Requirements */}
          {(passwordFocused || watchedPassword) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-2 h-2 rounded-full ${
                  passwordStrength >= 5 ? 'bg-success-500' :
                  passwordStrength >= 3 ? 'bg-warning-500' :
                  'bg-error-500'
                }`} />
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Password strength: {
                    passwordStrength >= 5 ? 'Strong' :
                    passwordStrength >= 3 ? 'Medium' :
                    'Weak'
                  }
                </span>
              </div>
              <div className="space-y-1">
                {passwordRequirements.map((req, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs">
                    <Check className={`w-3 h-3 ${
                      req.met ? 'text-success-500' : 'text-gray-400'
                    }`} />
                    <span className={req.met ? 'text-success-700 dark:text-success-400' : 'text-gray-500 dark:text-gray-400'}>
                      {req.label}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

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

        {/* Confirm Password Field */}
        <div className="form-group">
          <label htmlFor="confirmPassword" className="form-label">
            Confirm password
          </label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm your password"
              autoComplete="new-password"
              leftIcon={Lock}
              error={errors.confirmPassword?.message}
              disabled={isFormLoading}
              {...register('confirmPassword')}
              className="pl-10 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 dark:hover:text-gray-300 dark:focus:text-gray-300"
              disabled={isFormLoading}
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              {showConfirmPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="form-error mt-1"
            >
              {errors.confirmPassword.message}
            </motion.p>
          )}
        </div>

        {/* Terms and Conditions */}
        <div className="form-group">
          <Checkbox
            id="acceptTerms"
            label={
              <span>
                I agree to the{' '}
                <Link
                  to="/terms"
                  className="text-primary-600 hover:text-primary-700 hover:underline focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Terms of Service
                </Link>
                {' '}and{' '}
                <Link
                  to="/privacy"
                  className="text-primary-600 hover:text-primary-700 hover:underline focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Privacy Policy
                </Link>
              </span>
            }
            error={errors.acceptTerms?.message}
            disabled={isFormLoading}
            {...register('acceptTerms')}
          />
          {errors.acceptTerms && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="form-error mt-1"
            >
              {errors.acceptTerms.message}
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
          loadingText="Creating account..."
          disabled={isFormLoading}
        >
          Create account
        </Button>

        {/* Sign in link */}
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link
              to="/login"
              state={{ from: location.state?.from }}
              className="font-medium text-primary-600 hover:text-primary-700 hover:underline focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded"
            >
              Sign in
            </Link>
          </p>
        </div>
      </motion.form>
    </motion.div>
  )
}

export default RegisterForm