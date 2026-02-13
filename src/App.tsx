import { useState } from 'react';
import { ReportProvider, useReport } from './contexts/ReportContext';
import { MainLayout } from './layouts/MainLayout';
import { ReportEditor } from './components/editor/ReportEditor';
import { ReportPreview } from './components/preview/ReportPreview';
import { MetadataPanel } from './components/metadata/MetadataPanel';
import { DatasetPanel } from './components/editor/DatasetPanel';
import { exportReport } from './utils/exportManager';
import { saveConfiguration, loadConfiguration } from './utils/storageManager';
import { clsx } from 'clsx';

function MainContent() {
  const { blocks, metadata, viewMode, loadReport, datasets } = useReport();
  const [showMetadata, setShowMetadata] = useState(false);
  const [showDatasets, setShowDatasets] = useState(false);

  const handleExport = async () => {
    try {
      await exportReport(blocks, metadata, datasets);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export report.");
    }
  };

  const handleSave = () => {
    saveConfiguration(blocks, metadata);
  };

  const handleLoad = async (file: File) => {
    try {
      const config = await loadConfiguration(file);
      loadReport(config.blocks, config.metadata);
    } catch (error) {
      console.error("Failed to load configuration", error);
      alert("Failed to load configuration file.");
    }
  };

  return (
    <MainLayout
      onExport={handleExport}
      onSave={handleSave}
      onLoad={handleLoad}
      onToggleMetadata={() => { setShowMetadata(!showMetadata); setShowDatasets(false); }}
      onToggleDatasets={() => { setShowDatasets(!showDatasets); setShowMetadata(false); }}
    >
      <div className={clsx(
        "h-full w-full transition-all duration-300",
        viewMode === 'split' ? "flex gap-4" : "max-w-4xl mx-auto"
      )}>
        {/* Editor Pane */}
        {(viewMode === 'edit' || viewMode === 'split') && (
          <div className={clsx(
            "flex-1 min-w-0 transition-all duration-300",
            viewMode === 'split'
              ? "h-full overflow-y-auto bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6"
              : "bg-white dark:bg-gray-900 min-h-[800px] shadow-sm rounded-xl border border-gray-200 dark:border-gray-800 p-8 md:p-12 mb-20"
          )}>
            {showMetadata && <MetadataPanel onClose={() => setShowMetadata(false)} />}
            {showDatasets && <DatasetPanel onClose={() => setShowDatasets(false)} />}
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
      <MainContent />
    </ReportProvider>
  );
}

export default App;
