import { useState, useCallback } from "react";
import type { ProcessedEvent } from "../../types";
import { Skeleton } from "../ui/skeleton";
import { EventFormModal } from "../agenda/EventFormModal";
import { createEvent, deleteEvent } from "../../services/backend/data";
import {
  Trash2,
  Plus,
  Clock,
  MapPin,
  Video,
  Calendar,
  ChevronRight,
  Users,
  ExternalLink,
  Loader2,
} from "lucide-react";

interface AgendaPageProps {
  events: ProcessedEvent[];
  isLoading: boolean;
  onRefresh?: () => void;
}

interface NotificationState {
  type: "success" | "error" | "info";
  message: string;
  id: number;
}

export function AgendaPage({ events, isLoading, onRefresh }: AgendaPageProps) {
  const [notifications, setNotifications] = useState<NotificationState[]>([]);
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const showNotification = useCallback(
    (type: "success" | "error" | "info", message: string) => {
      const id = Date.now();
      setNotifications((prev) => [...prev, { type, message, id }]);
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }, 3000);
    },
    []
  );

  const formatTime = (dateTimeString: string) => {
    try {
      const date = new Date(dateTimeString);
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return dateTimeString;
    }
  };

  const formatDuration = (start: string, end: string) => {
    try {
      const startDate = new Date(start);
      const endDate = new Date(end);
      const diffMs = endDate.getTime() - startDate.getTime();
      const diffMins = Math.round(diffMs / 60000);

      if (diffMins < 60) return `${diffMins}min`;
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
    } catch {
      return "";
    }
  };

  const isEventNow = (start: string, end: string) => {
    const now = new Date();
    const startDate = new Date(start);
    const endDate = new Date(end);
    return now >= startDate && now <= endDate;
  };

  const isEventSoon = (start: string) => {
    const now = new Date();
    const startDate = new Date(start);
    const diffMs = startDate.getTime() - now.getTime();
    const diffMins = diffMs / 60000;
    return diffMins > 0 && diffMins <= 15;
  };

  const handleJoinMeeting = (link: string, title: string) => {
    window.open(link, "_blank");
    showNotification("info", `Joining "${title}"...`);
  };

  const handleCreateEvent = () => {
    setIsEventModalOpen(true);
  };

  const handleEventSubmit = async (eventData: {
    title: string;
    description?: string;
    location?: string;
    start_time: string;
    end_time: string;
    is_all_day?: boolean;
  }) => {
    const result = await createEvent(eventData);
    if (result.success) {
      showNotification("success", `Event "${eventData.title}" created!`);
      onRefresh?.();
    } else {
      throw new Error(result.error || "Failed to create event");
    }
  };

  const handleDeleteEvent = async (eventId: string, eventTitle: string) => {
    setIsDeleting(eventId);
    try {
      const result = await deleteEvent(eventId);
      if (result.success) {
        showNotification("success", `Event "${eventTitle}" deleted`);
        setExpandedEvent(null);
        onRefresh?.();
      } else {
        showNotification("error", result.error || "Failed to delete event");
      }
    } catch {
      showNotification("error", "Failed to delete event");
    } finally {
      setIsDeleting(null);
    }
  };

  // Sort events by start time
  const sortedEvents = [...events].sort(
    (a, b) =>
      new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  );

  // Find current/next event
  const now = new Date();
  const currentEvent = sortedEvents.find((e) =>
    isEventNow(e.start_time, e.end_time)
  );
  const nextEvent = sortedEvents.find((e) => new Date(e.start_time) > now);

  if (isLoading) {
    return (
      <div className="rounded-2xl border-2 border-border/50 bg-card/10 backdrop-blur-xl overflow-hidden">
        <div className="p-5 border-b border-border">
          <Skeleton className="h-6 w-32 bg-muted" />
        </div>
        <div className="divide-y divide-border">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-5 flex items-start gap-4">
              <Skeleton className="h-12 w-16 rounded bg-muted" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-4 w-3/4 bg-muted" />
                <Skeleton className="h-3 w-28 bg-muted/60" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`px-4 py-3 rounded-lg shadow-lg backdrop-blur-md border transition-all animate-in slide-in-from-right-5 ${
                notification.type === "success"
                  ? "bg-green-500/90 text-white border-green-400/50"
                  : notification.type === "info"
                  ? "bg-blue-500/90 text-white border-blue-400/50"
                  : "bg-destructive/90 text-destructive-foreground border-destructive/50"
              }`}
            >
              <span className="text-sm font-medium">
                {notification.message}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Current/Next Event Banner */}
      {(currentEvent || nextEvent) && (
        <div
          className={`rounded-2xl border-2 overflow-hidden ${
            currentEvent
              ? "border-green-500/50 bg-green-500/10"
              : "border-primary/50 bg-primary/10"
          }`}
        >
          <div className="px-5 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-2 h-2 rounded-full ${
                    currentEvent ? "bg-green-500 animate-pulse" : "bg-primary"
                  }`}
                />
                <span className="text-sm font-medium text-muted-foreground">
                  {currentEvent ? "Happening now" : "Up next"}
                </span>
              </div>
              {(currentEvent || nextEvent)?.meeting_link && (
                <button
                  onClick={() =>
                    handleJoinMeeting(
                      (currentEvent || nextEvent)!.meeting_link!,
                      (currentEvent || nextEvent)!.title
                    )
                  }
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  <Video className="w-4 h-4" />
                  Join now
                </button>
              )}
            </div>
            <h3 className="text-lg font-semibold text-foreground mt-2">
              {(currentEvent || nextEvent)?.title}
            </h3>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {formatTime((currentEvent || nextEvent)!.start_time)}
                {" - "}
                {formatTime((currentEvent || nextEvent)!.end_time)}
              </span>
              {(currentEvent || nextEvent)?.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  {(currentEvent || nextEvent)?.location}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Agenda Card */}
      <div className="rounded-2xl border-2 border-border/50 bg-card/30 backdrop-blur-xl overflow-hidden shadow-xl shadow-primary/5">
        {/* Header */}
        <div className="px-5 py-4 border-b border-border bg-card/50 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-3">
            <span className="text-xl">📅</span>
            Today's Agenda
            {sortedEvents.length > 0 && (
              <span className="text-xs font-semibold text-muted-foreground bg-muted/20 border border-border/30 px-2.5 py-1 rounded-full">
                {sortedEvents.length} events
              </span>
            )}
          </h2>
          <button
            onClick={handleCreateEvent}
            className="p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
            title="Create event"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {sortedEvents.length === 0 ? (
          <div className="py-16 text-center">
            <Calendar className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" />
            <p className="text-muted-foreground text-base mb-4">
              No events scheduled for today
            </p>
            <button
              onClick={handleCreateEvent}
              className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
            >
              + Schedule an event
            </button>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {sortedEvents.map((event) => {
              const isNow = isEventNow(event.start_time, event.end_time);
              const isSoon = isEventSoon(event.start_time);
              const isPast = new Date(event.end_time) < now;
              const isExpanded = expandedEvent === event.id;
              const duration = formatDuration(event.start_time, event.end_time);

              return (
                <div
                  key={event.id}
                  className={`transition-colors ${isPast ? "opacity-50" : ""} ${
                    isNow
                      ? "bg-green-500/5"
                      : isSoon
                      ? "bg-primary/5"
                      : "hover:bg-accent"
                  }`}
                >
                  <div
                    className="px-5 py-4 cursor-pointer"
                    onClick={() =>
                      setExpandedEvent(isExpanded ? null : event.id)
                    }
                  >
                    <div className="flex gap-4">
                      {/* Time Column */}
                      <div className="flex-shrink-0 w-20">
                        <div
                          className={`text-sm font-semibold ${
                            isNow
                              ? "text-green-500"
                              : isSoon
                              ? "text-primary"
                              : "text-primary"
                          }`}
                        >
                          {formatTime(event.start_time)}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {duration}
                        </div>
                      </div>

                      {/* Event Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p
                              className={`font-medium ${
                                isPast
                                  ? "text-muted-foreground"
                                  : "text-foreground"
                              }`}
                            >
                              {event.title}
                            </p>

                            {/* Quick Info */}
                            <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                              {event.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  <span className="truncate max-w-[150px]">
                                    {event.location}
                                  </span>
                                </span>
                              )}
                              {event.meeting_link && (
                                <span className="flex items-center gap-1 text-primary">
                                  <Video className="w-3 h-3" />
                                  Video call
                                </span>
                              )}
                              {event.attendees_count > 0 && (
                                <span className="flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  {event.attendees_count}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Status Badge */}
                          <div className="flex items-center gap-2">
                            {isNow && (
                              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-500">
                                Now
                              </span>
                            )}
                            {isSoon && !isNow && (
                              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary/20 text-primary">
                                Soon
                              </span>
                            )}
                            <ChevronRight
                              className={`w-4 h-4 text-muted-foreground transition-transform ${
                                isExpanded ? "rotate-90" : ""
                              }`}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="px-5 pb-4 pt-0">
                      <div className="ml-24 pl-4 border-l-2 border-border">
                        <div className="flex flex-wrap gap-2">
                          {event.meeting_link && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleJoinMeeting(
                                  event.meeting_link!,
                                  event.title
                                );
                              }}
                              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                            >
                              <Video className="w-4 h-4" />
                              Join meeting
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteEvent(event.id, event.title);
                            }}
                            disabled={isDeleting === event.id}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive text-sm font-medium hover:bg-destructive/20 transition-colors disabled:opacity-50"
                          >
                            {isDeleting === event.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                            Delete
                          </button>
                        </div>

                        {event.location && (
                          <a
                            href={`https://maps.google.com/maps?q=${encodeURIComponent(
                              event.location
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-2 mt-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <MapPin className="w-4 h-4" />
                            {event.location}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Event Form Modal */}
      <EventFormModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        onSubmit={handleEventSubmit}
        mode="create"
      />
    </div>
  );
}
