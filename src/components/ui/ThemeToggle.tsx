'use client';

import { useTheme } from '@/components/ThemeProvider';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="relative w-10 h-10 rounded-full flex items-center justify-center
                 text-zinc-600 dark:text-zinc-400 
                 hover:bg-zinc-100 dark:hover:bg-zinc-800 
                 transition-all duration-200"
            aria-label={theme === 'light' ? 'Activar modo oscuro' : 'Activar modo claro'}
        >
            <Sun className={`w-5 h-5 absolute transition-all duration-300 ${theme === 'light'
                    ? 'opacity-100 rotate-0 scale-100'
                    : 'opacity-0 -rotate-90 scale-0'
                }`} />
            <Moon className={`w-5 h-5 absolute transition-all duration-300 ${theme === 'dark'
                    ? 'opacity-100 rotate-0 scale-100'
                    : 'opacity-0 rotate-90 scale-0'
                }`} />
        </button>
    );
}
