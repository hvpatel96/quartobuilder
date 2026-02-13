import { useState, useRef } from 'react';
import { useReport } from '../../contexts/ReportContext';
import { X, Upload, Trash2, FileSpreadsheet, Copy } from 'lucide-react';
import Papa from 'papaparse';
import type { Dataset } from '../../types';
import { clsx } from 'clsx';

interface DatasetPanelProps {
    onClose: () => void;
}

export const DatasetPanel = ({ onClose }: DatasetPanelProps) => {
    const { datasets, addDataset, removeDataset } = useReport();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleFileUpload = (file: File) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            const content = e.target?.result;
            if (!content) return;

            let preview: any[] = [];

            if (file.name.endsWith('.csv')) {
                const result = Papa.parse(content as string, {
                    header: true,
                    preview: 5,
                    skipEmptyLines: true
                });
                preview = result.data;
            }

            const newDataset: Dataset = {
                id: Math.random().toString(36).substr(2, 9),
                name: file.name,
                type: file.name.endsWith('.csv') ? 'csv' :
                    file.name.endsWith('.xlsx') ? 'excel' :
                        file.name.endsWith('.tsv') ? 'tsv' : 'json',
                content: content,
                preview: preview,
                size: file.size
            };

            addDataset(newDataset);
        };

        if (file.name.endsWith('.xlsx')) {
            reader.readAsArrayBuffer(file);
        } else {
            reader.readAsText(file);
        }
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files?.[0]) {
            handleFileUpload(e.dataTransfer.files[0]);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
                <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
                    <div>
                        <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">Dataset Management</h3>
                        <p className="text-xs text-gray-500 mt-1">Upload and manage datasets for your analysis.</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 -mr-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 flex-1 overflow-y-auto">
                    {/* Upload Area */}
                    <div
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={onDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={clsx(
                            "border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all mb-6",
                            isDragging
                                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-[0.99]"
                                : "border-gray-300 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                        )}
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept=".csv,.xlsx,.tsv"
                            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                        />
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400 mb-3">
                            <Upload className="w-6 h-6" />
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">Click to upload or drag & drop</p>
                        <p className="text-xs text-gray-500 mt-1">Supports CSV, Excel, and TSV files</p>
                    </div>

                    {/* Dataset List */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Uploaded Datasets</h4>

                        {datasets.length === 0 && (
                            <div className="text-center py-8 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-dashed border-gray-200 dark:border-gray-700">
                                <p className="text-sm text-gray-400 italic">No datasets uploaded yet.</p>
                            </div>
                        )}

                        {datasets.map(dataset => (
                            <div key={dataset.id} className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-lg p-4 group hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-700 dark:text-green-400">
                                            <FileSpreadsheet className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate" title={dataset.name}>{dataset.name}</div>
                                            <div className="text-xs text-gray-500">{(dataset.size / 1024).toFixed(1)} KB • {dataset.type.toUpperCase()}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => navigator.clipboard.writeText(`data/${dataset.name}`)}
                                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                                            title="Copy path to clipboard"
                                        >
                                            <Copy className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => removeDataset(dataset.id)}
                                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                                            title="Delete dataset"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Preview (CSV only for now) */}
                                {dataset.type === 'csv' && dataset.preview.length > 0 && (
                                    <div className="bg-gray-50 dark:bg-gray-900 rounded-md border border-gray-100 dark:border-gray-800 overflow-hidden">
                                        <div className="overflow-x-auto custom-scrollbar">
                                            <table className="w-full text-[10px] text-left">
                                                <thead className="bg-gray-100 dark:bg-gray-800">
                                                    <tr>
                                                        {Object.keys(dataset.preview[0]).map(key => (
                                                            <th key={key} className="px-3 py-2 font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap border-b border-gray-200 dark:border-gray-700">{key}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {dataset.preview.map((row, i) => (
                                                        <tr key={i} className="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-white dark:hover:bg-gray-800/50 transition-colors">
                                                            {Object.values(row).map((val: any, j) => (
                                                                <td key={j} className="px-3 py-2 text-gray-500 dark:text-gray-400 whitespace-nowrap">{String(val).slice(0, 30)}</td>
                                                            ))}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        <div className="px-3 py-1 bg-gray-50 dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 text-[10px] text-gray-400 text-center">
                                            Showing first 5 rows
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
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
