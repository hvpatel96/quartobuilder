import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { BlockList } from './BlockList';
import { useReport } from '../../contexts/ReportContext';

export const ReportEditor = () => {
    const { blocks, updateBlockOrder } = useReport();

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            const oldIndex = blocks.findIndex((block) => block.id === active.id);
            const newIndex = blocks.findIndex((block) => block.id === over?.id);

            if (oldIndex !== -1 && newIndex !== -1) {
                const newBlocks = arrayMove(blocks, oldIndex, newIndex);
                updateBlockOrder(newBlocks);
            }
        }
    };

    return (
        <div className="pb-20">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={blocks.map(b => b.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <BlockList blocks={blocks} />
                </SortableContext>
            </DndContext>
        </div>
    );
};
