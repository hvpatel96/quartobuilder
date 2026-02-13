import type { ReportBlock, ReportMetadata } from '../../types';
import { HEALTHCARE_BLOCKS, HEALTHCARE_METADATA } from './healthcareReport';
import { SPACE_BLOCKS, SPACE_METADATA } from './spaceReport';

export interface ExampleReport {
    id: string;
    name: string;
    description: string;
    blocks: ReportBlock[];
    metadata: ReportMetadata;
}

export const EXAMPLES: ExampleReport[] = [
    {
        id: 'healthcare',
        name: 'Healthcare Screening',
        description: 'A comprehensive medical report with HTML styling and R visualizations.',
        blocks: HEALTHCARE_BLOCKS,
        metadata: HEALTHCARE_METADATA
    },
    {
        id: 'space',
        name: 'Space & Stars',
        description: 'A PDF-optimized report showcasing high-res images and page layout features.',
        blocks: SPACE_BLOCKS,
        metadata: SPACE_METADATA
    }
];
