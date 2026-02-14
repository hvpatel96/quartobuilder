import { useState, useRef, useCallback } from 'react';
import type { ReportBlock, ReportMetadata } from '../types';

interface HistoryEntry {
    blocks: ReportBlock[];
    metadata: ReportMetadata;
}

const MAX_HISTORY = 50;

export function useHistory(initialBlocks: ReportBlock[], initialMetadata: ReportMetadata) {
    const [history, setHistory] = useState<HistoryEntry[]>([{ blocks: initialBlocks, metadata: initialMetadata }]);
    const [pointer, setPointer] = useState(0);
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const canUndo = pointer > 0;
    const canRedo = pointer < history.length - 1;

    const pushState = useCallback((blocks: ReportBlock[], metadata: ReportMetadata, debounce = false) => {
        const commitEntry = () => {
            setHistory(prev => {
                // Discard any future states after the current pointer
                const newHistory = prev.slice(0, pointer + 1);
                newHistory.push({ blocks: JSON.parse(JSON.stringify(blocks)), metadata: JSON.parse(JSON.stringify(metadata)) });
                // Cap at MAX_HISTORY
                if (newHistory.length > MAX_HISTORY) {
                    newHistory.shift();
                    return newHistory;
                }
                return newHistory;
            });
            setPointer(prev => {
                // We need to account for potential shift
                return Math.min(prev + 1, MAX_HISTORY - 1);
            });
        };

        if (debounce) {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
            debounceTimer.current = setTimeout(commitEntry, 500);
        } else {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
                debounceTimer.current = null;
            }
            commitEntry();
        }
    }, [pointer]);

    const undo = useCallback((): HistoryEntry | null => {
        if (!canUndo) return null;
        const newPointer = pointer - 1;
        setPointer(newPointer);
        const entry = history[newPointer];
        return { blocks: JSON.parse(JSON.stringify(entry.blocks)), metadata: JSON.parse(JSON.stringify(entry.metadata)) };
    }, [canUndo, pointer, history]);

    const redo = useCallback((): HistoryEntry | null => {
        if (!canRedo) return null;
        const newPointer = pointer + 1;
        setPointer(newPointer);
        const entry = history[newPointer];
        return { blocks: JSON.parse(JSON.stringify(entry.blocks)), metadata: JSON.parse(JSON.stringify(entry.metadata)) };
    }, [canRedo, pointer, history]);

    const resetHistory = useCallback((blocks: ReportBlock[], metadata: ReportMetadata) => {
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
            debounceTimer.current = null;
        }
        setHistory([{ blocks: JSON.parse(JSON.stringify(blocks)), metadata: JSON.parse(JSON.stringify(metadata)) }]);
        setPointer(0);
    }, []);

    return { pushState, undo, redo, canUndo, canRedo, resetHistory };
}
