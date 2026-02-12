import { MainLayout } from './layouts/MainLayout';
import { ReportEditor } from './components/editor/ReportEditor';
import { ReportProvider, useReport } from './contexts/ReportContext';
import { MetadataPanel } from './components/metadata/MetadataPanel';
import { useState } from 'react';


import { exportReport } from './utils/exportManager';

const ReportApp = () => {
  const { blocks, metadata } = useReport();
  const [showMetadata, setShowMetadata] = useState(false);

  const handleExport = async () => {
    await exportReport(blocks, metadata);
  };

  return (
    <MainLayout
      onExport={handleExport}
      onToggleMetadata={() => setShowMetadata(!showMetadata)}
    >
      <div className="flex gap-6">
        <div className="flex-1 min-w-0">
          <ReportEditor />
        </div>
        {showMetadata && (
          <div className="w-80 flex-shrink-0">
            <MetadataPanel onClose={() => setShowMetadata(false)} />
          </div>
        )}
      </div>
    </MainLayout>
  );
};

function App() {
  return (
    <ReportProvider>
      <ReportApp />
    </ReportProvider>
  );
}

export default App;
