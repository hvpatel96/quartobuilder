import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { ReportBlock, BlockType, ReportMetadata } from '../types';

interface ReportContextType {
    blocks: ReportBlock[];
    metadata: ReportMetadata;
    addBlock: (type: BlockType, parentId?: string, columnId?: string) => void;
    updateBlock: (id: string, updates: Partial<ReportBlock>) => void;
    removeBlock: (id: string) => void;
    moveBlock: (id: string, direction: 'up' | 'down') => void;
    updateMetadata: (updates: Partial<ReportMetadata>) => void;
}

const ReportContext = createContext<ReportContextType | undefined>(undefined);

const generateId = () => Math.random().toString(36).substr(2, 9);

export const ReportProvider = ({ children }: { children: ReactNode }) => {
    const [blocks, setBlocks] = useState<ReportBlock[]>([
        { id: generateId(), type: 'text', content: '# Welcome to Quarto Builder\n\nStart editing your report by adding blocks below.' }
    ]);
    const [metadata, setMetadata] = useState<ReportMetadata>({
        title: 'Untitled Report',
        author: 'Anonymous',
        date: new Date().toISOString().split('T')[0],
        format: 'html'
    });

    // Helper to recursively finding a parent column or root array
    const findContainer = (list: ReportBlock[], id: string): ReportBlock[] | null => {
        const index = list.findIndex(b => b.id === id);
        if (index !== -1) return list;

        for (const block of list) {
            if (block.columns) {
                for (const col of block.columns) {
                    const found = findContainer(col.blocks, id);
                    if (found) return found;
                }
            }
        }
        return null;
    };

    // Helper to insert block into a specific column or root
    const insertBlock = (list: ReportBlock[], parentId: string, columnId: string, newBlock: ReportBlock): ReportBlock[] => {
        // If searching for root, parentId is undefined (handled by caller usually)
        return list.map(block => {
            if (block.id === parentId && block.columns) {
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
            if (block.columns) {
                return {
                    ...block,
                    columns: block.columns.map(col => ({
                        ...col,
                        blocks: insertBlock(col.blocks, parentId, columnId, newBlock)
                    }))
                };
            }
            return block;
        });
    };

    // Helper recursive update
    const updateRecursive = (list: ReportBlock[], id: string, updates: Partial<ReportBlock>): ReportBlock[] => {
        return list.map(block => {
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

    // Helper recursive remove
    const removeRecursive = (list: ReportBlock[], id: string): ReportBlock[] => {
        // Check if block is in this list
        if (list.some(b => b.id === id)) {
            return list.filter(b => b.id !== id);
        }
        // Otherwise search deeper
        return list.map(block => {
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

    const addBlock = (type: BlockType, parentId?: string, columnId?: string) => {
        const newBlock: ReportBlock = {
            id: generateId(),
            type,
            content: '',
            language: type === 'code' ? 'python' : undefined
        };

        if (type === 'layout') {
            newBlock.columns = [
                { id: generateId(), width: 50, blocks: [] },
                { id: generateId(), width: 50, blocks: [] }
            ];
        }

        if (parentId && columnId) {
            setBlocks(prev => insertBlock(prev, parentId, columnId, newBlock));
        } else {
            setBlocks(prev => [...prev, newBlock]);
        }
    };

    const updateBlock = (id: string, updates: Partial<ReportBlock>) => {
        setBlocks(prev => updateRecursive(prev, id, updates));
    };

    const removeBlock = (id: string) => {
        setBlocks(prev => removeRecursive(prev, id));
    };

    const moveBlock = (id: string, direction: 'up' | 'down') => {
        setBlocks(prev => {
            // We need to find the specific list containing this block to swap
            // This is tricky with immutable deep updates.
            // Simplification: We traverse and if we find the block in current children, we swap.

            const moveInList = (list: ReportBlock[]): ReportBlock[] => {
                const index = list.findIndex(b => b.id === id);
                if (index !== -1) {
                    if (direction === 'up' && index === 0) return list;
                    if (direction === 'down' && index === list.length - 1) return list;

                    const newBlocks = [...list];
                    const swapIndex = direction === 'up' ? index - 1 : index + 1;
                    [newBlocks[index], newBlocks[swapIndex]] = [newBlocks[swapIndex], newBlocks[index]];
                    return newBlocks;
                }

                return list.map(block => {
                    if (block.columns) {
                        return {
                            ...block,
                            columns: block.columns.map(col => ({
                                ...col,
                                blocks: moveInList(col.blocks)
                            }))
                        };
                    }
                    return block;
                });
            };

            return moveInList(prev);
        });
    };

    const updateMetadata = (updates: Partial<ReportMetadata>) => {
        setMetadata(prev => ({ ...prev, ...updates }));
    };

    return (
        <ReportContext.Provider value={{ blocks, metadata, addBlock, updateBlock, removeBlock, moveBlock, updateMetadata }}>
            {children}
        </ReportContext.Provider>
    );
};

export const useReport = () => {
    const context = useContext(ReportContext);
    if (!context) {
        throw new Error('useReport must be used within a ReportProvider');
    }
    return context;
};
