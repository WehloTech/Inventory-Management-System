import React, { useState, useEffect } from 'react';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  Sidebar as SidebarComponent,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import type { NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { Home, ChevronDown, Package, List, LogOut, LogIn, AlertTriangle, ShoppingCart, Truck } from 'lucide-react';
import { ThemeToggle } from '@/components/themetoggle';

// System logo mapping
const systemLogos: Record<string, string> = {
  usher: '/usher.png',
  usherette: '/usherrete.jpg',
  wehlo: '/wehlo.png',
  hoclomac: '/hoclomac.jpg',
  all: '/ALL.png',
};

// Function to generate navigation items based on system
const getNavItems = (system: string): NavItem[] => [
  {
    title: 'Home',
    href: `/inventory/${system}/inventory`,
    icon: Home,
  },
  {
    title: 'Inventory',
    icon: Package,
    submenu: [
      {
        title: 'Master List',
        href: `/inventory/${system}/master-list`,
        icon: List,
      },
      {
        title: 'Stock In',
        href: `/inventory/${system}/stock-in`,
        icon: LogIn,
      },
      {
        title: 'Stock Out',
        href: `/inventory/${system}/stock-out`,
        icon: LogOut,
      },
      {
        title: 'In Use',
        href: `/inventory/${system}/in-use`,
        icon: AlertTriangle,
      },
      {
        title: 'Damaged',
        href: `/inventory/${system}/damaged`,
        icon: AlertTriangle,
      },
    ],
  },
  {
    title: 'Purchase Order',
    href: `/inventory/${system}/purchase-order`,
    icon: ShoppingCart,
  },
  {
    title: 'Deployment',
    href: `/inventory/${system}/deployment`,
    icon: Truck,
  },
];

interface NavItemWithSubmenu extends NavItem {
  submenu?: NavItem[];
}

interface USHERSidebarProps {
  system?: string;
}

export function USHERSidebar({ system }: USHERSidebarProps) {
  const { isCurrentUrl } = useCurrentUrl();
  const [expandedItems, setExpandedItems] = useState<string[]>(['Inventory']);
  const [currentSystem, setCurrentSystem] = useState<string>('usher');

  // Detect system from URL if not provided as prop
  useEffect(() => {
    if (system) {
      setCurrentSystem(system);
    } else {
      // Extract system from current URL
      const path = window.location.pathname;
      const match = path.match(/\/inventory\/([^\/]+)/);
      if (match && match[1]) {
        setCurrentSystem(match[1]);
      }
    }
  }, [system]);

  const items = getNavItems(currentSystem);
  const systemDisplayName = currentSystem.toUpperCase();
  const systemLogo = systemLogos[currentSystem] || systemLogos.usher; // Fallback to usher logo

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  return (
    <SidebarComponent className="bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
      {/* Header */}
      <SidebarHeader>
        <div className="flex items-center justify-between">
          <Link href={`/inventory/${currentSystem}/inventory`} className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center group-hover:shadow-lg group-hover:scale-110 transition-all bg-white dark:bg-gray-800 p-1">
              <img 
                src={systemLogo} 
                alt={systemDisplayName}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-400 transition-colors">
                {systemDisplayName}
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Inventory</p>
            </div>
          </Link>
          <ThemeToggle />
        </div>
      </SidebarHeader>

      {/* Content */}
      <SidebarContent>
        <SidebarGroup className="px-2 py-0 pt-6">
          <SidebarMenu>
            {items.map((item) => {
              const isExpanded = expandedItems.includes(item.title);
              const hasSubmenu = item.submenu && item.submenu.length > 0;

              return (
                <SidebarMenuItem key={item.title}>
                  <div className="flex items-center gap-0 w-full">
                    {item.href ? (
                      <Link
                        href={item.href}
                        className="flex-1 flex items-center gap-2 px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white transition-all"
                      >
                        {item.icon && <item.icon size={20} />}
                        <span className="font-medium text-base">{item.title}</span>
                      </Link>
                    ) : (
                      <button
                        onClick={() => toggleExpanded(item.title)}
                        className="flex-1 flex items-center gap-2 px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white transition-all"
                      >
                        {item.icon && <item.icon size={20} />}
                        <span className="font-medium text-base">{item.title}</span>
                      </button>
                    )}
                    {hasSubmenu && (
                      <button
                        onClick={() => toggleExpanded(item.title)}
                        className="px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                      >
                        <ChevronDown
                          size={16}
                          className={`transition-transform duration-200 ${
                            isExpanded ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                    )}
                  </div>
                  {isExpanded && hasSubmenu && item.submenu && (
                    <SidebarMenuSub>
                      {item.submenu.map((subitem) => (
                        subitem.href && (
                          <SidebarMenuSubItem key={subitem.title}>
                            <Link
                              href={subitem.href}
                              className="flex items-center gap-2 w-full px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white transition-all"
                            >
                              {subitem.icon && <subitem.icon size={16} />}
                              <span className="text-base">{subitem.title}</span>
                            </Link>
                          </SidebarMenuSubItem>
                        )
                      ))}
                    </SidebarMenuSub>
                  )}
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="border-t border-gray-200 dark:border-gray-700">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/">
                <Package size={20} />
                <span className="text-base">Back to Inventory</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </SidebarComponent>
  );
}