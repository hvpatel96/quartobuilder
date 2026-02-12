export type BlockType = 'text' | 'code' | 'image' | 'html';

export interface ReportMetadata {
    title: string;
    author: string;
    date: string;
    format: 'html' | 'pdf' | 'docx';
}

export interface ReportBlock {
    id: string;
    type: BlockType;
    content: string; // Markdown text, Code content, or Image Data URL
    language?: string; // For code blocks (e.g., 'r', 'python')
    metadata?: {
        caption?: string; // For images
        [key: string]: any;
    };
}
