import React from 'react'
import { motion } from 'framer-motion'

const variants = {
  gold: 'bg-gold text-void hover:bg-yellow-400 border-transparent',
  outline: 'bg-transparent text-gold border-gold hover:bg-gold hover:text-void',
  ghost: 'bg-transparent text-text-main border-transparent hover:bg-edge',
  ice: 'bg-ice text-void hover:bg-blue-200 border-transparent',
  danger: 'bg-red-600 text-white border-transparent hover:bg-red-500',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-8 py-3.5 text-base',
}

export default function Button({
  children,
  variant = 'gold',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  'aria-label': ariaLabel,
  ...props
}) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      whileTap={{ scale: 0.97 }}
      className={`
        inline-flex items-center justify-center gap-2
        font-inter font-medium border rounded-lg
        transition-colors duration-150 cursor-pointer
        disabled:opacity-50 disabled:cursor-not-allowed
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : null}
      {children}
    </motion.button>
  )
}
