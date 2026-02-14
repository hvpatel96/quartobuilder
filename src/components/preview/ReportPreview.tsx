import { useReport } from '../../contexts/ReportContext';
import { PreviewBlockList } from './PreviewBlockList';
import { FileText, Globe, FileType } from 'lucide-react';

const formatConfig: Record<string, { label: string; color: string; bg: string; border: string; icon: any }> = {
    html: { label: 'HTML Preview', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/50', border: 'border-blue-200 dark:border-blue-800', icon: Globe },
    pdf: { label: 'PDF Preview', color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-950/50', border: 'border-red-200 dark:border-red-800', icon: FileText },
    docx: { label: 'DOCX Preview', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950/50', border: 'border-green-200 dark:border-green-800', icon: FileType },
};

export const ReportPreview = () => {
    const { blocks, metadata } = useReport();
    const fmt = formatConfig[metadata.format] || formatConfig.html;
    const FmtIcon = fmt.icon;
    const isPdf = metadata.format === 'pdf';

    return (
        <div className="h-full flex flex-col bg-white dark:bg-gray-900 shadow-sm border-l border-gray-200 dark:border-gray-800">
            {/* Format Badge — fixed at top */}
            <div className={`shrink-0 px-4 py-2 flex items-center gap-2 border-b ${fmt.border} ${fmt.bg}`}>
                <FmtIcon className={`w-4 h-4 ${fmt.color}`} />
                <span className={`text-xs font-semibold uppercase tracking-wide ${fmt.color}`}>{fmt.label}</span>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto p-8 md:p-12">
                <div className={`max-w-4xl mx-auto prose dark:prose-invert max-w-none ${isPdf ? 'border border-gray-200 dark:border-gray-300 shadow-md p-10 bg-white min-h-[11in]' : ''}`}>
                    {/* Metadata Header (Simulated) */}
                    {(metadata.title || metadata.author || metadata.date) && (
                        <div className="mb-8 border-b border-gray-200 dark:border-gray-700 pb-4">
                            {metadata.title && <h1 className="mb-2 !mt-0">{metadata.title}</h1>}
                            {metadata.author && <p className="mb-1 text-gray-600 dark:text-gray-400 font-medium">{metadata.author}</p>}
                            {metadata.date && <p className="text-sm text-gray-500 dark:text-gray-500">{metadata.date}</p>}
                        </div>
                    )}

                    {/* Content */}
                    {metadata.styling?.html?.cssContent && (
                        <style>
                            {metadata.styling.html.cssContent}
                        </style>
                    )}
                    <PreviewBlockList blocks={blocks} />
                </div>
            </div>
        </div>
    );
};
