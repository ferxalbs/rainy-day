import { useState } from "react";
import { useDailyData } from "../../hooks/useDailyData";
import { PremiumDock, type DockPage } from "./PremiumDock";
import { InboxPage } from "../pages/InboxPage";
import { AgendaPage } from "../pages/AgendaPage";
import { TaskPage } from "../pages/TaskPage";

export function MainLayout() {
  const [activePage, setActivePage] = useState<DockPage>("inbox");
  const { events, threads, tasks, isLoading, refresh } = useDailyData();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950/20 to-slate-950">
      {/* Header */}
      <header className="titlebar-drag-region sticky top-0 z-40 backdrop-blur-xl bg-background/30 border-b border-blue-500/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="no-drag">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
              {getGreeting()}
            </h1>
            <p className="text-sm text-muted-foreground">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <button
            onClick={refresh}
            className="no-drag p-2 rounded-lg bg-background/10 border border-blue-500/20 hover:bg-background/20 hover:border-blue-500/40 transition-all duration-200 group"
            aria-label="Refresh"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-blue-400 group-hover:rotate-180 transition-transform duration-500"
            >
              <path d="M21 12a9 9 0 11-2.2-5.9M21 4v4h-4" />
            </svg>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-8 min-h-[calc(100vh-200px)]">
        {activePage === "inbox" && (
          <InboxPage threads={threads} isLoading={isLoading} />
        )}
        {activePage === "agenda" && (
          <AgendaPage events={events} isLoading={isLoading} />
        )}
        {activePage === "task" && (
          <TaskPage tasks={tasks} isLoading={isLoading} />
        )}
      </main>

      {/* Premium Dock Navigation */}
      <PremiumDock activePage={activePage} onPageChange={setActivePage} />
    </div>
  );
}
