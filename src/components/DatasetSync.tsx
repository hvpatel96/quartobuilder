import { useEffect } from 'react';
import { useReport } from '../contexts/ReportContext';
import { useExecution } from '../contexts/ExecutionContext';
import { getDatasetContent } from '../utils/datasetStorage';

export const DatasetSync = () => {
    const { datasets } = useReport();
    const { writeFile, isReady } = useExecution();

    useEffect(() => {
        const syncDatasets = async () => {
            if (!isReady.r && !isReady.python) return;

            console.log("Syncing datasets to workers:", datasets.length);

            for (const dataset of datasets) {
                try {
                    // Read content from IndexedDB
                    const content = await getDatasetContent(dataset.id);
                    if (content) {
                        await writeFile(dataset.name, content);
                        console.log(`Synced ${dataset.name}`);
                    } else {
                        console.warn(`No content found in IndexedDB for ${dataset.name}`);
                    }
                } catch (err) {
                    console.error(`Failed to sync ${dataset.name}`, err);
                }
            }
        };

        syncDatasets();
    }, [datasets, isReady, writeFile]);

    return null; // Headless component
};
