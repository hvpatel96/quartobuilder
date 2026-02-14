import DOMPurify from 'dompurify';

interface PreviewHtmlProps {
    content: string;
}

export const PreviewHtml = ({ content }: PreviewHtmlProps) => {
    const sanitized = DOMPurify.sanitize(content);
    return (
        <div
            className="my-4"
            dangerouslySetInnerHTML={{ __html: sanitized }}
        />
    );
};
