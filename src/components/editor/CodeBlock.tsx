import { CodeEditor } from './CodeEditor';
import { useTheme } from '../../hooks/useTheme';

interface CodeBlockProps {
    content: string;
    language: string;
    metadata?: any;
    onChange: (content: string) => void;
    onLanguageChange: (language: string) => void;
    onMetadataChange?: (metadata: any) => void;
}

interface BlockOptionToggleProps {
    label: string;
    value: boolean;
    onChange: (value: boolean) => void;
}

const BlockOptionToggle = ({ label, value, onChange }: BlockOptionToggleProps) => (
    <button
        onClick={() => onChange(!value)}
        className={`px-1.5 py-0.5 text-[10px] font-medium rounded border transition-colors ${value
            ? 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800'
            : 'bg-gray-50 text-gray-400 border-gray-200 dark:bg-gray-800 dark:text-gray-500 dark:border-gray-700 hover:text-gray-600 dark:hover:text-gray-400'
            }`}
        title={`Toggle ${label}`}
    >
        {label}
    </button>
);

export const CodeBlock = ({ content, language, metadata, onChange, onLanguageChange, onMetadataChange }: CodeBlockProps) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    // Default values if undefined: echo=false, message=false, warning=false, output=true
    const options = metadata?.blockOptions || {};
    const echo = options.echo ?? false;
    const message = options.message ?? false;
    const warning = options.warning ?? false;
    const output = options.output ?? true;

    const updateOption = (key: keyof NonNullable<typeof metadata>['blockOptions'], value: boolean) => {
        onMetadataChange?.({
            ...metadata,
            blockOptions: {
                ...metadata?.blockOptions,
                [key]: value
            }
        });
    };

    return (
        <div className="bg-gray-50 dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden font-mono text-sm relative group my-2">
            <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800/50">
                <div className="flex items-center gap-3">
                    <select
                        value={language}
                        onChange={(e) => onLanguageChange(e.target.value)}
                        className="bg-transparent border-none text-xs font-semibold text-gray-500 focus:ring-0 cursor-pointer uppercase py-0 pl-0"
                    >
                        <option value="r">R</option>
                        <option value="python">Python</option>
                        {/* <option value="bash">Bash</option> */}
                        {/* <option value="markdown">Raw</option> */}
                    </select>

                    {/* Toggles */}
                    <div className="flex items-center gap-1.5 border-l border-gray-300 dark:border-gray-600 pl-3">
                        <BlockOptionToggle label="Echo" value={echo} onChange={(v) => updateOption('echo', v)} />
                        <BlockOptionToggle label="Msg" value={message} onChange={(v) => updateOption('message', v)} />
                        <BlockOptionToggle label="Warn" value={warning} onChange={(v) => updateOption('warning', v)} />
                        <BlockOptionToggle label="Out" value={output} onChange={(v) => updateOption('output', v)} />
                    </div>
                </div>
                <span className="text-xs text-gray-400 select-none">Code Chunk</span>
            </div>
            <CodeEditor
                value={content}
                onChange={onChange}
                language={language}
                placeholder="// Enter code here..."
                darkMode={isDark}
            />
        </div>
    );
};
