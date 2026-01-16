import { Dock, DockIcon } from "../ui/dock";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { Inbox, Calendar, CheckSquare, Settings, Sparkles, FileText } from "lucide-react";

export type DockPage = "plan" | "notes" | "inbox" | "agenda" | "task" | "config";

interface PremiumDockProps {
  activePage: DockPage;
  onPageChange: (page: DockPage) => void;
}

const pages = [
  { id: "plan" as DockPage, icon: Sparkles, label: "AI Plan" },
  { id: "notes" as DockPage, icon: FileText, label: "Note AI" },
  { id: "inbox" as DockPage, icon: Inbox, label: "Inbox" },
  { id: "agenda" as DockPage, icon: Calendar, label: "Agenda" },
  { id: "task" as DockPage, icon: CheckSquare, label: "Tasks" },
  { id: "config" as DockPage, icon: Settings, label: "Config" },
];

export function PremiumDock({ activePage, onPageChange }: PremiumDockProps) {
  return (
    <TooltipProvider delayDuration={100}>
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <Dock
          iconSize={48}
          iconMagnification={60}
          iconDistance={120}
          className="h-16 gap-3 px-3 bg-card/10 backdrop-blur-2xl border border-border rounded-2xl shadow-2xl shadow-black/50"
        >
          {pages.map((page) => {
            const Icon = page.icon;
            const isActive = activePage === page.id;

            return (
              <Tooltip key={page.id}>
                <TooltipTrigger asChild>
                  <DockIcon
                    onClick={() => onPageChange(page.id)}
                    className={`
                      relative rounded-xl transition-all duration-200
                      ${isActive
                        ? "bg-primary/10 border border-primary/50"
                        : "bg-secondary border border-border hover:bg-accent hover:border-border/50"
                      }
                    `}
                  >
                    <div className="relative flex flex-col items-center">
                      <Icon
                        className={`w-6 h-6 transition-colors duration-200 ${isActive ? "text-primary" : "text-muted-foreground"
                          }`}
                        strokeWidth={2}
                      />
                      {/* Active indicator dot */}
                      {isActive && (
                        <span className="absolute -bottom-2 w-1 h-1 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.8)]" />
                      )}
                    </div>
                  </DockIcon>
                </TooltipTrigger>
                <TooltipContent side="top" sideOffset={15}>
                  {page.label}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </Dock>
      </div>
    </TooltipProvider>
  );
}
