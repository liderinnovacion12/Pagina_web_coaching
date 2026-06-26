import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import useAuth from '../hooks/useAuth'
import useStore from '../store/useStore'
import useTranslation from '../hooks/useTranslation'
import Button from '../components/ui/Button'
import Toggle from '../components/ui/Toggle'

export default function Login() {
  const { signIn } = useAuth()
  const { user, profile } = useStore()
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Redirect if already logged in
  useEffect(() => {
    if (user && profile) {
      navigate(profile.role === 'admin' ? '/dashboard' : '/portal', { replace: true })
    }
  }, [user, profile])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn(email.trim().toLowerCase(), password)

      if (result.error) {
        setError(t('login.error_invalid'))
      } else if (result.profile) {
        navigate(result.profile.role === 'admin' ? '/dashboard' : '/portal', { replace: true })
      }
    } catch {
      setError(t('login.error_generic'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-void flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(201,168,76,0.06) 0%, transparent 70%)',
        }}
      />

      {/* Language toggle top-right */}
      <div className="absolute top-4 right-4">
        <Toggle />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-1">
            <span className="font-syne text-2xl text-text-main">COACH</span>
            <span className="font-syne text-2xl text-gold">PRO</span>
            <span className="ml-0.5 w-2 h-2 rounded-full bg-gold" />
          </Link>
        </div>

        {/* Card */}
        <div className="bg-surface border border-edge rounded-2xl p-8">
          <h1 className="font-syne text-2xl text-text-main mb-1">{t('login.title')}</h1>
          <p className="text-sm text-muted mb-8">{t('login.subtitle')}</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-xs font-jetbrains text-muted mb-2 uppercase tracking-wider">
                {t('login.email')}
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-void border border-edge rounded-lg px-4 py-3 text-sm text-text-main placeholder-muted focus:outline-none focus:border-gold transition-colors"
                placeholder="correo@ejemplo.com"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-xs font-jetbrains text-muted mb-2 uppercase tracking-wider">
                {t('login.password')}
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-void border border-edge rounded-lg px-4 py-3 text-sm text-text-main placeholder-muted focus:outline-none focus:border-gold transition-colors"
                placeholder="••••••••"
              />
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {error}
              </motion.div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              variant="gold"
              size="lg"
              loading={loading}
              className="w-full mt-2"
            >
              {loading ? t('login.loading') : t('login.submit')}
            </Button>
          </form>

          {/* Demo hint */}
          <div className="mt-6 pt-5 border-t border-edge">
            <p className="text-xs text-muted font-jetbrains text-center leading-relaxed">
              {t('login.demo_hint')}
            </p>
          </div>
        </div>

        {/* Back to home */}
        <p className="text-center mt-6 text-sm text-muted">
          <Link to="/" className="hover:text-gold transition-colors">
            ← Volver al inicio
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
