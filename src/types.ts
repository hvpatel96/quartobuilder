export type BlockType = 'text' | 'code' | 'image' | 'html' | 'layout' | 'pagebreak';

export interface ReportMetadata {
    title: string;
    author: string;
    date: string;
    format: 'html' | 'pdf' | 'docx';
}

export interface ReportColumn {
    id: string;
    width?: number; // percentage (e.g., 50)
    blocks: ReportBlock[];
}

export interface ReportBlock {
    id: string;
    type: BlockType;
    content: string; // Markdown text, Code content, or Image Data URL
    language?: string; // For code blocks (e.g., 'r', 'python')
    metadata?: {
        caption?: string; // For images
        blockOptions?: {
            echo?: boolean;
            message?: boolean;
            warning?: boolean;
            output?: boolean;
        };
        [key: string]: any;
    };
    columns?: ReportColumn[]; // For layout blocks
}
export interface Dataset {
    id: string;
    name: string; // "data.csv"
    type: 'csv' | 'excel' | 'tsv' | 'json';
    content: string | ArrayBuffer; // Base64 or raw for export
    preview: any[]; // First ~5 rows for preview
    size: number;
}
