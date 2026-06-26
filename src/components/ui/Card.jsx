import React from 'react'
import { motion } from 'framer-motion'

export default function Card({
  children,
  className = '',
  hover = false,
  padding = true,
  as: Tag = 'div',
  onClick,
  style,
}) {
  const base = `
    bg-surface border border-edge rounded-xl
    ${padding ? 'p-6' : ''}
    ${hover ? 'card-hover cursor-pointer' : ''}
    ${className}
  `

  if (hover || onClick) {
    return (
      <motion.div
        className={base}
        style={style}
        onClick={onClick}
        whileHover={{ y: -4, boxShadow: '0 8px 32px rgba(201, 168, 76, 0.15)' }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <div className={base} style={style}>
      {children}
    </div>
  )
}
