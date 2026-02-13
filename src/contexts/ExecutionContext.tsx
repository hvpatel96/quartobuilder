import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import type { ExecutionResult, WorkerResponse } from '../services/execution/types';

interface ExecutionContextType {
    runR: (code: string, id: string) => Promise<void>;
    runPython: (code: string, id: string) => Promise<void>;
    writeFile: (filename: string, content: string | ArrayBuffer) => Promise<void>;
    results: Record<string, ExecutionResult[]>;
    isReady: { r: boolean; python: boolean };
    isRunning: Record<string, boolean>;
    clearResults: (id: string) => void;
}

const ExecutionContext = createContext<ExecutionContextType | undefined>(undefined);

export const useExecution = () => {
    const context = useContext(ExecutionContext);
    if (!context) {
        throw new Error('useExecution must be used within an ExecutionProvider');
    }
    return context;
};

export const ExecutionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [results, setResults] = useState<Record<string, ExecutionResult[]>>({});
    const [isReady, setIsReady] = useState({ r: false, python: false });
    const [isRunning, setIsRunning] = useState<Record<string, boolean>>({});

    const rWorker = useRef<Worker | null>(null);
    const pythonWorker = useRef<Worker | null>(null);

    useEffect(() => {
        // Initialize R Worker
        rWorker.current = new Worker(new URL('../services/execution/r-worker.ts', import.meta.url), { type: 'module' });
        rWorker.current.onmessage = (e: MessageEvent<WorkerResponse>) => handleWorkerMessage(e, 'r');
        rWorker.current.postMessage({ type: 'init' });

        // Initialize Python Worker
        pythonWorker.current = new Worker(new URL('../services/execution/python-worker.ts', import.meta.url), { type: 'module' });
        pythonWorker.current.onmessage = (e: MessageEvent<WorkerResponse>) => handleWorkerMessage(e, 'python');
        pythonWorker.current.postMessage({ type: 'init' });

        return () => {
            rWorker.current?.terminate();
            pythonWorker.current?.terminate();
        };
    }, []);

    const handleWorkerMessage = useCallback((e: MessageEvent<WorkerResponse>, lang: 'r' | 'python') => {
        const { type } = e.data;

        if (type === 'loaded') {
            setIsReady(prev => ({ ...prev, [lang]: true }));
        } else if (type === 'output' && e.data.id) {
            const { id, result } = e.data;
            setResults(prev => ({
                ...prev,
                [id]: [...(prev[id] || []), result]
            }));
        } else if (type === 'complete' && e.data.id) {
            const { id } = e.data;
            setIsRunning(prev => ({ ...prev, [id]: false }));
        } else if (type === 'error') {
            const { id, error } = e.data;
            if (id) {
                setResults(prev => ({
                    ...prev,
                    [id]: [...(prev[id] || []), { type: 'text', content: `Error: ${error}` }]
                }));
                setIsRunning(prev => ({ ...prev, [id]: false }));
            } else {
                console.error(`Worker error (${lang}):`, error);
            }
        }
    }, []);

    const runR = useCallback(async (code: string, id: string) => {
        if (!rWorker.current || !isReady.r) return;
        setIsRunning(prev => ({ ...prev, [id]: true }));
        setResults(prev => ({ ...prev, [id]: [] }));
        rWorker.current.postMessage({ type: 'run', code, id });
    }, [isReady.r]);

    const runPython = useCallback(async (code: string, id: string) => {
        if (!pythonWorker.current || !isReady.python) return;
        setIsRunning(prev => ({ ...prev, [id]: true }));
        setResults(prev => ({ ...prev, [id]: [] }));
        pythonWorker.current.postMessage({ type: 'run', code, id });
    }, [isReady.python]);

    const writeFile = useCallback(async (filename: string, content: string | ArrayBuffer) => {
        // Broadcast to both workers if they are running
        if (rWorker.current) {
            rWorker.current.postMessage({ type: 'writeFile', filename, content });
        }
        if (pythonWorker.current) {
            // If binary, we might need to transfer or copy. 
            // postMessage structures structured clone, which handles ArrayBuffer.
            pythonWorker.current.postMessage({ type: 'writeFile', filename, content });
        }
    }, []);

    const clearResults = useCallback((id: string) => {
        setResults(prev => {
            const next = { ...prev };
            delete next[id];
            return next;
        });
    }, []);

    return (
        <ExecutionContext.Provider value={{ runR, runPython, writeFile, results, isReady, isRunning, clearResults }}>
            {children}
        </ExecutionContext.Provider>
    );
};
