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
    { id: 'usher', label: 'USHER', path: '/inventory/usher/master-list', icon: '/usher.png' },
    { id: 'usherette', label: 'USHERETTE', path: '/inventory/usherette/master-list', icon: '/usherrete.jpg' },
    { id: 'wehlo', label: 'WEHLO', path: '/inventory/wehlo/master-list', icon: '/wehlo.png' },
    { id: 'hoclomac', label: 'HOCLOMAC', path: '/inventory/hoclomac/master-list', icon: '/hoclomac.jpg' },
    { id: 'shared', label: 'SHARED', path: '/inventory/shared/master-list', icon: '/ALL.png' },
  ];

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-6 transition-all duration-700 relative overflow-hidden ${
      isDark 
        ? 'bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black' 
        : 'bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-white via-gray-100 to-gray-200'
    }`}>
      
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-green-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />

      {/* Header Section */}
      <div className="absolute top-8 right-8 z-50">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-6xl z-10">
        <div className="text-center mb-16 space-y-4">
          <h1 className={`text-5xl md:text-6xl font-extrabold tracking-tight transition-colors duration-300 ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            Choose <span className="text-green-500">Inventory</span>
          </h1>
          <p className={`text-lg opacity-60 font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Select a system to manage your assets
          </p>
        </div>

        {/* Profile Grid */}
        <div className="flex flex-wrap justify-center gap-10">
          {systems.map((system, index) => (
            <Link
              key={system.id}
              href={system.path}
              className="group flex flex-col items-center gap-6 outline-none animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="relative">
                {/* Glow Effect behind card */}
                <div className={`absolute inset-0 rounded-2xl blur-xl transition-opacity duration-500 opacity-0 group-hover:opacity-40 ${
                  isDark ? 'bg-green-400' : 'bg-green-500'
                }`} />
                
                {/* Profile Card */}
                <div className={`relative w-44 h-44 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 transform group-hover:-translate-y-2 group-hover:scale-105 ${
                  isDark 
                    ? 'bg-slate-900/50 border-slate-800 backdrop-blur-md group-hover:border-green-400' 
                    : 'bg-white/80 border-gray-200 backdrop-blur-md group-hover:border-green-500 shadow-xl group-hover:shadow-2xl'
                }`}>
                  <img 
                    src={system.icon} 
                    alt={system.label}
                    className="w-28 h-28 object-contain transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
              </div>

              {/* Label */}
              <div className="text-center">
                <p className={`text-xl font-bold tracking-wide transition-all duration-300 ${
                  isDark 
                    ? 'text-gray-400 group-hover:text-white' 
                    : 'text-gray-600 group-hover:text-black'
                }`}>
                  {system.label}
                </p>
                {/* Animated Underline */}
                <div className="h-1 w-0 group-hover:w-full bg-green-500 mx-auto transition-all duration-300 rounded-full mt-1" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

LandingPage.layout = undefined;

export default LandingPage;