import React from 'react';
import { Link } from '@inertiajs/react';

interface LandingPageComponent extends React.FC {
  layout?: undefined;
}

const LandingPage: LandingPageComponent = () => {
  const systems = [
    { 
      id: 'usher', 
      label: 'USHER', 
      path: '/usher/inventory',
      bgColor: 'bg-slate-800',
      icon: '/usher.png'
    },
    { 
      id: 'usherette', 
      label: 'USHERETTE', 
      path: '/usherette',
      bgColor: 'bg-slate-800',
      icon: '/usherrete.jpg'
    },
    { 
      id: 'wehlo', 
      label: 'WEHLO', 
      path: '/wehlo',
      bgColor: 'bg-slate-800',
      icon: '/wehlo.png'
    },
    { 
      id: 'hoclomac', 
      label: 'HOCLOMAC', 
      path: '/hoclomac',
      bgColor: 'bg-slate-800',
      icon: '/hoclomac.jpg'
    },
    { 
      id: 'all', 
      label: 'ALL', 
      path: '/all',
      bgColor: 'bg-slate-800',
      icon: '/ALL.png'
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-6xl">
        {/* Heading */}
        <h1 className="text-5xl font-bold text-white text-center mb-16">
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
                  className={`${system.bgColor} w-40 h-40 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-2xl transition-all duration-200 group-hover:scale-105 group-hover:border-4 group-hover:border-cyan-400`}
                >
                  {/* Actual Image */}
                  <img 
                    src={system.icon} 
                    alt={system.label}
                    className="w-24 h-24 object-contain"
                  />
                </div>

                {/* Label */}
                <p className="text-gray-200 text-lg font-medium group-hover:text-cyan-400 transition-colors duration-200">
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