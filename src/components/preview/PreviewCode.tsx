import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface PreviewCodeProps {
    content: string;
    language?: string;
}

export const PreviewCode = ({ content, language = 'r' }: PreviewCodeProps) => {
    return (
        <div className="my-4 rounded-md overflow-hidden text-sm">
            <div className="bg-gray-800 text-gray-400 px-4 py-1 text-xs uppercase font-mono border-b border-gray-700">
                {language}
            </div>
            <SyntaxHighlighter
                language={language}
                style={vscDarkPlus}
                customStyle={{ margin: 0, borderRadius: '0 0 0.375rem 0.375rem' }}
            >
                {content}
            </SyntaxHighlighter>
        </div>
    );
};
