import { X, Play } from 'lucide-react';
import { useReport } from '../../contexts/ReportContext';
import { EXAMPLES } from '../../utils/examples';

interface ExamplesPanelProps {
    onClose: () => void;
}

export const ExamplesPanel = ({ onClose }: ExamplesPanelProps) => {
    const { loadReport } = useReport();

    const handleLoad = (id: string) => {
        const example = EXAMPLES.find(e => e.id === id);
        if (example) {
            if (confirm(`Load "${example.name}"? This will replace your current report.`)) {
                loadReport(example.blocks, example.metadata);
                onClose();
            }
        }
    };

    return (
        <div className="fixed inset-y-0 left-0 w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-xl z-50 transform transition-transform duration-300 ease-in-out md:left-16">
            <div className="h-full flex flex-col">
                <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                    <h2 className="font-semibold text-gray-900 dark:text-gray-100">Examples Library</h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {EXAMPLES.map((example) => (
                        <div
                            key={example.id}
                            className="group relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer"
                            onClick={() => handleLoad(example.id)}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 transition-colors">
                                    {example.name}
                                </h3>
                                <Play className="w-4 h-4 text-gray-400 group-hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-all" />
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                {example.description}
                            </p>
                            <div className="mt-3 flex items-center gap-2">
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${example.metadata.format === 'pdf'
                                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                    : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                    }`}>
                                    {example.metadata.format.toUpperCase()}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
