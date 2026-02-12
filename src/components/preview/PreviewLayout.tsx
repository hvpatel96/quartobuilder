import type { ReportBlock } from '../../types';
import { PreviewBlockList } from './PreviewBlockList';

interface PreviewLayoutProps {
    block: ReportBlock;
}

export const PreviewLayout = ({ block }: PreviewLayoutProps) => {
    if (!block.columns) return null;

    return (
        <div className="flex flex-col md:flex-row gap-4 my-4">
            {block.columns.map((col) => (
                <div
                    key={col.id}
                    className="flex-1 min-w-0"
                    style={{ flexBasis: `${col.width}%` }}
                >
                    <PreviewBlockList blocks={col.blocks} />
                </div>
            ))}
        </div>
    );
};
