/**
 * @deprecated This file is deprecated. Use services from './backend/data' instead.
 * 
 * This file contained Tauri-based Gmail commands that have been
 * replaced by HTTP-based data fetching through the backend server.
 * 
 * Migration guide:
 * - getInboxSummary() -> getEmails() from './backend/data'
 * - getThreadDetail() -> Not available (use email ID directly)
 * - openThreadInGmail() -> Use direct URL: https://mail.google.com/mail/u/0/#inbox/{threadId}
 */

import { getEmails, type Email } from './backend/data';
import type { ThreadSummary } from '../types';

/**
 * @deprecated Use getEmails() from './backend/data' instead
 */
export async function getInboxSummary(
  maxItems: number = 20,
  _query: string = 'in:inbox is:unread'
): Promise<ThreadSummary[]> {
  console.warn('getInboxSummary is deprecated. Use getEmails from backend/data instead.');
  
  const emails = await getEmails(maxItems);
  
  // Convert Email to ThreadSummary for backward compatibility
  return emails.map((email: Email): ThreadSummary => ({
    id: email.id,
    subject: email.subject,
    snippet: email.snippet,
    from_name: email.sender.split('<')[0]?.trim() || email.sender,
    from_email: email.sender.match(/<(.+)>/)?.[1] || email.sender,
    date: new Date(email.received_at).toISOString(),
    is_unread: !email.is_read,
    message_count: 1,
    priority_score: email.is_important ? 100 : 50,
  }));
}

/**
 * @deprecated Not available in HTTP backend
 */
export async function getThreadDetail(_threadId: string): Promise<never> {
  throw new Error('getThreadDetail is not available. Use email data directly.');
}

/**
 * @deprecated Use direct URL instead
 */
export async function openThreadInGmail(threadId: string): Promise<void> {
  const url = `https://mail.google.com/mail/u/0/#inbox/${threadId}`;
  window.open(url, '_blank');
}
