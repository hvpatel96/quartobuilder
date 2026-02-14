import { useState, useEffect, useMemo } from 'react';
import { ReportProvider, useReport } from './contexts/ReportContext';
import { ExecutionProvider } from './contexts/ExecutionContext';
import { ToastProvider, useToast } from './contexts/ToastContext';
import { MainLayout } from './layouts/MainLayout';
import { ReportEditor } from './components/editor/ReportEditor';
import { ReportPreview } from './components/preview/ReportPreview';
import { MetadataPanel } from './components/metadata/MetadataPanel';
import { DatasetPanel } from './components/editor/DatasetPanel';
import { StylingPanel } from './components/metadata/StylingPanel';
import { ExamplesPanel } from './components/examples/ExamplesPanel';
import { BlockOutlinePanel } from './components/editor/BlockOutlinePanel';
import { exportReport } from './utils/exportManager';
import { saveConfiguration, loadConfiguration } from './utils/storageManager';
import { clsx } from 'clsx';
import { DatasetSync } from './components/DatasetSync';
import { useAutosave, getAutosaveData, clearAutosave } from './hooks/useAutosave';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useTheme } from './hooks/useTheme';

function MainContent() {
  const { blocks, metadata, viewMode, loadReport, datasets, resetReport, undo, redo, canUndo, canRedo } = useReport();
  const { addToast } = useToast();
  const [showMetadata, setShowMetadata] = useState(false);
  const [showDatasets, setShowDatasets] = useState(false);
  const [showStyling, setShowStyling] = useState(false);
  const [showExamples, setShowExamples] = useState(false);
  const [showOutline, setShowOutline] = useState(false);
  const [showRestoreBanner, setShowRestoreBanner] = useState(false);
  const [autosaveTimestamp, setAutosaveTimestamp] = useState<string | null>(null);
  const { theme, cycleTheme } = useTheme();

  // Autosave
  useAutosave(blocks, metadata, datasets);

  // Check for existing autosave on mount
  useEffect(() => {
    const saved = getAutosaveData();
    if (saved && (saved.blocks.length > 0 || saved.metadata.title)) {
      setShowRestoreBanner(true);
      setAutosaveTimestamp(saved.timestamp);
    }
  }, []);

  const handleRestore = () => {
    const saved = getAutosaveData();
    if (saved) {
      loadReport(saved.blocks, saved.metadata);
    }
    setShowRestoreBanner(false);
  };

  const handleDismissRestore = () => {
    clearAutosave();
    setShowRestoreBanner(false);
  };

  const handleExport = async () => {
    try {
      await exportReport(blocks, metadata, datasets);
      addToast('Report exported successfully!', 'success');
    } catch (error) {
      console.error("Export failed:", error);
      addToast('Failed to export report.', 'error');
    }
  };

  const handleSave = () => {
    saveConfiguration(blocks, metadata);
    addToast('Configuration saved!', 'success');
  };

  const handleLoad = async (file: File) => {
    try {
      const config = await loadConfiguration(file);
      loadReport(config.blocks, config.metadata);
      addToast('Configuration loaded!', 'success');
    } catch (error) {
      console.error("Failed to load configuration", error);
      addToast('Failed to load configuration file.', 'error');
    }
  };

  const handleNew = () => {
    if (confirm("Are you sure you want to create a new report? Unsaved changes will be lost.")) {
      resetReport();
    }
  };

  // Keyboard shortcuts
  const shortcutActions = useMemo(() => ({
    onUndo: undo,
    onRedo: redo,
    onSave: handleSave,
    onExport: handleExport,
  }), [undo, redo, handleSave, handleExport]);
  useKeyboardShortcuts(shortcutActions);

  return (
    <MainLayout
      onExport={handleExport}
      onSave={handleSave}
      onLoad={handleLoad}
      onNew={handleNew}

      onToggleMetadata={() => { setShowMetadata(!showMetadata); setShowDatasets(false); setShowStyling(false); setShowExamples(false); }}
      onToggleDatasets={() => { setShowDatasets(!showDatasets); setShowMetadata(false); setShowStyling(false); setShowExamples(false); }}
      onToggleStyling={() => { setShowStyling(!showStyling); setShowMetadata(false); setShowDatasets(false); setShowExamples(false); }}
      onToggleExamples={() => { setShowExamples(!showExamples); setShowMetadata(false); setShowDatasets(false); setShowStyling(false); }}
      onToggleOutline={() => setShowOutline(!showOutline)}
      onUndo={undo}
      onRedo={redo}
      canUndo={canUndo}
      canRedo={canRedo}
      theme={theme}
      onCycleTheme={cycleTheme}
    >
      {/* Autosave Restore Banner */}
      {showRestoreBanner && (
        <div className="absolute top-0 left-0 right-0 z-50 bg-blue-600 text-white px-4 py-2.5 flex items-center justify-between shadow-lg animate-in slide-in-from-top">
          <span className="text-sm font-medium">
            📄 Unsaved report found{autosaveTimestamp ? ` (${new Date(autosaveTimestamp).toLocaleString()})` : ''}. Restore it?
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRestore}
              className="px-3 py-1 bg-white text-blue-600 rounded-md text-sm font-semibold hover:bg-blue-50 transition-colors"
            >
              Restore
            </button>
            <button
              onClick={handleDismissRestore}
              className="px-3 py-1 bg-blue-700 text-white rounded-md text-sm font-medium hover:bg-blue-800 transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
      <div className={clsx(
        "h-full w-full transition-all duration-300",
        viewMode === 'split' ? "flex gap-4" : "max-w-4xl mx-auto"
      )}>
        {showMetadata && <MetadataPanel onClose={() => setShowMetadata(false)} />}
        {showDatasets && <DatasetPanel onClose={() => setShowDatasets(false)} />}
        {showStyling && <StylingPanel isOpen={showStyling} onClose={() => setShowStyling(false)} />}
        {showExamples && <ExamplesPanel onClose={() => setShowExamples(false)} />}
        {showOutline && <BlockOutlinePanel onClose={() => setShowOutline(false)} />}

        {/* Editor Pane */}
        {(viewMode === 'edit' || viewMode === 'split') && (
          <div className={clsx(
            "flex-1 min-w-0 transition-all duration-300",
            viewMode === 'split'
              ? "h-full overflow-y-auto bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 py-6 pr-6 pl-14"
              : "bg-white dark:bg-gray-900 min-h-[800px] shadow-sm rounded-xl border border-gray-200 dark:border-gray-800 py-8 pr-8 pl-14 md:p-12 mb-20"
          )}>
            <ReportEditor />
          </div>
        )}

        {/* Preview Pane */}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div className={clsx(
            "flex-1 min-w-0 transition-all duration-300",
            viewMode === 'split' ? "h-full overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm" : ""
          )}>
            <ReportPreview />
          </div>
        )}
      </div>
    </MainLayout>
  );
}

function App() {
  return (
    <ReportProvider>
      <ExecutionProvider>
        <ToastProvider>
          <DatasetSync />
          <MainContent />
        </ToastProvider>
      </ExecutionProvider>
    </ReportProvider>
  );
}

export default App;
