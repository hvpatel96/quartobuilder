import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { ReportBlock, ReportMetadata, Dataset } from '../types';

export const generateYAML = (metadata: ReportMetadata) => {
    return `---
title: "${metadata.title}"
author: "${metadata.author}"
date: "${metadata.date}"
format: ${metadata.format}
---
`;
};

export const exportReport = async (blocks: ReportBlock[], metadata: ReportMetadata, datasets: Dataset[] = []) => {
    const zip = new JSZip();
    const imageFolder = zip.folder("images");
    const dataFolder = zip.folder("data");
    let qmdContent = generateYAML(metadata);

    // Save Datasets
    if (dataFolder && datasets.length > 0) {
        datasets.forEach(dataset => {
            if (typeof dataset.content === 'string') {
                dataFolder.file(dataset.name, dataset.content);
            } else {
                dataFolder.file(dataset.name, dataset.content);
            }
        });
    }

    // Recursive function to process blocks
    const processBlocks = (blockList: ReportBlock[]): string => {
        let content = "";
        for (const block of blockList) {
            if (block.type === 'text') {
                content += `\n${block.content}\n`;
            } else if (block.type === 'code') {
                content += `\n\`\`\`{${block.language || 'r'}}\n${block.content}\n\`\`\`\n`;
            } else if (block.type === 'image' && block.content) {
                // Check if it's a data URL
                if (block.content.startsWith('data:image')) {
                    const matches = block.content.match(/^data:image\/([a-zA-Z+]*);base64,([^"]*)$/);
                    if (matches) {
                        const ext = matches[1].replace('+', '');
                        const safeExt = ext === 'jpeg' ? 'jpg' : ext;
                        const data = matches[2];
                        const filename = `image-${block.id}.${safeExt}`;

                        if (imageFolder) {
                            imageFolder.file(filename, data, { base64: true });
                        }

                        const caption = block.metadata?.caption ? `"${block.metadata.caption}"` : '';
                        content += `\n![${caption}](images/${filename})\n`;
                    }
                } else {
                    // If it's a normal URL
                    const caption = block.metadata?.caption ? `"${block.metadata.caption}"` : '';
                    content += `\n![${caption}](${block.content})\n`;
                }
            } else if (block.type === 'html') {
                content += `\n\`\`\`{=html}\n${block.content}\n\`\`\`\n`;
            } else if (block.type === 'pagebreak') {
                content += '\n{{< pagebreak >}}\n';
            } else if (block.type === 'layout' && block.columns) {
                content += `\n::::: {.columns}\n`;
                for (const col of block.columns) {
                    content += `\n::: {.column width="${col.width}%"}\n`;
                    content += processBlocks(col.blocks);
                    content += `\n:::\n`;
                }
                content += `\n:::::\n`;
            }
        }
        return content;
    };

    qmdContent += processBlocks(blocks);

    zip.file("report.qmd", qmdContent);

    try {
        const content = await zip.generateAsync({ type: "blob" });
        saveAs(content, `quarto-report-${Date.now()}.zip`);
    } catch (error) {
        console.error("Failed to generate zip", error);
        alert("Failed to export report.");
    }
};
