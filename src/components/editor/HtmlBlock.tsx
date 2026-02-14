import { CodeEditor } from './CodeEditor';

// Reusing the Toggle component logic
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
    // Default values: echo=false, output=true
    const options = metadata?.blockOptions || {};
    const echo = options.echo ?? false;
    const output = options.output ?? true;
    const isDark = document.documentElement.classList.contains('dark');

    const updateOption = (key: string, value: boolean) => {
        onMetadataChange?.({
            ...metadata,
            blockOptions: {
                ...metadata?.blockOptions,
                [key]: value
            }
        });
    };

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
            <CodeEditor
                value={content}
                onChange={onChange}
                language="html"
                placeholder="<div>Type raw HTML here...</div>"
                darkMode={isDark}
            />
        </div>
    );
};
