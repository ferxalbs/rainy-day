/**
 * useSummary Hook
 *
 * React hook for managing email summary state with loading, error handling, and limits.
 */

import { useState, useCallback } from "react";
import {
    type EmailSummary,
    type SummaryLimits,
    getEmailSummary,
    generateEmailSummary,
    getSummaryLimits,
} from "../services/backend/summary";

interface UseSummaryState {
    summary: EmailSummary | null;
    limits: SummaryLimits | null;
    isLoading: boolean;
    isGenerating: boolean;
    error: string | null;
}

interface UseSummaryReturn extends UseSummaryState {
    loadSummary: (emailId: string) => Promise<void>;
    generate: (emailId: string, forceRegenerate?: boolean) => Promise<boolean>;
    refreshLimits: () => Promise<void>;
    clearError: () => void;
}

export function useSummary(): UseSummaryReturn {
    const [state, setState] = useState<UseSummaryState>({
        summary: null,
        limits: null,
        isLoading: false,
        isGenerating: false,
        error: null,
    });

    const loadSummary = useCallback(async (emailId: string) => {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));
        try {
            const summary = await getEmailSummary(emailId);
            setState((prev) => ({ ...prev, summary, isLoading: false }));
        } catch (error) {
            setState((prev) => ({
                ...prev,
                isLoading: false,
                error: error instanceof Error ? error.message : "Failed to load summary",
            }));
        }
    }, []);

    const generate = useCallback(
        async (emailId: string, forceRegenerate = false): Promise<boolean> => {
            setState((prev) => ({ ...prev, isGenerating: true, error: null }));

            try {
                const result = await generateEmailSummary(emailId, { forceRegenerate });
                if (result) {
                    setState((prev) => ({
                        ...prev,
                        summary: result.summary,
                        limits: result.limits,
                        isGenerating: false,
                    }));
                    return true;
                }
                setState((prev) => ({
                    ...prev,
                    isGenerating: false,
                    error: "Failed to generate summary",
                }));
                return false;
            } catch (error) {
                const message =
                    error instanceof Error ? error.message : "Failed to generate summary";
                setState((prev) => ({
                    ...prev,
                    isGenerating: false,
                    error: message,
                }));
                return false;
            }
        },
        []
    );

    const refreshLimits = useCallback(async () => {
        try {
            const limits = await getSummaryLimits();
            setState((prev) => ({ ...prev, limits }));
        } catch (error) {
            console.error("[useSummary] Failed to refresh limits:", error);
        }
    }, []);

    const clearError = useCallback(() => {
        setState((prev) => ({ ...prev, error: null }));
    }, []);

    return {
        ...state,
        loadSummary,
        generate,
        refreshLimits,
        clearError,
    };
}
