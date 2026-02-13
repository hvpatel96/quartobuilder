import React, { useState, useRef } from 'react';
import { X, Upload, Palette, FileText, FileType } from 'lucide-react';
import { useReport } from '../../contexts/ReportContext';
import { clsx } from 'clsx';

interface StylingPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

export const StylingPanel = ({ isOpen, onClose }: StylingPanelProps) => {
    const { metadata, updateMetadata } = useReport();
    const [activeTab, setActiveTab] = useState<'html' | 'pdf'>('html');
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const styling = metadata.styling || {};
    const htmlStyle = styling.html || {};
    const pdfStyle = styling.pdf || {};

    const handleCssChange = (content: string) => {
        updateMetadata({
            ...metadata,
            styling: {
                ...styling,
                html: { ...htmlStyle, cssContent: content }
            }
        });
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            handleCssChange(content);
        };
        reader.readAsText(file);
    };

    const updatePdfOption = (key: keyof NonNullable<typeof styling.pdf>, value: any) => {
        updateMetadata({
            ...metadata,
            styling: {
                ...styling,
                pdf: { ...pdfStyle, [key]: value }
            }
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[85vh] overflow-hidden border border-gray-200 dark:border-gray-800">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
                            <Palette className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Document Styling</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Customize appearance for HTML & PDF</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 dark:border-gray-800">
                    <button
                        onClick={() => setActiveTab('html')}
                        className={clsx(
                            "flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors",
                            activeTab === 'html'
                                ? "border-purple-500 text-purple-600 dark:text-purple-400 bg-purple-50/50 dark:bg-purple-900/10"
                                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                        )}
                    >
                        <FileType className="w-4 h-4" />
                        HTML (CSS)
                    </button>
                    <button
                        onClick={() => setActiveTab('pdf')}
                        className={clsx(
                            "flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors",
                            activeTab === 'pdf'
                                ? "border-purple-500 text-purple-600 dark:text-purple-400 bg-purple-50/50 dark:bg-purple-900/10"
                                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                        )}
                    >
                        <FileText className="w-4 h-4" />
                        PDF Options
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {activeTab === 'html' && (
                        <div className="space-y-4 h-full flex flex-col">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Custom CSS</label>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="text-xs flex items-center gap-1.5 px-2 py-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-300 transition-colors"
                                >
                                    <Upload className="w-3.5 h-3.5" />
                                    Upload CSS File
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept=".css"
                                    onChange={handleFileUpload}
                                />
                            </div>
                            <textarea
                                value={htmlStyle.cssContent || ''}
                                onChange={(e) => handleCssChange(e.target.value)}
                                placeholder="/* Enter custom CSS here or upload a file... */&#10;body { font-family: sans-serif; }"
                                className="flex-1 w-full min-h-[300px] bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg p-4 font-mono text-sm text-gray-800 dark:text-gray-200 resize-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                                spellCheck={false}
                            />
                        </div>
                    )}

                    {activeTab === 'pdf' && (
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-800 pb-2">Layout & Structure</h3>

                                <label className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-800 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={pdfStyle.toc || false}
                                        onChange={(e) => updatePdfOption('toc', e.target.checked)}
                                        className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800"
                                    />
                                    <div>
                                        <div className="font-medium text-sm text-gray-900 dark:text-gray-100">Include Table of Contents</div>
                                        <div className="text-xs text-gray-500">Auto-generates a TOC at the beginning</div>
                                    </div>
                                </label>

                                <label className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-800 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={pdfStyle.numberSections || false}
                                        onChange={(e) => updatePdfOption('numberSections', e.target.checked)}
                                        className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800"
                                    />
                                    <div>
                                        <div className="font-medium text-sm text-gray-900 dark:text-gray-100">Number Sections</div>
                                        <div className="text-xs text-gray-500">Automatically numbers headers (1.1, 1.2, etc.)</div>
                                    </div>
                                </label>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-800 pb-2">Page Settings</h3>

                                <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Margins</label>
                                    <input
                                        type="text"
                                        value={pdfStyle.margin || '1in'}
                                        onChange={(e) => updatePdfOption('margin', e.target.value)}
                                        placeholder="e.g. 1in, 2.5cm"
                                        className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">Standard CSS/LaTeX units (in, cm, mm)</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};
