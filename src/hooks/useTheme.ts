import { useState, useEffect, useCallback } from 'react';

type Theme = 'light' | 'dark' | 'system';

const THEME_KEY = 'quartobuilder-theme';

function getSystemDark(): boolean {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function useTheme() {
    const [theme, setThemeState] = useState<Theme>(() => {
        const saved = localStorage.getItem(THEME_KEY);
        return (saved as Theme) || 'system';
    });

    const isDark = theme === 'dark' || (theme === 'system' && getSystemDark());

    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDark]);

    // Listen for system theme changes when in 'system' mode
    useEffect(() => {
        if (theme !== 'system') return;
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = () => {
            if (mq.matches) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        };
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, [theme]);

    const setTheme = useCallback((t: Theme) => {
        setThemeState(t);
        localStorage.setItem(THEME_KEY, t);
    }, []);

    const cycleTheme = useCallback(() => {
        const next: Record<Theme, Theme> = { system: 'dark', dark: 'light', light: 'system' };
        setTheme(next[theme]);
    }, [theme, setTheme]);

    return { theme, setTheme, isDark, cycleTheme };
}
