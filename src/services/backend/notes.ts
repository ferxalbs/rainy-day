/**
 * Notes Service
 *
 * Handles interactions with the backend notes endpoints for Note AI.
 *
 * @since v0.5.20
 */

import { get, post } from "./api";

// ============================================================================
// Types
// ============================================================================

export interface NoteSection {
    id: string;
    type: "email_summary" | "task_recap" | "meeting_notes" | "custom";
    title: string;
    content: string;
}

export interface DailyNote {
    id: string;
    date: string;
    sections: NoteSection[];
    sourceData: {
        emailsProcessed: number;
        tasksProcessed: number;
        eventsProcessed: number;
    };
    generatedAt: number;
}

export interface UsageStats {
    tier: "free" | "plus" | "pro";
    daily: {
        generations: {
            allowed: boolean;
            remaining: number;
            limit: number;
            used: number;
        };
        expansions: {
            allowed: boolean;
            remaining: number;
            limit: number;
            used: number;
        };
    };
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Get today's note (auto-generates if none exists)
 * @param language - Language for AI response ('en' or 'es')
 */
export async function getTodaysNote(
    language: 'en' | 'es' = 'en'
): Promise<DailyNote | null> {
    const response = await get<{ note: DailyNote }>(
        `/notes/today?language=${language}`
    );

    if (!response.ok || !response.data) {
        if (response.status === 429) {
            throw new Error("Usage limit reached");
        }
        if (response.status === 503) {
            throw new Error("AI not configured");
        }
        console.error("[Notes] Failed to get today's note:", response.error);
        return null;
    }

    return response.data.note;
}

/**
 * Force regenerate today's note
 * @param language - Language for AI response ('en' or 'es')
 */
export async function regenerateNote(
    language: 'en' | 'es' = 'en'
): Promise<DailyNote | null> {
    const response = await post<{ note: DailyNote; message: string }>(
        "/notes/generate",
        { language }
    );

    if (!response.ok || !response.data) {
        if (response.status === 429) {
            throw new Error("Usage limit reached. Upgrade your plan for more generations.");
        }
        if (response.status === 503) {
            throw new Error("AI not configured");
        }
        console.error("[Notes] Failed to regenerate note:", response.error);
        return null;
    }

    return response.data.note;
}

/**
 * Expand a paragraph with AI
 */
export async function expandParagraph(params: {
    noteId: string;
    sectionId: string;
    paragraphIndex: number;
    prompt: string;
    content: string;
}): Promise<string | null> {
    const response = await post<{ expanded: string }>("/notes/expand", {
        note_id: params.noteId,
        section_id: params.sectionId,
        paragraph_index: params.paragraphIndex,
        prompt: params.prompt,
        content: params.content,
    });

    if (!response.ok || !response.data) {
        if (response.status === 429) {
            throw new Error("Expansion limit reached for today.");
        }
        console.error("[Notes] Failed to expand paragraph:", response.error);
        return null;
    }

    return response.data.expanded;
}

/**
 * Get usage stats for the current user
 */
export async function getUsageStats(): Promise<UsageStats | null> {
    const response = await get<UsageStats>("/notes/usage");

    if (!response.ok || !response.data) {
        console.warn("[Notes] Failed to get usage stats:", response.error);
        return null;
    }

    return response.data;
}

/**
 * Get a specific note by ID
 */
export async function getNote(noteId: string): Promise<DailyNote | null> {
    const response = await get<{ note: DailyNote }>(`/notes/${noteId}`);

    if (!response.ok || !response.data) {
        console.error("[Notes] Failed to get note:", response.error);
        return null;
    }

    return response.data.note;
}
