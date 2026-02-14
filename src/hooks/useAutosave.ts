import { useEffect, useRef } from 'react';
import type { ReportBlock, ReportMetadata, Dataset } from '../types';

const AUTOSAVE_KEY = 'quartobuilder-autosave';
const DEBOUNCE_MS = 1000;

interface AutosaveData {
    blocks: ReportBlock[];
    metadata: ReportMetadata;
    datasets: Dataset[];
    timestamp: string;
}

export function useAutosave(blocks: ReportBlock[], metadata: ReportMetadata, datasets: Dataset[]) {
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Debounced save
    useEffect(() => {
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => {
            const data: AutosaveData = {
                blocks,
                metadata,
                datasets,
                timestamp: new Date().toISOString(),
            };
            try {
                localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(data));
            } catch {
                // localStorage full or unavailable — silently ignore
            }
        }, DEBOUNCE_MS);

        return () => {
            if (timer.current) clearTimeout(timer.current);
        };
    }, [blocks, metadata, datasets]);

    return null;
}

export function getAutosaveData(): AutosaveData | null {
    try {
        const raw = localStorage.getItem(AUTOSAVE_KEY);
        if (!raw) return null;
        const data = JSON.parse(raw) as AutosaveData;
        if (!data.blocks || !Array.isArray(data.blocks) || !data.metadata) return null;
        return data;
    } catch {
        return null;
    }
}

export function clearAutosave(): void {
    localStorage.removeItem(AUTOSAVE_KEY);
}
