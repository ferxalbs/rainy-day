import { useEffect, useState, useCallback } from "react";
import {
  Sun,
  Moon,
  MonitorSmartphone,
  Cloud,
  Sparkles,
  Snowflake,
  RefreshCw,
  Sunrise,
} from "lucide-react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "./ui/command";
import { useTheme } from "../contexts/ThemeContext";
import type { ThemeMode, ThemeName } from "../types/theme";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const { mode, themeName, setMode, setThemeName } = useTheme();

  // Handle keyboard shortcut (Cmd+K or Ctrl+K)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleThemeChange = useCallback(
    async (newMode: ThemeMode) => {
      await setMode(newMode);
      setOpen(false);
    },
    [setMode]
  );

  const handleThemeNameChange = useCallback(
    async (newName: ThemeName) => {
      await setThemeName(newName);
      setOpen(false);
    },
    [setThemeName]
  );

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Command Palette"
      description="Quick actions and theme switching"
      className="backdrop-blur-xl bg-muted/10 border-2 border-border rounded-2xl"
    >
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Theme Colors">
          <CommandItem
            onSelect={() => handleThemeNameChange("default")}
            className="gap-2"
          >
            <MonitorSmartphone className="h-4 w-4" />
            <span>Default</span>
            {themeName === "default" && (
              <span className="ml-auto text-xs text-primary">Active</span>
            )}
          </CommandItem>

          <CommandItem
            onSelect={() => handleThemeNameChange("sky-blue")}
            className="gap-2"
          >
            <Cloud className="h-4 w-4" />
            <span>Sky Blue</span>
            {themeName === "sky-blue" && (
              <span className="ml-auto text-xs text-primary">Active</span>
            )}
          </CommandItem>

          <CommandItem
            onSelect={() => handleThemeNameChange("cosmic-gold")}
            className="gap-2"
          >
            <Sparkles className="h-4 w-4" />
            <span>Cosmic Gold</span>
            {themeName === "cosmic-gold" && (
              <span className="ml-auto text-xs text-primary">Active</span>
            )}
          </CommandItem>

          <CommandItem
            onSelect={() => handleThemeNameChange("starry-christmas")}
            className="gap-2"
          >
            <Snowflake className="h-4 w-4" />
            <span>Starry Christmas</span>
            {themeName === "starry-christmas" && (
              <span className="ml-auto text-xs text-primary">Active</span>
            )}
          </CommandItem>

          <CommandItem
            onSelect={() => handleThemeNameChange("ocean-sunset")}
            className="gap-2"
          >
            <Sunrise className="h-4 w-4" />
            <span>Ocean Sunset</span>
            {themeName === "ocean-sunset" && (
              <span className="ml-auto text-xs text-primary">Active</span>
            )}
          </CommandItem>

          <CommandItem
            onSelect={() => handleThemeNameChange("midnight-void")}
            className="gap-2"
          >
            <div className="size-4 rounded-full bg-[#000000] border border-white/20" />
            <span>Midnight Void</span>
            {themeName === "midnight-void" && (
              <span className="ml-auto text-xs text-primary">Active</span>
            )}
          </CommandItem>

          <CommandItem
            onSelect={() => handleThemeNameChange("cosmic-night")}
            className="gap-2"
          >
            <div className="size-4 rounded-full bg-[#020617] border border-blue-500/20" />
            <span>Cosmic Night</span>
            {themeName === "cosmic-night" && (
              <span className="ml-auto text-xs text-primary">Active</span>
            )}
          </CommandItem>

          <CommandItem
            onSelect={() => handleThemeNameChange("retro-sunset")}
            className="gap-2"
          >
            <div className="size-4 rounded-full bg-[#0f0a08] border border-orange-500/20" />
            <span>Retro Sunset</span>
            {themeName === "retro-sunset" && (
              <span className="ml-auto text-xs text-primary">Active</span>
            )}
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Appearance Mode">
          <CommandItem
            onSelect={() => handleThemeChange("day")}
            className="gap-2"
          >
            <Sun className="h-4 w-4" />
            <span>Day Mode</span>
            {mode === "day" && (
              <span className="ml-auto text-xs text-primary">Active</span>
            )}
          </CommandItem>

          <CommandItem
            onSelect={() => handleThemeChange("night")}
            className="gap-2"
          >
            <Moon className="h-4 w-4" />
            <span>Night Mode</span>
            {mode === "night" && (
              <span className="ml-auto text-xs text-primary">Active</span>
            )}
          </CommandItem>

          <CommandItem
            onSelect={() => handleThemeChange("automatic")}
            className="gap-2"
          >
            <MonitorSmartphone className="h-4 w-4" />
            <span>Automatic Mode</span>
            {mode === "automatic" && (
              <span className="ml-auto text-xs text-primary">Active</span>
            )}
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Actions">
          <CommandItem
            onSelect={() => {
              window.location.reload();
              setOpen(false);
            }}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Reload Application</span>
            <span className="ml-auto text-xs text-muted-foreground">⌘R</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
