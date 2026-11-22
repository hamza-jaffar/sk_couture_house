import type { ComponentType } from 'react';
import * as LucideIcons from 'lucide-react';
import type { LucideProps } from 'lucide-react';

type Props = LucideProps & {
    /** Icon name (PascalCase, kebab-case, or lowercase) or fallback text/emoji */
    name?: string | null;
    /** Optional fallback content if icon name not found */
    fallback?: React.ReactNode;
};

// Index all Lucide icon components in a case-insensitive map
const iconMap = new Map<string, ComponentType<LucideProps>>();

for (const [key, value] of Object.entries(LucideIcons)) {
    // In React 19 / modern React, forwardRef icons are objects with a render function or functions
    if (value && (typeof value === 'object' || typeof value === 'function')) {
        // Strip dashes, underscores, spaces and lowercase for maximum flexibility
        const normalized = key.replace(/[-_ ]/g, '').toLowerCase();
        iconMap.set(normalized, value as ComponentType<LucideProps>);
    }
}

/**
 * Determine if a string is an emoji or very short symbol (1-2 code points)
 */
function isEmojiOrSymbol(str: string): boolean {
    // Check if string contains emoji characters or is 1-2 characters
    const emojiRegex = /\p{Extended_Pictographic}/u;
    return emojiRegex.test(str) || Array.from(str).length <= 2;
}

export default function LucideIcon({ name, fallback, ...props }: Props) {
    if (!name || !name.trim()) {
        return fallback ? <>{fallback}</> : null;
    }

    const trimmed = name.trim();
    const cleanKey = trimmed.replace(/[-_ ]/g, '').toLowerCase();

    // Check if we have a matching Lucide icon
    const IconComponent = iconMap.get(cleanKey);

    if (IconComponent) {
        return <IconComponent {...props} />;
    }

    // If it's an emoji or short symbol, display as centered emoji text
    if (isEmojiOrSymbol(trimmed)) {
        return (
            <span
                aria-hidden="true"
                className="inline-flex items-center justify-center leading-none select-none"
                style={{ fontSize: props.size ? `${props.size}px` : undefined }}
            >
                {trimmed}
            </span>
        );
    }

    // If custom fallback provided
    if (fallback) {
        return <>{fallback}</>;
    }

    // Default safe fallback for unparsed text: render a subtle Sparkles or HelpCircle icon
    // so it never spills text outside its container
    const FallbackIcon = LucideIcons.Sparkles;
    return (
        <FallbackIcon
            {...props}
            className={`opacity-40 ${props.className ?? 'h-4 w-4'}`}
        />
    );
}
