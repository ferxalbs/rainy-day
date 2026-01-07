import { Sun, Moon, MonitorSmartphone } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

export function ThemeSwitcher() {
  const { mode, setMode } = useTheme();

  const handleThemeChange = (value: string) => {
    setMode(value as "day" | "night" | "automatic");
  };

  const getIcon = () => {
    switch (mode) {
      case "day":
        return <Sun className="h-4 w-4" />;
      case "night":
        return <Moon className="h-4 w-4" />;
      case "automatic":
        return <MonitorSmartphone className="h-4 w-4" />;
    }
  };

  const getLabel = () => {
    switch (mode) {
      case "day":
        return "Day";
      case "night":
        return "Night";
      case "automatic":
        return "Auto";
    }
  };

  return (
    <Select value={mode} onValueChange={handleThemeChange}>
      <SelectTrigger className="w-[110px] h-8 gap-2 border-blue-500/20 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
        {getIcon()}
        <SelectValue>{getLabel()}</SelectValue>
      </SelectTrigger>
      <SelectContent className="backdrop-blur-xl bg-black/90 dark:bg-white/90 border-2 border-blue-500/20 rounded-xl">
        <SelectItem value="day" className="gap-2">
          <div className="flex items-center gap-2">
            <Sun className="h-4 w-4" />
            <span>Day</span>
          </div>
        </SelectItem>
        <SelectItem value="night" className="gap-2">
          <div className="flex items-center gap-2">
            <Moon className="h-4 w-4" />
            <span>Night</span>
          </div>
        </SelectItem>
        <SelectItem value="automatic" className="gap-2">
          <div className="flex items-center gap-2">
            <MonitorSmartphone className="h-4 w-4" />
            <span>Automatic</span>
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
