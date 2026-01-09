/**
 * Timezone Utilities
 * 
 * Provides consistent timezone handling across the application.
 * All database storage uses UTC epoch milliseconds.
 * All display uses the user's local timezone.
 * All Google Calendar API calls include the user's IANA timezone.
 */

/**
 * Get the user's IANA timezone string
 * @returns Timezone like "America/New_York" or "Europe/London"
 */
export function getUserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * Get the current timezone offset as a string like "-05:00" or "+02:00"
 */
export function getTimezoneOffset(): string {
  const offset = new Date().getTimezoneOffset();
  const absOffset = Math.abs(offset);
  const hours = Math.floor(absOffset / 60);
  const minutes = absOffset % 60;
  const sign = offset <= 0 ? '+' : '-';
  return `${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

/**
 * Convert local date and time to ISO string for API calls
 * @param date Date string in YYYY-MM-DD format
 * @param time Time string in HH:mm format
 * @returns ISO string in local timezone (e.g., "2026-01-09T14:00:00-05:00")
 */
export function localToISO(date: string, time: string): string {
  const [year, month, day] = date.split('-').map(Number);
  const [hours, minutes] = time.split(':').map(Number);
  
  // Format with timezone offset
  const offset = getTimezoneOffset();
  const pad = (n: number) => n.toString().padStart(2, '0');
  
  return `${year}-${pad(month)}-${pad(day)}T${pad(hours)}:${pad(minutes)}:00${offset}`;
}

/**
 * Convert all-day event date to ISO format
 * @param date Date string in YYYY-MM-DD format
 * @returns Object with date-only format for Google Calendar API
 */
export function dateToAllDay(date: string): { date: string } {
  return { date };
}

/**
 * Parse an ISO string or timestamp to a local Date object
 * @param input ISO string or epoch milliseconds
 * @returns Local Date object
 */
export function parseToLocalDate(input: string | number): Date {
  if (typeof input === 'number') {
    return new Date(input);
  }
  return new Date(input);
}

/**
 * Format a date/time for display in the user's local timezone
 * @param input ISO string or epoch milliseconds
 * @param options Intl.DateTimeFormatOptions
 */
export function formatLocalDateTime(
  input: string | number,
  options: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }
): string {
  const date = parseToLocalDate(input);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('en-US', options);
}

/**
 * Format a date for display
 * @param input ISO string or epoch milliseconds
 */
export function formatLocalDate(
  input: string | number,
  options: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }
): string {
  const date = parseToLocalDate(input);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', options);
}

/**
 * Get today's date in YYYY-MM-DD format (local timezone)
 */
export function getTodayLocalDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get start and end of today in UTC for database queries
 * @returns Object with start and end epoch timestamps
 */
export function getTodayRange(): { start: number; end: number } {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  
  return {
    start: startOfDay.getTime(),
    end: endOfDay.getTime(),
  };
}

/**
 * Convert local time to next rounded hour (for default event times)
 * @returns Object with startTime and endTime in HH:mm format
 */
export function getDefaultEventTimes(): { startTime: string; endTime: string } {
  const now = new Date();
  const nextHour = new Date(now.getTime() + 60 * 60 * 1000);
  nextHour.setMinutes(0, 0, 0);
  
  const endHour = new Date(nextHour.getTime() + 60 * 60 * 1000);
  
  const formatTime = (d: Date) => 
    `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  
  return {
    startTime: formatTime(nextHour),
    endTime: formatTime(endHour),
  };
}
