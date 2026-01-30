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
import { Home, ChevronDown } from 'lucide-react';

interface NavItemWithSubmenu extends NavItem {
  submenu?: NavItem[];
}

interface USHERSidebarProps {
  items: NavItemWithSubmenu[];
}

export function USHERSidebar({ items = [] }: USHERSidebarProps) {
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
        <SidebarGroup className="px-2 py-0">
          <SidebarGroupLabel>Modules</SidebarGroupLabel>
          <SidebarMenu>
            {items.map((item) => {
              const isExpanded = expandedItems.includes(item.title);
              const hasSubmenu = item.submenu && item.submenu.length > 0;

              if (hasSubmenu) {
                return (
                  <SidebarMenuItem key={item.title}>
                    <button
                      onClick={() => toggleExpanded(item.title)}
                      className="flex items-center gap-2 w-full px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-700/50 hover:text-white transition-all duration-200 group"
                    >
                      {item.icon && <item.icon size={20} />}
                      <span className="font-medium text-sm flex-1 text-left">{item.title}</span>
                      <ChevronDown
                        size={16}
                        className={`transition-transform duration-200 ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {isExpanded && item.submenu && (
                      <SidebarMenuSub>
                        {item.submenu.map((subitem) => (
                          subitem.href && (
                            <SidebarMenuSubItem key={subitem.title}>
                              <a
                                href={subitem.href}
                                className="flex items-center gap-2 w-full px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-700/50 hover:text-white transition-all"
                              >
                                {subitem.icon && <subitem.icon size={16} />}
                                <span className="text-sm">{subitem.title}</span>
                              </a>
                            </SidebarMenuSubItem>
                          )
                        ))}
                      </SidebarMenuSub>
                    )}
                  </SidebarMenuItem>
                );
              }

              // Regular menu items (no submenu) - only render if href exists
              if (!item.href) return null;

              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isCurrentUrl(item.href)}
                    tooltip={{ children: item.title }}
                  >
                    <Link 
                      href={item.href}
                    >
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
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
                <span>Back to Home</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </SidebarComponent>
  );
}