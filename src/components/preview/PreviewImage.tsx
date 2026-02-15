
interface PreviewImageProps {
    content: string; // URL
    caption?: string;
}

export const PreviewImage = ({ content, caption }: PreviewImageProps) => {
    if (!content) return null;

    return (
        <figure className="my-6">
            <img
                src={content}
                alt={caption || 'Report Image'}
                className="rounded-lg shadow-sm max-w-full h-auto mx-auto"
            />
            {caption && (
                <figcaption className="text-center text-sm text-gray-500 mt-2 italic">
                    {caption}
                </figcaption>
            )}
        </figure>
    );
};
