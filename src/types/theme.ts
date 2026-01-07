// Theme types and interfaces

export type ThemeMode = 'day' | 'night' | 'automatic';

export interface ThemeColors {
  background: string;
  foreground: string;
  border: string;
  primary: string;
  secondary: string;
  accent: string;
  muted: string;
  card: string;
  popover: string;
}

export interface ThemeConfig {
  mode: ThemeMode;
  colors: ThemeColors;
}

export const DAY_THEME: ThemeConfig = {
  mode: 'day',
  colors: {
    background: '0 0% 100%',           // White
    foreground: '222.2 84% 4.9%',      // Very dark blue
    border: '214.3 31.8% 91.4%',       // Light blue-gray
    primary: '217.2 91.2% 59.8%',      // Blue
    secondary: '210 40% 96.1%',        // Very light blue
    accent: '210 40% 96.1%',           // Light accent
    muted: '210 40% 96.1%',            // Light muted
    card: '0 0% 100%',                 // White
    popover: '0 0% 100%',              // White
  },
};

export const NIGHT_THEME: ThemeConfig = {
  mode: 'night',
  colors: {
    background: '222.2 84% 4.9%',      // Very dark blue
    foreground: '210 40% 98%',         // Almost white
    border: '217.2 32.6% 17.5%',       // Dark blue-gray
    primary: '217.2 91.2% 59.8%',      // Blue
    secondary: '217.2 32.6% 17.5%',    // Dark secondary
    accent: '217.2 32.6% 17.5%',       // Dark accent
    muted: '217.2 32.6% 17.5%',        // Dark muted
    card: '222.2 84% 4.9%',            // Very dark blue
    popover: '222.2 84% 4.9%',         // Very dark blue
  },
};
