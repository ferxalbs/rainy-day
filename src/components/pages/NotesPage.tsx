/**
 * NotesPage - Note AI Page Component
 *
 * A focused "deep work" page for AI-powered text summarization.
 * Separate from the AI Plan page, designed for daily note generation.
 *
 * @since v0.5.20
 */

import React, { useState } from "react";
import { useNoteAI, type NoteSection } from "../../hooks/useNoteAI";
import { motion, AnimatePresence } from "motion/react";
import {
    FileText,
    RefreshCw,
    ChevronDown,
    ChevronRight,
    Sparkles,
    Mail,
    CheckSquare,
    Calendar,
    AlertCircle,
    Copy,
    Check,
} from "lucide-react";

// ============================================================================
// Types
// ============================================================================

interface NotesPageProps {
    className?: string;
}

// ============================================================================
// Sub-components
// ============================================================================

function UsageIndicator({
    used,
    limit,
    label,
}: {
    used: number;
    limit: number;
    label: string;
}) {
    const percentage = Math.min((used / limit) * 100, 100);
    const isNearLimit = percentage >= 80;
    const isAtLimit = used >= limit;

    return (
        <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">{label}:</span>
            <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all ${isAtLimit
                        ? "bg-destructive"
                        : isNearLimit
                            ? "bg-yellow-500"
                            : "bg-primary"
                        }`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            <span
                className={`font-medium ${isAtLimit ? "text-destructive" : "text-foreground"}`}
            >
                {used}/{limit}
            </span>
        </div>
    );
}

function SectionIcon({ type }: { type: NoteSection["type"] }) {
    switch (type) {
        case "email_summary":
            return <Mail className="w-4 h-4 text-blue-500" />;
        case "task_recap":
            return <CheckSquare className="w-4 h-4 text-green-500" />;
        case "meeting_notes":
            return <Calendar className="w-4 h-4 text-purple-500" />;
        default:
            return <FileText className="w-4 h-4 text-muted-foreground" />;
    }
}

/**
 * Render simple markdown (bold, italic, bullet points)
 */
function renderMarkdown(content: string): React.ReactNode {
    // Split by lines to handle bullet points
    const lines = content.split('\n');

    return lines.map((line, lineIndex) => {
        // Parse inline formatting (bold)
        const parts: React.ReactNode[] = [];
        let keyIndex = 0;

        // Match **bold** patterns
        const boldRegex = /\*\*([^*]+)\*\*/g;
        let lastIndex = 0;
        let match;

        while ((match = boldRegex.exec(line)) !== null) {
            // Add text before the match
            if (match.index > lastIndex) {
                parts.push(line.slice(lastIndex, match.index));
            }
            // Add the bold text
            parts.push(
                <strong key={`bold-${lineIndex}-${keyIndex++}`} className="text-foreground font-semibold">
                    {match[1]}
                </strong>
            );
            lastIndex = match.index + match[0].length;
        }

        // Add remaining text
        if (lastIndex < line.length) {
            parts.push(line.slice(lastIndex));
        }

        // If no bold found, just use the line
        if (parts.length === 0) {
            parts.push(line);
        }

        return (
            <div key={lineIndex} className={line.startsWith('- ') || line.startsWith('• ') ? '' : ''}>
                {parts}
            </div>
        );
    });
}

function NoteSection({
    section,
    isLast,
}: {
    section: NoteSection;
    isLast: boolean;
}) {
    const [isExpanded, setIsExpanded] = useState(true);
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(section.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`group ${!isLast ? "border-b border-border/50 pb-4 mb-4" : ""}`}
        >
            {/* Section Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center gap-2 text-left hover:bg-muted/30 -mx-2 px-2 py-1 rounded-lg transition-colors"
            >
                {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                ) : (
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                )}
                <SectionIcon type={section.type} />
                <span className="font-medium text-foreground">{section.title}</span>

                {/* Copy button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleCopy();
                    }}
                    className="ml-auto opacity-0 group-hover:opacity-100 p-1 hover:bg-muted rounded transition-all"
                    title="Copy section"
                >
                    {copied ? (
                        <Check className="w-3.5 h-3.5 text-green-500" />
                    ) : (
                        <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                    )}
                </button>
            </button>

            {/* Section Content */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="pl-10 pt-2 text-sm text-muted-foreground leading-relaxed space-y-1">
                            {renderMarkdown(section.content)}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

function EmptyState({ onGenerate }: { onGenerate: () => void }) {
    return (
        <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
                Generate Your Daily Note
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-6">
                AI will summarize your emails, tasks, and events into a concise daily
                briefing.
            </p>
            <button
                onClick={onGenerate}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
                <Sparkles className="w-4 h-4" />
                Generate Note
            </button>
        </div>
    );
}

function LoadingSkeleton() {
    return (
        <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                    <div className="h-6 w-48 bg-muted rounded" />
                    <div className="pl-10 space-y-1.5">
                        <div className="h-4 w-full bg-muted/60 rounded" />
                        <div className="h-4 w-3/4 bg-muted/60 rounded" />
                        <div className="h-4 w-5/6 bg-muted/60 rounded" />
                    </div>
                </div>
            ))}
        </div>
    );
}

// ============================================================================
// Main Component
// ============================================================================

export function NotesPage({ className = "" }: NotesPageProps) {
    const {
        note,
        isLoading,
        error,
        isGenerating,
        generate,
        usage,
    } = useNoteAI();

    const canGenerate = usage?.daily.generations.remaining !== 0;

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Header with Usage Stats */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-foreground">Note AI</h2>
                        <p className="text-xs text-muted-foreground">
                            AI-powered daily summary
                        </p>
                    </div>
                </div>

                {/* Usage indicator */}
                {usage && (
                    <div className="flex items-center gap-4">
                        <UsageIndicator
                            used={usage.daily.generations.used}
                            limit={usage.daily.generations.limit}
                            label="Notes"
                        />
                    </div>
                )}
            </div>

            {/* Error State */}
            {error && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Main Content */}
            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6">
                {isLoading ? (
                    <LoadingSkeleton />
                ) : !note ? (
                    <EmptyState onGenerate={generate} />
                ) : (
                    <>
                        {/* Note Header */}
                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/50">
                            <div className="text-sm text-muted-foreground">
                                <span className="font-medium text-foreground">
                                    {new Date(note.generatedAt).toLocaleDateString("en-US", {
                                        weekday: "long",
                                        month: "short",
                                        day: "numeric",
                                    })}
                                </span>
                                <span className="mx-2">•</span>
                                <span>
                                    {note.sourceData.emailsProcessed} emails,{" "}
                                    {note.sourceData.tasksProcessed} tasks,{" "}
                                    {note.sourceData.eventsProcessed} events
                                </span>
                            </div>

                            {/* Regenerate button */}
                            <button
                                onClick={generate}
                                disabled={isGenerating || !canGenerate}
                                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-all ${canGenerate
                                    ? "bg-muted hover:bg-muted/80 text-foreground"
                                    : "bg-muted/50 text-muted-foreground cursor-not-allowed"
                                    }`}
                                title={canGenerate ? "Regenerate note" : "Daily limit reached"}
                            >
                                <RefreshCw
                                    className={`w-3.5 h-3.5 ${isGenerating ? "animate-spin" : ""}`}
                                />
                                {isGenerating ? "Generating..." : "Regenerate"}
                            </button>
                        </div>

                        {/* Sections */}
                        <div className="space-y-2">
                            {note.sections.map((section, index) => (
                                <NoteSection
                                    key={section.id}
                                    section={section}
                                    isLast={index === note.sections.length - 1}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Generating Overlay */}
            <AnimatePresence>
                {isGenerating && note && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50"
                    >
                        <div className="text-center">
                            <RefreshCw className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
                            <p className="text-sm text-muted-foreground">
                                Generating your daily note...
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
