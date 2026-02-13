import { WebR } from 'webr';
import type { WorkerRequest } from './types.ts';

const webR = new WebR();

async function init() {
    await webR.init();
    await webR.installPackages(['ggplot2', 'dplyr', 'DT']);
    // Create data directory
    try {
        await webR.FS.mkdir('data');
    } catch (e) {
        // Ignore if exists
    }
    postMessage({ type: 'loaded' });
}

self.onmessage = async (e: MessageEvent<WorkerRequest>) => {
    const data = e.data;
    switch (data.type) {
        case 'init':
            await init();
            return;
        case 'writeFile':
            const { filename, content } = data;
            try {
                // Ensure data directory exists (redundant but safe)
                try { await webR.FS.mkdir('data'); } catch (e) { }

                // Write file to data/filename
                const path = `data/${filename}`;

                let dataToWrite: Uint8Array;
                if (typeof content === 'string') {
                    console.log(`[R] Writing file ${path}, type: string, length: ${content.length}`);
                    dataToWrite = new TextEncoder().encode(content);
                } else {
                    console.log(`[R] Writing file ${path}, type: binary, byteLength: ${content.byteLength}`);
                    dataToWrite = new Uint8Array(content);
                }

                await webR.FS.writeFile(path, dataToWrite);
                console.log(`[R] File ${path} written successfully.`);
            } catch (err: any) {
                console.error("Failed to write file:", err);
                postMessage({ type: 'error', error: `Write failed: ${err.message}` });
            }
            break;

        case 'run':
            const { id, code } = data;
            if (!code) return;

            try {
                // Prepare plot capture
                // We'll use a virtual file system approach
                const plotFilename = `plot-${id}.png`;

                await webR.evalRVoid(`
                    png("${plotFilename}", width = 800, height = 600)
                `);

                // Execute code with output capture
                await webR.evalRVoid(`code_to_run <- ${JSON.stringify(code)}`);

                const captureCode = `
                    output_lines <- capture.output({
                        source(textConnection(code_to_run), local = TRUE, echo = FALSE, print.eval = TRUE)
                    })
                    paste(output_lines, collapse = "\\n")
                `;

                const result = await webR.evalR(captureCode);
                let output: any = await result.toJs();

                // Unpack WebR object if needed
                if (typeof output === 'object' && output !== null) {
                    if ((output as any).values && Array.isArray((output as any).values)) {
                        output = (output as any).values.join('\n');
                    } else if (Array.isArray(output)) {
                        output = output.join('\n');
                    } else {
                        output = JSON.stringify(output);
                    }
                }

                output = String(output);

                // Close device and check for plot
                await webR.evalRVoid(`dev.off()`);

                // Check if file exists and has content
                let plotData = null;
                try {
                    const fileData = await webR.FS.readFile(plotFilename);
                    if (fileData && fileData.length > 0) {
                        // Use a safer base64 conversion for binary data
                        const base64 = btoa(fileData.reduce((data, byte) => data + String.fromCharCode(byte), ''));
                        plotData = `data:image/png;base64,${base64}`;
                    }
                    // Clean up
                    await webR.FS.unlink(plotFilename);
                } catch (err) {
                    // Start of new plot, or no plot generated, ignore
                }

                if (plotData) {
                    postMessage({ type: 'output', id, result: { type: 'image', content: plotData } });
                }

                if (output) {
                    postMessage({ type: 'output', id, result: { type: 'text', content: output } });
                }

                postMessage({ type: 'complete', id });

            } catch (err: any) {
                // Clean up in case of error
                try { await webR.evalRVoid(`dev.off()`); } catch (e) { }
                postMessage({ type: 'error', id, error: err.message });
            }
            break;
    }
};
