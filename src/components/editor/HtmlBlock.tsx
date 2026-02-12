import { useRef, useEffect } from 'react';

interface HtmlBlockProps {
    content: string;
    onChange: (content: string) => void;
}

export const HtmlBlock = ({ content, onChange }: HtmlBlockProps) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [content]);

    return (
        <div className="relative group my-2">
            <div className="absolute top-0 right-0 px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs font-mono rounded-bl-md rounded-tr-md select-none pointer-events-none">
                HTML
            </div>
            <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => onChange(e.target.value)}
                placeholder="<div>Type raw HTML here...</div>"
                className="w-full bg-orange-50/50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800/30 rounded-md p-3 font-mono text-sm text-gray-800 dark:text-gray-200 resize-none overflow-hidden outline-none focus:ring-1 focus:ring-orange-400"
                rows={2}
                spellCheck={false}
            />
        </div>
    );
};
