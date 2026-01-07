import type { ProcessedEvent } from "../../types";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";

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
      <div className="flex items-center justify-center h-full">
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-6 pb-24">
      <Card className="bg-background/10 backdrop-blur-md border-blue-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <span className="text-2xl">📅</span>
            Today's Agenda
          </CardTitle>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No events scheduled for today
            </p>
          ) : (
            <ul className="space-y-3">
              {events.map((event) => (
                <li
                  key={event.id}
                  className="p-4 rounded-lg bg-background/5 border border-white/5 hover:bg-background/10 hover:border-blue-500/30 transition-all duration-200 group"
                >
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 text-xs font-medium text-blue-400 bg-blue-500/10 px-3 py-1 rounded-md h-fit">
                      {formatTime(event.start_time)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <span className="font-medium text-sm text-foreground block">
                        {event.title}
                      </span>
                      {event.location && (
                        <span className="text-xs text-muted-foreground block">
                          📍 {event.location}
                        </span>
                      )}
                      {event.meeting_link && (
                        <a
                          href={event.meeting_link}
                          className="text-xs text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center gap-1 mt-1"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <span>Join meeting</span>
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
