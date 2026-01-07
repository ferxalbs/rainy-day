import { useState } from "react";
import { useDailyData } from "../../hooks/useDailyData";
import { Topbar } from "./Topbar";
import { PremiumDock, type DockPage } from "./PremiumDock";
import { InboxPage } from "../pages/InboxPage";
import { AgendaPage } from "../pages/AgendaPage";
import { TaskPage } from "../pages/TaskPage";

const PAGE_TITLES: Record<DockPage, string> = {
  inbox: "Priority Inbox",
  agenda: "Today's Agenda",
  task: "Tasks",
};

export function MainLayout() {
  const [activePage, setActivePage] = useState<DockPage>("inbox");
  const { events, threads, tasks, isLoading, refresh } = useDailyData();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const formatDate = () => {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Native-style Topbar */}
      <Topbar
        title={PAGE_TITLES[activePage]}
        onRefresh={refresh}
        isRefreshing={isLoading}
      />

      {/* Main Content */}
      <main className="pt-14 pb-28 px-6">
        <div className="max-w-2xl mx-auto">
          {/* Greeting Section */}
          <div className="mb-8 pt-4">
            <h1 className="text-3xl font-bold text-foreground">
              {getGreeting()}
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
                {formatDate()}
              </p>
            </div>
          </div>

          {/* Page Content */}
          {activePage === "inbox" && (
            <InboxPage threads={threads} isLoading={isLoading} />
          )}
          {activePage === "agenda" && (
            <AgendaPage events={events} isLoading={isLoading} />
          )}
          {activePage === "task" && (
            <TaskPage tasks={tasks} isLoading={isLoading} />
          )}
        </div>
      </main>

      {/* Premium Dock Navigation */}
      <PremiumDock activePage={activePage} onPageChange={setActivePage} />
    </div>
  );
}
