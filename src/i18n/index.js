/**
 * i18n Configuration — FleetCommand
 * Languages: English, Arabic (RTL), Ukrainian, Russian, Spanish
 */
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import en from './locales/en'
import ar from './locales/ar'
import uk from './locales/uk'
import ru from './locales/ru'
import es from './locales/es'

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: { en, ar, uk, ru, es },
        fallbackLng: 'en',
        defaultNS: 'common',
        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage'],
            lookupLocalStorage: 'fleetcommand_lang',
        },
        interpolation: { escapeValue: false },
    })

export default i18n
