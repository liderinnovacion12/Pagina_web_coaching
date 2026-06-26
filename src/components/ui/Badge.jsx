import React from 'react'

const variants = {
  gold:    'bg-gold/10 text-gold border-gold/20',
  ice:     'bg-ice/10 text-ice border-ice/20',
  green:   'bg-green-500/10 text-green-400 border-green-500/20',
  red:     'bg-red-500/10 text-red-400 border-red-500/20',
  muted:   'bg-edge text-muted border-transparent',
  admin:   'bg-gold/15 text-gold border-gold/30',
  member:  'bg-ice/10 text-ice border-ice/20',
}

export default function Badge({ children, variant = 'muted', className = '' }) {
  return (
    <span
      className={`
        inline-flex items-center px-2 py-0.5
        text-xs font-medium font-jetbrains
        border rounded-md
        ${variants[variant] || variants.muted}
        ${className}
      `}
    >
      {children}
    </span>
  )
}
