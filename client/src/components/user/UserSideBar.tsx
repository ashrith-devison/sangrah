'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Clock,
  UsersRound,
  Upload,
  Trash2,
  Database,
  Star,
  HardDrive,
  Tag,
  RefreshCw,
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
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useStorageQuota } from '@/hooks/useStorageQuota';
import { StorageProvider, useStorageContext } from '@/contexts/StorageContext';

// Navigation items
const navigationItems = [
  {
    title: 'Home',
    url: '/user/home',
    icon: Home,
  },
  {
    title: 'Recent Files',
    url: '/user/recent',
    icon: Clock,
    badge: 'new',
  },
  {
    title: 'Upload',
    url: '/user/upload',
    icon: Upload,
  },
  {
    title: 'Shared Files',
    url: '/user/shared',
    icon: UsersRound,
    badge: 'new',
  },
  {
    title: 'Starred',
    url: '/user/starred',
    icon: Star,
  },
];

const organizationItems = [
  {
    title: 'My Drive',
    url: '/user/drive',
    icon: Database,
  },
];

const otherItems = [
  {
    title: 'Trash',
    url: '/user/trash',
    icon: Trash2,
    badge: 'soon',
  },
];

const UserSideBarContent = () => {
  const pathname = usePathname();
  const { loading, error, getStorageStats, refetch } = useStorageQuota();
  const storageContext = useStorageContext();
  
  const storageStats = getStorageStats();

  // Listen for storage refresh requests from context
  React.useEffect(() => {
    if (storageContext) {
      // Could add more sophisticated event handling here if needed
    }
  }, [storageContext]);

  return (
    <Sidebar className="border-r border-zinc-800 bg-black">
      {/* Header */}
      <SidebarHeader className="border-b border-zinc-800 p-4 bg-black">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-[#6e73fa] to-[#5e5e5e] rounded-lg flex items-center justify-center">
            <Database className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-white font-bold text-lg">File Vault</h2>
            <p className="text-gray-400 text-xs">Personal Storage</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-black p-2">
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-400 font-medium text-xs uppercase tracking-wider px-3 py-2">
            Quick Access
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map(item => (
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
                      {item.badge && (
                        <Badge
                          variant="secondary"
                          className="bg-[#6e73fa]/20 text-[#6e73fa] text-xs px-2 py-0"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Organization */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-400 font-medium text-xs uppercase tracking-wider px-3 py-2">
            Organization
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {organizationItems.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className={`
                      text-gray-300 hover:text-white hover:bg-zinc-950 transition-all duration-300 rounded-xl mx-2 p-3
                      ${pathname === item.url ? 'bg-[#6e73fa]/30 text-[#6e73fa] border-r-2 border-[#6e73fa] hover:border-[#6e73fa]/50 shadow-2xl shadow-[#6e73fa]/20' : 'hover:border-[#6e73fa]/30 hover:shadow-lg'}
                    `}
                  >
                    <Link href={item.url} className="flex items-center">
                      <item.icon className="w-4 h-4" />
                      <span className="ml-3">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Other */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-400 font-medium text-xs uppercase tracking-wider px-3 py-2">
            Other
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {otherItems.map(item => (
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
                      {item.badge && (
                        <Badge
                          variant="secondary"
                          className="bg-red-500/20 text-red-400 text-xs px-2 py-0"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="border-t border-zinc-800 p-4 bg-black">
        {/* Storage Usage */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-sm">Storage</span>
              {!loading && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={refetch}
                  className="h-4 w-4 p-0 text-gray-400 hover:text-white"
                >
                  <RefreshCw className="w-3 h-3" />
                </Button>
              )}
            </div>
            <span className="text-white text-sm font-medium">
              {loading ? (
                <span className="text-gray-400">Loading...</span>
              ) : error ? (
                <span className="text-red-400">Error</span>
              ) : storageStats ? (
                `${isNaN(Number(storageStats.used)) ? '0.00' : Number(storageStats.used).toFixed(2)}MB / ${isNaN(Number(storageStats.total)) ? '10.00' : Number(storageStats.total).toFixed(2)}MB`
              ) : (
                '0.00MB / 10.00MB'
              )}
            </span>
          </div>
          
          <Progress 
            value={loading ? 0 : error ? 0 : storageStats?.percentage || 0} 
            className="h-2" 
          />
          
          <div className="flex justify-between text-xs">
            <span className="text-green-400">
              {loading ? 'Loading...' : error ? 'N/A' : storageStats ? storageStats.remaining + ' free' : '10MB free'}
            </span>
            <span className="text-gray-400">
              {loading ? '...' : error ? 'Error' : storageStats ? `${storageStats.percentage}% used` : '0% used'}
            </span>
          </div>
          
          {error && (
            <div className="text-xs text-red-400 text-center">
              Failed to load storage data
            </div>
          )}
        </div>

        {/* Upgrade Button */}
        <Button
          size="sm"
          className="w-full mt-3 bg-gradient-to-r from-[#6e73fa] to-[#5e5e5e] text-white"
        >
          <HardDrive className="w-3 h-3 mr-2" />
          Upgrade Storage
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};

// Main export component with storage provider
export const UserSideBar = () => {
  return (
    <StorageProvider>
      <UserSideBarContent />
    </StorageProvider>
  );
};
