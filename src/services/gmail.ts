/**
 * Gmail service for fetching email threads
 */
import { invoke } from '@tauri-apps/api/core';
import { openUrl } from '@tauri-apps/plugin-opener';
import type { ThreadSummary, GmailThreadDetail } from '../types';

/**
 * Get inbox summary with top email threads
 */
export async function getInboxSummary(
  maxItems: number = 20,
  query: string = 'in:inbox is:unread'
): Promise<ThreadSummary[]> {
  try {
    return await invoke<ThreadSummary[]>('get_inbox_summary', {
      maxItems,
      query,
    });
  } catch (error) {
    console.error('Failed to get inbox summary:', error);
    throw error;
  }
}

/**
 * Get detailed information about a specific thread
 */
export async function getThreadDetail(threadId: string): Promise<GmailThreadDetail> {
  try {
    return await invoke<GmailThreadDetail>('get_thread_detail', {
      threadId,
    });
  } catch (error) {
    console.error('Failed to get thread detail:', error);
    throw error;
  }
}

/**
 * Open a thread in Gmail web interface
 */
export async function openThreadInGmail(threadId: string): Promise<void> {
  const url = await invoke<string>('open_thread_in_gmail', { threadId });
  await openUrl(url);
}
