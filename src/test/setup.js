import '@testing-library/jest-dom'
import i18n from '../lib/i18n'

// Force a deterministic language for assertions regardless of jsdom's navigator locale
i18n.changeLanguage('es')
