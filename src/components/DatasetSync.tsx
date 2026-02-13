import { useEffect } from 'react';
import { useReport } from '../contexts/ReportContext';
import { useExecution } from '../contexts/ExecutionContext';

export const DatasetSync = () => {
    const { datasets } = useReport();
    const { writeFile, isReady } = useExecution();

    useEffect(() => {
        const syncDatasets = async () => {
            if (!isReady.r && !isReady.python) return;

            console.log("Syncing datasets to workers:", datasets.length);

            for (const dataset of datasets) {
                try {
                    await writeFile(dataset.name, dataset.content);
                    console.log(`Synced ${dataset.name}`);
                } catch (err) {
                    console.error(`Failed to sync ${dataset.name}`, err);
                }
            }
        };

        syncDatasets();
    }, [datasets, isReady, writeFile]);

    return null; // Headless component
};
