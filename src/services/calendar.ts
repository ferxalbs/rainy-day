/**
 * Calendar service for fetching events
 */
import { invoke } from '@tauri-apps/api/core';
import type { ProcessedEvent, CalendarEvent } from '../types';

/**
 * Get today's calendar events
 */
export async function getTodayEvents(): Promise<ProcessedEvent[]> {
  try {
    return await invoke<ProcessedEvent[]>('get_today_events');
  } catch (error) {
    console.error('Failed to get today events:', error);
    throw error;
  }
}

/**
 * Get events for a specific date range
 */
export async function getEventsRange(
  timeMin: string,
  timeMax: string
): Promise<CalendarEvent[]> {
  try {
    return await invoke<CalendarEvent[]>('get_events_range', {
      timeMin,
      timeMax,
    });
  } catch (error) {
    console.error('Failed to get events range:', error);
    throw error;
  }
}
