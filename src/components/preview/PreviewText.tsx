import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface PreviewTextProps {
    content: string;
}

export const PreviewText = ({ content }: PreviewTextProps) => {
    return (
        <div className="prose dark:prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
            </ReactMarkdown>
        </div>
    );
};
