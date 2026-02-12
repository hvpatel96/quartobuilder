
import { Block } from './Block';
import { TextBlock } from './TextBlock';
import { CodeBlock } from './CodeBlock';
import { ImageBlock } from './ImageBlock';
import { HtmlBlock } from './HtmlBlock';
import { useReport } from '../../contexts/ReportContext';
import { Type, Code, Image as ImageIcon } from 'lucide-react';

export const ReportEditor = () => {
    const { blocks, addBlock, updateBlock, removeBlock, moveBlock } = useReport();

    return (
        <div className="space-y-4 pb-20">
            {blocks.map((block) => (
                <Block
                    key={block.id}
                    id={block.id}
                    onDelete={removeBlock}
                    onMoveUp={() => moveBlock(block.id, 'up')}
                    onMoveDown={() => moveBlock(block.id, 'down')}
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
                            onChange={(content) => updateBlock(block.id, { content })}
                            onLanguageChange={(lang) => updateBlock(block.id, { language: lang })}
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
                            onChange={(content) => updateBlock(block.id, { content })}
                        />
                    )}
                </Block>
            ))}

            {/* Add Block Controls */}
            <div className="flex items-center justify-center gap-4 py-8 opacity-50 hover:opacity-100 transition-opacity border-t-2 border-dashed border-gray-100 dark:border-gray-800 mt-8">
                <button onClick={() => addBlock('text')} className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-white dark:hover:bg-gray-800 transition-all hover:scale-105 group">
                    <div className="p-3 bg-gray-100 dark:bg-gray-700 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 rounded-full shadow-sm">
                        <Type className="w-5 h-5 text-gray-500 group-hover:text-blue-600 dark:text-gray-300 dark:group-hover:text-blue-400" />
                    </div>
                    <span className="text-xs font-medium text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300">Text</span>
                </button>
                <button onClick={() => addBlock('code')} className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-white dark:hover:bg-gray-800 transition-all hover:scale-105 group">
                    <div className="p-3 bg-gray-100 dark:bg-gray-700 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 rounded-full shadow-sm">
                        <Code className="w-5 h-5 text-gray-500 group-hover:text-blue-600 dark:text-gray-300 dark:group-hover:text-blue-400" />
                    </div>
                    <span className="text-xs font-medium text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300">Code</span>
                </button>
                <button onClick={() => addBlock('image')} className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-white dark:hover:bg-gray-800 transition-all hover:scale-105 group">
                    <div className="p-3 bg-gray-100 dark:bg-gray-700 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 rounded-full shadow-sm">
                        <ImageIcon className="w-5 h-5 text-gray-500 group-hover:text-blue-600 dark:text-gray-300 dark:group-hover:text-blue-400" />
                    </div>
                    <span className="text-xs font-medium text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300">Image</span>
                </button>
                <button onClick={() => addBlock('html')} className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-white dark:hover:bg-gray-800 transition-all hover:scale-105 group">
                    <div className="p-3 bg-gray-100 dark:bg-gray-700 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 rounded-full shadow-sm">
                        <div className="w-5 h-5 text-gray-500 group-hover:text-blue-600 dark:text-gray-300 dark:group-hover:text-blue-400 font-mono text-xs flex items-center justify-center font-bold">&lt;/&gt;</div>
                    </div>
                    <span className="text-xs font-medium text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300">HTML</span>
                </button>
            </div>
        </div>
    );
};
