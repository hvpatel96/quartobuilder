import { useReport } from '../../contexts/ReportContext';

import { X } from 'lucide-react';

interface MetadataPanelProps {
    onClose: () => void;
}

export const MetadataPanel = ({ onClose }: MetadataPanelProps) => {
    const { metadata, updateMetadata } = useReport();

    return (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg p-5 sticky top-20">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-gray-500">Document Settings</h3>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <X className="w-4 h-4" />
                </button>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                    <input
                        type="text"
                        value={metadata.title}
                        onChange={(e) => updateMetadata({ title: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-md bg-transparent focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Author</label>
                    <input
                        type="text"
                        value={metadata.author}
                        onChange={(e) => updateMetadata({ author: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-md bg-transparent focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                    <input
                        type="date"
                        value={metadata.date}
                        onChange={(e) => updateMetadata({ date: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-md bg-transparent focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Output Format</label>
                    <div className="grid grid-cols-3 gap-2">
                        {['html', 'pdf', 'docx'].map(fmt => (
                            <button
                                key={fmt}
                                onClick={() => updateMetadata({ format: fmt as any })}
                                className={`px-2 py-1.5 text-xs font-medium rounded-md border ${metadata.format === fmt
                                    ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300'
                                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                                    }`}
                            >
                                {fmt.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
