import { useReport } from '../../contexts/ReportContext';

import { X } from 'lucide-react';
import { clsx } from 'clsx';

interface MetadataPanelProps {
    onClose: () => void;
}

export const MetadataPanel = ({ onClose }: MetadataPanelProps) => {
    const { metadata, updateMetadata } = useReport();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 z-10">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">Document Settings</h3>
                    <button
                        onClick={onClose}
                        className="p-2 -mr-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Report Title</label>
                        <input
                            type="text"
                            value={metadata.title}
                            onChange={(e) => updateMetadata({ title: e.target.value })}
                            placeholder="Enter report title..."
                            className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-950 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Author Name</label>
                        <input
                            type="text"
                            value={metadata.author}
                            onChange={(e) => updateMetadata({ author: e.target.value })}
                            placeholder="Enter author name..."
                            className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-950 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Publication Date</label>
                        <input
                            type="date"
                            value={metadata.date}
                            onChange={(e) => updateMetadata({ date: e.target.value })}
                            className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-950 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Output Format</label>
                        <div className="grid grid-cols-3 gap-3">
                            {['html', 'pdf', 'docx'].map(fmt => (
                                <button
                                    key={fmt}
                                    onClick={() => updateMetadata({ format: fmt as any })}
                                    className={clsx(
                                        "px-4 py-3 text-sm font-medium rounded-lg border transition-all",
                                        metadata.format === fmt
                                            ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20"
                                            : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600"
                                    )}
                                >
                                    {fmt.toUpperCase()}
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Choose the format for the final rendered report.</p>
                    </div>
                </div>

                <div className="p-5 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950/50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 font-medium rounded-lg hover:opacity-90 transition-opacity"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};
