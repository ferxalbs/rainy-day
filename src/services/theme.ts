// Theme service - handles communication with Tauri backend

import { invoke } from '@tauri-apps/api/core';
import type { ThemeMode } from '../types/theme';

export async function getTheme(): Promise<ThemeMode> {
  try {
    const mode = await invoke<string>('get_theme');
    return mode as ThemeMode;
  } catch (error) {
    console.error('Failed to get theme:', error);
    return 'automatic';
  }
}

export async function setTheme(mode: ThemeMode): Promise<void> {
  try {
    await invoke('set_theme', { mode });
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
