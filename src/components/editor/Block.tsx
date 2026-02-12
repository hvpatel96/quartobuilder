import React from 'react';
import { GripVertical, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface BlockProps {
    id: string;
    onDelete: (id: string) => void;
    onMoveUp: (id: string) => void;
    onMoveDown: (id: string) => void;
    children: React.ReactNode;
    active?: boolean;
}

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

export const Block = ({ id, onDelete, onMoveUp, onMoveDown, children, active }: BlockProps) => {
    return (
        <div className={cn(
            "group relative flex items-start -ml-12 pl-12 pr-4 py-2 rounded-md transition-colors",
            active ? "bg-blue-50/50 dark:bg-blue-900/10 ring-1 ring-blue-200 dark:ring-blue-800" : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
        )}>
            {/* Controls Container - Visible on group hover */}
            <div className="absolute left-0 top-2 flex flex-col items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm z-10 w-10">
                <button
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-grab active:cursor-grabbing"
                    title="Drag to move"
                >
                    <GripVertical className="w-4 h-4" />
                </button>
                <div className="h-px w-full bg-gray-200 dark:bg-gray-700 my-0.5"></div>
                <button onClick={() => onMoveUp(id)} className="p-1 text-gray-400 hover:text-blue-500" title="Move Up">
                    <ArrowUp className="w-3 h-3" />
                </button>
                <button onClick={() => onMoveDown(id)} className="p-1 text-gray-400 hover:text-blue-500" title="Move Down">
                    <ArrowDown className="w-3 h-3" />
                </button>
                <div className="h-px w-full bg-gray-200 dark:bg-gray-700 my-0.5"></div>
                <button onClick={() => onDelete(id)} className="p-1 text-gray-400 hover:text-red-500" title="Delete Block">
                    <Trash2 className="w-3 h-3" />
                </button>
            </div>

            {/* Block Content */}
            <div className="flex-1 w-full min-w-0">
                {children}
            </div>
        </div>
    );
};
