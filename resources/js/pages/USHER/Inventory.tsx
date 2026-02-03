import React from 'react';
import { Head } from '@inertiajs/react';
import { USHERSidebar } from '@/components/sidebar/usher-sidebar';
import {
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';

interface InventoryPageComponent extends React.FC {
  layout?: any;
}

const Inventory: InventoryPageComponent = () => {
  return (
    <>
      <Head title="USHER Inventory System" />
      <SidebarProvider>
        <USHERSidebar />
        <main className="flex-1 w-full overflow-hidden">
          <div className="flex items-center justify-between gap-4 p-4 border-b">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <h1 className="text-xl font-bold">USHER Inventory System</h1>
            </div>
          </div>
          
          <div className="w-full h-full flex flex-col items-center justify-start p-6 pt-20">
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white text-center">
              Welcome to USHER
            </h1>
          </div>
        </main>
      </SidebarProvider>
    </>
  );
};

export default Inventory;