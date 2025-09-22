'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Shield,
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from '@/components/ui/sidebar';

// Admin navigation items
const adminNavigationItems = [
  {
    title: 'Dashboard',
    url: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Users',
    url: '/admin/users',
    icon: Users,
  },
];

export const AdminSideBar = () => {
  const pathname = usePathname();
  

  return (
    <Sidebar className="border-r border-zinc-800 bg-black">
      {/* Header */}
      <SidebarHeader className="border-b border-zinc-800 p-4 bg-black">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-[#6e73fa] to-[#5e5e5e] rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-white font-bold text-lg">Admin Panel</h2>
            <p className="text-gray-400 text-xs">System Control</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-black p-2">
        {/* Main Admin Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-400 font-medium text-xs uppercase tracking-wider px-3 py-2">
            Administration
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminNavigationItems.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className={`
                      text-gray-300 hover:text-white hover:bg-zinc-950 transition-all duration-300 rounded-xl mx-2 p-3
                      ${pathname === item.url ? 'bg-[#6e73fa]/30 text-[#6e73fa] border-r-2 border-[#6e73fa] hover:border-[#6e73fa]/50 shadow-2xl shadow-[#6e73fa]/20' : 'hover:border-[#6e73fa]/30 hover:shadow-lg'}
                    `}
                  >
                    <Link
                      href={item.url}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center">
                        <item.icon className="w-4 h-4" />
                        <span className="ml-3">{item.title}</span>
                      </div>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

    </Sidebar>
  );
};
