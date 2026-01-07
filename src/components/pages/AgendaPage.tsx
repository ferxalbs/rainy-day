import type { ProcessedEvent } from "../../types";
import { Skeleton } from "../ui/skeleton";
import { ExternalLink } from "lucide-react";

interface AgendaPageProps {
  events: ProcessedEvent[];
  isLoading: boolean;
}

export function AgendaPage({ events, isLoading }: AgendaPageProps) {
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

  if (isLoading) {
    return (
      <div className="rounded-2xl border-2 border-blue-500/30 bg-slate-900/80 backdrop-blur-xl overflow-hidden">
        <div className="p-5 border-b border-slate-800">
          <Skeleton className="h-6 w-40 bg-slate-800" />
        </div>
        <div className="divide-y divide-slate-800">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-5 flex gap-4">
              <Skeleton className="h-4 w-16 bg-slate-800" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-4 w-3/4 bg-slate-800" />
                <Skeleton className="h-3 w-32 bg-slate-800/60" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border-2 border-blue-500/30 bg-slate-900/80 backdrop-blur-xl overflow-hidden shadow-xl shadow-blue-500/5">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-800 bg-slate-900/50">
        <h2 className="text-lg font-semibold text-white flex items-center gap-3">
          <span className="text-xl">📅</span>
          Today's Agenda
        </h2>
      </div>

      {/* Content */}
      {events.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-slate-400 text-base">
            No events scheduled for today
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-800">
          {events.map((event) => (
            <div
              key={event.id}
              className="px-5 py-4 hover:bg-slate-800/50 transition-colors group"
            >
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-20 text-sm font-semibold text-blue-400 pt-0.5">
                  {formatTime(event.start_time)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white group-hover:text-blue-400 transition-colors">
                    {event.title}
                  </p>
                  {event.location && (
                    <p className="text-sm text-slate-400 mt-1 flex items-center gap-1.5">
                      <span>📍</span>
                      <span className="truncate">{event.location}</span>
                    </p>
                  )}
                  {event.meeting_link && (
                    <a
                      href={event.meeting_link}
                      className="inline-flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 font-medium mt-2 transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Join meeting
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
