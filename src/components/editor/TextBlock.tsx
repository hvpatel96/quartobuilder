import { useRef, useEffect } from 'react';

interface TextBlockProps {
    content: string;
    onChange: (content: string) => void;
}

export const TextBlock = ({ content, onChange }: TextBlockProps) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [content]);

    return (
        <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Type your text here (Markdown supported)..."
            className="w-full bg-transparent border-none focus:ring-0 text-gray-800 dark:text-gray-200 resize-none overflow-hidden p-0 text-lg leading-relaxed placeholder-gray-300 dark:placeholder-gray-600 outline-none"
            rows={1}
            autoFocus
        />
    );
};
