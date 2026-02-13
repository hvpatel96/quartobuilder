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
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg p-5 sticky top-20 max-h-[80vh] overflow-y-auto flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-gray-500">Datasets</h3>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Upload Area */}
            <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                className={clsx(
                    "border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors mb-4",
                    isDragging ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600"
                )}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".csv,.xlsx,.tsv"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                />
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <p className="text-xs text-center text-gray-500 font-medium">Click to upload or drag & drop</p>
                <p className="text-[10px] text-center text-gray-400 mt-1">CSV, Excel, TSV</p>
            </div>

            {/* Dataset List */}
            <div className="space-y-3 flex-1 overflow-y-auto min-h-[100px]">
                {datasets.length === 0 && (
                    <div className="text-center py-4 text-gray-400 text-xs italic">
                        No datasets uploaded yet.
                    </div>
                )}

                {datasets.map(dataset => (
                    <div key={dataset.id} className="border border-gray-200 dark:border-gray-700 rounded-md p-3 group">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 overflow-hidden">
                                <FileSpreadsheet className="w-4 h-4 text-green-600 flex-shrink-0" />
                                <span className="text-sm font-medium truncate" title={dataset.name}>{dataset.name}</span>
                            </div>
                            <button
                                onClick={() => removeDataset(dataset.id)}
                                className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>{(dataset.size / 1024).toFixed(1)} KB</span>
                            <button
                                onClick={() => navigator.clipboard.writeText(`data/${dataset.name}`)}
                                className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                                title="Copy path to clipboard"
                            >
                                <Copy className="w-3 h-3" />
                                <span className="font-mono">data/{dataset.name}</span>
                            </button>
                        </div>

                        {/* Preview (CSV only for now) */}
                        {dataset.type === 'csv' && dataset.preview.length > 0 && (
                            <div className="mt-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-100 dark:border-gray-700 overflow-x-auto">
                                <table className="w-full text-[10px] text-left">
                                    <thead>
                                        <tr className="border-b border-gray-200 dark:border-gray-700">
                                            {Object.keys(dataset.preview[0]).map(key => (
                                                <th key={key} className="px-2 py-1 font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap">{key}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {dataset.preview.map((row, i) => (
                                            <tr key={i} className="border-b border-gray-100 dark:border-gray-800 last:border-0">
                                                {Object.values(row).map((val: any, j) => (
                                                    <td key={j} className="px-2 py-1 text-gray-500 dark:text-gray-400 whitespace-nowrap">{String(val).slice(0, 20)}</td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
