export type ExecutionResult = {
    type: 'text' | 'image';
    content: string; // text content or base64 data URL
};

export type WorkerRequest =
    | { type: 'init' }
    | { type: 'run', code: string, id: string }
    | { type: 'writeFile', filename: string, content: string | ArrayBuffer };

export type WorkerResponse =
    | { type: 'loaded' }
    | { type: 'output', result: ExecutionResult, id?: string }
    | { type: 'error', error: string, id?: string }
    | { type: 'complete', id?: string };
