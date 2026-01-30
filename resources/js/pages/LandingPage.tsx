import React from 'react';
import { Link } from '@inertiajs/react';

interface LandingPageComponent extends React.FC {
  layout?: undefined;
}

const LandingPage: LandingPageComponent = () => {
  const systems = [
    { id: 'usher', label: 'USHER', path: '/usher/inventory' },
    { id: 'usherette', label: 'USHERETTE', path: '/usherette' },
    { id: 'wehlo', label: 'WEHLO', path: '/wehlo' },
    { id: 'hoclomac', label: 'HOCLOMAC', path: '/hoclomac' },
    { id: 'all', label: 'ALL', path: '/all' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
      <div className="w-full max-w-2xl space-y-6">
        {systems.map((system) => (
          <Link
            key={system.id}
            href={system.path}
            className="block w-full bg-gray-900 hover:bg-gray-800 text-white font-bold text-3xl py-8 px-8 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] text-center"
          >
            {system.label}
          </Link>
        ))}
      </div>
    </div>
  );
};

// Prevent layout from wrapping this page
LandingPage.layout = undefined;

export default LandingPage;