import type { InertiaLinkProps } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';

export type BreadcrumbItem = {
    title: string;
    href: string;
};

export type NavItem = {
    title: string;
    href?: NonNullable<InertiaLinkProps['href']>;  // Make it optional
    icon?: LucideIcon | null;
    isActive?: boolean;
    submenu?: NavItem[];  // Add this line
};