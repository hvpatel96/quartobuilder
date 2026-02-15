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

    // Refs to avoid stale closure issues — always hold the latest values
    const historyRef = useRef(history);
    historyRef.current = history;
    const pointerRef = useRef(pointer);
    pointerRef.current = pointer;

    const canUndo = pointer > 0;
    const canRedo = pointer < history.length - 1;

    const pushState = useCallback((blocks: ReportBlock[], metadata: ReportMetadata, debounce = false) => {
        const commitEntry = () => {
            const currentPointer = pointerRef.current;
            setHistory(prev => {
                // Discard any future states after the current pointer
                const newHistory = prev.slice(0, currentPointer + 1);
                newHistory.push({ blocks: JSON.parse(JSON.stringify(blocks)), metadata: JSON.parse(JSON.stringify(metadata)) });
                // Cap at MAX_HISTORY
                if (newHistory.length > MAX_HISTORY) {
                    newHistory.shift();
                }
                return newHistory;
            });
            setPointer(prev => {
                const currentLen = pointerRef.current + 2; // after push, length = pointer + 2
                return Math.min(prev + 1, currentLen > MAX_HISTORY ? MAX_HISTORY - 1 : prev + 1);
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
    }, []); // No dependencies needed — uses refs for mutable state

    const undo = useCallback((): HistoryEntry | null => {
        const currentPointer = pointerRef.current;
        const currentHistory = historyRef.current;
        if (currentPointer <= 0) return null;
        const newPointer = currentPointer - 1;
        setPointer(newPointer);
        const entry = currentHistory[newPointer];
        return { blocks: JSON.parse(JSON.stringify(entry.blocks)), metadata: JSON.parse(JSON.stringify(entry.metadata)) };
    }, []);

    const redo = useCallback((): HistoryEntry | null => {
        const currentPointer = pointerRef.current;
        const currentHistory = historyRef.current;
        if (currentPointer >= currentHistory.length - 1) return null;
        const newPointer = currentPointer + 1;
        setPointer(newPointer);
        const entry = currentHistory[newPointer];
        return { blocks: JSON.parse(JSON.stringify(entry.blocks)), metadata: JSON.parse(JSON.stringify(entry.metadata)) };
    }, []);

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
