import { Dock, DockIcon } from "../ui/dock";
import { Inbox, Calendar, CheckSquare } from "lucide-react";

export type DockPage = "inbox" | "agenda" | "task";

interface PremiumDockProps {
  activePage: DockPage;
  onPageChange: (page: DockPage) => void;
}

export function PremiumDock({ activePage, onPageChange }: PremiumDockProps) {
  const pages = [
    { id: "inbox" as DockPage, icon: Inbox, label: "Inbox" },
    { id: "agenda" as DockPage, icon: Calendar, label: "Agenda" },
    { id: "task" as DockPage, icon: CheckSquare, label: "Tasks" },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <Dock
        iconSize={48}
        iconMagnification={64}
        iconDistance={150}
        className="bg-background/10 backdrop-blur-md border-blue-500/20 shadow-2xl shadow-blue-500/10 px-4"
      >
        {pages.map((page) => {
          const Icon = page.icon;
          const isActive = activePage === page.id;

          return (
            <DockIcon
              key={page.id}
              onClick={() => onPageChange(page.id)}
              className={`
                relative transition-all duration-300
                ${
                  isActive
                    ? "bg-blue-500/20 border-2 border-blue-500/50"
                    : "bg-background/5 border border-white/5 hover:bg-blue-500/10 hover:border-blue-500/30"
                }
              `}
            >
              <div className="relative">
                <Icon
                  className={`
                    w-6 h-6 transition-colors duration-300
                    ${isActive ? "text-blue-400" : "text-muted-foreground"}
                  `}
                  strokeWidth={2}
                />
                {isActive && (
                  <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full -z-10 animate-pulse" />
                )}
              </div>
            </DockIcon>
          );
        })}
      </Dock>
    </div>
  );
}
