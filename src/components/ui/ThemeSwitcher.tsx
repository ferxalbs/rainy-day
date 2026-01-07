import {
  Sun,
  Moon,
  MonitorSmartphone,
  Cloud,
  Sparkles,
  Snowflake,
  Sunrise,
} from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

export function ThemeSwitcher() {
  const { mode, themeName, setMode, setThemeName } = useTheme();

  const handleModeChange = (value: string) => {
    setMode(value as "day" | "night" | "automatic");
  };

  const handleNameChange = (value: string) => {
    setThemeName(
      value as
        | "default"
        | "sky-blue"
        | "cosmic-gold"
        | "starry-christmas"
        | "ocean-sunset"
    );
  };

  return (
    <div className="flex items-center gap-2 no-drag">
      {/* Theme Name Selector */}
      <Select value={themeName} onValueChange={handleNameChange}>
        <SelectTrigger className="w-[150px] h-8 gap-2 border-border bg-secondary/50 backdrop-blur-md hover:bg-secondary transition-all rounded-full px-3 text-xs font-medium">
          {themeName === "default" && (
            <MonitorSmartphone className="h-3.5 w-3.5 text-muted-foreground" />
          )}
          {themeName === "sky-blue" && (
            <Cloud className="h-3.5 w-3.5 text-primary" />
          )}
          {themeName === "cosmic-gold" && (
            <Sparkles className="h-3.5 w-3.5 text-primary" />
          )}
          {themeName === "starry-christmas" && (
            <Snowflake className="h-3.5 w-3.5 text-primary" />
          )}
          {themeName === "ocean-sunset" && (
            <Sunrise className="h-3.5 w-3.5 text-primary" />
          )}
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="backdrop-blur-2xl bg-card/95 border-border rounded-2xl shadow-2xl">
          <SelectItem
            value="default"
            className="rounded-lg focus:bg-accent focus:text-accent-foreground transition-colors"
          >
            <div className="flex items-center gap-2">
              <MonitorSmartphone className="h-4 w-4 text-muted-foreground" />
              <span>Default</span>
            </div>
          </SelectItem>
          <SelectItem
            value="sky-blue"
            className="rounded-lg focus:bg-accent focus:text-accent-foreground transition-colors"
          >
            <div className="flex items-center gap-2">
              <Cloud className="h-4 w-4 text-primary" />
              <span>Sky Blue</span>
            </div>
          </SelectItem>
          <SelectItem
            value="cosmic-gold"
            className="rounded-lg focus:bg-accent focus:text-accent-foreground transition-colors"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>Cosmic Gold</span>
            </div>
          </SelectItem>
          <SelectItem
            value="starry-christmas"
            className="rounded-lg focus:bg-accent focus:text-accent-foreground transition-colors"
          >
            <div className="flex items-center gap-2">
              <Snowflake className="h-4 w-4 text-primary" />
              <span>Starry Christmas</span>
            </div>
          </SelectItem>
          <SelectItem
            value="ocean-sunset"
            className="rounded-lg focus:bg-accent focus:text-accent-foreground transition-colors"
          >
            <div className="flex items-center gap-2">
              <Sunrise className="h-4 w-4 text-primary" />
              <span>Ocean Sunset</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>

      {/* Appearance Selector */}
      <Select value={mode} onValueChange={handleModeChange}>
        <SelectTrigger className="w-[100px] h-8 gap-2 border-border bg-secondary/50 backdrop-blur-md hover:bg-secondary transition-all rounded-full px-3">
          {mode === "day" && <Sun className="h-3.5 w-3.5 text-primary" />}
          {mode === "night" && <Moon className="h-3.5 w-3.5 text-primary" />}
          {mode === "automatic" && (
            <MonitorSmartphone className="h-3.5 w-3.5 text-muted-foreground" />
          )}
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="backdrop-blur-2xl bg-card/95 border-border rounded-2xl shadow-2xl">
          <SelectItem
            value="day"
            className="rounded-lg focus:bg-accent transition-colors"
          >
            <div className="flex items-center gap-2">
              <Sun className="h-4 w-4 text-primary" />
              <span>Day</span>
            </div>
          </SelectItem>
          <SelectItem
            value="night"
            className="rounded-lg focus:bg-accent transition-colors"
          >
            <div className="flex items-center gap-2">
              <Moon className="h-4 w-4 text-primary" />
              <span>Night</span>
            </div>
          </SelectItem>
          <SelectItem
            value="automatic"
            className="rounded-lg focus:bg-accent transition-colors"
          >
            <div className="flex items-center gap-2">
              <MonitorSmartphone className="h-4 w-4 text-muted-foreground" />
              <span>Auto</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
