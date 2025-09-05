import React from 'react'
import { motion } from 'framer-motion'
import { Bot, Sparkles } from 'lucide-react'

/**
 * Typing Indicator Component
 * Shows when AI is processing/typing a response
 */
const TypingIndicator = ({ 
  message = "AI is thinking...",
  showAvatar = true,
  compact = false,
  className = ''
}) => {
  // Animation variants for the dots
  const dotVariants = {
    initial: { y: 0 },
    animate: { 
      y: [-4, 0, -4],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }

  // Stagger the dots animation
  const containerVariants = {
    animate: {
      transition: {
        staggerChildren: 0.2
      }
    }
  }

  // Shimmer effect for the background
  const shimmerVariants = {
    initial: { backgroundPosition: '-200% 0' },
    animate: {
      backgroundPosition: '200% 0',
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "linear"
      }
    }
  }

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className={`flex items-center space-x-2 ${className}`}
      >
        <div className="flex items-center space-x-1">
          <motion.div
            variants={containerVariants}
            animate="animate"
            className="flex space-x-1"
          >
            {[0, 1, 2].map((index) => (
              <motion.div
                key={index}
                variants={dotVariants}
                custom={index}
                className="w-1.5 h-1.5 bg-gray-400 rounded-full"
              />
            ))}
          </motion.div>
          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
            {message}
          </span>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{
        type: "spring",
        damping: 20,
        stiffness: 300
      }}
      className={`flex justify-start ${className}`}
    >
      <div className="flex max-w-4xl items-start space-x-3">
        {/* Avatar */}
        {showAvatar && (
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <Bot className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </div>
        )}

        {/* Typing Bubble */}
        <div className="flex-1">
          <motion.div
            variants={shimmerVariants}
            initial="initial"
            animate="animate"
            className="inline-block px-4 py-3 rounded-2xl rounded-bl-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm"
            style={{
              background: `linear-gradient(90deg, 
                rgba(249, 250, 251, 1) 0%, 
                rgba(243, 244, 246, 1) 50%, 
                rgba(249, 250, 251, 1) 100%)`,
              backgroundSize: '200% 100%'
            }}
          >
            <div className="flex items-center space-x-2">
              {/* Sparkles icon */}
              <motion.div
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                  scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                }}
              >
                <Sparkles className="w-4 h-4 text-primary-500" />
              </motion.div>

              {/* Animated dots */}
              <motion.div
                variants={containerVariants}
                animate="animate"
                className="flex space-x-1"
              >
                {[0, 1, 2].map((index) => (
                  <motion.div
                    key={index}
                    variants={{
                      initial: { y: 0, opacity: 0.6 },
                      animate: { 
                        y: [-3, 0, -3],
                        opacity: [0.6, 1, 0.6],
                        transition: {
                          duration: 1.2,
                          repeat: Infinity,
                          delay: index * 0.15,
                          ease: "easeInOut"
                        }
                      }
                    }}
                    className="w-2 h-2 bg-gray-600 dark:bg-gray-400 rounded-full"
                  />
                ))}
              </motion.div>

              {/* Text message */}
              <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
                {message}
              </span>
            </div>

            {/* Progress bar */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ 
                duration: 3, 
                repeat: Infinity, 
                repeatType: "reverse",
                ease: "easeInOut"
              }}
              className="h-0.5 bg-gradient-to-r from-primary-500 to-blue-500 rounded-full mt-2"
            />
          </motion.div>

          {/* Status text */}
          <div className="mt-1 flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex items-center space-x-1"
            >
              <div className="w-1.5 h-1.5 bg-primary-500 rounded-full" />
              <span>Processing your request</span>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

/**
 * Multiple Users Typing Component
 * Shows when multiple users are typing (for collaboration)
 */
export const MultipleTypingIndicator = ({ 
  users = [], 
  className = '' 
}) => {
  if (users.length === 0) return null

  const displayUsers = users.slice(0, 3)
  const remainingCount = users.length - 3

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 ${className}`}
    >
      {/* User avatars */}
      <div className="flex -space-x-1">
        {displayUsers.map((user, index) => (
          <div
            key={user.id}
            className="w-6 h-6 rounded-full bg-primary-500 border-2 border-white dark:border-gray-900 flex items-center justify-center text-xs text-white font-medium"
            style={{ zIndex: displayUsers.length - index }}
          >
            {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
          </div>
        ))}
      </div>

      {/* Typing text */}
      <div className="flex items-center space-x-1">
        <span>
          {displayUsers.length === 1 
            ? `${displayUsers[0].name || displayUsers[0].email} is typing`
            : displayUsers.length === 2
            ? `${displayUsers[0].name || displayUsers[0].email} and ${displayUsers[1].name || displayUsers[1].email} are typing`
            : `${displayUsers.length}${remainingCount > 0 ? `+${remainingCount}` : ''} people are typing`
          }
        </span>
        
        {/* Animated dots */}
        <motion.div
          variants={{
            animate: {
              transition: { staggerChildren: 0.2 }
            }
          }}
          animate="animate"
          className="flex space-x-0.5"
        >
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              variants={{
                animate: {
                  y: [-2, 0, -2],
                  transition: {
                    duration: 0.8,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }
                }
              }}
              className="w-1 h-1 bg-gray-400 rounded-full"
            />
          ))}
        </motion.div>
      </div>
    </motion.div>
  )
}

/**
 * Simple Dots Loading Component
 */
export const DotsLoading = ({ 
  size = 'md', 
  color = 'gray',
  className = '' 
}) => {
  const sizes = {
    sm: 'w-1 h-1',
    md: 'w-1.5 h-1.5',
    lg: 'w-2 h-2'
  }

  const colors = {
    gray: 'bg-gray-400',
    primary: 'bg-primary-500',
    white: 'bg-white'
  }

  return (
    <motion.div
      variants={{
        animate: {
          transition: { staggerChildren: 0.2 }
        }
      }}
      animate="animate"
      className={`flex space-x-1 ${className}`}
    >
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          variants={{
            animate: {
              y: [-3, 0, -3],
              transition: {
                duration: 1,
                repeat: Infinity,
                ease: "easeInOut"
              }
            }
          }}
          className={`${sizes[size]} ${colors[color]} rounded-full`}
        />
      ))}
    </motion.div>
  )
}

export default TypingIndicator