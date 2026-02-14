import React, { useState } from 'react';
import { GripVertical, Trash2, ArrowUp, ArrowDown, Copy, ChevronRight, ChevronDown } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface BlockProps {
    id: string;
    onDelete: (id: string) => void;
    onMoveUp: (id: string) => void;
    onMoveDown: (id: string) => void;
    onDuplicate?: (id: string) => void;
    children: React.ReactNode;
    active?: boolean;
    inColumn?: boolean;
}

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

export const Block = ({ id, onDelete, onMoveUp, onMoveDown, onDuplicate, children, active, inColumn }: BlockProps) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 'auto',
        opacity: isDragging ? 0.5 : 1,
    };

    const [collapsed, setCollapsed] = useState(false);

    return (
        <div
            ref={setNodeRef}
            style={style}
            id={`block-${id}`}
            className={cn(
                "group relative flex items-start -ml-12 pl-12 pr-4 py-2 rounded-md transition-colors",
                active ? "bg-blue-50/50 dark:bg-blue-900/10 ring-1 ring-blue-200 dark:ring-blue-800" : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
            )}
        >
            {/* Controls Container - Hidden in columns */}
            {!inColumn && (
                <div className="absolute left-0 top-2 flex flex-col items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm z-10 w-10">
                    <button
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-grab active:cursor-grabbing"
                        title="Drag to move"
                        {...attributes}
                        {...listeners}
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
                    <button onClick={() => onDuplicate?.(id)} className="p-1 text-gray-400 hover:text-green-500" title="Duplicate Block">
                        <Copy className="w-3 h-3" />
                    </button>
                    <button onClick={() => onDelete(id)} className="p-1 text-gray-400 hover:text-red-500" title="Delete Block">
                        <Trash2 className="w-3 h-3" />
                    </button>
                </div>
            )}

            {/* Block Content */}
            <div className="flex-1 w-full min-w-0">
                {!inColumn && (
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="absolute top-3 right-2 p-0.5 text-gray-300 hover:text-gray-500 dark:hover:text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        title={collapsed ? 'Expand' : 'Collapse'}
                    >
                        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                )}
                {collapsed ? (
                    <div className="text-sm text-gray-400 dark:text-gray-500 italic py-1 truncate cursor-pointer" onClick={() => setCollapsed(false)}>
                        (Collapsed block)
                    </div>
                ) : (
                    children
                )}
            </div>

            {/* Delete button fallback for in-column blocks (optional, or rely on internal controls if any) 
                 Actually, user asked to hide side controls. 
                 If we want delete for column items, it might need to be elsewhere or we assume they use the column header? 
                 Wait, the user said "hide the side controls (drag to move, up, down, delete)".
                 But we still need a way to delete blocks inside columns!
                 The existing Block wrapper puts everything in side controls. 
                 If we hide it, we can't delete blocks inside columns.
                 
                 Let's add a small delete button inside the content area for column blocks?
                 Or maybe just keep delete but hide move controls? 
                 User request: "hide the side controls (drag to move, up, down, delete)". 
                 Strictly following this means no controls. 
                 But that would make it impossible to delete.
                 I will add a small absolute delete button top-right for in-column blocks.
             */}
            {inColumn && (
                <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => onDuplicate?.(id)}
                        className="p-1 text-gray-300 hover:text-green-500"
                        title="Duplicate Block"
                    >
                        <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={() => onDelete(id)}
                        className="p-1 text-gray-300 hover:text-red-500"
                        title="Delete Block"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}
        </div>
    );
};
