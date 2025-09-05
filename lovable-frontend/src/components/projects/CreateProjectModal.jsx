import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  X, 
  Sparkles, 
  FileText, 
  Palette, 
  Zap,
  ArrowRight,
  Globe,
  Briefcase,
  ShoppingBag,
  User,
  BookOpen,
  Monitor
} from 'lucide-react'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Modal from '../ui/Modal'
import { useProjects } from '../../hooks/useProjects'
import { aiService } from '../../services/ai'
import toast from 'react-hot-toast'

// Form validation schema
const createProjectSchema = z.object({
  name: z.string()
    .min(1, 'Project name is required')
    .max(100, 'Project name must be less than 100 characters'),
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  tags: z.array(z.string()).max(10, 'Maximum 10 tags allowed').optional()
})

// Template categories with icons and descriptions
const TEMPLATE_CATEGORIES = [
  {
    id: 'blank',
    name: 'Blank Project',
    description: 'Start from scratch with AI assistance',
    icon: FileText,
    color: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
  },
  {
    id: 'portfolio',
    name: 'Portfolio',
    description: 'Professional portfolio website',
    icon: User,
    color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
  },
  {
    id: 'business',
    name: 'Business',
    description: 'Corporate website or landing page',
    icon: Briefcase,
    color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300'
  },
  {
    id: 'landing',
    name: 'Landing Page',
    description: 'High-converting product landing page',
    icon: Zap,
    color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300'
  },
  {
    id: 'ecommerce',
    name: 'E-commerce',
    description: 'Online store or product showcase',
    icon: ShoppingBag,
    color: 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300'
  },
  {
    id: 'blog',
    name: 'Blog',
    description: 'Personal or professional blog',
    icon: BookOpen,
    color: 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300'
  },
  {
    id: 'dashboard',
    name: 'Dashboard',
    description: 'Admin or analytics dashboard',
    icon: Monitor,
    color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300'
  }
]

// Style options
const STYLE_OPTIONS = [
  { id: 'modern', name: 'Modern', description: 'Clean and contemporary' },
  { id: 'minimal', name: 'Minimal', description: 'Simple and focused' },
  { id: 'creative', name: 'Creative', description: 'Bold and artistic' },
  { id: 'corporate', name: 'Corporate', description: 'Professional and trustworthy' },
  { id: 'playful', name: 'Playful', description: 'Fun and engaging' }
]

// Color scheme options
const COLOR_SCHEMES = [
  { id: 'blue', name: 'Blue', class: 'bg-blue-500' },
  { id: 'green', name: 'Green', class: 'bg-green-500' },
  { id: 'purple', name: 'Purple', class: 'bg-purple-500' },
  { id: 'red', name: 'Red', class: 'bg-red-500' },
  { id: 'orange', name: 'Orange', class: 'bg-orange-500' },
  { id: 'dark', name: 'Dark', class: 'bg-gray-800' },
  { id: 'light', name: 'Light', class: 'bg-gray-100 border border-gray-300' }
]

/**
 * Create Project Modal Component
 * Multi-step modal for creating new projects with templates and customization
 */
