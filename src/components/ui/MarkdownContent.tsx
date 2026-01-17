/**
 * MarkdownContent Component
 *
 * Reusable markdown renderer with modern styling.
 * Supports: **bold**, *italic*, `inline code`, bullet points, numbered lists.
 * Optimized with React.memo for performance.
 *
 * @since v0.5.20
 */

import React from "react";

// ============================================================================
// Types
// ============================================================================

export interface MarkdownContentProps {
    /** Markdown content string to render */
    content: string;
    /** Additional CSS classes */
    className?: string;
    /** Compact mode reduces spacing */
    compact?: boolean;
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Parse inline markdown formatting (bold, italic, inline code)
 */
function parseInlineMarkdown(text: string, lineIndex: number): React.ReactNode[] {
    const parts: React.ReactNode[] = [];
    let keyIndex = 0;

    // Combined regex for **bold**, *italic*, and `code`
    const regex = /(\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`)/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
        // Add text before the match
        if (match.index > lastIndex) {
            parts.push(
                <span key={`text-${lineIndex}-${keyIndex++}`}>
                    {text.slice(lastIndex, match.index)}
                </span>
            );
        }

        if (match[2]) {
            // Bold: **text**
            parts.push(
                <strong key={`bold-${lineIndex}-${keyIndex++}`} className="text-foreground font-semibold">
                    {match[2]}
                </strong>
            );
        } else if (match[3]) {
            // Italic: *text*
            parts.push(
                <em key={`italic-${lineIndex}-${keyIndex++}`} className="text-foreground/90 italic">
                    {match[3]}
                </em>
            );
        } else if (match[4]) {
            // Inline code: `code`
            parts.push(
                <code key={`code-${lineIndex}-${keyIndex++}`} className="px-1.5 py-0.5 rounded bg-muted/50 text-xs font-mono text-foreground">
                    {match[4]}
                </code>
            );
        }

        lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
        parts.push(
            <span key={`text-${lineIndex}-${keyIndex++}`}>
                {text.slice(lastIndex)}
            </span>
        );
    }

    return parts.length > 0 ? parts : [text];
}

// ============================================================================
// Component
// ============================================================================

/**
 * Modern markdown renderer with bullet points, headers, and inline formatting.
 * Memoized for optimal performance.
 *
 * @example
 * <MarkdownContent content="**Bold** and *italic* with `code`" />
 * <MarkdownContent content="- Bullet 1\n- Bullet 2" compact />
 */
export const MarkdownContent = React.memo(function MarkdownContent({
    content,
    className = "",
    compact = false,
}: MarkdownContentProps) {
    const lines = content.split('\n').filter(line => line.trim() !== '');
    const spacing = compact ? "space-y-1" : "space-y-2";

    return (
        <div className={`${spacing} ${className}`}>
            {lines.map((line, lineIndex) => {
                const trimmedLine = line.trim();

                // Bullet point (-, •, *)
                if (/^[-•*]\s/.test(trimmedLine)) {
                    const bulletContent = trimmedLine.slice(2);
                    return (
                        <div key={lineIndex} className="flex items-start gap-2 group">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary/60 mt-2 flex-shrink-0 group-hover:bg-primary transition-colors" />
                            <span className="flex-1 leading-relaxed">
                                {parseInlineMarkdown(bulletContent, lineIndex)}
                            </span>
                        </div>
                    );
                }

                // Numbered list (1., 2., etc.)
                const numberedMatch = trimmedLine.match(/^(\d+)\.\s(.+)/);
                if (numberedMatch) {
                    return (
                        <div key={lineIndex} className="flex items-start gap-2.5">
                            <span className="text-xs font-medium text-primary/70 mt-0.5 w-4 text-right flex-shrink-0">
                                {numberedMatch[1]}.
                            </span>
                            <span className="flex-1 leading-relaxed">
                                {parseInlineMarkdown(numberedMatch[2], lineIndex)}
                            </span>
                        </div>
                    );
                }

                // Regular paragraph
                return (
                    <p key={lineIndex} className="leading-relaxed">
                        {parseInlineMarkdown(trimmedLine, lineIndex)}
                    </p>
                );
            })}
        </div>
    );
});

export default MarkdownContent;
