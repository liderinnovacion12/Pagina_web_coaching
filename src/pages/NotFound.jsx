import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-void flex flex-col items-center justify-center px-4 text-center">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <p className="font-jetbrains text-8xl font-bold text-gold/20 mb-4">404</p>
        <h1 className="font-syne text-3xl text-text-main mb-3">Página no encontrada</h1>
        <p className="text-muted mb-8 max-w-sm mx-auto">
          La ruta que buscas no existe o fue movida.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gold text-void font-medium rounded-lg hover:bg-yellow-400 transition-colors"
        >
          ← Volver al inicio
        </Link>
      </motion.div>
    </div>
  )
}
