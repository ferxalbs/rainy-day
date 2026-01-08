/**
 * Theme service - handles theme persistence using localStorage
 * 
 * This replaces the old Tauri-based theme service.
 */

import type { ThemeMode, ThemeName } from '../types/theme';

const THEME_STORAGE_KEY = 'rainy-day-theme';

interface StoredTheme {
  mode: ThemeMode;
  name: ThemeName;
}

/**
 * Get the current theme from localStorage
 */
export async function getTheme(): Promise<{ mode: ThemeMode; name: ThemeName }> {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as StoredTheme;
      return {
        mode: parsed.mode || 'automatic',
        name: parsed.name || 'default',
      };
    }
  } catch (error) {
    console.error('Failed to get theme from localStorage:', error);
  }
  return { mode: 'automatic', name: 'default' };
}

/**
 * Set the theme in localStorage
 */
export async function setTheme(mode: ThemeMode, name: ThemeName): Promise<void> {
  try {
    const theme: StoredTheme = { mode, name };
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(theme));
  } catch (error) {
    console.error('Failed to set theme in localStorage:', error);
    throw error;
  }
}

/**
 * Get the system theme preference
 */
export async function getSystemTheme(): Promise<'day' | 'night'> {
  try {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return isDark ? 'night' : 'day';
    }
  } catch (error) {
    console.error('Failed to get system theme:', error);
  }
  return 'night';
}

/**
 * Reset theme to default
 */
export async function resetTheme(): Promise<void> {
  try {
    localStorage.removeItem(THEME_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to reset theme:', error);
    throw error;
  }
}
