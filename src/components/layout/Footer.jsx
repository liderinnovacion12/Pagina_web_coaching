import React from 'react'
import { Link } from 'react-router-dom'
import useTranslation from '../../hooks/useTranslation'

export default function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="border-t border-edge bg-surface/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-1 mb-3">
              <span className="font-syne text-xl text-text-main">COACH</span>
              <span className="font-syne text-xl text-gold">PRO</span>
              <span className="ml-0.5 w-1.5 h-1.5 rounded-full bg-gold" />
            </div>
            <p className="text-sm text-muted leading-relaxed">{t('footer.tagline')}</p>
          </div>

          {/* Links */}
          <div>
            <p className="text-xs font-jetbrains text-muted uppercase tracking-widest mb-4">Plataforma</p>
            <ul className="space-y-2">
              {['/', '/login', '/portal'].map((href, i) => (
                <li key={href}>
                  <Link
                    to={href}
                    className="text-sm text-muted hover:text-gold transition-colors"
                  >
                    {['Landing', 'Ingresar', 'Portal'][i]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="text-xs font-jetbrains text-muted uppercase tracking-widest mb-4">Legal</p>
            <ul className="space-y-2">
              {['Privacidad', 'Términos', 'Cookies'].map((item) => (
                <li key={item}>
                  <span className="text-sm text-muted cursor-default">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-edge flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted font-jetbrains">
            © {new Date().getFullYear()} CoachPro. {t('footer.rights')}
          </p>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-muted font-jetbrains">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
