import { RefreshCw } from "lucide-react";

interface TopbarProps {
  title: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function Topbar({ title, onRefresh, isRefreshing }: TopbarProps) {
  return (
    <header
      data-tauri-drag-region
      className="titlebar-drag-region fixed top-0 left-0 right-0 z-50 h-10 flex items-center justify-between bg-card/40 backdrop-blur-xl border-b border-border select-none"
    >
      {/* Left: Traffic light spacing + Page title */}
      <div className="flex items-center h-full pl-20">
        <span className="text-sm font-medium text-muted-foreground">
          {title}
        </span>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-4 pr-4 no-drag">
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-lg hover:bg-accent transition-all duration-200 group disabled:opacity-50"
            aria-label="Refresh"
          >
            <RefreshCw
              className={`w-4 h-4 text-foreground/70 group-hover:text-foreground transition-colors ${
                isRefreshing ? "animate-spin" : ""
              }`}
              strokeWidth={2}
            />
          </button>
        )}
      </div>
    </header>
  );
}
