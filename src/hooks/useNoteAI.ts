/**
 * useNoteAI Hook
 *
 * React hook for Note AI page state management.
 * Handles note generation, expansion, and usage tracking.
 * Respects app language settings for localized AI responses.
 *
 * @since v0.5.20
 */

import { useState, useCallback, useEffect } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import {
    getTodaysNote,
    regenerateNote,
    expandParagraph as expandParagraphApi,
    getUsageStats,
    type DailyNote,
    type UsageStats,
    type NoteSection,
} from "../services/backend/notes";

// Re-export types for convenience
export type { DailyNote, UsageStats, NoteSection };

// ============================================================================
// Types
// ============================================================================

export interface UseNoteAIResult {
    // Note data
    note: DailyNote | null;
    isLoading: boolean;
    error: string | null;

    // Generation
    isGenerating: boolean;
    generate: () => Promise<void>;

    // Expansion
    isExpanding: boolean;
    expand: (params: {
        noteId: string;
        sectionId: string;
        paragraphIndex: number;
        prompt: string;
        content: string;
    }) => Promise<string | null>;

    // Usage
    usage: UsageStats | null;
    refreshUsage: () => Promise<void>;
}

// ============================================================================
// Hook
// ============================================================================

export function useNoteAI(): UseNoteAIResult {
    const { language } = useLanguage();

    // State
    const [note, setNote] = useState<DailyNote | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isExpanding, setIsExpanding] = useState(false);
    const [usage, setUsage] = useState<UsageStats | null>(null);

    // Fetch today's note on mount
    const fetchTodaysNote = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const todaysNote = await getTodaysNote(language);
            if (todaysNote) {
                setNote(todaysNote);
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to load note";
            // Don't show error if it's just a 429 (usage limit)
            if (!message.includes("429") && !message.includes("limit")) {
                setError(message);
            }
        } finally {
            setIsLoading(false);
        }
    }, [language]);

    // Generate new note
    const generate = useCallback(async () => {
        setIsGenerating(true);
        setError(null);

        try {
            const newNote = await regenerateNote(language);
            if (newNote) {
                setNote(newNote);
            }
            // Refresh usage after generation
            const stats = await getUsageStats();
            if (stats) setUsage(stats);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to generate note";
            if (message.includes("limit") || message.includes("Usage")) {
                setError("Daily limit reached. Upgrade your plan for more generations.");
            } else {
                setError(message);
            }
        } finally {
            setIsGenerating(false);
        }
    }, [language]);

    // Expand a paragraph
    const expand = useCallback(
        async (params: {
            noteId: string;
            sectionId: string;
            paragraphIndex: number;
            prompt: string;
            content: string;
        }): Promise<string | null> => {
            setIsExpanding(true);

            try {
                const expanded = await expandParagraphApi(params);
                // Refresh usage after expansion
                const stats = await getUsageStats();
                if (stats) setUsage(stats);
                return expanded;
            } catch (err) {
                const message = err instanceof Error ? err.message : "Failed to expand";
                if (message.includes("limit")) {
                    setError("Expansion limit reached for today.");
                }
                return null;
            } finally {
                setIsExpanding(false);
            }
        },
        []
    );

    // Refresh usage stats
    const refreshUsage = useCallback(async () => {
        try {
            const stats = await getUsageStats();
            if (stats) setUsage(stats);
        } catch (err) {
            console.warn("[NoteAI] Failed to fetch usage:", err);
        }
    }, []);

    // Initial fetch
    useEffect(() => {
        fetchTodaysNote();
        refreshUsage();
    }, [fetchTodaysNote, refreshUsage]);

    return {
        note,
        isLoading,
        error,
        isGenerating,
        generate,
        isExpanding,
        expand,
        usage,
        refreshUsage,
    };
}
