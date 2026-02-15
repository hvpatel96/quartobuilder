import DOMPurify from 'dompurify';

// Register hook once at module scope to avoid accumulating duplicates on every render
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    if ('target' in node) {
        node.setAttribute('target', '_blank');
        node.setAttribute('rel', 'noopener noreferrer');
    }
});

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
