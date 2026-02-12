import { useState } from 'react';
import { ReportProvider, useReport } from './contexts/ReportContext';
import { MainLayout } from './layouts/MainLayout';
import { ReportEditor } from './components/editor/ReportEditor';
import { ReportPreview } from './components/preview/ReportPreview';
import { MetadataPanel } from './components/metadata/MetadataPanel';
import { exportReport } from './utils/exportManager';
import { clsx } from 'clsx';

function MainContent() {
  const { blocks, metadata, viewMode } = useReport();
  const [showMetadata, setShowMetadata] = useState(false);

  const handleExport = async () => {
    try {
      await exportReport(blocks, metadata);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export report.");
    }
  };

  return (
    <MainLayout onExport={handleExport} onToggleMetadata={() => setShowMetadata(!showMetadata)}>
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
