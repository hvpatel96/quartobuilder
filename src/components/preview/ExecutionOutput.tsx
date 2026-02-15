import { useExecution } from '../../contexts/ExecutionContext';
import { Play, Loader2, Square } from 'lucide-react';
import { clsx } from 'clsx';

interface ExecutionOutputProps {
    blockId: string;
    code: string;
    language: string;
    showOutput?: boolean;
}

export const ExecutionOutput = ({ blockId, code, language, showOutput = true }: ExecutionOutputProps) => {
    const { runR, runPython, cancelExecution, results, isRunning, isReady } = useExecution();
    const blockResults = results[blockId] || [];
    const running = isRunning[blockId];

    // Determine if backend is ready
    const ready = language === 'r' ? isReady.r : language === 'python' ? isReady.python : false;

    const handleRun = async () => {
        if (!ready) return;
        if (language === 'r') {
            await runR(code, blockId);
        } else if (language === 'python') {
            await runPython(code, blockId);
        }
    };

    const handleCancel = () => {
        cancelExecution(blockId);
    };

    if (!showOutput) return null;

    return (
        <div className="mt-2 space-y-2">
            {/* Toolbar / Status */}
            <div className="flex items-center gap-2">
                <button
                    onClick={handleRun}
                    disabled={!ready || running}
                    className={clsx(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                        ready
                            ? "bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-500"
                    )}
                    title={!ready ? "Loading execution engine..." : "Run code"}
                >
                    {running ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                        <Play className="w-3.5 h-3.5 fill-current" />
                    )}
                    {running ? "Running..." : "Run"}
                </button>

                {running && (
                    <button
                        onClick={handleCancel}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 transition-colors"
                        title="Cancel execution"
                    >
                        <Square className="w-3 h-3 fill-current" />
                        Cancel
                    </button>
                )}

                {!ready && (
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Initializing {language === 'r' ? "R" : "Python"} engine...
                    </span>
                )}
            </div>

            {/* Results Display */}
            {(blockResults.length > 0) && (
                <div className="border border-gray-200 dark:border-gray-800 rounded-md overflow-hidden bg-white dark:bg-gray-950">
                    {blockResults.map((res, idx) => (
                        <div key={idx} className="p-3 border-b border-gray-100 dark:border-gray-900 last:border-0">
                            {res.type === 'text' ? (
                                <pre className="text-sm font-mono whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                                    {typeof res.content === 'string' ? res.content : JSON.stringify(res.content, null, 2)}
                                </pre>
                            ) : (
                                <div className="flex justify-center bg-white">
                                    <img src={res.content} alt="Plot output" className="max-w-full h-auto" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
