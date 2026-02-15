import type { ReactNode } from 'react';
import { FileText, Download, Save, Settings, Eye, LayoutTemplate, PenTool, FolderOpen, Database, Palette, FilePlus, Library, Undo2, Redo2, List, Moon, Sun, Monitor } from 'lucide-react';
import { useReport } from '../contexts/ReportContext';
import { cn } from '../utils/cn';

interface MainLayoutProps {
    children: ReactNode;
    onExport: () => void;
    onSave: () => void;
    onLoad: (file: File) => void;
    onToggleMetadata?: () => void;
    onToggleDatasets?: () => void;
    onToggleStyling?: () => void;
    onToggleExamples?: () => void;
    onToggleOutline?: () => void;
    onNew: () => void;
    onUndo?: () => void;
    onRedo?: () => void;
    canUndo?: boolean;
    canRedo?: boolean;
    theme?: 'light' | 'dark' | 'system';
    onCycleTheme?: () => void;
}

export const MainLayout = ({ children, onExport, onSave, onLoad, onToggleMetadata, onToggleDatasets, onToggleStyling, onToggleExamples, onToggleOutline, onNew, onUndo, onRedo, canUndo, canRedo, theme, onCycleTheme }: MainLayoutProps) => {
    const { viewMode, setViewMode } = useReport();

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans">
            {/* Sidebar - Remains the same */}
            <aside className="w-16 md:w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col transition-all duration-300">
                <div className="p-4 border-b border-gray-200 dark:border-gray-800 font-bold text-lg flex items-center gap-3">
                    <div className="p-2 bg-blue-600 rounded-lg text-white">
                        <FileText className="w-5 h-5" />
                    </div>
                    <span className="hidden md:inline tracking-tight">Quarto<span className="text-blue-600">Builder</span></span>
                </div>

                <nav className="flex-1 overflow-y-auto p-4 space-y-6">
                    <div>
                        <div className="text-xs uppercase text-gray-400 font-semibold tracking-wider mb-3 hidden md:block pl-2">Tools</div>
                        <button
                            onClick={onToggleMetadata}
                            className="w-full flex items-center gap-3 px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors text-left"
                        >
                            <Settings className="w-5 h-5" />
                            <span className="hidden md:inline text-sm font-medium">Metadata</span>
                        </button>
                        <button
                            onClick={onToggleDatasets}
                            className="w-full flex items-center gap-3 px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors text-left"
                        >
                            <Database className="w-5 h-5" />
                            <span className="hidden md:inline text-sm font-medium">Datasets</span>
                        </button>
                        <button
                            onClick={onToggleStyling}
                            className="w-full flex items-center gap-3 px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors text-left"
                        >
                            <Palette className="w-5 h-5" />
                            <span className="hidden md:inline text-sm font-medium">Styling</span>
                        </button>
                        <button
                            onClick={onToggleExamples}
                            className="w-full flex items-center gap-3 px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors text-left"
                        >
                            <Library className="w-5 h-5" />
                            <span className="hidden md:inline text-sm font-medium">Examples</span>
                        </button>
                        <button
                            onClick={onToggleOutline}
                            className="w-full flex items-center gap-3 px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors text-left"
                        >
                            <List className="w-5 h-5" />
                            <span className="hidden md:inline text-sm font-medium">Block Outline</span>
                        </button>
                    </div>
                </nav>

                <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
                    <button
                        onClick={onCycleTheme}
                        className="w-full flex items-center gap-3 px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors text-left"
                        title={`Theme: ${theme || 'system'}`}
                    >
                        {theme === 'dark' ? <Moon className="w-5 h-5" /> : theme === 'light' ? <Sun className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
                        <span className="hidden md:inline text-sm font-medium capitalize">{theme || 'system'}</span>
                    </button>
                    <button
                        onClick={onExport}
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-lg shadow-sm hover:shadow transition-all"
                        title="Export"
                    >
                        <Download className="w-4 h-4" />
                        <span className="hidden md:inline font-medium text-sm">Export Report</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-hidden flex flex-col relative">
                <header className="h-14 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center px-6 justify-between z-10 sticky top-0">
                    {/* Left Side: Title */}
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span className="font-medium text-gray-900 dark:text-gray-100">Draft Report</span>
                    </div>

                    {/* Center: View Toggles */}
                    <div className="flex items-center bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                        <button
                            onClick={() => setViewMode('edit')}
                            className={cn(
                                "p-1.5 rounded-md transition-all flex items-center gap-2 text-xs font-medium",
                                viewMode === 'edit' ? "bg-white dark:bg-gray-700 shadow-sm text-blue-600" : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
                            )}
                            title="Edit Mode"
                        >
                            <PenTool className="w-4 h-4" />
                            <span className="hidden sm:inline">Edit</span>
                        </button>
                        <button
                            onClick={() => setViewMode('split')}
                            className={cn(
                                "p-1.5 rounded-md transition-all flex items-center gap-2 text-xs font-medium",
                                viewMode === 'split' ? "bg-white dark:bg-gray-700 shadow-sm text-blue-600" : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
                            )}
                            title="Split View"
                        >
                            <LayoutTemplate className="w-4 h-4" />
                            <span className="hidden sm:inline">Split</span>
                        </button>
                        <button
                            onClick={() => setViewMode('preview')}
                            className={cn(
                                "p-1.5 rounded-md transition-all flex items-center gap-2 text-xs font-medium",
                                viewMode === 'preview' ? "bg-white dark:bg-gray-700 shadow-sm text-blue-600" : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
                            )}
                            title="Preview Mode"
                        >
                            <Eye className="w-4 h-4" />
                            <span className="hidden sm:inline">Preview</span>
                        </button>
                    </div>

                    {/* Right Side: Actions */}
                    <div className="flex items-center gap-1">
                        <button
                            onClick={onUndo}
                            disabled={!canUndo}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md text-gray-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Undo (Ctrl+Z)"
                        >
                            <Undo2 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={onRedo}
                            disabled={!canRedo}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md text-gray-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Redo (Ctrl+Y)"
                        >
                            <Redo2 className="w-4 h-4" />
                        </button>
                        <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1"></div>
                        <button
                            onClick={onNew}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md text-gray-500 transition-colors"
                            title="New Report"
                        >
                            <FilePlus className="w-4 h-4" />
                        </button>
                        <label className="cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md text-gray-500 transition-colors" title="Load Configuration">
                            <input
                                type="file"
                                accept=".json"
                                className="hidden"
                                onChange={(e) => {
                                    if (e.target.files?.[0]) {
                                        onLoad(e.target.files[0]);
                                        e.target.value = '';
                                    }
                                }}
                            />
                            <FolderOpen className="w-4 h-4" />
                        </label>
                        <button
                            onClick={onSave}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md text-gray-500 transition-colors"
                            title="Save Configuration (Ctrl+S)"
                        >
                            <Save className="w-4 h-4" />
                        </button>
                    </div>
                </header>

                {/* Scrollable Canvas area */}
                <div className={cn(
                    "flex-1 bg-gray-50 dark:bg-gray-950 p-4 md:p-6 scroll-smooth",
                    viewMode === 'split' ? "overflow-hidden" : "overflow-y-auto"
                )}>
                    {children}
                </div>
            </main>
        </div>
    );
};
