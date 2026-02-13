import React from 'react';
import { Block } from './Block';
import { TextBlock } from './TextBlock';
import { CodeBlock } from './CodeBlock';
import { ImageBlock } from './ImageBlock';
import { HtmlBlock } from './HtmlBlock';
import { LayoutBlock } from './LayoutBlock';
import { PageBreakBlock } from './PageBreakBlock';
import { useReport } from '../../contexts/ReportContext';
import type { ReportBlock } from '../../types';
import { Type, Code, Image as ImageIcon, Columns, Scissors } from 'lucide-react';

interface BlockListProps {
    blocks: ReportBlock[];
    parentId?: string; // ID of the parent LayoutBlock (if any)
    columnId?: string; // ID of the column within the parent (if any)
}

export const BlockList = ({ blocks, parentId, columnId }: BlockListProps) => {
    const { addBlock, updateBlock, removeBlock, moveBlock } = useReport();

    // Helper to render AddButton 
    const AddButton = ({ onClick, icon, label }: { onClick: () => void, icon: React.ReactNode, label: string }) => (
        <button onClick={onClick} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 text-xs font-medium border border-transparent hover:border-gray-200 dark:hover:border-gray-700">
            {icon}
            <span>{label}</span>
        </button>
    );

    return (
        <div className="space-y-4">
            {blocks.map((block) => (
                <Block
                    key={block.id}
                    id={block.id}
                    onDelete={removeBlock}
                    onMoveUp={() => moveBlock(block.id, 'up')}
                    onMoveDown={() => moveBlock(block.id, 'down')}
                    inColumn={!!columnId}
                >
                    {block.type === 'text' && (
                        <TextBlock
                            content={block.content}
                            onChange={(content) => updateBlock(block.id, { content })}
                        />
                    )}
                    {block.type === 'code' && (
                        <CodeBlock
                            content={block.content}
                            language={block.language || 'r'}
                            metadata={block.metadata}
                            onChange={(content) => updateBlock(block.id, { content })}
                            onLanguageChange={(lang) => updateBlock(block.id, { language: lang })}
                            onMetadataChange={(metadata) => updateBlock(block.id, { metadata })}
                        />
                    )}
                    {block.type === 'image' && (
                        <ImageBlock
                            content={block.content}
                            caption={block.metadata?.caption}
                            onChange={(content) => updateBlock(block.id, { content })}
                            onCaptionChange={(caption) => updateBlock(block.id, { metadata: { ...block.metadata, caption } })}
                        />
                    )}
                    {block.type === 'html' && (
                        <HtmlBlock
                            content={block.content}
                            metadata={block.metadata}
                            onChange={(content) => updateBlock(block.id, { content })}
                            onMetadataChange={(metadata) => updateBlock(block.id, { metadata })}
                        />
                    )}
                    {block.type === 'layout' && (
                        <LayoutBlock block={block} />
                    )}
                    {block.type === 'pagebreak' && (
                        <PageBreakBlock />
                    )}
                </Block>
            ))}

            {/* Add Block Controls */}
            {(!columnId || blocks.length === 0) && (
                <div className="flex flex-wrap items-center justify-center gap-2 py-4 opacity-50 hover:opacity-100 transition-opacity border-t border-dashed border-gray-200 dark:border-gray-800">
                    <AddButton onClick={() => addBlock('text', parentId, columnId)} icon={<Type className="w-4 h-4" />} label="Text" />
                    <AddButton onClick={() => addBlock('code', parentId, columnId)} icon={<Code className="w-4 h-4" />} label="Code" />
                    <AddButton onClick={() => addBlock('image', parentId, columnId)} icon={<ImageIcon className="w-4 h-4" />} label="Image" />
                    <AddButton onClick={() => addBlock('html', parentId, columnId)} icon={<div className="font-mono text-[10px] font-bold">&lt;/&gt;</div>} label="HTML" />
                    {!columnId && (
                        <>
                            <AddButton onClick={() => addBlock('layout', parentId, columnId)} icon={<Columns className="w-4 h-4" />} label="Columns" />
                            <AddButton onClick={() => addBlock('pagebreak', parentId, columnId)} icon={<Scissors className="w-4 h-4" />} label="Page Break" />
                        </>
                    )}
                </div>
            )}
        </div>
    );
};