const CreateProjectModal = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  defaultTemplate = null 
}) => {
  const [step, setStep] = useState(1) // 1: Basic Info, 2: Template Selection, 3: Customization
  const [selectedTemplate, setSelectedTemplate] = useState(defaultTemplate || 'blank')
  const [selectedStyle, setSelectedStyle] = useState('modern')
  const [selectedColorScheme, setSelectedColorScheme] = useState('blue')
  const [isCreating, setIsCreating] = useState(false)
  const [availableTemplates, setAvailableTemplates] = useState([])
  const [tagInput, setTagInput] = useState('')

  const { createProject } = useProjects()

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
    reset,
    getValues
  } = useForm({
    resolver: zodResolver(createProjectSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      description: '',
      tags: []
    }
  })

  const watchedTags = watch('tags') || []

  // Load available templates on mount
  useEffect(() => {
    if (isOpen) {
      loadTemplates()
      setStep(1)
      reset()
      setSelectedTemplate(defaultTemplate || 'blank')
    }
  }, [isOpen, defaultTemplate, reset])

  const loadTemplates = async () => {
    try {
      const response = await aiService.getTemplates()
      setAvailableTemplates(response.templates || [])
    } catch (error) {
      console.error('Failed to load templates:', error)
    }
  }

  const handleAddTag = (e) => {
    e.preventDefault()
    if (tagInput.trim() && watchedTags.length < 10 && !watchedTags.includes(tagInput.trim())) {
      setValue('tags', [...watchedTags, tagInput.trim()])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove) => {
    setValue('tags', watchedTags.filter(tag => tag !== tagToRemove))
  }

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleCreateProject = async (formData) => {
    if (!isValid) return

    setIsCreating(true)

    try {
      let projectData = {
        name: formData.name,
        description: formData.description || '',
        tags: formData.tags || []
      }

      // Create the project first
      const newProject = await createProject(projectData)

      // If using a template, generate initial content
      if (selectedTemplate !== 'blank') {
        try {
          await aiService.generateFromTemplate({
            category: selectedTemplate,
            style: selectedStyle,
            colorScheme: selectedColorScheme
          })
        } catch (error) {
          console.warn('Failed to generate from template:', error)
          // Project still created successfully, just without template content
        }
      }

      toast.success('Project created successfully!')
      onSuccess?.(newProject)
      onClose()

    } catch (error) {
      console.error('Failed to create project:', error)
      toast.error('Failed to create project. Please try again.')
    } finally {
      setIsCreating(false)
    }
  }

  const getStepTitle = () => {
    switch (step) {
      case 1: return 'Project Details'
      case 2: return 'Choose Template'
      case 3: return 'Customize Style'
      default: return 'Create Project'
    }
  }

  const getStepDescription = () => {
    switch (step) {
      case 1: return 'Give your project a name and description'
      case 2: return 'Select a template to get started quickly'
      case 3: return 'Customize the look and feel'
      default: return ''
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="2xl">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg mr-3">
              <Sparkles className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {getStepTitle()}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {getStepDescription()}
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center mb-8">
          {[1, 2, 3].map((stepNumber) => (
            <React.Fragment key={stepNumber}>
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                ${step >= stepNumber 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }
              `}>
                {stepNumber}
              </div>
              {stepNumber < 3 && (
                <div className={`
                  flex-1 h-0.5 mx-2
                  ${step > stepNumber 
                    ? 'bg-primary-600' 
                    : 'bg-gray-200 dark:bg-gray-700'
                  }
                `} />
              )}
            </React.Fragment>
          ))}
        </div>

        <form onSubmit={handleSubmit(handleCreateProject)}>
          <AnimatePresence mode="wait">
            {/* Step 1: Basic Information */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <Input
                    label="Project Name"
                    placeholder="My Awesome Website"
                    error={errors.name?.message}
                    {...register('name')}
                    autoFocus
                  />
                </div>

                <div>
                  <label className="form-label">
                    Description (optional)
                  </label>
                  <textarea
                    className="form-input"
                    rows={3}
                    placeholder="Describe your project..."
                    {...register('description')}
                  />
                  {errors.description && (
                    <p className="form-error">{errors.description.message}</p>
                  )}
                </div>

                <div>
                  <label className="form-label">Tags</label>
                  <div className="space-y-3">
                    <div className="flex">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddTag(e)}
                        placeholder="Add a tag..."
                        className="form-input rounded-r-none border-r-0"
                      />
                      <button
                        type="button"
                        onClick={handleAddTag}
                        className="px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-r-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                    
                    {watchedTags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {watchedTags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(tag)}
                              className="ml-2 text-primary-500 hover:text-primary-700"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Template Selection */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {TEMPLATE_CATEGORIES.map((template) => {
                    const IconComponent = template.icon
                    return (
                      <div
                        key={template.id}
                        className={`
                          p-4 border-2 rounded-xl cursor-pointer transition-all hover:border-primary-300
                          ${selectedTemplate === template.id 
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                            : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                          }
                        `}
                        onClick={() => setSelectedTemplate(template.id)}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-lg ${template.color}`}>
                            <IconComponent className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 dark:text-white">
                              {template.name}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {template.description}
                            </p>
                          </div>
                          {selectedTemplate === template.id && (
                            <div className="w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full" />
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {/* Step 3: Style Customization */}
            {step === 3 && selectedTemplate !== 'blank' && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Style Selection */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                    Design Style
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {STYLE_OPTIONS.map((style) => (
                      <div
                        key={style.id}
                        className={`
                          p-3 border rounded-lg cursor-pointer transition-all
                          ${selectedStyle === style.id 
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                            : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                          }
                        `}
                        onClick={() => setSelectedStyle(style.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {style.name}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {style.description}
                            </p>
                          </div>
                          {selectedStyle === style.id && (
                            <div className="w-4 h-4 bg-primary-600 rounded-full flex items-center justify-center">
                              <div className="w-1.5 h-1.5 bg-white rounded-full" />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Color Scheme Selection */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                    Color Scheme
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {COLOR_SCHEMES.map((color) => (
                      <button
                        key={color.id}
                        type="button"
                        onClick={() => setSelectedColorScheme(color.id)}
                        className={`
                          flex items-center space-x-2 px-3 py-2 rounded-lg border transition-all
                          ${selectedColorScheme === color.id
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                          }
                        `}
                      >
                        <div className={`w-4 h-4 rounded ${color.class}`} />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {color.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <div className="flex justify-between pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
            <div>
              {step > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                >
                  Back
                </Button>
              )}
            </div>

            <div className="flex space-x-3">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
              >
                Cancel
              </Button>
              
              {step < 3 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={step === 1 && !isValid}
                  rightIcon={ArrowRight}
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  loading={isCreating}
                  loadingText="Creating..."
                  disabled={!isValid}
                >
                  Create Project
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </Modal>
  )
}

export default CreateProjectModal