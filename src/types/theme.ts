// Theme types and interfaces

export type ThemeAppearance = 'day' | 'night';
export type ThemeMode = 'day' | 'night' | 'automatic';
export type ThemeName = 'default' | 'sky-blue' | 'cosmic-gold' | 'starry-christmas' | 'ocean-sunset';

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
  name: ThemeName;
  mode: ThemeMode;
  colors: ThemeColors;
}

export const DAY_THEME: ThemeConfig = {
  name: 'default',
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
  name: 'default',
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

export const SKY_BLUE_DAY_THEME: ThemeConfig = {
  name: 'sky-blue',
  mode: 'day',
  colors: {
    background: '200 100% 98%',        // Crisp sky blue white
    foreground: '202 95% 12%',         // Deep ocean blue (better contrast)
    border: '200 85% 88%',             // Soft cloud border
    primary: '199 89% 48%',            // Vibrant sky blue
    secondary: '200 95% 94%',          // Light sky secondary
    accent: '200 90% 90%',             // Gentle sky accent
    muted: '200 85% 92%',              // Soft muted sky
    card: '200 100% 99%',              // Nearly white sky card
    popover: '200 100% 99%',           // Nearly white sky popover
  },
};

export const SKY_BLUE_NIGHT_THEME: ThemeConfig = {
  name: 'sky-blue',
  mode: 'night',
  colors: {
    background: '202 100% 4%',         // Deep midnight sky
    foreground: '199 85% 96%',         // Bright cloud white  
    border: '202 95% 14%',             // Dark sky border (more visible)
    primary: '199 89% 52%',            // Brighter sky blue for dark mode
    secondary: '202 90% 9%',           // Deep night secondary
    accent: '202 85% 16%',             // Subtle night accent
    muted: '202 80% 11%',              // Muted deep night
    card: '202 95% 6%',                // Midnight card
    popover: '202 95% 6%',             // Midnight popover
  },
};

export const COSMIC_GOLD_DAY_THEME: ThemeConfig = {
  name: 'cosmic-gold',
  mode: 'day',
  colors: {
    background: '42 35% 97%',          // Warm parchment light
    foreground: '25 45% 12%',          // Rich bronze text
    border: '45 60% 85%',              // Soft gold border
    primary: '43 96% 56%',             // Amber 500
    secondary: '42 40% 92%',           // Warm stardust
    accent: '43 96% 56%',              // Amber accent
    muted: '42 35% 90%',               // Soft parchment muted
    card: '42 50% 98%',                // Luminous nebula white
    popover: '42 50% 98%',             // Luminous nebula white
  },
};

export const COSMIC_GOLD_NIGHT_THEME: ThemeConfig = {
  name: 'cosmic-gold',
  mode: 'night',
  colors: {
    background: '25 25% 5%',           // Deep cosmic void (Solid fallback)
    foreground: '43 96% 90%',          // Light Amber/Gold
    border: '43 60% 20%',              // Dark Gold Border
    primary: '43 96% 56%',             // Amber 500
    secondary: '25 30% 10%',           // Dark cosmic secondary
    accent: '43 96% 56%',              // Amber accent
    muted: '25 20% 12%',               // Muted space
    card: '25 30% 6%',                 // Deep nebula card
    popover: '25 30% 6%',              // Deep nebula popover
  },
};

export const STARRY_CHRISTMAS_DAY_THEME: ThemeConfig = {
  name: 'starry-christmas',
  mode: 'day',
  colors: {
    background: '0 0% 98%',            // Snow white
    foreground: '142 76% 18%',         // Pine green text
    border: '0 84% 60%',               // Christmas red border
    primary: '142 70% 45%',            // Pine green
    secondary: '0 0% 94%',             // Light snow secondary
    accent: '0 84% 60%',               // Red accent
    muted: '142 30% 90%',              // Muted pine
    card: '0 0% 100%',                 // White snow card
    popover: '0 0% 100%',              // White snow popover
  },
};

export const STARRY_CHRISTMAS_NIGHT_THEME: ThemeConfig = {
  name: 'starry-christmas',
  mode: 'night',
  colors: {
    background: '142 40% 6%',          // Deep forest night
    foreground: '0 0% 95%',            // Snow white text
    border: '0 70% 35%',               // Dark red border
    primary: '142 70% 45%',            // Pine green
    secondary: '142 40% 10%',          // Dark forest secondary
    accent: '48 96% 53%',              // Gold accent (lights)
    muted: '142 30% 15%',              // Muted forest
    card: '142 40% 8%',                // Forest card
    popover: '142 40% 8%',             // Forest popover
  },
};

export const OCEAN_SUNSET_DAY_THEME: ThemeConfig = {
  name: 'ocean-sunset',
  mode: 'day',
  colors: {
    background: '39 100% 98%',         // Light peachy sand
    foreground: '24 45% 15%',          // Warm dark brown
    border: '14 90% 85%',              // Soft coral pink border
    primary: '14 100% 63%',            // Vibrant Coral
    secondary: '28 100% 95%',          // Pale sunset peach
    accent: '28 100% 55%',             // Golden orange sunset
    muted: '39 50% 94%',               // Soft sand muted
    card: '39 100% 99%',               // Luminous sand card
    popover: '39 100% 99%',            // Luminous sand popover
  },
};

export const OCEAN_SUNSET_NIGHT_THEME: ThemeConfig = {
  name: 'ocean-sunset',
  mode: 'night',
  colors: {
    background: '230 40% 6%',          // Deep midnight ocean
    foreground: '39 90% 95%',          // Soft coral glow
    border: '280 50% 20%',             // Muted sunset purple border
    primary: '14 100% 63%',            // Vibrant Coral
    secondary: '230 35% 12%',          // Dark indigo secondary
    accent: '32 100% 50%',             // Golden sunset glow
    muted: '230 25% 15%',              // Muted midnight
    card: '230 35% 8%',                // Midnight depths card
    popover: '230 35% 8%',             // Midnight depths popover
  },
};

