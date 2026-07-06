import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import useAuth from '../hooks/useAuth'
import useStore from '../store/useStore'
import useTranslation from '../hooks/useTranslation'
import Button from '../components/ui/Button'
import Toggle from '../components/ui/Toggle'

export default function Login() {
  const { signIn, signInWithGoogle } = useAuth()
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

  const handleGoogle = async () => {
    setError('')
    const { error } = await signInWithGoogle()
    if (error) setError(t('login.error_generic'))
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

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="h-px flex-1 bg-edge" />
            <span className="text-xs text-muted uppercase tracking-wider">{t('auth.or_divider')}</span>
            <div className="h-px flex-1 bg-edge" />
          </div>

          {/* Google */}
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={handleGoogle}
            className="w-full"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.48c-.28 1.5-1.13 2.78-2.4 3.63v3.02h3.88c2.27-2.09 3.57-5.17 3.57-8.84z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.95-2.9l-3.88-3.02c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.12C3.25 21.3 7.31 24 12 24z"/>
              <path fill="#FBBC05" d="M5.27 14.27A7.2 7.2 0 0 1 4.9 12c0-.79.14-1.56.37-2.27V6.62H1.27A11.98 11.98 0 0 0 0 12c0 1.94.46 3.77 1.27 5.38l4-3.11z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.45-3.45C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.27 6.62l4 3.11C6.22 6.86 8.87 4.75 12 4.75z"/>
            </svg>
            {t('auth.google_button')}
          </Button>

          <p className="text-center mt-6 text-sm text-muted">
            {t('auth.no_account')}{' '}
            <Link to="/registro" className="text-gold hover:underline">
              {t('auth.register_link')}
            </Link>
          </p>

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
