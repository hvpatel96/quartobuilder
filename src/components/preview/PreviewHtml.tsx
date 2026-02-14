import DOMPurify from 'dompurify';

interface PreviewHtmlProps {
    content: string;
}

export const PreviewHtml = ({ content }: PreviewHtmlProps) => {
    // Configure DOMPurify to open links in new tab + secure them
    DOMPurify.addHook('afterSanitizeAttributes', (node) => {
        if ('target' in node) {
            node.setAttribute('target', '_blank');
            node.setAttribute('rel', 'noopener noreferrer');
        }
    });

    const sanitized = DOMPurify.sanitize(content);
    return (
        <div
            className="my-4"
            dangerouslySetInnerHTML={{ __html: sanitized }}
        />
    );
};
