import { useState, useEffect, useCallback } from "react";
import { useDailyData } from "../../hooks/useDailyData";
import { useSyncStatus } from "../../hooks/useSyncStatus";
import { useDailyPlan } from "../../hooks/useDailyPlan";
import {
  useKeyboardShortcuts,
  FOCUS_QUICK_TASK_EVENT,
  REGENERATE_PLAN_EVENT,
  TRIGGER_SYNC_EVENT,
} from "../../hooks/useKeyboardShortcuts";
import { Topbar } from "./Topbar";
import { PremiumDock, type DockPage } from "./PremiumDock";
import { InboxPage } from "../pages/InboxPage";
import { AgendaPage } from "../pages/AgendaPage";
import { TaskPage } from "../pages/TaskPage";
import { ConfigPage } from "../pages/ConfigPage";
import { SmartDailyPlan } from "../plan/SmartDailyPlan";

const PAGE_TITLES: Record<DockPage, string> = {
  plan: "AI Daily Plan",
  inbox: "Priority Inbox",
  agenda: "Today's Agenda",
  task: "Tasks",
  config: "Configuration",
};

export function MainLayout() {
  const [activePage, setActivePage] = useState<DockPage>("plan");
  const { events, threads, tasks, isLoading, refresh } = useDailyData();
  const { triggerSync } = useSyncStatus();
  const { isGenerating, regenerate } = useDailyPlan();

  // Keyboard shortcut handlers
  const handleRegeneratePlan = useCallback(() => {
    // Dispatch event for SmartDailyPlan to handle
    window.dispatchEvent(new CustomEvent(REGENERATE_PLAN_EVENT));
  }, []);

  const handleFocusQuickTask = useCallback(() => {
    // Dispatch event for QuickTaskInput to handle
    window.dispatchEvent(new CustomEvent(FOCUS_QUICK_TASK_EVENT));
  }, []);

  const handleTriggerSync = useCallback(() => {
    // Dispatch event and trigger sync
    window.dispatchEvent(new CustomEvent(TRIGGER_SYNC_EVENT));
    triggerSync("all");
  }, [triggerSync]);

  // Register keyboard shortcuts
  useKeyboardShortcuts({
    onRegeneratePlan: handleRegeneratePlan,
    onFocusQuickTask: handleFocusQuickTask,
    onTriggerSync: handleTriggerSync,
    enabled: true,
  });

  // Listen for navigation events from Command Palette
  useEffect(() => {
    const handleNavigate = (e: CustomEvent<DockPage>) => {
      setActivePage(e.detail);
    };
    window.addEventListener(
      "navigate-to-page" as string,
      handleNavigate as EventListener
    );
    return () =>
      window.removeEventListener(
        "navigate-to-page" as string,
        handleNavigate as EventListener
      );
  }, []);

  // Page-aware refresh handler
  const handleRefresh = useCallback(() => {
    if (activePage === "plan") {
      regenerate();
    } else {
      refresh();
    }
  }, [activePage, regenerate, refresh]);

  const isRefreshing = activePage === "plan" ? isGenerating : isLoading;

  return (
    <div className="min-h-screen">
      {/* Native-style Topbar */}
      <Topbar
        title={PAGE_TITLES[activePage]}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      {/* Main Content */}
      <main className="pt-14 pb-28 px-6">
        <div className="max-w-2xl mx-auto">
          {/* Greeting Section */}
          <div className="mb-8 pt-4">
            <h1 className="text-3xl font-bold text-foreground">
              {new Date().getHours() < 12
                ? "Good morning"
                : new Date().getHours() < 18
                ? "Good afternoon"
                : "Good evening"}
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Page Content */}
          {activePage === "plan" && <SmartDailyPlan />}
          {activePage === "inbox" && (
            <InboxPage threads={threads} isLoading={isLoading} onRefresh={refresh} />
          )}
          {activePage === "agenda" && (
            <AgendaPage events={events} isLoading={isLoading} />
          )}
          {activePage === "task" && (
            <TaskPage tasks={tasks} isLoading={isLoading} />
          )}
          {activePage === "config" && <ConfigPage />}
        </div>
      </main>

      {/* Premium Dock Navigation */}
      <PremiumDock activePage={activePage} onPageChange={setActivePage} />
    </div>
  );
}
