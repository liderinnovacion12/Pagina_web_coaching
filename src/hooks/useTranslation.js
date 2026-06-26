import { useTranslation as useI18nTranslation } from 'react-i18next'
import i18n from '../lib/i18n'
import useStore from '../store/useStore'

export default function useTranslation(ns = 'translation') {
  const { t, i18n: i18nInstance } = useI18nTranslation(ns)
  const { setLang } = useStore()

  const toggleLanguage = () => {
    const next = i18nInstance.language === 'es' ? 'en' : 'es'
    i18nInstance.changeLanguage(next)
    setLang(next)
  }

  const setLanguage = (lang) => {
    i18nInstance.changeLanguage(lang)
    setLang(lang)
  }

  return { t, lang: i18nInstance.language, toggleLanguage, setLanguage, i18n: i18nInstance }
}
