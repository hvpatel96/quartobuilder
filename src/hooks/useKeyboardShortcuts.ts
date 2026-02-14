import { useEffect } from 'react';

interface KeyboardShortcutActions {
    onUndo?: () => void;
    onRedo?: () => void;
    onSave?: () => void;
    onExport?: () => void;
}

export function useKeyboardShortcuts(actions: KeyboardShortcutActions) {
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            const ctrl = e.ctrlKey || e.metaKey;

            if (ctrl && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                actions.onUndo?.();
            } else if (ctrl && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
                e.preventDefault();
                actions.onRedo?.();
            } else if (ctrl && e.key === 's' && !e.shiftKey) {
                e.preventDefault();
                actions.onSave?.();
            } else if (ctrl && e.key === 'e' && e.shiftKey) {
                e.preventDefault();
                actions.onExport?.();
            }
        };

        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [actions]);
}
