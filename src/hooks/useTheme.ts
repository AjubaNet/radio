import { useState, useEffect } from 'react';

export type Theme = 'dark' | 'light';

const STORAGE_KEY = 'radiolab-theme';

export function useTheme() {
    const [theme, setThemeState] = useState<Theme>(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        return (saved === 'light' ? 'light' : 'dark') as Theme;
    });

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem(STORAGE_KEY, theme);
    }, [theme]);

    const toggleTheme = () => setThemeState(t => t === 'dark' ? 'light' : 'dark');
    const setTheme = (t: Theme) => setThemeState(t);

    return { theme, toggleTheme, setTheme };
}
