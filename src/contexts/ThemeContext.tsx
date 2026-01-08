import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { getTheme, setTheme as saveTheme } from "../services/theme";
import type { ThemeMode, ThemeConfig, ThemeName } from "../types/theme";
import {
  DAY_THEME,
  NIGHT_THEME,
  SKY_BLUE_DAY_THEME,
  SKY_BLUE_NIGHT_THEME,
  COSMIC_GOLD_DAY_THEME,
  COSMIC_GOLD_NIGHT_THEME,
  STARRY_CHRISTMAS_DAY_THEME,
  STARRY_CHRISTMAS_NIGHT_THEME,
  OCEAN_SUNSET_DAY_THEME,
  OCEAN_SUNSET_NIGHT_THEME,
  MIDNIGHT_VOID_DAY_THEME,
  MIDNIGHT_VOID_NIGHT_THEME,
  COSMIC_NIGHT_DAY_THEME,
  COSMIC_NIGHT_NIGHT_THEME,
  RETRO_SUNSET_DAY_THEME,
  RETRO_SUNSET_NIGHT_THEME,
} from "../types/theme";

interface ThemeContextType {
  mode: ThemeMode;
  themeName: ThemeName;
  currentTheme: ThemeConfig;
  setMode: (mode: ThemeMode) => Promise<void>;
  setThemeName: (name: ThemeName) => Promise<void>;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("automatic");
  const [themeName, setThemeNameState] = useState<ThemeName>("default");
  const [currentTheme, setCurrentTheme] = useState<ThemeConfig>(NIGHT_THEME);
  const [isLoading, setIsLoading] = useState(true);

  // Detect system theme preference
  const getSystemThemePreference = useCallback((): "day" | "night" => {
    if (typeof window !== "undefined" && window.matchMedia) {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "night"
        : "day";
    }
    return "night";
  }, []);

  // Compute the actual theme based on mode and name
  const computeTheme = useCallback(
    (themeMode: ThemeMode, name: ThemeName): ThemeConfig => {
      const systemPreference = getSystemThemePreference();
      const actualAppearance =
        themeMode === "automatic" ? systemPreference : themeMode;

      if (name === "sky-blue") {
        return actualAppearance === "day"
          ? SKY_BLUE_DAY_THEME
          : SKY_BLUE_NIGHT_THEME;
      }
      if (name === "cosmic-gold") {
        return actualAppearance === "day"
          ? COSMIC_GOLD_DAY_THEME
          : COSMIC_GOLD_NIGHT_THEME;
      }
      if (name === "starry-christmas") {
        return actualAppearance === "day"
          ? STARRY_CHRISTMAS_DAY_THEME
          : STARRY_CHRISTMAS_NIGHT_THEME;
      }
      if (name === "ocean-sunset") {
        return actualAppearance === "day"
          ? OCEAN_SUNSET_DAY_THEME
          : OCEAN_SUNSET_NIGHT_THEME;
      }
      if (name === "midnight-void") {
        return actualAppearance === "day"
          ? MIDNIGHT_VOID_DAY_THEME
          : MIDNIGHT_VOID_NIGHT_THEME;
      }
      if (name === "cosmic-night") {
        return actualAppearance === "day"
          ? COSMIC_NIGHT_DAY_THEME
          : COSMIC_NIGHT_NIGHT_THEME;
      }
      if (name === "retro-sunset") {
        return actualAppearance === "day"
          ? RETRO_SUNSET_DAY_THEME
          : RETRO_SUNSET_NIGHT_THEME;
      }
      return actualAppearance === "day" ? DAY_THEME : NIGHT_THEME;
    },
    [getSystemThemePreference]
  );

  // Apply theme to document
  const applyTheme = useCallback(
    (theme: ThemeConfig) => {
      const root = document.documentElement;

      // Remove existing theme classes
      root.classList.remove(
        "theme-day",
        "theme-night",
        "dark",
        "theme-sky-blue",
        "theme-cosmic-gold",
        "theme-starry-christmas",
        "theme-ocean-sunset",
        "theme-midnight-void",
        "theme-cosmic-night",
        "theme-retro-sunset",
        "theme-default"
      );

      // Add new theme classes
      const actualMode =
        theme.mode === "automatic" ? getSystemThemePreference() : theme.mode;

      root.classList.add(`theme-${theme.name}`);
      root.classList.add(`theme-${actualMode}`);

      // Add 'dark' class for compatibility with existing components
      if (actualMode === "night") {
        root.classList.add("dark");
      }

      // Set CSS custom properties
      root.style.setProperty("--background", theme.colors.background);
      root.style.setProperty("--foreground", theme.colors.foreground);
      root.style.setProperty("--border", theme.colors.border);
      root.style.setProperty("--primary", theme.colors.primary);
      root.style.setProperty("--secondary", theme.colors.secondary);
      root.style.setProperty("--accent", theme.colors.accent);
      root.style.setProperty("--muted", theme.colors.muted);
      root.style.setProperty("--card", theme.colors.card);
      root.style.setProperty("--popover", theme.colors.popover);

      // Update other derived variables
      root.style.setProperty("--card-foreground", theme.colors.foreground);
      root.style.setProperty("--popover-foreground", theme.colors.foreground);
      root.style.setProperty(
        "--primary-foreground",
        actualMode === "day" ? "222.2 47.4% 11.2%" : "210 40% 98%"
      );
      root.style.setProperty("--secondary-foreground", theme.colors.foreground);
      root.style.setProperty(
        "--muted-foreground",
        actualMode === "day" ? "215.4 16.3% 46.9%" : "215 20.2% 65.1%"
      );
      root.style.setProperty("--accent-foreground", theme.colors.foreground);
    },
    [getSystemThemePreference]
  );

  // Set mode and persist
  const setMode = useCallback(
    async (newMode: ThemeMode) => {
      try {
        await saveTheme(newMode, themeName);
        setModeState(newMode);
        const theme = computeTheme(newMode, themeName);
        setCurrentTheme(theme);
        applyTheme(theme);
      } catch (error) {
        console.error("Failed to set theme mode:", error);
      }
    },
    [computeTheme, applyTheme, themeName]
  );

  // Set theme name and persist
  const setThemeName = useCallback(
    async (newName: ThemeName) => {
      try {
        await saveTheme(mode, newName);
        setThemeNameState(newName);
        const theme = computeTheme(mode, newName);
        setCurrentTheme(theme);
        applyTheme(theme);
      } catch (error) {
        console.error("Failed to set theme name:", error);
      }
    },
    [computeTheme, applyTheme, mode]
  );

  // Load saved theme on mount
  useEffect(() => {
    async function loadTheme() {
      try {
        const { mode: savedMode, name: savedName } = await getTheme();

        setModeState(savedMode);
        setThemeNameState(savedName);
        const theme = computeTheme(savedMode, savedName);
        setCurrentTheme(theme);
        applyTheme(theme);
      } catch (error) {
        console.error("Failed to load theme:", error);
        // Use default theme
        const theme = computeTheme("automatic", "default");
        setCurrentTheme(theme);
        applyTheme(theme);
      } finally {
        setIsLoading(false);
      }
    }

    loadTheme();
  }, [computeTheme, applyTheme]);

  // Listen for system theme changes
  useEffect(() => {
    if (mode !== "automatic") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = () => {
      const theme = computeTheme("automatic", themeName);
      setCurrentTheme(theme);
      applyTheme(theme);
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [mode, computeTheme, applyTheme]);

  return (
    <ThemeContext.Provider
      value={{
        mode,
        themeName,
        currentTheme,
        setMode,
        setThemeName,
        isLoading,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
