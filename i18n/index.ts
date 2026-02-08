import { getLocales } from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import ko from './locales/ko.json';
import vi from './locales/vi.json';

const resources = {
    en: { translation: en },
    ko: { translation: ko },
    vi: { translation: vi },
};

// Get device language
const deviceLanguage = getLocales()[0]?.languageCode ?? 'en';

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: deviceLanguage, // Default to device language initially
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false, // react already safes from xss
        },
        react: {
            useSuspense: false,
        }
    });

export default i18n;
