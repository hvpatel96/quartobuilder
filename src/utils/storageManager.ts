import { saveAs } from 'file-saver';
import type { ReportBlock, ReportMetadata } from '../types';

interface ReportConfig {
    version: string;
    timestamp: string;
    metadata: ReportMetadata;
    blocks: ReportBlock[];
}

export const saveConfiguration = (blocks: ReportBlock[], metadata: ReportMetadata) => {
    const config: ReportConfig = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        metadata,
        blocks
    };

    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    saveAs(blob, `quarto-report-config-${new Date().toISOString().split('T')[0]}.json`);
};

export const loadConfiguration = (file: File): Promise<{ blocks: ReportBlock[], metadata: ReportMetadata }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const json = e.target?.result as string;
                const config = JSON.parse(json) as ReportConfig;

                // Basic validation
                if (!config.blocks || !Array.isArray(config.blocks)) {
                    throw new Error("Invalid configuration file: 'blocks' is missing or invalid.");
                }
                if (!config.metadata) {
                    throw new Error("Invalid configuration file: 'metadata' is missing.");
                }

                // Validate block structure
                const validTypes = ['text', 'code', 'image', 'html', 'layout', 'pagebreak'];
                for (const block of config.blocks) {
                    if (!block.id || typeof block.id !== 'string') {
                        throw new Error("Invalid block: missing or invalid 'id'.");
                    }
                    if (!validTypes.includes(block.type)) {
                        throw new Error(`Invalid block type: '${block.type}'.`);
                    }
                    if (typeof block.content !== 'string') {
                        throw new Error(`Invalid block content for block '${block.id}'.`);
                    }
                }

                // Validate metadata format
                const validFormats = ['html', 'pdf', 'docx'];
                if (!validFormats.includes(config.metadata.format)) {
                    throw new Error(`Invalid format: '${config.metadata.format}'.`);
                }

                resolve({ blocks: config.blocks, metadata: config.metadata });
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsText(file);
    });
};
