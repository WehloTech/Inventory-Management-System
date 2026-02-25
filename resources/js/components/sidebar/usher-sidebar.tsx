import React, { useState, useEffect } from 'react';
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  Sidebar as SidebarComponent,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import type { NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import {
  ChevronDown,
  Package,
  ArrowLeftRight,
  PackagePlus,
  PackageMinus,
  Wrench,
  ShieldAlert,
  ShoppingCart,
  Truck,
  BarChart3,
  FlaskConical,
} from 'lucide-react';
import { ThemeToggle } from '@/components/themetoggle';

const systemLogos: Record<string, string> = {
  usher: '/usher.png',
  usherette: '/usherrete.jpg',
  wehlo: '/wehlo.png',
  hoclomac: '/hoclomac.jpg',
  shared: '/ALL.png',
};

const getNavItems = (system: string): NavItem[] => [
  {
    title: 'Inventory',
    icon: Package,
    submenu: [
      {
        title: 'Master List',
        href: `/inventory/${system}/master-list`,
        icon: BarChart3,
      },
      {
        title: 'Stock In',
        href: `/inventory/${system}/stock-in`,
        icon: PackagePlus,
      },
      {
        title: 'Stock Out',
        href: `/inventory/${system}/stock-out`,
        icon: PackageMinus,
      },
      {
        title: 'In Use',
        href: `/inventory/${system}/in-use`,
        icon: Wrench,
      },
      {
        title: 'Damaged',
        href: `/inventory/${system}/damaged`,
        icon: ShieldAlert,
      },
      {
        title: 'Consumable',
        href: `/inventory/${system}/consumable`,
        icon: FlaskConical,
      },
    ],
  },
  {
    title: 'Purchase Order',
    icon: ShoppingCart,
  },
  {
    title: 'Purchase Request',
    icon: ShoppingCart,
  },
  {
    title: 'Deployment',
    icon: Truck,
  },
];

interface USHERSidebarProps {
  system?: string;
}

export function USHERSidebar({ system }: USHERSidebarProps) {
  const { isCurrentUrl } = useCurrentUrl();
  const [expandedItems, setExpandedItems] = useState<string[]>(['Inventory']);
  const [currentSystem, setCurrentSystem] = useState<string>('usher');

  useEffect(() => {
    if (system) {
      setCurrentSystem(system);
    } else {
      const path = window.location.pathname;
      const match = path.match(/\/inventory\/([^\/]+)/);
      if (match && match[1]) {
        setCurrentSystem(match[1]);
      }
    }
  }, [system]);

  const items = getNavItems(currentSystem);
  const systemDisplayName = currentSystem.toUpperCase();
  const systemLogo = systemLogos[currentSystem] || systemLogos.usher;

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  return (
    <SidebarComponent className="bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* ── Header ───────────────────────────────────────────── */}
      <SidebarHeader className="px-4 py-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white dark:bg-gray-800 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 group-hover:ring-blue-400 transition-all p-1">
              <img
                src={systemLogo}
                alt={systemDisplayName}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900 dark:text-white leading-tight group-hover:text-blue-500 transition-colors">
                {systemDisplayName}
              </h1>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 uppercase tracking-wider">Inventory System</p>
            </div>
          </Link>
          <ThemeToggle />
        </div>
      </SidebarHeader>

      {/* ── Nav ──────────────────────────────────────────────── */}
      <SidebarContent className="flex-1 overflow-y-auto px-3 py-4">
        <SidebarGroup>
          <SidebarMenu className="space-y-1">
            {items.map((item) => {
              const isExpanded = expandedItems.includes(item.title);
              const hasSubmenu = item.submenu && item.submenu.length > 0;
              const isActive = item.href ? isCurrentUrl(item.href) : false;

              return (
                <SidebarMenuItem key={item.title}>
                  {/* Top-level row */}
                  <div className="flex items-center w-full rounded-xl overflow-hidden">
                    {hasSubmenu ? (
                      <button
                        onClick={() => toggleExpanded(item.title)}
                        className={`flex-1 flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all w-full ${
                          isExpanded
                            ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                        }`}
                      >
                        {item.icon && (
                          <span className={`flex-shrink-0 ${isExpanded ? 'text-blue-500' : 'text-gray-400 dark:text-gray-500'}`}>
                            <item.icon size={18} />
                          </span>
                        )}
                        <span className="flex-1 text-left">{item.title}</span>
                        <ChevronDown
                          size={15}
                          className={`flex-shrink-0 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-blue-500' : ''}`}
                        />
                      </button>
                    ) : item.href ? (
                      <Link
                        href={item.href}
                        className={`flex-1 flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          isActive
                            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                        }`}
                      >
                        {item.icon && (
                          <span className={`flex-shrink-0 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`}>
                            <item.icon size={18} />
                          </span>
                        )}
                        <span>{item.title}</span>
                      </Link>
                    ) : (
                      <div
                        className="flex-1 flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 dark:text-gray-500 cursor-not-allowed"
                      >
                        {item.icon && (
                          <span className="flex-shrink-0 text-gray-400 dark:text-gray-500">
                            <item.icon size={18} />
                          </span>
                        )}
                        <span>{item.title}</span>
                      </div>
                    )}
                  </div>

                  {/* Submenu */}
                  {isExpanded && hasSubmenu && item.submenu && (
                    <SidebarMenuSub className="mt-1 ml-3 pl-3 border-l-2 border-gray-100 dark:border-gray-800 space-y-0.5">
                      {item.submenu.map((subitem) => {
                        if (!subitem.href) return null;
                        const isSubActive = isCurrentUrl(subitem.href);

                        return (
                          <SidebarMenuSubItem key={subitem.title}>
                            <Link
                              href={subitem.href}
                              className={`group flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm transition-all ${
                                isSubActive
                                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium'
                                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                              }`}
                            >
                              {subitem.icon && (
                                <span className={`flex-shrink-0 transition-colors ${isSubActive ? 'text-blue-500 dark:text-blue-400' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'}`}>
                                  <subitem.icon size={15} />
                                </span>
                              )}
                              <span>{subitem.title}</span>

                              {/* Active pill */}
                              {isSubActive && (
                                <span className="ml-auto w-1.5 h-4 rounded-full bg-blue-500 dark:bg-blue-400" />
                              )}
                            </Link>
                          </SidebarMenuSubItem>
                        );
                      })}
                    </SidebarMenuSub>
                  )}
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      {/* ── Footer ───────────────────────────────────────────── */}
      <SidebarFooter className="px-3 py-3 border-t border-gray-100 dark:border-gray-800">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-all"
        >
          <ArrowLeftRight size={17} className="text-gray-400" />
          <span>Switch System</span>
        </Link>
      </SidebarFooter>
    </SidebarComponent>
  );
}