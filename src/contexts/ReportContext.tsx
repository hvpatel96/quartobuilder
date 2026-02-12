import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { ReportBlock, BlockType, ReportMetadata } from '../types';

interface ReportContextType {
    blocks: ReportBlock[];
    metadata: ReportMetadata;
    addBlock: (type: BlockType) => void;
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

    const addBlock = (type: BlockType) => {
        const newBlock: ReportBlock = {
            id: generateId(),
            type,
            content: '',
            language: type === 'code' ? 'python' : undefined
        };
        setBlocks(prev => [...prev, newBlock]);
    };

    const updateBlock = (id: string, updates: Partial<ReportBlock>) => {
        setBlocks(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
    };

    const removeBlock = (id: string) => {
        setBlocks(prev => prev.filter(b => b.id !== id));
    };

    const moveBlock = (id: string, direction: 'up' | 'down') => {
        setBlocks(prev => {
            const index = prev.findIndex(b => b.id === id);
            if (index === -1) return prev;
            if (direction === 'up' && index === 0) return prev;
            if (direction === 'down' && index === prev.length - 1) return prev;

            const newBlocks = [...prev];
            const swapIndex = direction === 'up' ? index - 1 : index + 1;
            [newBlocks[index], newBlocks[swapIndex]] = [newBlocks[swapIndex], newBlocks[index]];
            return newBlocks;
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
