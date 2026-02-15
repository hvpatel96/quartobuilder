import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { ReportBlock, BlockType, ReportMetadata, Dataset } from '../types';
import { useHistory } from '../hooks/useHistory';
import { saveDatasetContent, deleteDatasetContent, clearAllDatasetContent } from '../utils/datasetStorage';

interface ReportContextType {
    blocks: ReportBlock[];
    metadata: ReportMetadata;
    viewMode: 'edit' | 'split' | 'preview';
    setViewMode: (mode: 'edit' | 'split' | 'preview') => void;
    addBlock: (type: BlockType, parentId?: string, columnId?: string) => void;
    updateBlock: (id: string, updates: Partial<ReportBlock>) => void;
    removeBlock: (id: string) => void;
    moveBlock: (id: string, direction: 'up' | 'down') => void;
    updateBlockOrder: (newBlocks: ReportBlock[]) => void;
    loadReport: (blocks: ReportBlock[], metadata: ReportMetadata) => void;
    updateMetadata: (updates: Partial<ReportMetadata>) => void;
    datasets: Dataset[];
    addDataset: (dataset: Dataset) => void;
    removeDataset: (id: string) => void;
    resetReport: () => void;
    undo: () => void;
    redo: () => void;
    canUndo: boolean;
    canRedo: boolean;
    duplicateBlock: (id: string) => void;
}

const defaultContext: ReportContextType = {
    blocks: [],
    metadata: {
        title: '',
        author: '',
        date: '',
        format: 'html'
    },
    viewMode: 'edit',
    setViewMode: () => { },
    addBlock: () => { },
    updateBlock: () => { },
    removeBlock: () => { },
    moveBlock: () => { },
    updateBlockOrder: () => { },
    loadReport: () => { },
    updateMetadata: () => { },
    datasets: [],
    addDataset: () => { },
    removeDataset: () => { },
    resetReport: () => { },
    undo: () => { },
    redo: () => { },
    canUndo: false,
    canRedo: false,
    duplicateBlock: () => { },
};

const ReportContext = createContext<ReportContextType>(defaultContext);

export const useReport = () => useContext(ReportContext);

interface ReportProviderProps {
    children: ReactNode;
}

