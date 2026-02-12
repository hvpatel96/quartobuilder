import { Scissors } from 'lucide-react';

export const PageBreakBlock = () => {
    return (
        <div className="flex items-center justify-center py-4 opacity-50 hover:opacity-100 transition-opacity">
            <div className="h-px bg-gray-300 dark:bg-gray-700 w-full relative group">
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-50 dark:bg-gray-900 px-3 py-1 flex items-center gap-2 text-xs text-gray-500 border border-gray-200 dark:border-gray-700 rounded-full">
                    <Scissors className="w-3 h-3" />
                    <span className="font-mono font-medium">PAGE BREAK</span>
                </div>
            </div>
        </div>
    );
};
