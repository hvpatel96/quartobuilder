import { useState, useEffect, useCallback, useRef } from 'react';
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
import { ErrorBoundary } from './components/ErrorBoundary';
import { exportReport } from './utils/exportManager';
import { saveConfiguration, loadConfiguration } from './utils/storageManager';
import { clsx } from 'clsx';
import { DatasetSync } from './components/DatasetSync';
import { useAutosave, getAutosaveData, clearAutosave } from './hooks/useAutosave';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useTheme } from './hooks/useTheme';

type PanelName = 'metadata' | 'datasets' | 'styling' | 'examples' | 'outline';

function MainContent() {
  const { blocks, metadata, viewMode, loadReport, datasets, resetReport, undo, redo, canUndo, canRedo } = useReport();
  const { addToast } = useToast();

  // Single activePanel state replaces 5 separate booleans
  const [activePanel, setActivePanel] = useState<PanelName | null>(null);
  const togglePanel = useCallback((name: PanelName) => {
    // Outline is modal, so it can coexist with others; all others are mutually exclusive
    if (name === 'outline') {
      setActivePanel(prev => prev === 'outline' ? null : 'outline');
    } else {
      setActivePanel(prev => prev === name ? null : name);
    }
  }, []);

  const [showRestoreBanner, setShowRestoreBanner] = useState(false);
  const [autosaveTimestamp, setAutosaveTimestamp] = useState<string | null>(null);
  const { theme, cycleTheme } = useTheme();

  // Track whether the report has unsaved changes
  const hasUnsavedRef = useRef(false);

  // Autosave
  useAutosave(blocks, metadata, datasets);

  // Mark as dirty whenever content changes (after initial mount)
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    hasUnsavedRef.current = true;
  }, [blocks, metadata]);

  // beforeunload warning for unsaved changes
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (hasUnsavedRef.current) {
        e.preventDefault();
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, []);

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

  const handleExport = useCallback(async () => {
    try {
      await exportReport(blocks, metadata, datasets);
      addToast('Report exported successfully!', 'success');
    } catch (error) {
      console.error("Export failed:", error);
      addToast('Failed to export report.', 'error');
    }
  }, [blocks, metadata, datasets, addToast]);

  const handleSave = useCallback(() => {
    saveConfiguration(blocks, metadata);
    hasUnsavedRef.current = false;
    addToast('Configuration saved!', 'success');
  }, [blocks, metadata, addToast]);

  const handleLoad = async (file: File) => {
    try {
      const config = await loadConfiguration(file);
      loadReport(config.blocks, config.metadata);
      hasUnsavedRef.current = false;
      addToast('Configuration loaded!', 'success');
    } catch (error) {
      console.error("Failed to load configuration", error);
      addToast('Failed to load configuration file.', 'error');
    }
  };

  const handleNew = () => {
    if (confirm("Are you sure you want to create a new report? Unsaved changes will be lost.")) {
      resetReport();
      hasUnsavedRef.current = false;
    }
  };

  // Keyboard shortcuts — use refs for stable action references to avoid re-registering listeners
  const actionsRef = useRef({ onUndo: undo, onRedo: redo, onSave: handleSave, onExport: handleExport });
  actionsRef.current = { onUndo: undo, onRedo: redo, onSave: handleSave, onExport: handleExport };

  const stableActions = useRef({
    onUndo: () => actionsRef.current.onUndo(),
    onRedo: () => actionsRef.current.onRedo(),
    onSave: () => actionsRef.current.onSave(),
    onExport: () => actionsRef.current.onExport(),
  });
  useKeyboardShortcuts(stableActions.current);

  return (
    <MainLayout
      onExport={handleExport}
      onSave={handleSave}
      onLoad={handleLoad}
      onNew={handleNew}

      onToggleMetadata={() => togglePanel('metadata')}
      onToggleDatasets={() => togglePanel('datasets')}
      onToggleStyling={() => togglePanel('styling')}
      onToggleExamples={() => togglePanel('examples')}
      onToggleOutline={() => togglePanel('outline')}
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
        {activePanel === 'metadata' && <MetadataPanel onClose={() => setActivePanel(null)} />}
        {activePanel === 'datasets' && <DatasetPanel onClose={() => setActivePanel(null)} />}
        {activePanel === 'styling' && <StylingPanel isOpen={true} onClose={() => setActivePanel(null)} />}
        {activePanel === 'examples' && <ExamplesPanel onClose={() => setActivePanel(null)} />}
        {activePanel === 'outline' && <BlockOutlinePanel onClose={() => setActivePanel(null)} />}

        {/* Editor Pane */}
        {(viewMode === 'edit' || viewMode === 'split') && (
          <div className={clsx(
            "flex-1 min-w-0 transition-all duration-300",
            viewMode === 'split'
              ? "h-full overflow-y-auto bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 py-6 pr-6 pl-14"
              : "bg-white dark:bg-gray-900 min-h-[800px] shadow-sm rounded-xl border border-gray-200 dark:border-gray-800 py-8 pr-8 pl-14 md:p-12 mb-20"
          )}>
            <ErrorBoundary>
              <ReportEditor />
            </ErrorBoundary>
          </div>
        )}

        {/* Preview Pane */}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div className={clsx(
            "flex-1 min-w-0 transition-all duration-300",
            viewMode === 'split' ? "h-full overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm" : ""
          )}>
            <ErrorBoundary>
              <ReportPreview />
            </ErrorBoundary>
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
