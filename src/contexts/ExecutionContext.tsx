import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import type { ExecutionResult, WorkerResponse } from '../services/execution/types';

interface ExecutionContextType {
    runR: (code: string, id: string) => Promise<void>;
    runPython: (code: string, id: string) => Promise<void>;
    writeFile: (filename: string, content: string | ArrayBuffer) => Promise<void>;
    cancelExecution: (id: string) => void;
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

    // Track which block id maps to which language so cancel knows which worker to terminate
    const runningBlockLang = useRef<Record<string, 'r' | 'python'>>({});

    useEffect(() => {
        // Handler defined inside useEffect to avoid stale closure / missing dependency issues
        const handleWorkerMessage = (e: MessageEvent<WorkerResponse>, lang: 'r' | 'python') => {
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
                delete runningBlockLang.current[id];
            } else if (type === 'error') {
                const { id, error } = e.data;
                if (id) {
                    setResults(prev => ({
                        ...prev,
                        [id]: [...(prev[id] || []), { type: 'text', content: `Error: ${error}` }]
                    }));
                    setIsRunning(prev => ({ ...prev, [id]: false }));
                    delete runningBlockLang.current[id];
                } else {
                    console.error(`Worker error (${lang}):`, error);
                }
            }
        };

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

    const runR = useCallback(async (code: string, id: string) => {
        if (!rWorker.current || !isReady.r) return;
        setIsRunning(prev => ({ ...prev, [id]: true }));
        setResults(prev => ({ ...prev, [id]: [] }));
        runningBlockLang.current[id] = 'r';
        rWorker.current.postMessage({ type: 'run', code, id });
    }, [isReady.r]);

    const runPython = useCallback(async (code: string, id: string) => {
        if (!pythonWorker.current || !isReady.python) return;
        setIsRunning(prev => ({ ...prev, [id]: true }));
        setResults(prev => ({ ...prev, [id]: [] }));
        runningBlockLang.current[id] = 'python';
        pythonWorker.current.postMessage({ type: 'run', code, id });
    }, [isReady.python]);

    const createWorkerHandler = useCallback((lang: 'r' | 'python') => {
        return (e: MessageEvent<WorkerResponse>) => {
            const data = e.data;
            if (data.type === 'loaded') {
                setIsReady(prev => ({ ...prev, [lang]: true }));
            } else if (data.type === 'output' && data.id) {
                setResults(prev => ({
                    ...prev,
                    [data.id!]: [...(prev[data.id!] || []), data.result]
                }));
            } else if (data.type === 'complete' && data.id) {
                setIsRunning(prev => ({ ...prev, [data.id!]: false }));
                delete runningBlockLang.current[data.id!];
            } else if (data.type === 'error' && data.id) {
                setResults(prev => ({
                    ...prev,
                    [data.id!]: [...(prev[data.id!] || []), { type: 'text' as const, content: `Error: ${data.error}` }]
                }));
                setIsRunning(prev => ({ ...prev, [data.id!]: false }));
                delete runningBlockLang.current[data.id!];
            }
        };
    }, []);

    const cancelExecution = useCallback((id: string) => {
        const lang = runningBlockLang.current[id];
        if (!lang) return;

        // Terminate the worker and spawn a fresh one
        if (lang === 'r' && rWorker.current) {
            rWorker.current.terminate();
            rWorker.current = new Worker(new URL('../services/execution/r-worker.ts', import.meta.url), { type: 'module' });
            rWorker.current.onmessage = createWorkerHandler('r');
            setIsReady(prev => ({ ...prev, r: false }));
            rWorker.current.postMessage({ type: 'init' });
        } else if (lang === 'python' && pythonWorker.current) {
            pythonWorker.current.terminate();
            pythonWorker.current = new Worker(new URL('../services/execution/python-worker.ts', import.meta.url), { type: 'module' });
            pythonWorker.current.onmessage = createWorkerHandler('python');
            setIsReady(prev => ({ ...prev, python: false }));
            pythonWorker.current.postMessage({ type: 'init' });
        }

        // Mark block as cancelled
        setIsRunning(prev => ({ ...prev, [id]: false }));
        setResults(prev => ({
            ...prev,
            [id]: [...(prev[id] || []), { type: 'text', content: '⚠️ Execution cancelled' }]
        }));
        delete runningBlockLang.current[id];
    }, [createWorkerHandler]);

    const writeFile = useCallback(async (filename: string, content: string | ArrayBuffer) => {
        if (rWorker.current) {
            rWorker.current.postMessage({ type: 'writeFile', filename, content });
        }
        if (pythonWorker.current) {
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
        <ExecutionContext.Provider value={{ runR, runPython, writeFile, cancelExecution, results, isReady, isRunning, clearResults }}>
            {children}
        </ExecutionContext.Provider>
    );
};
