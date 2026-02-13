import type { ReportBlock } from '../../types';
import { PreviewText } from './PreviewText';
import { PreviewCode } from './PreviewCode';
import { PreviewImage } from './PreviewImage';
import { PreviewHtml } from './PreviewHtml';
import { PreviewLayout } from './PreviewLayout';
import { ExecutionOutput } from './ExecutionOutput';

interface PreviewBlockProps {
    block: ReportBlock;
}

export const PreviewBlock = ({ block }: PreviewBlockProps) => {
    switch (block.type) {
        case 'text':
            return <PreviewText content={block.content} />;
        case 'code':
            const codeOptions = block.metadata?.blockOptions || {};
            const codeEcho = codeOptions.echo ?? false;
            const codeOutput = codeOptions.output ?? true;

            if (!codeEcho && !codeOutput) return null;

            return (
                <div className="space-y-2 group">
                    {codeEcho && (
                        <PreviewCode content={block.content} language={block.language} />
                    )}
                    {(block.language === 'r' || block.language === 'python') && (
                        <ExecutionOutput
                            blockId={block.id}
                            code={block.content}
                            language={block.language}
                            showOutput={codeOutput}
                        />
                    )}
                </div>
            );

        case 'image':
            return <PreviewImage content={block.content} caption={block.metadata?.caption} />;

        case 'html':
            const htmlOptions = block.metadata?.blockOptions || {};
            const htmlEcho = htmlOptions.echo ?? false;
            const htmlOutput = htmlOptions.output ?? true;

            return (
                <div className="flex flex-col gap-4">
                    {htmlEcho && <PreviewCode content={block.content} language="html" />}
                    {htmlOutput && <PreviewHtml content={block.content} />}
                </div>
            );
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
