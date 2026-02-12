

interface CodeBlockProps {
    content: string;
    language: string;
    onChange: (content: string) => void;
    onLanguageChange: (language: string) => void;
}

export const CodeBlock = ({ content, language, onChange, onLanguageChange }: CodeBlockProps) => {
    return (
        <div className="bg-gray-50 dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden font-mono text-sm relative group my-2">
            <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800/50">
                <select
                    value={language}
                    onChange={(e) => onLanguageChange(e.target.value)}
                    className="bg-transparent border-none text-xs font-semibold text-gray-500 focus:ring-0 cursor-pointer uppercase py-0 pl-0"
                >
                    <option value="r">R</option>
                    <option value="python">Python</option>
                    <option value="bash">Bash</option>
                    <option value="markdown">Raw</option>
                </select>
                <span className="text-xs text-gray-400 select-none">Code Chunk</span>
            </div>
            <textarea
                value={content}
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-transparent border-none focus:ring-0 p-3 text-gray-800 dark:text-gray-200 resize-y min-h-[100px] outline-none font-mono"
                placeholder="// Enter code here..."
                spellCheck={false}
            />
        </div>
    );
};
