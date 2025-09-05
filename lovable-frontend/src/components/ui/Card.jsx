import React, { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { MoreVertical } from 'lucide-react'
import { clsx } from 'clsx'

/**
 * Card Component
 * A flexible container with consistent styling and optional features
 */
const Card = forwardRef(({
  children,
  variant = 'default',
  size = 'md',
  hover = false,
  clickable = false,
  loading = false,
  className,
  onClick,
  as: Component = 'div',
  ...props
}, ref) => {
  const baseClasses = 'card transition-all duration-200'
  
  const variantClasses = {
    default: 'bg-white dark:bg-gray-800',
    elevated: 'bg-white dark:bg-gray-800 shadow-lg',
    outlined: 'bg-white dark:bg-gray-800 border-2',
    ghost: 'bg-transparent border-none shadow-none'
  }
  
  const sizeClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10'
  }

  const cardClasses = clsx(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    {
      'card-hover': hover || clickable,
      'cursor-pointer': clickable,
      'animate-pulse': loading,
      'opacity-60': loading
    },
    className
  )

  const cardProps = {
    ref,
    className: cardClasses,
    onClick: clickable ? onClick : undefined,
    ...props
  }

  if (hover || clickable) {
    return (
      <motion.div
        as={Component}
        whileHover={{ y: -2, shadow: '0 8px 25px -8px rgba(0, 0, 0, 0.1)' }}
        whileTap={{ scale: clickable ? 0.98 : 1 }}
        {...cardProps}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <Component {...cardProps}>
      {children}
    </Component>
  )
})

Card.displayName = 'Card'

/**
 * Card Header Component
 */
export const CardHeader = ({
  title,
  subtitle,
  action,
  className,
  children,
  ...props
}) => {
  return (
    <div 
      className={clsx(
        'flex items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-700',
        className
      )}
      {...props}
    >
      <div className="flex-1">
        {title && (
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h3>
        )}
        {subtitle && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {subtitle}
          </p>
        )}
        {children}
      </div>
      
      {action && (
        <div className="flex-shrink-0 ml-4">
          {action}
        </div>
      )}
    </div>
  )
}

/**
 * Card Body Component
 */
export const CardBody = ({
  className,
  children,
  ...props
}) => {
  return (
    <div 
      className={clsx('flex-1', className)}
      {...props}
    >
      {children}
    </div>
  )
}

/**
 * Card Footer Component
 */
