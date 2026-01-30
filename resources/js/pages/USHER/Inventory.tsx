import React from 'react';
import { Head } from '@inertiajs/react';
import { USHERSidebar } from '@/components/sidebar/usher-sidebar';
import {
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import type { NavItem } from '@/types';
import { Package, List, LogOut, LogIn, AlertTriangle, ShoppingCart, Truck } from 'lucide-react';

interface InventoryPageComponent extends React.FC {
  layout?: any;
}

const Inventory: InventoryPageComponent = () => {
  // Navigation items for USHER system
  const navItems: NavItem[] = [
    {
      title: 'Inventory',
      // No href - this makes it a dropdown only
      icon: Package,
      submenu: [
        {
          title: 'Master List',
          href: '/usher/master-list',
          icon: List,
        },
        {
          title: 'Stock Out',
          href: '/usher/stock-out',
          icon: LogOut,
        },
        {
          title: 'Stock In',
          href: '/usher/stock-in',
          icon: LogIn,
        },
        {
          title: 'Damaged',
          href: '/usher/damaged',
          icon: AlertTriangle,
        },
      ],
    },
    {
      title: 'Purchase Order',
      href: '/usher/purchase-order',
      icon: ShoppingCart,
    },
    {
      title: 'Deployment',
      href: '/usher/deployment',
      icon: Truck,
    },
  ];

  return (
    <>
      <Head title="USHER Inventory System" />
      <SidebarProvider>
        <USHERSidebar items={navItems} />
        <main className="flex-1 w-full overflow-hidden">
          <div className="flex items-center gap-4 p-4 border-b">
            <SidebarTrigger />
            <h1 className="text-xl font-bold">USHER Inventory System</h1>
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