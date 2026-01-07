import { Sun, Moon, MonitorSmartphone, Cloud, Sparkles } from "lucide-react";
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
    setThemeName(value as "default" | "sky-blue" | "cosmic-gold");
  };

  return (
    <div className="flex items-center gap-2 no-drag">
      {/* Theme Name Selector */}
      <Select value={themeName} onValueChange={handleNameChange}>
        <SelectTrigger className="w-[130px] h-8 gap-2 border-slate-700/50 bg-slate-800/20 backdrop-blur-md hover:bg-slate-700/30 transition-all rounded-full px-3">
          {themeName === "default" && (
            <MonitorSmartphone className="h-3.5 w-3.5 text-slate-400" />
          )}
          {themeName === "sky-blue" && (
            <Cloud className="h-3.5 w-3.5 text-sky-400" />
          )}
          {themeName === "cosmic-gold" && (
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
          )}
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="backdrop-blur-2xl bg-slate-900/90 border-slate-700/50 rounded-2xl shadow-2xl">
          <SelectItem
            value="default"
            className="rounded-lg focus:bg-slate-800 focus:text-white transition-colors"
          >
            <div className="flex items-center gap-2">
              <MonitorSmartphone className="h-4 w-4 text-slate-400" />
              <span>Default</span>
            </div>
          </SelectItem>
          <SelectItem
            value="sky-blue"
            className="rounded-lg focus:bg-sky-900/50 focus:text-sky-100 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Cloud className="h-4 w-4 text-sky-400" />
              <span>Sky Blue</span>
            </div>
          </SelectItem>
          <SelectItem
            value="cosmic-gold"
            className="rounded-lg focus:bg-amber-900/50 focus:text-amber-100 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span>Cosmic Gold</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>

      {/* Appearance Selector */}
      <Select value={mode} onValueChange={handleModeChange}>
        <SelectTrigger className="w-[100px] h-8 gap-2 border-slate-700/50 bg-slate-800/20 backdrop-blur-md hover:bg-slate-700/30 transition-all rounded-full px-3">
          {mode === "day" && <Sun className="h-3.5 w-3.5 text-orange-400" />}
          {mode === "night" && <Moon className="h-3.5 w-3.5 text-indigo-400" />}
          {mode === "automatic" && (
            <MonitorSmartphone className="h-3.5 w-3.5 text-slate-400" />
          )}
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="backdrop-blur-2xl bg-slate-900/90 border-slate-700/50 rounded-2xl shadow-2xl">
          <SelectItem
            value="day"
            className="rounded-lg focus:bg-slate-800 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Sun className="h-4 w-4 text-orange-400" />
              <span>Day</span>
            </div>
          </SelectItem>
          <SelectItem
            value="night"
            className="rounded-lg focus:bg-slate-800 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Moon className="h-4 w-4 text-indigo-400" />
              <span>Night</span>
            </div>
          </SelectItem>
          <SelectItem
            value="automatic"
            className="rounded-lg focus:bg-slate-800 transition-colors"
          >
            <div className="flex items-center gap-2">
              <MonitorSmartphone className="h-4 w-4 text-slate-400" />
              <span>Auto</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
