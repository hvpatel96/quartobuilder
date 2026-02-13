import { useRef, useEffect } from 'react';

// Reusing the Toggle component logic if I could export it, but for now duplicate the small component or inline it.
// I'll inline the toggle logic for simplicity or create a small helper function if I can.
// Actually I'll just copy the BlockOptionToggle component here.

interface BlockOptionToggleProps {
    label: string;
    value: boolean;
    onChange: (value: boolean) => void;
}

const BlockOptionToggle = ({ label, value, onChange }: BlockOptionToggleProps) => (
    <button
        onClick={() => onChange(!value)}
        className={`px-1.5 py-0.5 text-[10px] font-medium rounded border transition-colors ${value
            ? 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800'
            : 'bg-white text-gray-400 border-gray-200 dark:bg-gray-800 dark:text-gray-500 dark:border-gray-700 hover:text-gray-600 dark:hover:text-gray-400'
            }`}
        title={`Toggle ${label}`}
    >
        {label}
    </button>
);

interface HtmlBlockProps {
    content: string;
    metadata?: any;
    onChange: (content: string) => void;
    onMetadataChange?: (metadata: any) => void;
}

export const HtmlBlock = ({ content, metadata, onChange, onMetadataChange }: HtmlBlockProps) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Default values: echo=false, output=true (others irrelevant for HTML mostly but user asked for them)
    const options = metadata?.blockOptions || {};
    const echo = options.echo ?? false;
    const output = options.output ?? true;

    const updateOption = (key: string, value: boolean) => {
        onMetadataChange?.({
            ...metadata,
            blockOptions: {
                ...metadata?.blockOptions,
                [key]: value
            }
        });
    };

    // Auto-resize
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [content]);

    return (
        <div className="relative group my-2 border border-orange-200 dark:border-orange-800/30 rounded-md overflow-hidden">
            <div className="flex items-center justify-between px-3 py-1.5 bg-orange-50 dark:bg-orange-900/10 border-b border-orange-100 dark:border-orange-800/30">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-orange-600 dark:text-orange-400 font-bold">HTML</span>
                    <div className="flex items-center gap-1.5 border-l border-orange-200 dark:border-orange-800/30 pl-2">
                        <BlockOptionToggle label="Echo" value={echo} onChange={(v) => updateOption('echo', v)} />
                        <BlockOptionToggle label="Out" value={output} onChange={(v) => updateOption('output', v)} />
                    </div>
                </div>
            </div>
            <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => onChange(e.target.value)}
                placeholder="<div>Type raw HTML here...</div>"
                className="w-full bg-orange-50/20 dark:bg-orange-900/5 focus:bg-white dark:focus:bg-gray-900 p-3 font-mono text-sm text-gray-800 dark:text-gray-200 resize-none overflow-hidden outline-none"
                rows={2}
                spellCheck={false}
            />
        </div>
    );
};
