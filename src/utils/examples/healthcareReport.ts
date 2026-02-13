import type { ReportBlock, ReportMetadata } from '../../types';

export const HEALTHCARE_METADATA: ReportMetadata = {
    title: 'Comprehensive Health Screening Report',
    author: 'Dr. Sarah Chen, MD',
    date: new Date().toLocaleDateString(),
    format: 'html',
    styling: {
        html: {
            cssContent: `
/* Custom Report Styling */
.report-header {
    border-bottom: 2px solid #2563eb;
    padding-bottom: 1rem;
    margin-bottom: 2rem;
}
.metric-card {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 0.5rem;
    padding: 1rem;
    text-align: center;
}
.metric-value {
    font-size: 2rem;
    font-weight: bold;
    color: #0f172a;
}
.metric-label {
    color: #64748b;
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}
.recommendation-box {
    background-color: #f0fdf4;
    border-left: 4px solid #22c55e;
    padding: 1rem;
    margin: 1rem 0;
}
.metrics-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
}
.signature-container {
    margin-top: 2rem;
    padding-top: 1rem;
    border-top: 1px solid #e5e7eb;
}
.text-gray-600 {
    color: #4b5563;
}
.text-sm {
    font-size: 0.875rem;
}
.font-bold {
    font-weight: 700;
}
.text-lg {
    font-size: 1.125rem;
}
.text-gray-400 {
    color: #9ca3af;
}
`
        }
    }
};

export const HEALTHCARE_BLOCKS: ReportBlock[] = [
    {
        id: 'header-intro',
        type: 'text',
        content: `# Executive Summary

This report summarizes the comprehensive health screening results for **Patient ID: 84920**. The screening was conducted on ${new Date().toLocaleDateString()} at the Metropolis Medical Center.

## Patient Overview
The patient is a 45-year-old male presenting for an annual wellness exam. Vitals are stable, but there are indicators suggesting pre-hypertension and elevated cholesterol levels that warrant lifestyle interventions.`
    },
    {
        id: 'vitals-layout',
        type: 'layout',
        content: '',
        columns: [
            {
                id: 'vitals-col-1',
                width: 50,
                blocks: [
                    {
                        id: 'vitals-metrics',
                        type: 'html',
                        content: `
<div class="metrics-grid">
    <div class="metric-card">
        <div class="metric-value">128/82</div>
        <div class="metric-label">Blood Pressure</div>
    </div>
    <div class="metric-card">
        <div class="metric-value">72</div>
        <div class="metric-label">Heart Rate (BPM)</div>
    </div>
    <div class="metric-card">
        <div class="metric-value">24.5</div>
        <div class="metric-label">BMI</div>
    </div>
    <div class="metric-card">
        <div class="metric-value">98%</div>
        <div class="metric-label">SpO2</div>
    </div>
</div>`
                    }
                ]
            },
            {
                id: 'vitals-col-2',
                width: 50,
                blocks: [
                    {
                        id: 'analysis-text',
                        type: 'text',
                        content: `### Vitals Analysis
                        
The patient's blood pressure is slightly elevated (128/82 mmHg), placing them in the *Elevated* category. Heart rate and oxygen saturation are within normal limits. BMI indicates a healthy weight, though upper range.

**Immediate actions:**
*   Monitor BP daily for 2 weeks
*   Reduce sodium intake
*   Increase cardiovascular activity`
                    }
                ]
            }
        ]
    },
    {
        id: 'lab-results-header',
        type: 'text',
        content: `## Laboratory Results Analysis

We performed a standard lipid panel and metabolic profile. The following R code generates a visualization of the patient's lipid levels compared to the standard reference ranges.`
    },
    {
        id: 'lipid-analysis-code',
        type: 'code',
        language: 'r',
        content: `# R Code for Lipid Profile Visualization
library(ggplot2)

lipid_data <- data.frame(
  Metric = c("Total Cholesterol", "HDL", "LDL", "Triglycerides"),
  Value = c(210, 45, 140, 160),
  Reference = c(200, 40, 100, 150)
)

ggplot(lipid_data, aes(x=Metric, y=Value, fill=Metric)) +
  geom_bar(stat="identity") +
  geom_hline(aes(yintercept=Reference), linetype="dashed", color="red") +
  theme_minimal() +
  labs(title="Lipid Profile vs Reference Max", y="mg/dL")`,
        metadata: {
            blockOptions: {
                echo: true,
                warning: false
            }
        }
    },
    {
        id: 'chart-placeholder',
        type: 'image',
        content: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        metadata: {
            caption: 'Figure 1: Representative data visualization (Placeholder)'
        }
    },
    {
        id: 'recommendations',
        type: 'text',
        content: `## Clinical Recommendations

Based on the vitals and laboratory findings, the following plan is recommended:

1.  **Dietary Modification**: Adopt a Mediterranean-style diet rich in healthy fats, whole grains, and vegetables.
2.  **Exercise**: Aim for 150 minutes of moderate-intensity aerobic activity per week.
3.  **Follow-up**: Schedule a follow-up appointment in 3 months to review blood pressure logs and repeat the lipid panel.`
    },
    {
        id: 'signature-block',
        type: 'html',
        content: `
<div class="signature-container">
    <p class="font-bold text-lg">Dr. Sarah Chen, MD</p>
    <p class="text-gray-600">Internal Medicine</p>
    <p class="text-sm text-gray-400">License: #MD-55920-CA</p>
</div>`
    }
];
