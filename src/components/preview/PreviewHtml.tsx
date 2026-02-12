
interface PreviewHtmlProps {
    content: string;
}

export const PreviewHtml = ({ content }: PreviewHtmlProps) => {
    return (
        <div
            className="my-4"
            dangerouslySetInnerHTML={{ __html: content }}
        />
    );
};
