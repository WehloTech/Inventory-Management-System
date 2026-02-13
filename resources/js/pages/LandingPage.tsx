import React from 'react';
import { Link } from '@inertiajs/react';
import { ThemeToggle } from '../components/themetoggle';
import { useAppearance } from '../hooks/use-appearance';

interface LandingPageComponent extends React.FC {
  layout?: undefined;
}

const LandingPage: LandingPageComponent = () => {
  const { resolvedAppearance } = useAppearance();
  const isDark = resolvedAppearance === 'dark';

  const systems = [
    { 
      id: 'usher', 
      label: 'USHER', 
      path: '/inventory/usher/master-list',
      icon: '/usher.png'
    },
    { 
      id: 'usherette', 
      label: 'USHERETTE', 
      path: '/inventory/usherette/master-list',
      icon: '/usherrete.jpg'
    },
    { 
      id: 'wehlo', 
      label: 'WEHLO', 
      path: '/inventory/wehlo/master-list',
      icon: '/wehlo.png'
    },
    { 
      id: 'hoclomac', 
      label: 'HOCLOMAC', 
      path: '/inventory/hoclomac/master-list',
      icon: '/hoclomac.jpg'
    },
    { 
      id: 'all', 
      label: 'ALL', 
      path: '/inventory/all/master-list',
      icon: '/ALL.png'
    },
  ];

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-8 transition-colors duration-300 relative ${
      isDark ? 'bg-slate-950' : 'bg-gray-100'
    }`}>
      {/* Theme Toggle Button */}
      <div className="absolute top-8 right-8">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-6xl">
        {/* Heading */}
        <h1 className={`text-5xl font-bold text-center mb-16 transition-colors duration-300 ${
          isDark ? 'text-white' : 'text-black'
        }`}>
          Choose Inventory 
        </h1>

        {/* Profile Grid */}
        <div className="flex flex-wrap justify-center gap-8 mb-12">
          {systems.map((system) => (
            <Link
              key={system.id}
              href={system.path}
              className="group cursor-pointer focus:outline-none"
            >
              <div className="flex flex-col items-center gap-4">
                {/* Profile Card */}
                <div
                  className={`w-40 h-40 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:border-4 ${
                    isDark 
                      ? 'bg-slate-800 group-hover:border-green-400' 
                      : 'bg-white group-hover:border-green-500'
                  }`}
                >
                  {/* Actual Image */}
                  <img 
                    src={system.icon} 
                    alt={system.label}
                    className="w-24 h-24 object-contain"
                  />
                </div>

                {/* Label */}
                <p className={`text-lg font-medium transition-colors duration-200 ${
                  isDark 
                    ? 'text-gray-200 group-hover:text-green-400' 
                    : 'text-black group-hover:text-green-600'
                }`}>
                  {system.label}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

// Prevent layout from wrapping this page
LandingPage.layout = undefined;

export default LandingPage;