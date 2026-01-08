/**
 * @deprecated This file is deprecated. Use services from './backend/data' instead.
 * 
 * This file contained Tauri-based Calendar commands that have been
 * replaced by HTTP-based data fetching through the backend server.
 * 
 * Migration guide:
 * - getTodayEvents() -> getTodayEvents() from './backend/data'
 * - getEventsRange() -> getEvents() from './backend/data'
 */

import { getTodayEvents as backendGetTodayEvents, getEvents, type CalendarEvent } from './backend/data';
import type { ProcessedEvent } from '../types';

/**
 * Convert backend CalendarEvent to ProcessedEvent for backward compatibility
 */
function toProcessedEvent(event: CalendarEvent): ProcessedEvent {
  return {
    id: event.id,
    title: event.title,
    start_time: event.start_time,
    end_time: event.end_time,
    location: event.location,
    meeting_link: event.meeting_link,
    attendees_count: 0,
  };
}

/**
 * @deprecated Use getTodayEvents() from './backend/data' instead
 */
export async function getTodayEvents(): Promise<ProcessedEvent[]> {
  console.warn('getTodayEvents from calendar.ts is deprecated. Use getTodayEvents from backend/data instead.');
  
  const events = await backendGetTodayEvents();
  return events.map(toProcessedEvent);
}

/**
 * @deprecated Use getEvents() from './backend/data' instead
 */
export async function getEventsRange(
  timeMin: string,
  timeMax: string
): Promise<ProcessedEvent[]> {
  console.warn('getEventsRange is deprecated. Use getEvents from backend/data instead.');
  
  const events = await getEvents(50, timeMin, timeMax);
  return events.map(toProcessedEvent);
}
