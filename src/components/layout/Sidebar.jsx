import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import useStore from '../../store/useStore'
import useTranslation from '../../hooks/useTranslation'

const NAV_ITEMS = [
  {
    key: 'dashboard',
    sectionId: null, // top of page
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="7" height="7" rx="1.5"/>
        <rect x="14" y="3" width="7" height="7" rx="1.5"/>
        <rect x="3" y="14" width="7" height="7" rx="1.5"/>
        <rect x="14" y="14" width="7" height="7" rx="1.5"/>
      </svg>
    ),
  },
  {
    key: 'videos',
    sectionId: 'section-videos',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="2" y="4" width="20" height="16" rx="2"/>
        <polygon points="10 9 15 12 10 15 10 9" fill="currentColor" stroke="none"/>
      </svg>
    ),
  },
  {
    key: 'coaches',
    sectionId: 'section-coaches',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="9" cy="7" r="3"/>
        <circle cx="17" cy="9" r="2.5"/>
        <path d="M2 20c0-3.3 3.1-6 7-6s7 2.7 7 6"/>
        <path d="M17 13c2.2 0 4 1.6 4 3.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    key: 'analytics',
    sectionId: 'section-analytics',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
  },
]

export default function Sidebar() {
  const { sidebarOpen, toggleSidebar, profile } = useStore()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()

  const [activeKey, setActiveKey] = React.useState('dashboard')

  const handleNav = (item) => {
    setActiveKey(item.key)
    if (item.sectionId) {
      // If not on dashboard, navigate first then scroll
      if (location.pathname !== '/dashboard') {
        navigate('/dashboard')
        setTimeout(() => {
          document.getElementById(item.sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 200)
      } else {
        document.getElementById(item.sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    } else {
      navigate('/dashboard')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : 'U'

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarOpen ? 220 : 64 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="relative flex flex-col h-full overflow-hidden shrink-0"
      style={{
        background: 'linear-gradient(180deg, #0D1019 0%, #080A0F 100%)',
        borderRight: '1px solid rgba(201,168,76,0.12)',
      }}
    >
      {/* Subtle gold line top */}
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #C9A84C55, transparent)' }} />

      {/* Toggle button */}
      <button
        onClick={toggleSidebar}
        aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        className="absolute top-4 right-3 z-10 p-1.5 rounded-lg text-muted hover:text-gold transition-colors"
        style={{ background: 'rgba(201,168,76,0.08)' }}
      >
        <motion.svg
          animate={{ rotate: sidebarOpen ? 0 : 180 }}
          transition={{ duration: 0.3 }}
          width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        >
          <polyline points="15 18 9 12 15 6"/>
        </motion.svg>
      </button>

      {/* Logo area */}
      <div className="h-16 flex items-center px-4 shrink-0" style={{ borderBottom: '1px solid rgba(201,168,76,0.08)' }}>
        <div className="flex items-center gap-2 overflow-hidden">
          {/* Animated logo mark */}
          <div className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center relative"
            style={{ background: 'linear-gradient(135deg, #C9A84C22, #C9A84C44)', border: '1px solid #C9A84C55' }}
          >
            <div className="w-3 h-3 rounded-sm" style={{ background: 'linear-gradient(135deg, #C9A84C, #E8C97A)' }} />
          </div>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.span
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2 }}
                className="font-syne text-base font-black whitespace-nowrap"
                style={{ color: '#C9A84C', letterSpacing: '0.12em' }}
              >
                COACHPRO
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-4 flex flex-col gap-1 px-2">
        {NAV_ITEMS.map((item) => {
          const isActive = activeKey === item.key
          return (
            <button
              key={item.key}
              onClick={() => handleNav(item)}
              aria-label={t(`sidebar.${item.key}`)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-left transition-all duration-200 relative group"
              style={{
                background: isActive
                  ? 'linear-gradient(135deg, rgba(201,168,76,0.15), rgba(201,168,76,0.08))'
                  : 'transparent',
                border: isActive ? '1px solid rgba(201,168,76,0.3)' : '1px solid transparent',
                color: isActive ? '#C9A84C' : '#5A6070',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(201,168,76,0.06)'
                  e.currentTarget.style.color = '#E8EAF0'
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = '#5A6070'
                }
              }}
            >
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-full"
                  style={{ background: 'linear-gradient(180deg, #C9A84C, #E8C97A)' }}
                />
              )}
              <span className="shrink-0">{item.icon}</span>
              <AnimatePresence>
                {sidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -6 }}
                    transition={{ duration: 0.15 }}
                    className="text-sm font-medium whitespace-nowrap"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    {t(`sidebar.${item.key}`)}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          )
        })}
      </nav>

      {/* User at bottom */}
      <div className="px-3 py-4" style={{ borderTop: '1px solid rgba(201,168,76,0.08)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #C9A84C33, #C9A84C55)',
              border: '1px solid #C9A84C44',
            }}
          >
            <span className="text-xs font-jetbrains" style={{ color: '#C9A84C' }}>{initials}</span>
          </div>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="min-w-0"
              >
                <p className="text-xs font-medium truncate" style={{ color: '#E8EAF0' }}>
                  {profile?.full_name || 'Usuario'}
                </p>
                <p className="text-xs capitalize" style={{ color: '#5A6070', fontFamily: 'JetBrains Mono, monospace' }}>
                  {profile?.role || 'member'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.aside>
  )
}
