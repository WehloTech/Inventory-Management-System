import { useAppearance } from '../hooks/use-appearance';

export function ThemeToggle() {
    const { resolvedAppearance, updateAppearance } = useAppearance();

    const toggleTheme = () => {
        updateAppearance(resolvedAppearance === 'dark' ? 'light' : 'dark');
    };

    return (
        <button
            onClick={toggleTheme}
            className={`relative inline-flex items-center h-6 rounded-full w-12 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                resolvedAppearance === 'dark'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-800'
                    : 'bg-gradient-to-r from-pink-500 via-orange-400 to-orange-500'
            }`}
            aria-label="Toggle theme"
        >
            {/* Sun Icon (Light Mode) */}
            <span className="absolute left-1">
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-yellow-500"
                >
                    <circle cx="12" cy="12" r="5" />
                    <line x1="12" y1="1" x2="12" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="23" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                    <line x1="1" y1="12" x2="3" y2="12" />
                    <line x1="21" y1="12" x2="23" y2="12" />
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
            </span>

            {/* Moon Icon (Dark Mode) */}
            <span className="absolute right-1">
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="text-cyan-300"
                >
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                    {/* Stars */}
                    <circle cx="8" cy="8" r="1" fill="currentColor" opacity="0.6" />
                    <circle cx="16" cy="6" r="1" fill="currentColor" opacity="0.6" />
                </svg>
            </span>

            {/* Toggle Circle */}
            <span
                className={`inline-block w-5 h-5 transform transition-transform duration-300 bg-white rounded-full shadow-lg ${
                    resolvedAppearance === 'dark' ? 'translate-x-6' : 'translate-x-0.5'
                }`}
            />
        </button>
    );
}   