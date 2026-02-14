import { useState } from 'react';
import { useReport } from '../../contexts/ReportContext';
import { X, Search, Type, Code, Image as ImageIcon, Columns, Scissors, FileCode } from 'lucide-react';
import type { ReportBlock } from '../../types';

interface BlockOutlinePanelProps {
    onClose: () => void;
}

const typeIcons: Record<string, any> = {
    text: Type,
    code: Code,
    image: ImageIcon,
    html: FileCode,
    layout: Columns,
    pagebreak: Scissors,
};

const typeLabels: Record<string, string> = {
    text: 'Text',
    code: 'Code',
    image: 'Image',
    html: 'HTML',
    layout: 'Layout',
    pagebreak: 'Page Break',
};

function getBlockPreview(block: ReportBlock): string {
    if (block.type === 'pagebreak') return '— Page Break —';
    if (block.type === 'layout') return `Layout (${block.columns?.length || 0} columns)`;
    if (block.type === 'image') return block.metadata?.caption || '(Image)';
    if (!block.content) return '(Empty)';
    return block.content.slice(0, 50).replace(/\n/g, ' ');
}

function flattenBlocks(blocks: ReportBlock[], depth = 0): { block: ReportBlock; depth: number }[] {
    const result: { block: ReportBlock; depth: number }[] = [];
    for (const block of blocks) {
        result.push({ block, depth });
        if (block.columns) {
            for (const col of block.columns) {
                for (const child of col.blocks) {
                    result.push({ block: child, depth: depth + 1 });
                }
            }
        }
    }
    return result;
}

export const BlockOutlinePanel = ({ onClose }: BlockOutlinePanelProps) => {
    const { blocks } = useReport();
    const [search, setSearch] = useState('');

    const allBlocks = flattenBlocks(blocks);
    const filtered = search
        ? allBlocks.filter(({ block }) => {
            const preview = getBlockPreview(block).toLowerCase();
            const typeLabel = typeLabels[block.type]?.toLowerCase() || '';
            return preview.includes(search.toLowerCase()) || typeLabel.includes(search.toLowerCase());
        })
        : allBlocks;

    const scrollToBlock = (id: string) => {
        const el = document.getElementById(`block-${id}`);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.classList.add('ring-2', 'ring-blue-400');
            setTimeout(() => el.classList.remove('ring-2', 'ring-blue-400'), 1500);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-2xl w-full max-w-md max-h-[70vh] flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
                    <h3 className="font-bold text-base text-gray-900 dark:text-gray-100">Block Outline</h3>
                    <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="px-4 pt-3 pb-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search blocks..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 dark:text-gray-200"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-2 pb-3">
                    {filtered.length === 0 ? (
                        <div className="text-center py-8 text-sm text-gray-400 italic">
                            {blocks.length === 0 ? 'No blocks in report.' : 'No matching blocks.'}
                        </div>
                    ) : (
                        <div className="space-y-0.5">
                            {filtered.map(({ block, depth }, i) => {
                                const Icon = typeIcons[block.type] || Type;
                                return (
                                    <button
                                        key={block.id}
                                        onClick={() => { scrollToBlock(block.id); onClose(); }}
                                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left group"
                                        style={{ paddingLeft: `${12 + depth * 16}px` }}
                                    >
                                        <div className="p-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 group-hover:text-blue-600 transition-colors shrink-0">
                                            <Icon className="w-3.5 h-3.5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                                {typeLabels[block.type] || block.type}
                                                {block.type === 'code' && block.language && (
                                                    <span className="ml-1.5 text-blue-500 normal-case">({block.language})</span>
                                                )}
                                            </div>
                                            <div className="text-sm text-gray-700 dark:text-gray-300 truncate mt-0.5">
                                                {getBlockPreview(block)}
                                            </div>
                                        </div>
                                        <span className="text-[10px] text-gray-300 dark:text-gray-600 shrink-0">#{i + 1}</span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
