// Theme service - handles communication with Tauri backend

import { invoke } from '@tauri-apps/api/core';
import type { ThemeMode, ThemeName } from '../types/theme';

export async function getTheme(): Promise<{ mode: ThemeMode, name: ThemeName }> {
  try {
    const result = await invoke<{ mode: string, name: string }>('get_theme');
    return {
      mode: result.mode as ThemeMode,
      name: result.name as ThemeName
    };
  } catch (error) {
    console.error('Failed to get theme:', error);
    return { mode: 'automatic', name: 'default' };
  }
}

export async function setTheme(mode: ThemeMode, name: ThemeName): Promise<void> {
  try {
    await invoke('set_theme', { mode, name });
  } catch (error) {
    console.error('Failed to set theme:', error);
    throw error;
  }
}

export async function getSystemTheme(): Promise<'day' | 'night'> {
  try {
    const theme = await invoke<string>('get_system_theme');
    return theme as 'day' | 'night';
  } catch (error) {
    console.error('Failed to get system theme:', error);
    return 'night';
  }
}

export async function resetTheme(): Promise<void> {
  try {
    await invoke('reset_theme');
  } catch (error) {
    console.error('Failed to reset theme:', error);
    throw error;
  }
}
