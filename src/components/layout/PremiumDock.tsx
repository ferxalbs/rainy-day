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
    <TooltipProvider delayDuration={200}>
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <Dock
          iconSize={48}
          iconMagnification={60}
          iconDistance={120}
          className="h-16 gap-2 px-3 bg-slate-900/90 backdrop-blur-2xl border border-blue-500/30 rounded-2xl shadow-2xl shadow-blue-500/10"
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
                          ? "bg-blue-500/20 border-2 border-blue-500"
                          : "bg-slate-800/50 border border-slate-700 hover:bg-slate-700 hover:border-blue-500/50"
                      }
                    `}
                  >
                    <div className="relative flex flex-col items-center">
                      <Icon
                        className={`w-6 h-6 ${
                          isActive ? "text-blue-400" : "text-slate-300"
                        }`}
                        strokeWidth={2}
                      />
                      {/* Active indicator dot */}
                      {isActive && (
                        <span className="absolute -bottom-2 w-1.5 h-1.5 rounded-full bg-blue-400" />
                      )}
                    </div>
                  </DockIcon>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  sideOffset={12}
                  className="bg-slate-800 border-slate-700 text-white text-sm px-3 py-1.5 rounded-lg"
                >
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
