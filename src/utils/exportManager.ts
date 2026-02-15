import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { ReportBlock, ReportMetadata, Dataset } from '../types';
import { getDatasetContent } from './datasetStorage';

// generateYAML moved inside exportReport to access styling options

export const exportReport = async (blocks: ReportBlock[], metadata: ReportMetadata, datasets: Dataset[] = []) => {
    const zip = new JSZip();
    const imageFolder = zip.folder("images");
    const dataFolder = zip.folder("data");
    const wwwFolder = zip.folder("www"); // For CSS

    // Styling Options
    const styling = metadata.styling || {};
    const htmlStyle = styling.html || {};
    const pdfStyle = styling.pdf || {};

    // 1. Handle HTML CSS
    let cssFileName = "";
    if (htmlStyle.cssContent && wwwFolder) {
        cssFileName = "styles.css";
        wwwFolder.file(cssFileName, htmlStyle.cssContent);
    }

    // Helper: escape strings for safe YAML double-quoted values
    const escapeYaml = (str: string): string =>
        str.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');

    // 2. Generate YAML with styling options
    const generateStylingYAML = () => {
        let yaml = `---
title: "${escapeYaml(metadata.title)}"
author: "${escapeYaml(metadata.author)}"
date: "${escapeYaml(metadata.date)}"
format: 
  ${metadata.format}:
`;
        // Indent sub-options
        if (metadata.format === 'html') {
            if (cssFileName) {
                yaml += `    css: www/${cssFileName}\n`;
            }
        } else if (metadata.format === 'pdf') {
            if (pdfStyle.toc) yaml += `    toc: true\n`;
            if (pdfStyle.numberSections) yaml += `    number-sections: true\n`;
            if (pdfStyle.margin) {
                const safeMargin = pdfStyle.margin.replace(/[^a-zA-Z0-9.,\s]/g, '');
                yaml += `    geometry: margin=${safeMargin}\n`;
            }
        }

        yaml += `---\n`;
        return yaml;
    };

    let qmdContent = generateStylingYAML();

    // Save Datasets (read content from IndexedDB)
    if (dataFolder && datasets.length > 0) {
        for (const dataset of datasets) {
            const content = await getDatasetContent(dataset.id);
            if (content) {
                dataFolder.file(dataset.name, content);
            } else {
                console.warn(`No content found in IndexedDB for dataset "${dataset.name}", skipping`);
            }
        }
    }

    // Recursive function to process blocks
    const processBlocks = (blockList: ReportBlock[]): string => {
        let content = "";
        for (const block of blockList) {
            if (block.type === 'text') {
                content += `\n${block.content}\n`;
            } else if (block.type === 'code') {
                const lang = block.language || 'r';
                const options = block.metadata?.blockOptions || {};
                const echo = options.echo ?? false;
                const message = options.message ?? false;
                const warning = options.warning ?? false;
                const output = options.output ?? true;

                let optionsStr = "";
                if (lang !== 'markdown') {
                    // Echo (Default false, so if true we can be explicit or just leave it if Quarto defaults true? 
                    // Quarto default is true. Editor default is false.
                    // If editor is false (default), we must write "echo: false".
                    // If editor is true, we can write "echo: true".
                    if (echo === false) optionsStr += "#| echo: false\n";
                    else optionsStr += "#| echo: true\n";

                    if (message === false) optionsStr += "#| message: false\n";
                    if (warning === false) optionsStr += "#| warning: false\n";
                    if (output === false) optionsStr += "#| output: false\n";
                }

                content += `\n\`\`\`{${lang}}\n${optionsStr}${block.content}\n\`\`\`\n`;
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
                const htmlOptions = block.metadata?.blockOptions || {};
                const htmlEcho = htmlOptions.echo ?? false; // Default false
                const htmlOutput = htmlOptions.output ?? true; // Default true

                // Echo: Show the source as a syntax-highlighted code block if true
                if (htmlEcho) {
                    content += `\n\`\`\`html\n${block.content}\n\`\`\`\n`;
                }

                // Output: Render the raw HTML if true
                if (htmlOutput) {
                    content += `\n\`\`\`{=html}\n${block.content}\n\`\`\`\n`;
                }
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
