/**
 * i18n — i18next initialization
 *
 * Turkish (tr) default, English (en) secondary.
 * Namespace-based, lazy loaded, interpolation, plurals.
 */

import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

// Import translations directly for bundling (small app, avoids network requests)
import trAuth from './locales/tr/auth.json';
import trCommon from './locales/tr/common.json';
import trHome from './locales/tr/home.json';
import trLesson from './locales/tr/lesson.json';
import trProfile from './locales/tr/profile.json';
import trShop from './locales/tr/shop.json';

import enAuth from './locales/en/auth.json';
import enCommon from './locales/en/common.json';
import enHome from './locales/en/home.json';
import enLesson from './locales/en/lesson.json';
import enProfile from './locales/en/profile.json';
import enShop from './locales/en/shop.json';

export const defaultNS = 'common';
export const supportedLanguages = ['tr', 'en'] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    defaultNS,
    ns: ['common', 'auth', 'home', 'lesson', 'shop', 'profile'],
    fallbackLng: 'tr',
    supportedLngs: [...supportedLanguages],
    interpolation: {
      escapeValue: false, // React already escapes
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'novalingo_lang',
    },
    resources: {
      tr: {
        common: trCommon,
        auth: trAuth,
        home: trHome,
        lesson: trLesson,
        shop: trShop,
        profile: trProfile,
      },
      en: {
        common: enCommon,
        auth: enAuth,
        home: enHome,
        lesson: enLesson,
        shop: enShop,
        profile: enProfile,
      },
    },
  });

export default i18n;
