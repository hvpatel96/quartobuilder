// Python Worker
import { loadPyodide } from 'pyodide';
import type { WorkerRequest } from './types.ts';

let pyodide: any = null;

async function init() {
    try {
        console.log("Initializing Pyodide...");
        pyodide = await loadPyodide({
            indexURL: "https://cdn.jsdelivr.net/pyodide/v0.29.3/full/"
        });
        console.log("Pyodide loaded. Installing packages...");

        await pyodide.loadPackage("matplotlib");
        await pyodide.loadPackage("pandas");
        // Also load micropip to be safe for other packages
        await pyodide.loadPackage("micropip");

        await pyodide.runPythonAsync(`
            import matplotlib
            matplotlib.use("Agg")
            import matplotlib.pyplot as plt
            plt.show = lambda *args, **kwargs: None
            import os
            if not os.path.exists('data'):
                os.makedirs('data')
        `);

        console.log("Python packages installed.");
        postMessage({ type: 'loaded' });
    } catch (err: any) {
        console.error("Pyodide initialization failed:", err);
        postMessage({ type: 'error', error: `Init failed: ${err.message}` });
    }
}

self.onmessage = async (e: MessageEvent<WorkerRequest>) => {
    const data = e.data;
    switch (data.type) {
        case 'init':
            await init();
            return;
        case 'writeFile':
            const { filename, content } = data;
            // Sanitize: only allow the basename (no path traversal)
            const safeName = filename.replace(/[\\/]/g, '_').replace(/^\.+/, '');
            if (!safeName) {
                postMessage({ type: 'error', error: 'Invalid filename' });
                break;
            }
            if (!pyodide) return;
            try {
                // Ensure data directory exists
                pyodide.FS.mkdirTree('data'); // Safe if exists

                const path = `data/${safeName}`;

                if (typeof content === 'string') {
                    console.log(`[Python] Writing file ${path}, type: string, length: ${content.length}`);
                    pyodide.FS.writeFile(path, content);
                } else {
                    console.log(`[Python] Writing file ${path}, type: binary, byteLength: ${content.byteLength}`);
                    pyodide.FS.writeFile(path, new Uint8Array(content));
                }
            } catch (err: any) {
                console.error("Failed to write file:", err);
                postMessage({ type: 'error', error: `Write failed: ${err.message}` });
            }
            break;

        case 'run':
            const { id, code } = data;
            if (!code || !pyodide) {
                if (!pyodide) postMessage({ type: 'error', id, error: "Python engine not ready" });
                return;
            }

            try {
                // Capture output
                pyodide.setStdout({
                    batched: (msg: string) => {
                        postMessage({ type: 'output', id, result: { type: 'text', content: msg } });
                    }
                });

                pyodide.setStderr({
                    batched: (msg: string) => {
                        postMessage({ type: 'output', id, result: { type: 'text', content: msg } });
                    }
                });

                // Run code
                let result = await pyodide.runPythonAsync(code);

                // Check for plots
                const plotCode = `
import matplotlib.pyplot as plt
import io
import base64

img_str = ""
if plt.get_fignums():
    buf = io.BytesIO()
    plt.savefig(buf, format='png')
    buf.seek(0)
    img_str = base64.b64encode(buf.read()).decode('utf-8')
    plt.close()
img_str
`;
                const plotResult = await pyodide.runPythonAsync(plotCode);

                if (plotResult) {
                    postMessage({ type: 'output', id, result: { type: 'image', content: `data:image/png;base64,${plotResult}` } });
                } else if (result !== undefined) {
                    postMessage({ type: 'output', id, result: { type: 'text', content: result.toString() } });
                }

                postMessage({ type: 'complete', id });

            } catch (err: any) {
                postMessage({ type: 'error', id, error: err.message });
            }
            break;
    }
};
