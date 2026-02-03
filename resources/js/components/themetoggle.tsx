import { useAppearance } from '../hooks/use-appearance';

export function ThemeToggle() {
    const { resolvedAppearance, updateAppearance } = useAppearance();

    const toggleTheme = () => {
        updateAppearance(resolvedAppearance === 'dark' ? 'light' : 'dark');
    };

    return (
        <button
            onClick={toggleTheme}
            className="relative inline-flex items-center h-8 rounded-full w-16 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 bg-gray-300 dark:bg-blue-600"
            aria-label="Toggle theme"
        >
            {/* Sun Icon (Light Mode) */}
            <span className="absolute left-2 text-sm">☀️</span>
            
            {/* Moon Icon (Dark Mode) */}
            <span className="absolute right-2 text-sm">🌙</span>
            
            {/* Toggle Circle */}
            <span
                className={`inline-block w-6 h-6 transform transition-transform bg-white rounded-full shadow-md ${
                    resolvedAppearance === 'dark' ? 'translate-x-8' : 'translate-x-1'
                }`}
            />
        </button>
    );
}