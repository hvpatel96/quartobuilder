import { useReport } from '../../contexts/ReportContext';
import { PreviewBlockList } from './PreviewBlockList';

export const ReportPreview = () => {
    const { blocks, metadata } = useReport();

    return (
        <div className="h-full overflow-y-auto bg-white dark:bg-gray-50 p-8 md:p-12 shadow-sm border-l border-gray-200 dark:border-gray-800">
            <div className="max-w-4xl mx-auto prose dark:prose-invert max-w-none">
                {/* Metadata Header (Simulated) */}
                {(metadata.title || metadata.author || metadata.date) && (
                    <div className="mb-8 border-b border-gray-200 dark:border-gray-700 pb-4">
                        {metadata.title && <h1 className="mb-2 !mt-0">{metadata.title}</h1>}
                        {metadata.author && <p className="mb-1 text-gray-600 dark:text-gray-400 font-medium">{metadata.author}</p>}
                        {metadata.date && <p className="text-sm text-gray-500 dark:text-gray-500">{metadata.date}</p>}
                    </div>
                )}

                {/* Content */}
                <PreviewBlockList blocks={blocks} />
            </div>
        </div>
    );
};
