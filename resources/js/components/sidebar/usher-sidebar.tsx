import React, { useState } from 'react';
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

// ===== NAVIGATION ITEMS CONFIGURATION =====
// Change the order/items here and it updates everywhere!
export const usherNavItems: NavItem[] = [
  {
    title: 'Inventory',
    href: '/usher/inventory',
    icon: Package,
    submenu: [
      {
        title: 'Master List',
        href: '/usher/master-list',
        icon: List,
      },
      {
        title: 'Stock In',
        href: '/usher/stock-in',
        icon: LogIn,
      },
      {
        title: 'Stock Out',
        href: '/usher/stock-out',
        icon: LogOut,
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

interface NavItemWithSubmenu extends NavItem {
  submenu?: NavItem[];
}

interface USHERSidebarProps {
  items?: NavItemWithSubmenu[];
}

export function USHERSidebar({ items = usherNavItems }: USHERSidebarProps) {
  const { isCurrentUrl } = useCurrentUrl();
  const [expandedItems, setExpandedItems] = useState<string[]>(['Inventory']);

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  return (
    <SidebarComponent>
      {/* Header */}
      <SidebarHeader>
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center font-bold text-lg group-hover:shadow-lg group-hover:scale-110 transition-all">
            U
          </div>
          <div>
            <h1 className="text-lg font-bold group-hover:text-blue-400 transition-colors">
              USHER
            </h1>
            <p className="text-xs text-gray-400">Inventory</p>
          </div>
        </Link>
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
                      <a
                        href={item.href}
                        className="flex-1 flex items-center gap-2 px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-700/50 hover:text-white transition-all"
                      >
                        {item.icon && <item.icon size={20} />}
                        <span className="font-medium text-base">{item.title}</span>
                      </a>
                    ) : (
                      <button
                        onClick={() => toggleExpanded(item.title)}
                        className="flex-1 flex items-center gap-2 px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-700/50 hover:text-white transition-all"
                      >
                        {item.icon && <item.icon size={20} />}
                        <span className="font-medium text-base">{item.title}</span>
                      </button>
                    )}
                    {hasSubmenu && (
                      <button
                        onClick={() => toggleExpanded(item.title)}
                        className="px-3 py-2 text-gray-300 hover:text-white"
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
                            <a
                              href={subitem.href}
                              className="flex items-center gap-2 w-full px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-700/50 hover:text-white transition-all"
                            >
                              {subitem.icon && <subitem.icon size={16} />}
                              <span className="text-base">{subitem.title}</span>
                            </a>
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
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/" prefetch>
                <Home size={20} />
                <span className="text-base">Back to Home</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </SidebarComponent>
  );
}