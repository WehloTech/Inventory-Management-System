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
      bgColor: 'bg-purple-600',
      icon: '👤'
    },
    { 
      id: 'usherette', 
      label: 'USHERETTE', 
      path: '/usherette',
      bgColor: 'bg-cyan-500',
      icon: '😊'
    },
    { 
      id: 'wehlo', 
      label: 'WEHLO', 
      path: '/wehlo',
      bgColor: 'bg-lime-500',
      icon: '😊'
    },
    { 
      id: 'hoclomac', 
      label: 'HOCLOMAC', 
      path: '/hoclomac',
      bgColor: 'bg-red-500',
      icon: '😊'
    },
    { 
      id: 'all', 
      label: 'ALL', 
      path: '/all',
      bgColor: 'bg-blue-600',
      icon: '😊'
    },
  ];

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-6xl">
        {/* Heading */}
        <h1 className="text-5xl font-bold text-white text-center mb-16">
          Choose Your Profile
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
                  className={`${system.bgColor} w-40 h-40 rounded-lg flex items-center justify-center text-7xl shadow-lg group-hover:shadow-2xl transition-all duration-200 group-hover:scale-105 group-hover:border-4 group-hover:border-white`}
                >
                  {/* Placeholder Icon - Replace with actual image */}
                  <div className="w-full h-full rounded-lg bg-black bg-opacity-20 flex items-center justify-center">
                    <span className="text-6xl">📺</span>
                  </div>
                </div>

                {/* Label */}
                <p className="text-gray-400 text-lg font-medium group-hover:text-white transition-colors duration-200">
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