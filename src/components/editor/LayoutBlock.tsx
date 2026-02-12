import { BlockList } from './BlockList';
import type { ReportBlock } from '../../types';

interface LayoutBlockProps {
    block: ReportBlock;
}

export const LayoutBlock = ({ block }: LayoutBlockProps) => {
    if (!block.columns) return null;

    return (
        <div className="flex flex-col md:flex-row gap-4 p-2 bg-gray-50/50 dark:bg-gray-900/20 rounded-lg border border-dashed border-gray-200 dark:border-gray-800 w-full">
            {block.columns.map((col) => (
                <div
                    key={col.id}
                    className="flex-1 min-w-0 flex flex-col p-2 bg-white dark:bg-gray-900 rounded-md border border-gray-100 dark:border-gray-800 shadow-sm"
                    style={{ flexBasis: `${col.width}%` }}
                >
                    <div className="mb-2 text-[10px] uppercase font-bold text-gray-300 dark:text-gray-600 tracking-wider">
                        Column {col.width}%
                    </div>
                    <BlockList
                        blocks={col.blocks}
                        parentId={block.id}
                        columnId={col.id}
                    />
                </div>
            ))}
        </div>
    );
};
