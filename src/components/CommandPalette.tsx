import { useEffect, useState, useCallback } from "react";
import { Sun, Moon, MonitorSmartphone, Palette } from "lucide-react";
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
import type { ThemeMode } from "../types/theme";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const { mode, setMode } = useTheme();

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

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Command Palette"
      description="Quick actions and theme switching"
      className="backdrop-blur-xl bg-muted/80 border-2 border-border rounded-2xl"
    >
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Theme">
          <CommandItem
            onSelect={() => handleThemeChange("day")}
            className="gap-2"
          >
            <Sun className="h-4 w-4" />
            <span>Switch to Day Theme</span>
            {mode === "day" && (
              <span className="ml-auto text-xs text-blue-500">Active</span>
            )}
          </CommandItem>

          <CommandItem
            onSelect={() => handleThemeChange("night")}
            className="gap-2"
          >
            <Moon className="h-4 w-4" />
            <span>Switch to Night Theme</span>
            {mode === "night" && (
              <span className="ml-auto text-xs text-blue-500">Active</span>
            )}
          </CommandItem>

          <CommandItem
            onSelect={() => handleThemeChange("automatic")}
            className="gap-2"
          >
            <MonitorSmartphone className="h-4 w-4" />
            <span>Switch to Automatic Theme</span>
            {mode === "automatic" && (
              <span className="ml-auto text-xs text-blue-500">Active</span>
            )}
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Appearance">
          <CommandItem className="gap-2">
            <Palette className="h-4 w-4" />
            <span>Customize Colors</span>
            <span className="ml-auto text-xs text-muted-foreground">
              Coming soon
            </span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
