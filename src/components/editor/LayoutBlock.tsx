import { BlockList } from './BlockList';
import type { ReportBlock } from '../../types';
import { useReport } from '../../contexts/ReportContext';
import { Plus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

interface LayoutBlockProps {
    block: ReportBlock;
}

export const LayoutBlock = ({ block }: LayoutBlockProps) => {
    const { updateBlock } = useReport();

    if (!block.columns) return null;

    const addColumn = () => {
        const newCol = {
            id: Math.random().toString(36).substr(2, 9),
            width: Math.floor(100 / (block.columns!.length + 1)), // Rough distribution
            blocks: []
        };
        // Normalize existing widths
        const existingWidth = Math.floor(100 / (block.columns!.length + 1));
        const updatedColumns = block.columns!.map(c => ({ ...c, width: existingWidth }));

        updateBlock(block.id, { columns: [...updatedColumns, newCol] });
    };

    const removeColumn = (colId: string) => {
        if (block.columns!.length <= 1) return; // Prevent deleting last column
        updateBlock(block.id, { columns: block.columns!.filter(c => c.id !== colId) });
    };

    const updateColumnWidth = (colId: string, newWidth: number) => {
        // Clamp width 
        if (newWidth < 1 || newWidth >= 100) return;

        const otherCols = block.columns!.filter(c => c.id !== colId);
        if (otherCols.length === 0) return;

        // Calculate remaining space
        const remainingSpace = 100 - newWidth;

        // Distribute remaining space proportionally based on current widths
        const currentOtherTotal = otherCols.reduce((sum, c) => sum + (c.width || 0), 0);

        const updatedColumns = block.columns!.map(c => {
            if (c.id === colId) return { ...c, width: newWidth };

            // Calculate new proportional width
            const ratio = (c.width || 0) / currentOtherTotal;
            const adjustedWidth = Math.floor(remainingSpace * ratio);
            return { ...c, width: adjustedWidth };
        });

        // Fix rounding errors by adding remainder to the last "other" column
        const total = updatedColumns.reduce((sum, c) => sum + (c.width || 0), 0);
        const diff = 100 - total;

        if (diff !== 0) {
            const lastOtherId = otherCols[otherCols.length - 1].id;
            const finalColumns = updatedColumns.map(c =>
                c.id === lastOtherId ? { ...c, width: (c.width || 0) + diff } : c
            );
            updateBlock(block.id, { columns: finalColumns });
        } else {
            updateBlock(block.id, { columns: updatedColumns });
        }
    };

    return (
        <div className="flex flex-col gap-2 p-2 bg-gray-50/50 dark:bg-gray-900/20 rounded-lg border border-dashed border-gray-200 dark:border-gray-800 w-full relative group/layout">

            {/* Columns Container */}
            <div className="flex flex-col md:flex-row gap-4">
                {block.columns.map((col, index) => (
                    <div
                        key={col.id}
                        className="flex-1 min-w-0 flex flex-col p-2 bg-white dark:bg-gray-900 rounded-md border border-gray-100 dark:border-gray-800 shadow-sm transition-all"
                        style={{ flexBasis: `${col.width}%` }}
                    >
                        {/* Column Header Controls */}
                        <div className="mb-2 flex items-center justify-between gap-2 border-b border-gray-100 dark:border-gray-800 pb-1">
                            <div className="flex items-center gap-1">
                                <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-600 tracking-wider">
                                    Col {index + 1}
                                </span>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover/layout:opacity-100 transition-opacity">
                                <button
                                    onClick={() => {
                                        if (index > 0) {
                                            const newCols = [...block.columns!];
                                            [newCols[index], newCols[index - 1]] = [newCols[index - 1], newCols[index]];
                                            updateBlock(block.id, { columns: newCols });
                                        }
                                    }}
                                    disabled={index === 0}
                                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded disabled:opacity-30 disabled:hover:bg-transparent text-gray-400"
                                    title="Move Left"
                                >
                                    <ChevronLeft className="w-3 h-3" />
                                </button>
                                <button
                                    onClick={() => {
                                        if (index < block.columns!.length - 1) {
                                            const newCols = [...block.columns!];
                                            [newCols[index], newCols[index + 1]] = [newCols[index + 1], newCols[index]];
                                            updateBlock(block.id, { columns: newCols });
                                        }
                                    }}
                                    disabled={index === block.columns!.length - 1}
                                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded disabled:opacity-30 disabled:hover:bg-transparent text-gray-400"
                                    title="Move Right"
                                >
                                    <ChevronRight className="w-3 h-3" />
                                </button>

                                <div className="w-px h-3 bg-gray-200 dark:bg-gray-700 mx-1"></div>

                                <input
                                    type="number"
                                    value={col.width}
                                    onChange={(e) => updateColumnWidth(col.id, Number(e.target.value))}
                                    className="w-16 text-center text-xs border border-gray-200 dark:border-gray-700 rounded px-1 py-0.5 bg-transparent"
                                    min={1}
                                    max={100}
                                />
                                <span className="text-xs text-gray-400">%</span>
                                <button
                                    onClick={() => removeColumn(col.id)}
                                    className="ml-1 p-1 hover:bg-red-50 hover:text-red-500 rounded text-gray-300 transition-colors"
                                    title="Remove Column"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            </div>
                        </div>

                        <BlockList
                            blocks={col.blocks}
                            parentId={block.id}
                            columnId={col.id}
                        />
                    </div>
                ))}
            </div>

            {/* Layout Footer Controls */}
            <div className="opacity-0 group-hover/layout:opacity-100 transition-opacity absolute -bottom-3 left-1/2 -translate-x-1/2 z-10">
                <button
                    onClick={addColumn}
                    className="flex items-center gap-1 px-3 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full shadow-sm text-xs font-medium text-gray-500 hover:text-blue-600 hover:border-blue-200 transition-colors"
                >
                    <Plus className="w-3 h-3" />
                    <span>Add Column</span>
                </button>
            </div>
        </div>
    );
};
