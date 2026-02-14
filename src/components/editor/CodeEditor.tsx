import { useRef, useEffect, useCallback } from 'react';
import { EditorView, keymap, placeholder as cmPlaceholder, lineNumbers } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { defaultKeymap, indentWithTab, history, historyKeymap } from '@codemirror/commands';
import { bracketMatching, indentOnInput, syntaxHighlighting, defaultHighlightStyle } from '@codemirror/language';
import { python } from '@codemirror/lang-python';
import { html } from '@codemirror/lang-html';
import { markdown } from '@codemirror/lang-markdown';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';

interface CodeEditorProps {
    value: string;
    onChange: (value: string) => void;
    language?: string;
    placeholder?: string;
    minHeight?: string;
    darkMode?: boolean;
}

function getLanguageExtension(language?: string) {
    switch (language) {
        case 'python': return python();
        case 'r': return javascript(); // R doesn't have an official CM6 extension; JS provides reasonable highlighting
        case 'html': return html();
        case 'markdown': return markdown();
        case 'bash':
        case 'shell': return []; // No built-in bash mode; we still get line numbers and bracket matching
        default: return [];
    }
}

const baseTheme = EditorView.theme({
    '&': {
        fontSize: '13px',
        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
    },
    '.cm-content': {
        padding: '12px 0',
        minHeight: '80px',
    },
    '.cm-gutters': {
        backgroundColor: 'transparent',
        borderRight: '1px solid #e5e7eb',
        color: '#9ca3af',
        fontSize: '11px',
        minWidth: '36px',
    },
    '.cm-activeLineGutter': {
        backgroundColor: 'transparent',
        color: '#6b7280',
    },
    '.cm-activeLine': {
        backgroundColor: 'rgba(59, 130, 246, 0.04)',
    },
    '&.cm-focused .cm-cursor': {
        borderLeftColor: '#3b82f6',
    },
    '&.cm-focused': {
        outline: 'none',
    },
    '.cm-line': {
        padding: '0 12px',
    },
    '.cm-placeholder': {
        color: '#9ca3af',
        fontStyle: 'italic',
    },
});

const darkThemeOverrides = EditorView.theme({
    '.cm-gutters': {
        borderRight: '1px solid #374151',
        color: '#6b7280',
    },
    '.cm-activeLine': {
        backgroundColor: 'rgba(59, 130, 246, 0.08)',
    },
}, { dark: true });

export const CodeEditor = ({ value, onChange, language, placeholder, darkMode }: CodeEditorProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const viewRef = useRef<EditorView | null>(null);
    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;

    // Track whether the view is currently being updated programmatically
    const isExternalUpdate = useRef(false);

    const createExtensions = useCallback(() => {
        const langExt = getLanguageExtension(language);
        const extensions = [
            lineNumbers(),
            history(),
            bracketMatching(),
            indentOnInput(),
            syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
            keymap.of([...defaultKeymap, ...historyKeymap, indentWithTab]),
            baseTheme,
            EditorView.updateListener.of((update) => {
                if (update.docChanged && !isExternalUpdate.current) {
                    onChangeRef.current(update.state.doc.toString());
                }
            }),
            EditorView.lineWrapping,
        ];

        if (placeholder) {
            extensions.push(cmPlaceholder(placeholder));
        }

        if (darkMode) {
            extensions.push(oneDark, darkThemeOverrides);
        }

        if (Array.isArray(langExt)) {
            extensions.push(...langExt);
        } else {
            extensions.push(langExt);
        }

        return extensions;
    }, [language, placeholder, darkMode]);

    // Initialize editor
    useEffect(() => {
        if (!containerRef.current) return;

        const state = EditorState.create({
            doc: value,
            extensions: createExtensions(),
        });

        const view = new EditorView({
            state,
            parent: containerRef.current,
        });

        viewRef.current = view;

        return () => {
            view.destroy();
            viewRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only run once on mount

    // Sync value from parent (e.g. undo/redo changes coming from outside)
    useEffect(() => {
        const view = viewRef.current;
        if (!view) return;
        const currentDoc = view.state.doc.toString();
        if (currentDoc !== value) {
            isExternalUpdate.current = true;
            view.dispatch({
                changes: { from: 0, to: currentDoc.length, insert: value },
            });
            isExternalUpdate.current = false;
        }
    }, [value]);

    // Reconfigure when language or theme changes
    useEffect(() => {
        const view = viewRef.current;
        if (!view) return;
        // Fully recreate state for extension changes
        const state = EditorState.create({
            doc: view.state.doc.toString(),
            extensions: createExtensions(),
        });
        view.setState(state);
    }, [language, darkMode, createExtensions]);

    return <div ref={containerRef} className="cm-editor-wrapper" />;
};