export const ReportProvider = ({ children }: ReportProviderProps) => {
    const [blocks, setBlocks] = useState<ReportBlock[]>([]);
    const [viewMode, setViewMode] = useState<'edit' | 'split' | 'preview'>('edit');
    const [metadata, setMetadata] = useState<ReportMetadata>({
        title: '',
        author: '',
        date: '',
        format: 'html'
    });
    const [datasets, setDatasets] = useState<Dataset[]>([]);

    const historyHook = useHistory([], { title: '', author: '', date: '', format: 'html' });

    const findContainer = (
        currentBlocks: ReportBlock[],
        parentId: string | undefined,
        columnId: string | undefined
    ): { container: ReportBlock[] | null, parentBlock: ReportBlock | null, column: any | null } => {
        // ... (Logic same as before, no changes needed here but including for completeness if overwriting)
        // Actually, to keep it short I will just implement the logic again.

        if (!parentId && !columnId) {
            return { container: currentBlocks, parentBlock: null, column: null };
        }

        for (const block of currentBlocks) {
            if (block.id === parentId) {
                // Found parent block
                if (block.type === 'layout' && block.columns && columnId) {
                    const col = block.columns.find(c => c.id === columnId);
                    if (col) {
                        return { container: col.blocks, parentBlock: block, column: col };
                    }
                }
                // If parent is not layout or no columnId, maybe valid for other nestable blocks later
                return { container: null, parentBlock: block, column: null };
            }
            // Recurse
            if (block.columns) {
                // Check columns
                for (const col of block.columns) {
                    const result = findContainer(col.blocks, parentId, columnId);
                    if (result.container) return result;
                }
            }
        }
        return { container: null, parentBlock: null, column: null };
    };

    // Helper to insert block into recursive structure
    const insertBlock = (
        currentBlocks: ReportBlock[],
        newBlock: ReportBlock,
        parentId: string | undefined,
        columnId: string | undefined
    ): ReportBlock[] => {
        if (!parentId && !columnId) {
            return [...currentBlocks, newBlock];
        }

        return currentBlocks.map(block => {
            if (block.id === parentId) {
                if (block.type === 'layout' && block.columns && columnId) {
                    return {
                        ...block,
                        columns: block.columns.map(col => {
                            if (col.id === columnId) {
                                return { ...col, blocks: [...col.blocks, newBlock] };
                            }
                            return col;
                        })
                    };
                }
            }
            if (block.columns) {
                return {
                    ...block,
                    columns: block.columns.map(col => ({
                        ...col,
                        blocks: insertBlock(col.blocks, newBlock, parentId, columnId)
                    }))
                };
            }
            return block;
        });
    };

    const addBlock = (type: BlockType, parentId?: string, columnId?: string) => {
        const newBlock: ReportBlock = {
            id: crypto.randomUUID(),
            type,
            content: '',
            language: type === 'code' ? 'r' : undefined,
            columns: type === 'layout' ? [
                { id: crypto.randomUUID(), width: 50, blocks: [] },
                { id: crypto.randomUUID(), width: 50, blocks: [] }
            ] : undefined
        };

        setBlocks(prev => {
            const next = insertBlock(prev, newBlock, parentId, columnId);
            historyHook.pushState(next, metadata);
            return next;
        });
    };

    const updateRecursive = (currentBlocks: ReportBlock[], id: string, updates: Partial<ReportBlock>): ReportBlock[] => {
        return currentBlocks.map(block => {
            if (block.id === id) {
                return { ...block, ...updates };
            }
            if (block.columns) {
                return {
                    ...block,
                    columns: block.columns.map(col => ({
                        ...col,
                        blocks: updateRecursive(col.blocks, id, updates)
                    }))
                };
            }
            return block;
        });
    };

    const updateBlock = (id: string, updates: Partial<ReportBlock>) => {
        const isContentOnly = Object.keys(updates).length === 1 && 'content' in updates;
        setBlocks(prev => {
            const next = updateRecursive(prev, id, updates);
            historyHook.pushState(next, metadata, isContentOnly);
            return next;
        });
    };

    const removeRecursive = (currentBlocks: ReportBlock[], id: string): ReportBlock[] => {
        return currentBlocks.filter(block => block.id !== id).map(block => {
            if (block.columns) {
                return {
                    ...block,
                    columns: block.columns.map(col => ({
                        ...col,
                        blocks: removeRecursive(col.blocks, id)
                    }))
                };
            }
            return block;
        });
    };

    const removeBlock = (id: string) => {
        setBlocks(prev => {
            const next = removeRecursive(prev, id);
            historyHook.pushState(next, metadata);
            return next;
        });
    };

    const moveInList = (list: ReportBlock[], id: string, direction: 'up' | 'down'): ReportBlock[] => {
        const index = list.findIndex(b => b.id === id);
        if (index === -1) return list;

        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= list.length) return list;

        const newList = [...list];
        [newList[index], newList[newIndex]] = [newList[newIndex], newList[index]];
        return newList;
    };

    const moveRecursive = (currentBlocks: ReportBlock[], id: string, direction: 'up' | 'down'): ReportBlock[] => {
        // Try to move at this level first
        if (currentBlocks.some(b => b.id === id)) {
            return moveInList(currentBlocks, id, direction);
        }

        // Recurse
        return currentBlocks.map(block => {
            if (block.columns) {
                return {
                    ...block,
                    columns: block.columns.map(col => ({
                        ...col,
                        blocks: moveRecursive(col.blocks, id, direction)
                    }))
                };
            }
            return block;
        });
    };


    const moveBlock = (id: string, direction: 'up' | 'down') => {
        setBlocks(prev => {
            const next = moveRecursive(prev, id, direction);
            historyHook.pushState(next, metadata);
            return next;
        });
    };

    const updateBlockOrder = (newBlocks: ReportBlock[]) => {
        setBlocks(newBlocks);
        historyHook.pushState(newBlocks, metadata);
    };

    const loadReport = (newBlocks: ReportBlock[], newMetadata: ReportMetadata) => {
        setBlocks(newBlocks);
        setMetadata(newMetadata);
        historyHook.resetHistory(newBlocks, newMetadata);
    };

    const updateMetadata = (updates: Partial<ReportMetadata>) => {
        setMetadata(prev => {
            const next = { ...prev, ...updates };
            historyHook.pushState(blocks, next, true);
            return next;
        });
    };

    const addDataset = (dataset: Dataset) => {
        // Save content to IndexedDB, then store metadata-only in React state
        if (dataset.content !== undefined) {
            saveDatasetContent(dataset.id, dataset.content).catch(err =>
                console.error('Failed to save dataset content to IndexedDB:', err)
            );
        }
        // Strip content from React state — it lives in IndexedDB now
        const { content: _content, ...meta } = dataset;
        setDatasets(prev => [...prev, meta as Dataset]);
    };

    const removeDataset = (id: string) => {
        deleteDatasetContent(id).catch(err =>
            console.error('Failed to delete dataset content from IndexedDB:', err)
        );
        setDatasets(prev => prev.filter(d => d.id !== id));
    };

    const resetReport = () => {
        const emptyMeta: ReportMetadata = { title: '', author: '', date: '', format: 'html' };
        setBlocks([]);
        setMetadata(emptyMeta);
        setDatasets([]);
        clearAllDatasetContent().catch(err =>
            console.error('Failed to clear dataset content from IndexedDB:', err)
        );
        historyHook.resetHistory([], emptyMeta);
    };

    // Deep clone a block with new IDs
    const deepCloneBlock = (block: ReportBlock): ReportBlock => {
        const cloned: ReportBlock = {
            ...block,
            id: crypto.randomUUID(),
            content: block.content,
            metadata: block.metadata ? structuredClone(block.metadata) : undefined,
        };
        if (block.columns) {
            cloned.columns = block.columns.map(col => ({
                id: crypto.randomUUID(),
                width: col.width,
                blocks: col.blocks.map(deepCloneBlock),
            }));
        }
        return cloned;
    };

    const duplicateBlockInList = (currentBlocks: ReportBlock[], id: string): ReportBlock[] => {
        const result: ReportBlock[] = [];
        for (const block of currentBlocks) {
            result.push(block);
            if (block.id === id) {
                result.push(deepCloneBlock(block));
            } else if (block.columns) {
                // Check if the target is inside this block's columns
                const updatedBlock = {
                    ...block,
                    columns: block.columns.map(col => ({
                        ...col,
                        blocks: duplicateBlockInList(col.blocks, id),
                    })),
                };
                result[result.length - 1] = updatedBlock;
            }
        }
        return result;
    };

    const duplicateBlock = (id: string) => {
        setBlocks(prev => {
            const next = duplicateBlockInList(prev, id);
            historyHook.pushState(next, metadata);
            return next;
        });
    };

    const undo = useCallback(() => {
        const entry = historyHook.undo();
        if (entry) {
            setBlocks(entry.blocks);
            setMetadata(entry.metadata);
        }
    }, [historyHook]);

    const redo = useCallback(() => {
        const entry = historyHook.redo();
        if (entry) {
            setBlocks(entry.blocks);
            setMetadata(entry.metadata);
        }
    }, [historyHook]);

    return (
        <ReportContext.Provider value={{
            blocks, metadata, viewMode, setViewMode,
            addBlock, updateBlock, removeBlock, moveBlock, updateBlockOrder,
            loadReport, updateMetadata,
            datasets, addDataset, removeDataset,
            resetReport,
            undo, redo,
            canUndo: historyHook.canUndo,
            canRedo: historyHook.canRedo,
            duplicateBlock,
        }}>
            {children}
        </ReportContext.Provider>
    );
};
