import { Dock, DockIcon } from "../ui/dock";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { Inbox, Calendar, CheckSquare } from "lucide-react";

export type DockPage = "inbox" | "agenda" | "task";

interface PremiumDockProps {
  activePage: DockPage;
  onPageChange: (page: DockPage) => void;
}

const pages = [
  { id: "inbox" as DockPage, icon: Inbox, label: "Inbox" },
  { id: "agenda" as DockPage, icon: Calendar, label: "Agenda" },
  { id: "task" as DockPage, icon: CheckSquare, label: "Tasks" },
];

export function PremiumDock({ activePage, onPageChange }: PremiumDockProps) {
  return (
    <TooltipProvider delayDuration={100}>
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <Dock
          iconSize={48}
          iconMagnification={60}
          iconDistance={120}
          className="h-16 gap-3 px-3 bg-slate-900/10 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl shadow-black/50"
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
                      ${
                        isActive
                          ? "bg-blue-500/10 border border-blue-500/50"
                          : "bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20"
                      }
                    `}
                  >
                    <div className="relative flex flex-col items-center">
                      <Icon
                        className={`w-6 h-6 transition-colors duration-200 ${
                          isActive ? "text-blue-400" : "text-slate-400"
                        }`}
                        strokeWidth={2}
                      />
                      {/* Active indicator dot */}
                      {isActive && (
                        <span className="absolute -bottom-2 w-1 h-1 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
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
