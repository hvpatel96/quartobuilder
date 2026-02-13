import type { ReportBlock, ReportMetadata } from '../../types';

export const SPACE_METADATA: ReportMetadata = {
    title: 'Stellar Formation in the Orion Nebula',
    author: 'Dr. Astra Nova',
    date: new Date().toLocaleDateString(),
    format: 'pdf',
    styling: {
        pdf: {
            toc: true,
            numberSections: true,
            margin: '1in'
        }
    }
};

export const SPACE_BLOCKS: ReportBlock[] = [
    {
        id: 'intro',
        type: 'text',
        content: `# Introduction

The process of star formation is one of the most fundamental events in the universe. It begins within giant molecular clouds, dense regions of gas and dust that collapse under their own gravity. This report explores the visual and chemical characteristics of these stellar nurseries.`
    },
    {
        id: 'nebula-image',
        type: 'image',
        content: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=2048&auto=format&fit=crop',
        metadata: {
            caption: 'Figure 1: The majestic pillars of creation, a region of active star formation.'
        }
    },
    {
        id: 'formation-process',
        type: 'text',
        content: `## The Protostellar Phase

As the cloud collapses, it fragments into smaller clumps, each destined to become a star. The core heats up, eventually igniting nuclear fusion.

> "We are made of starstuff." - Carl Sagan

The following R code simulates the density distribution of a collapsing cloud core.`
    },
    {
        id: 'density-simulation',
        type: 'code',
        language: 'r',
        content: `# Simulating Cloud Core Density
r <- seq(0.1, 10, length.out=100)
rho <- 1 / (r^2)
plot(r, rho, type='l', main='Isothermal Sphere Density Profile', 
     xlab='Radius (AU)', ylab='Density', col='blue', lwd=2)`,
        metadata: {
            blockOptions: {
                echo: true,
                warning: false
            }
        }
    },
    {
        id: 'conclusion',
        type: 'text',
        content: `## Conclusion

Understanding these processes helps us unravel our own origins. The interplay of gravity, turbulence, and magnetic fields naturally leads to the beautiful structures we observe in the night sky.`
    },
    {
        id: 'layout-demo',
        type: 'layout',
        content: '',
        columns: [
            {
                id: 'col1',
                width: 50,
                blocks: [
                    {
                        id: 'text-left',
                        type: 'text',
                        content: '### Observation\nNew telescopes allow us to peer through the dust.'
                    }
                ]
            },
            {
                id: 'col2',
                width: 50,
                blocks: [
                    {
                        id: 'text-right',
                        type: 'text',
                        content: '### Theory\nComputer simulations refine our understanding of collapse mechanics.'
                    }
                ]
            }
        ]
    }
];
