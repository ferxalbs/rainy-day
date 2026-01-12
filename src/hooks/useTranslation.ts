/**
 * useTranslation Hook
 * 
 * Provides translation function with support for nested keys and fallback.
 */

import { useCallback } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

/**
 * Get nested value from object using dot notation
 */
function getNestedValue(obj: Record<string, unknown>, path: string): string | undefined {
    const keys = path.split('.');
    let current: unknown = obj;

    for (const key of keys) {
        if (current === null || current === undefined || typeof current !== 'object') {
            return undefined;
        }
        current = (current as Record<string, unknown>)[key];
    }

    return typeof current === 'string' ? current : undefined;
}

/**
 * Replace parameters in translation string
 * Example: "Hello {{name}}" with { name: "John" } => "Hello John"
 */
function interpolate(text: string, params?: Record<string, string | number>): string {
    if (!params) return text;

    return text.replace(/\{\{(\w+)\}\}/g, (_, key) => {
        return params[key]?.toString() ?? `{{${key}}}`;
    });
}

interface UseTranslationReturn {
    t: (key: string, params?: Record<string, string | number>) => string;
    language: string;
}

/**
 * Translation hook
 * 
 * @example
 * const { t } = useTranslation();
 * t('common.close') // "Close" or "Cerrar"
 * t('inbox.taskCreated', { name: 'My Task' }) // with interpolation
 */
export function useTranslation(): UseTranslationReturn {
    const { translations, language } = useLanguage();

    const t = useCallback((key: string, params?: Record<string, string | number>): string => {
        const value = getNestedValue(translations as unknown as Record<string, unknown>, key);

        if (value === undefined) {
            // Return key if translation not found (helps debug missing translations)
            console.warn(`[i18n] Missing translation: ${key}`);
            return key;
        }

        return interpolate(value, params);
    }, [translations]);

    return { t, language };
}
