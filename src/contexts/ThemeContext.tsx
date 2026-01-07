import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { getTheme, setTheme as saveTheme } from "../services/theme";
import type { ThemeMode, ThemeConfig } from "../types/theme";
import { DAY_THEME, NIGHT_THEME } from "../types/theme";

interface ThemeContextType {
  mode: ThemeMode;
  currentTheme: ThemeConfig;
  setMode: (mode: ThemeMode) => Promise<void>;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("automatic");
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

  // Compute the actual theme based on mode
  const computeTheme = useCallback(
    (themeMode: ThemeMode): ThemeConfig => {
      if (themeMode === "automatic") {
        const systemPreference = getSystemThemePreference();
        return systemPreference === "day" ? DAY_THEME : NIGHT_THEME;
      }
      return themeMode === "day" ? DAY_THEME : NIGHT_THEME;
    },
    [getSystemThemePreference]
  );

  // Apply theme to document
  const applyTheme = useCallback(
    (theme: ThemeConfig) => {
      const root = document.documentElement;

      // Remove existing theme classes
      root.classList.remove("theme-day", "theme-night", "dark");

      // Add new theme class
      const actualMode =
        theme.mode === "automatic" ? getSystemThemePreference() : theme.mode;
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
        await saveTheme(newMode);
        setModeState(newMode);
        const theme = computeTheme(newMode);
        setCurrentTheme(theme);
        applyTheme(theme);
      } catch (error) {
        console.error("Failed to set theme:", error);
      }
    },
    [computeTheme, applyTheme]
  );

  // Load saved theme on mount
  useEffect(() => {
    async function loadTheme() {
      try {
        const savedMode = await getTheme();
        setModeState(savedMode);
        const theme = computeTheme(savedMode);
        setCurrentTheme(theme);
        applyTheme(theme);
      } catch (error) {
        console.error("Failed to load theme:", error);
        // Use default theme
        const theme = computeTheme("automatic");
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
      const theme = computeTheme("automatic");
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
    <ThemeContext.Provider value={{ mode, currentTheme, setMode, isLoading }}>
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