export const CardFooter = ({
  className,
  children,
  divided = true,
  ...props
}) => {
  return (
    <div 
      className={clsx(
        'mt-4 pt-4',
        divided && 'border-t border-gray-200 dark:border-gray-700',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

/**
 * Card Image Component
 */
export const CardImage = ({
  src,
  alt,
  aspectRatio = 'video', // video (16:9), square (1:1), photo (4:3)
  objectFit = 'cover',
  className,
  ...props
}) => {
  const aspectRatioClasses = {
    video: 'aspect-video',
    square: 'aspect-square',
    photo: 'aspect-[4/3]'
  }

  const objectFitClasses = {
    cover: 'object-cover',
    contain: 'object-contain',
    fill: 'object-fill',
    none: 'object-none',
    'scale-down': 'object-scale-down'
  }

  return (
    <div className={clsx(
      'relative overflow-hidden rounded-t-lg -m-6 mb-4',
      aspectRatioClasses[aspectRatio],
      className
    )}>
      <img
        src={src}
        alt={alt}
        className={clsx(
          'w-full h-full',
          objectFitClasses[objectFit]
        )}
        {...props}
      />
    </div>
  )
}

/**
 * Stats Card Component
 * Pre-configured card for displaying statistics
 */
export const StatsCard = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  className,
  ...props
}) => {
  const changeTypeClasses = {
    positive: 'text-success-600 dark:text-success-400',
    negative: 'text-error-600 dark:text-error-400',
    neutral: 'text-gray-600 dark:text-gray-400'
  }

  return (
    <Card className={clsx('relative overflow-hidden', className)} {...props}>
      <div className="flex items-center">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 truncate">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {value}
          </p>
          {change && (
            <p className={clsx('text-sm', changeTypeClasses[changeType])}>
              {change}
            </p>
          )}
        </div>
        
        {Icon && (
          <div className="flex-shrink-0">
            <Icon className="h-8 w-8 text-gray-400" />
          </div>
        )}
      </div>
    </Card>
  )
}

/**
 * Feature Card Component
 * Card for displaying features or services
 */
export const FeatureCard = ({
  icon: Icon,
  title,
  description,
  action,
  className,
  ...props
}) => {
  return (
    <Card 
      className={clsx('text-center', className)} 
      hover
      {...props}
    >
      {Icon && (
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 dark:bg-primary-900 mb-4">
          <Icon className="h-8 w-8 text-primary-600 dark:text-primary-400" />
        </div>
      )}
      
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
        {title}
      </h3>
      
      {description && (
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {description}
        </p>
      )}
      
      {action && (
        <div className="mt-6">
          {action}
        </div>
      )}
    </Card>
  )
}

/**
 * Profile Card Component
 * Card for user profiles
 */
export const ProfileCard = ({
  avatar,
  name,
  role,
  bio,
  actions,
  stats,
  className,
  ...props
}) => {
  return (
    <Card className={clsx('text-center', className)} {...props}>
      {avatar && (
        <img
          src={avatar}
          alt={name}
          className="mx-auto h-24 w-24 rounded-full mb-4"
        />
      )}
      
      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
        {name}
      </h3>
      
      {role && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {role}
        </p>
      )}
      
      {bio && (
        <p className="text-gray-600 dark:text-gray-400 mt-3">
          {bio}
        </p>
      )}
      
      {stats && (
        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          {stats.map((stat, index) => (
            <div key={index}>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {stat.value}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      )}
      
      {actions && (
        <div className="mt-6 space-y-2">
          {actions}
        </div>
      )}
    </Card>
  )
}

/**
 * Article Card Component
 * Card for blog posts or articles
 */
export const ArticleCard = ({
  image,
  title,
  excerpt,
  author,
  date,
  readTime,
  tags = [],
  href,
  className,
  ...props
}) => {
  return (
    <Card 
      className={clsx('overflow-hidden', className)}
      hover
      clickable={!!href}
      onClick={href ? () => window.location.href = href : undefined}
      {...props}
    >
      {image && (
        <CardImage
          src={image}
          alt={title}
          aspectRatio="video"
        />
      )}
      
      <div className="space-y-3">
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">
          {title}
        </h3>
        
        {excerpt && (
          <p className="text-gray-600 dark:text-gray-400 line-clamp-3">
            {excerpt}
          </p>
        )}
        
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-2">
            {author && <span>{author}</span>}
            {date && <span>•</span>}
            {date && <time>{date}</time>}
          </div>
          
          {readTime && (
            <span>{readTime} read</span>
          )}
        </div>
      </div>
    </Card>
  )
}

/**
 * Empty Card Component
 * Card for empty states
 */
export const EmptyCard = ({
  icon: Icon,
  title,
  description,
  action,
  className,
  ...props
}) => {
  return (
    <Card 
      className={clsx('text-center py-12', className)}
      variant="ghost"
      {...props}
    >
      {Icon && (
        <Icon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
      )}
      
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
        {title}
      </h3>
      
      {description && (
        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
          {description}
        </p>
      )}
      
      {action && action}
    </Card>
  )
}

/**
 * Loading Card Component
 * Skeleton loading state for cards
 */
export const LoadingCard = ({ 
  lines = 3,
  showImage = false,
  className,
  ...props 
}) => {
  return (
    <Card className={clsx('animate-pulse', className)} {...props}>
      {showImage && (
        <div className="bg-gray-300 dark:bg-gray-600 h-48 rounded mb-4" />
      )}
      
      <div className="space-y-3">
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4" />
        
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className="h-3 bg-gray-300 dark:bg-gray-600 rounded"
            style={{ 
              width: `${Math.random() * 40 + 60}%` 
            }}
          />
        ))}
      </div>
    </Card>
  )
}

export default Card