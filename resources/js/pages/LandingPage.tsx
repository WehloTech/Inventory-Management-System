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
      bgColor: 'bg-white',
      icon: '/usher.png'  // Changed from /images/usher.png
    },
    { 
      id: 'usherette', 
      label: 'USHERETTE', 
      path: '/usherette',
      bgColor: 'bg-white',
      icon: '/usherrete.jpg'  // Changed from /images/usherrete.jpg
    },
    { 
      id: 'wehlo', 
      label: 'WEHLO', 
      path: '/wehlo',
      bgColor: 'bg-white',
      icon: '/wehlo.png'  // Changed from /images/wehlo.png
    },
    { 
      id: 'hoclomac', 
      label: 'HOCLOMAC', 
      path: '/hoclomac',
      bgColor: 'bg-white',
      icon: '/hoclomac.jpg'  // Changed from /images/hoclomac.jpg
    },
    { 
      id: 'all', 
      label: 'ALL', 
      path: '/all',
      bgColor: 'bg-white',
      icon: '/ALL.png'  // Changed from /images/ALL.png
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-6xl">
        {/* Heading */}
        <h1 className="text-5xl font-bold text-black text-center mb-16">
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
                  className={`${system.bgColor} w-40 h-40 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-2xl transition-all duration-200 group-hover:scale-105 group-hover:border-4 group-hover:border-blue-400`}
                >
                  {/* Actual Image */}
                  <img 
                    src={system.icon} 
                    alt={system.label}
                    className="w-24 h-24 object-contain"
                  />
                </div>

                {/* Label */}
                <p className="text-black text-lg font-medium group-hover:text-gray-700 transition-colors duration-200">
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