import React from 'react'
import { motion } from 'framer-motion'
import useTranslation from '../../hooks/useTranslation'

export default function Toggle({ className = '' }) {
  const { lang, toggleLanguage } = useTranslation()

  return (
    <button
      onClick={toggleLanguage}
      aria-label={`Switch language to ${lang === 'es' ? 'English' : 'Español'}`}
      className={`
        relative inline-flex items-center gap-1.5 px-3 py-1.5
        border border-edge rounded-lg
        text-xs font-jetbrains font-medium text-muted
        hover:border-gold hover:text-gold
        transition-colors duration-150
        ${className}
      `}
    >
      <motion.span
        key={lang}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.15 }}
        className="text-text-main"
      >
        {lang.toUpperCase()}
      </motion.span>
      <span className="text-edge">|</span>
      <span>{lang === 'es' ? 'EN' : 'ES'}</span>
    </button>
  )
}
