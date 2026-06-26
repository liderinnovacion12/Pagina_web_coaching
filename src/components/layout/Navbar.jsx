import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import useStore from '../../store/useStore'
import useAuth from '../../hooks/useAuth'
import useTranslation from '../../hooks/useTranslation'
import Toggle from '../ui/Toggle'
import Button from '../ui/Button'

export default function Navbar() {
  const { user, profile } = useStore()
  const { signOut } = useAuth()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  const handleLogout = async () => {
    await signOut()
    navigate('/')
  }

  const isLanding = location.pathname === '/'

  return (
    <header
      className={`
        fixed top-0 left-0 right-0 z-50
        transition-all duration-300
        ${scrolled || !isLanding
          ? 'bg-void/95 backdrop-blur-md border-b border-edge'
          : 'bg-transparent'}
      `}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-1 group" aria-label="CoachPro home">
          <span className="font-syne text-xl text-text-main tracking-tight group-hover:text-gold transition-colors">
            COACH
          </span>
          <span className="font-syne text-xl text-gold">PRO</span>
          <span className="ml-0.5 w-1.5 h-1.5 rounded-full bg-gold inline-block" />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-4">
          <Toggle />

          {!user ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/login')}
            >
              {t('nav.login')}
            </Button>
          ) : (
            <>
              {profile?.role === 'admin' && (
                <Link
                  to="/dashboard"
                  className="text-sm text-muted hover:text-text-main transition-colors px-2 py-1"
                >
                  {t('nav.dashboard')}
                </Link>
              )}
              <Link
                to="/portal"
                className="text-sm text-muted hover:text-text-main transition-colors px-2 py-1"
              >
                {t('nav.portal')}
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                {t('nav.logout')}
              </Button>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2 text-muted hover:text-text-main"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        >
          <motion.span
            animate={menuOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
            className="block w-5 h-0.5 bg-current origin-center"
          />
          <motion.span
            animate={menuOpen ? { opacity: 0 } : { opacity: 1 }}
            className="block w-5 h-0.5 bg-current"
          />
          <motion.span
            animate={menuOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
            className="block w-5 h-0.5 bg-current origin-center"
          />
        </button>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-surface border-b border-edge overflow-hidden"
          >
            <div className="px-4 py-4 flex flex-col gap-3">
              <Toggle />
              {!user ? (
                <Button variant="outline" size="sm" onClick={() => navigate('/login')}>
                  {t('nav.login')}
                </Button>
              ) : (
                <>
                  {profile?.role === 'admin' && (
                    <Link to="/dashboard" className="text-sm text-muted hover:text-text-main py-2">
                      {t('nav.dashboard')}
                    </Link>
                  )}
                  <Link to="/portal" className="text-sm text-muted hover:text-text-main py-2">
                    {t('nav.portal')}
                  </Link>
                  <Button variant="ghost" size="sm" onClick={handleLogout}>
                    {t('nav.logout')}
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
