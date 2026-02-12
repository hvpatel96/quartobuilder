import type { ReportBlock } from '../../types';
import { PreviewText } from './PreviewText';
import { PreviewCode } from './PreviewCode';
import { PreviewImage } from './PreviewImage';
import { PreviewHtml } from './PreviewHtml';
import { PreviewLayout } from './PreviewLayout';

interface PreviewBlockProps {
    block: ReportBlock;
}

export const PreviewBlock = ({ block }: PreviewBlockProps) => {
    switch (block.type) {
        case 'text':
            return <PreviewText content={block.content} />;
        case 'code':
            return <PreviewCode content={block.content} language={block.language} />;
        case 'image':
            return <PreviewImage content={block.content} caption={block.metadata?.caption} />;
        case 'html':
            return <PreviewHtml content={block.content} />;
        case 'layout':
            return <PreviewLayout block={block} />;
        case 'pagebreak':
            return (
                <div className="py-8 flex items-center gap-4 text-gray-300 dark:text-gray-700 select-none">
                    <div className="h-px bg-current flex-1" />
                    <span className="text-xs font-mono uppercase tracking-widest">Page Break</span>
                    <div className="h-px bg-current flex-1" />
                </div>
            );
        default:
            return null;
    }
};
