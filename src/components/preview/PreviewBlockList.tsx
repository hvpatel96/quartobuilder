import type { ReportBlock } from '../../types';
import { PreviewBlock } from './PreviewBlock';

interface PreviewBlockListProps {
    blocks: ReportBlock[];
}

export const PreviewBlockList = ({ blocks }: PreviewBlockListProps) => {
    return (
        <div className="space-y-4">
            {blocks.map((block) => (
                <PreviewBlock key={block.id} block={block} />
            ))}
        </div>
    );
};
