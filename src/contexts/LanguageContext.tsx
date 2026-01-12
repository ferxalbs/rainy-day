/**
 * Language Context
 * 
 * Provides internationalization support with language switching and persistence.
 * Auto-detects system language on first load.
 */

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Language } from '../i18n/types';

// Import translations
import en from '../i18n/translations/en.json';
import es from '../i18n/translations/es.json';

const translations: Record<Language, typeof en> = { en, es };

const STORAGE_KEY = 'rainy_day_language';
const SUPPORTED_LANGUAGES: Language[] = ['en', 'es'];

interface LanguageContextValue {
    language: Language;
    setLanguage: (lang: Language) => void;
    translations: typeof en;
    supportedLanguages: { code: Language; name: string; nativeName: string }[];
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

/**
 * Detect system language
 */
function detectSystemLanguage(): Language {
    const browserLang = navigator.language.split('-')[0];
    return SUPPORTED_LANGUAGES.includes(browserLang as Language)
        ? (browserLang as Language)
        : 'en';
}

/**
 * Load saved language from localStorage
 */
function loadSavedLanguage(): Language | null {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved && SUPPORTED_LANGUAGES.includes(saved as Language)) {
            return saved as Language;
        }
    } catch {
        // localStorage not available
    }
    return null;
}

/**
 * Save language to localStorage
 */
function saveLanguage(lang: Language): void {
    try {
        localStorage.setItem(STORAGE_KEY, lang);
    } catch {
        // localStorage not available
    }
}

interface LanguageProviderProps {
    children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
    const [language, setLanguageState] = useState<Language>(() => {
        // First check localStorage, then detect system language
        return loadSavedLanguage() || detectSystemLanguage();
    });

    const setLanguage = useCallback((lang: Language) => {
        setLanguageState(lang);
        saveLanguage(lang);
    }, []);

    // Update document lang attribute
    useEffect(() => {
        document.documentElement.lang = language;
    }, [language]);

    const value: LanguageContextValue = {
        language,
        setLanguage,
        translations: translations[language],
        supportedLanguages: [
            { code: 'en', name: 'English', nativeName: 'English' },
            { code: 'es', name: 'Spanish', nativeName: 'Español' },
        ],
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
}

/**
 * Hook to access language context
 */
export function useLanguage(): LanguageContextValue {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
