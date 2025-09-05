import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  User, 
  Mail, 
  Bell, 
  Shield, 
  CreditCard, 
  Download,
  Upload,
  Eye,
  EyeOff,
  Check,
  X,
  Crown,
  Zap,
  Settings,
  Trash2,
  ExternalLink,
  Save,
  AlertTriangle,
  Smartphone
} from 'lucide-react'

import { useAuth } from '../hooks/useAuth'
import { useUIStore } from '../store/uiStore'
import Button from '../components/ui/Button'

// Validation schemas
const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be less than 50 characters'),
  email: z.string().email('Please enter a valid email address'),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  website: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  location: z.string().max(100, 'Location must be less than 100 characters').optional()
})

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  confirmNewPassword: z.string()
}).refine(data => data.newPassword === data.confirmNewPassword, {
  message: "Passwords don't match",
  path: ["confirmNewPassword"]
})

/**
 * Profile Page Component
 * User account management, settings, and preferences
 */
const ProfilePage = () => {
  const { 
    user, 
    updateProfile, 
    changePassword, 
    isLoading,
    subscriptionPlan,
    apiUsage
  } = useAuth()
  
  const {
    theme,
    toggleTheme,
    notifications,
    updateNotifications,
    editor,
    updateEditorSettings,
    accessibility,
    updateAccessibility
  } = useUIStore()

  const [activeTab, setActiveTab] = useState('profile')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [showDeleteAccount, setShowDeleteAccount] = useState(false)

  // Profile form
  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      bio: user?.bio || '',
      website: user?.website || '',
      location: user?.location || ''
    }
  })

  // Password form
  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: ''
    }
  })

  const handleProfileSubmit = async (data) => {
    try {
      await updateProfile(data)
      profileForm.reset(data)
    } catch (error) {
      console.error('Profile update failed:', error)
    }
  }

  const handlePasswordSubmit = async (data) => {
    try {
      await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmNewPassword: data.confirmNewPassword
      })
      passwordForm.reset()
    } catch (error) {
      console.error('Password change failed:', error)
    }
  }

  const handleAvatarUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setAvatarPreview(e.target.result)
        // TODO: Upload avatar to server
      }
      reader.readAsDataURL(file)
    }
  }

  const subscriptionPlans = {
    free: {
      name: 'Free',
      price: '$0',
      features: ['5 projects', '10 AI generations/month', 'Basic templates', 'Community support'],
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
      icon: User
    },
    pro: {
      name: 'Pro',
      price: '$19',
      features: ['50 projects', '100 AI generations/month', 'Premium templates', 'Priority support', 'Advanced export options'],
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      icon: Zap
    },
    premium: {
      name: 'Premium',
      price: '$49',
      features: ['Unlimited projects', 'Unlimited AI generations', 'All templates', '24/7 support', 'Team collaboration', 'API access'],
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      icon: Crown
    }
  }

  const currentPlan = subscriptionPlans[subscriptionPlan] || subscriptionPlans.free

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'account', label: 'Account', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'subscription', label: 'Subscription', icon: CreditCard },
    { id: 'preferences', label: 'Preferences', icon: Settings },
    { id: 'security', label: 'Security', icon: Shield },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center sm:text-left"
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Account Settings
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Manage your account settings and preferences
        </p>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Navigation */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:w-64"
        >
          <div className="card p-4">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                  }`}
                >
                  <tab.icon className="w-5 h-5 mr-3" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex-1"
        >
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="card p-6 space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Profile Information
              </h2>

              <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)} className="space-y-6">
                {/* Avatar Upload */}
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    {avatarPreview || user?.avatarUrl ? (
                      <img
                        src={avatarPreview || user.avatarUrl}
                        alt="Avatar"
                        className="w-20 h-20 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <User className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    <label className="absolute bottom-0 right-0 bg-primary-600 text-white rounded-full p-1 cursor-pointer hover:bg-primary-700 transition-colors">
                      <Upload className="w-4 h-4" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      Profile Photo
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Upload a photo to personalize your account
                    </p>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input
                      {...profileForm.register('name')}
                      type="text"
                      className="form-input"
                      placeholder="Enter your full name"
                    />
                    {profileForm.formState.errors.name && (
                      <p className="form-error">{profileForm.formState.errors.name.message}</p>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input
                      {...profileForm.register('email')}
                      type="email"
                      className="form-input"
                      placeholder="Enter your email"
                    />
                    {profileForm.formState.errors.email && (
                      <p className="form-error">{profileForm.formState.errors.email.message}</p>
                    )}
                  </div>

                  <div className="form-group md:col-span-2">
                    <label className="form-label">Bio</label>
                    <textarea
                      {...profileForm.register('bio')}
                      rows={3}
                      className="form-input"
                      placeholder="Tell us about yourself"
                    />
                    {profileForm.formState.errors.bio && (
                      <p className="form-error">{profileForm.formState.errors.bio.message}</p>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Website</label>
                    <input
                      {...profileForm.register('website')}
                      type="url"
                      className="form-input"
                      placeholder="https://yourwebsite.com"
                    />
                    {profileForm.formState.errors.website && (
                      <p className="form-error">{profileForm.formState.errors.website.message}</p>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Location</label>
                    <input
                      {...profileForm.register('location')}
                      type="text"
                      className="form-input"
                      placeholder="City, Country"
                    />
                    {profileForm.formState.errors.location && (
                      <p className="form-error">{profileForm.formState.errors.location.message}</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    loading={profileForm.formState.isSubmitting}
                    leftIcon={Save}
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Account Tab */}
          {activeTab === 'account' && (
            <div className="space-y-6">
              {/* Account Info */}
              <div className="card p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Account Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Account ID
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white font-mono">
                      {user?.id}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Member Since
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Email Verified
                    </label>
                    <div className="flex items-center">
                      {user?.emailVerified ? (
                        <Check className="w-4 h-4 text-success-600 mr-2" />
                      ) : (
                        <X className="w-4 h-4 text-error-600 mr-2" />
                      )}
                      <span className="text-sm text-gray-900 dark:text-white">
                        {user?.emailVerified ? 'Verified' : 'Not verified'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Last Login
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Change Password */}
              <div className="card p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Change Password
                </h2>
                <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="space-y-4">
                  <div className="form-group">
                    <label className="form-label">Current Password</label>
                    <div className="relative">
                      <input
                        {...passwordForm.register('currentPassword')}
                        type={showCurrentPassword ? 'text' : 'password'}
                        className="form-input pr-10"
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      >
                        {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {passwordForm.formState.errors.currentPassword && (
                      <p className="form-error">{passwordForm.formState.errors.currentPassword.message}</p>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">New Password</label>
                    <div className="relative">
                      <input
                        {...passwordForm.register('newPassword')}
                        type={showNewPassword ? 'text' : 'password'}
                        className="form-input pr-10"
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      >
                        {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {passwordForm.formState.errors.newPassword && (
                      <p className="form-error">{passwordForm.formState.errors.newPassword.message}</p>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Confirm New Password</label>
                    <div className="relative">
                      <input
                        {...passwordForm.register('confirmNewPassword')}
                        type={showConfirmPassword ? 'text' : 'password'}
                        className="form-input pr-10"
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {passwordForm.formState.errors.confirmNewPassword && (
                      <p className="form-error">{passwordForm.formState.errors.confirmNewPassword.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    loading={passwordForm.formState.isSubmitting}
                    leftIcon={Shield}
                  >
                    Update Password
                  </Button>
                </form>
              </div>

              {/* Delete Account */}
              <div className="card p-6 border-error-200 dark:border-error-800">
                <h2 className="text-xl font-semibold text-error-600 dark:text-error-400 mb-4">
                  Danger Zone
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
                <Button
                  onClick={() => setShowDeleteAccount(!showDeleteAccount)}
                  variant="danger"
                  leftIcon={Trash2}
                >
                  Delete Account
                </Button>
                
                {showDeleteAccount && (
                  <div className="mt-4 p-4 bg-error-50 dark:bg-error-900/20 rounded-lg">
                    <div className="flex items-center mb-3">
                      <AlertTriangle className="w-5 h-5 text-error-600 mr-2" />
                      <span className="font-medium text-error-800 dark:text-error-200">
                        This action cannot be undone
                      </span>
                    </div>
                    <p className="text-sm text-error-700 dark:text-error-300 mb-4">
                      This will permanently delete your account and all associated data.
                    </p>
                    <div className="flex gap-3">
                      <Button
                        variant="danger"
                        size="sm"
                      >
                        Yes, delete my account
                      </Button>
                      <Button
                        onClick={() => setShowDeleteAccount(false)}
                        variant="outline"
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Subscription Tab */}
          {activeTab === 'subscription' && (
            <div className="space-y-6">
              {/* Current Plan */}
              <div className="card p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Current Plan
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      You're currently on the {currentPlan.name} plan
                    </p>
                  </div>
                  <div className={`px-4 py-2 rounded-full ${currentPlan.bgColor}`}>
                    <div className="flex items-center">
                      <currentPlan.icon className={`w-5 h-5 mr-2 ${currentPlan.color}`} />
                      <span className={`font-medium ${currentPlan.color}`}>
                        {currentPlan.name}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Usage Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {apiUsage.used}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      AI Generations Used
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {apiUsage.limit}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Monthly Limit
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {apiUsage.remaining}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Remaining
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <span>Usage this month</span>
                    <span>{Math.round((apiUsage.used / apiUsage.limit) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((apiUsage.used / apiUsage.limit) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                {subscriptionPlan === 'free' && (
                  <Button leftIcon={Crown}>
                    Upgrade Plan
                  </Button>
                )}
              </div>

              {/* Available Plans */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Object.entries(subscriptionPlans).map(([key, plan]) => (
                  <div
                    key={key}
                    className={`card p-6 relative ${
                      key === subscriptionPlan ? 'ring-2 ring-primary-500' : ''
                    }`}
                  >
                    {key === subscriptionPlan && (
                      <div className="absolute top-0 right-0 bg-primary-600 text-white px-3 py-1 text-xs font-medium rounded-bl-lg rounded-tr-lg">
                        Current
                      </div>
                    )}
                    
                    <div className="text-center mb-4">
                      <plan.icon className={`w-8 h-8 mx-auto mb-2 ${plan.color}`} />
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {plan.name}
                      </h3>
                      <div className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                        {plan.price}
                        <span className="text-lg font-normal text-gray-500 dark:text-gray-400">
                          /month
                        </span>
                      </div>
                    </div>

                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <Check className="w-4 h-4 text-success-600 mr-3 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <Button
                      fullWidth
                      variant={key === subscriptionPlan ? 'outline' : 'primary'}
                      disabled={key === subscriptionPlan}
                    >
                      {key === subscriptionPlan ? 'Current Plan' : 'Choose Plan'}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Other tabs would be implemented similarly... */}
          {activeTab === 'notifications' && (
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Notification Preferences
              </h2>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      Email Notifications
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Receive notifications via email
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications.email}
                      onChange={(e) => updateNotifications({ email: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                  </label>
                </div>
                
                {/* Add more notification settings */}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default ProfilePage