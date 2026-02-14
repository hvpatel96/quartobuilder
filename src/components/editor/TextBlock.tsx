import { useRef, useEffect, useState, useCallback } from 'react';
import { Bold, Italic, Code, Heading, Link, List, ListOrdered } from 'lucide-react';

interface TextBlockProps {
    content: string;
    onChange: (content: string) => void;
}

export const TextBlock = ({ content, onChange }: TextBlockProps) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [showToolbar, setShowToolbar] = useState(false);
    const toolbarTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Auto-resize
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [content]);

    const wrapSelection = useCallback((before: string, after: string) => {
        const ta = textareaRef.current;
        if (!ta) return;
        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        const selected = content.slice(start, end);
        const newContent = content.slice(0, start) + before + selected + after + content.slice(end);
        onChange(newContent);
        // Restore cursor position
        requestAnimationFrame(() => {
            ta.focus();
            ta.setSelectionRange(start + before.length, end + before.length);
        });
    }, [content, onChange]);

    const insertPrefix = useCallback((prefix: string) => {
        const ta = textareaRef.current;
        if (!ta) return;
        const start = ta.selectionStart;
        // Find beginning of current line
        const lineStart = content.lastIndexOf('\n', start - 1) + 1;
        const newContent = content.slice(0, lineStart) + prefix + content.slice(lineStart);
        onChange(newContent);
        requestAnimationFrame(() => {
            ta.focus();
            ta.setSelectionRange(start + prefix.length, start + prefix.length);
        });
    }, [content, onChange]);

    const handleFocus = () => {
        if (toolbarTimeout.current) clearTimeout(toolbarTimeout.current);
        setShowToolbar(true);
    };

    const handleBlur = () => {
        toolbarTimeout.current = setTimeout(() => setShowToolbar(false), 200);
    };

    const ToolbarButton = ({ onClick, icon: Icon, title }: { onClick: () => void; icon: any; title: string }) => (
        <button
            onMouseDown={(e) => { e.preventDefault(); onClick(); }}
            className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            title={title}
        >
            <Icon className="w-3.5 h-3.5" />
        </button>
    );

    return (
        <div>
            {showToolbar && (
                <div className="flex items-center gap-0.5 mb-1 p-1 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 transition-opacity">
                    <ToolbarButton onClick={() => wrapSelection('**', '**')} icon={Bold} title="Bold" />
                    <ToolbarButton onClick={() => wrapSelection('*', '*')} icon={Italic} title="Italic" />
                    <ToolbarButton onClick={() => wrapSelection('`', '`')} icon={Code} title="Inline Code" />
                    <div className="w-px h-4 bg-gray-200 dark:bg-gray-600 mx-0.5" />
                    <ToolbarButton onClick={() => insertPrefix('## ')} icon={Heading} title="Heading" />
                    <ToolbarButton onClick={() => wrapSelection('[', '](url)')} icon={Link} title="Link" />
                    <div className="w-px h-4 bg-gray-200 dark:bg-gray-600 mx-0.5" />
                    <ToolbarButton onClick={() => insertPrefix('- ')} icon={List} title="Bullet List" />
                    <ToolbarButton onClick={() => insertPrefix('1. ')} icon={ListOrdered} title="Numbered List" />
                </div>
            )}
            <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => onChange(e.target.value)}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder="Type your text here (Markdown supported)..."
                className="w-full bg-transparent border-none focus:ring-0 text-gray-800 dark:text-gray-200 resize-none overflow-hidden p-0 text-lg leading-relaxed placeholder-gray-300 dark:placeholder-gray-600 outline-none"
                rows={1}
            />
        </div>
    );
};
