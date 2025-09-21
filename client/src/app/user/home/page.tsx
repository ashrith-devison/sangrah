'use client';

import React from 'react';
import {
  FileText,
  Download,
  Share2,
  HardDrive,
} from 'lucide-react';
import { FileItem, StorageStats, QuickStat } from '@/types/home';
import HomeHeader from '@/components/user/HomeHeader';
import QuickStatsGrid from '@/components/user/QuickStatsGrid';
import StorageCard from '@/components/user/StorageCard';
import ActivityCard from '@/components/user/ActivityCard';
import FilesView from '@/components/user/FilesView';
import { AuthGuard } from '@/components/auth/AuthGuard';

export default function Page() {
  // Mock data for demonstration
  const storageStats: StorageStats = {
    used: 7.2,
    total: 15,
    percentage: 48,
  };

  const recentFiles: FileItem[] = [
    {
      id: 1,
      name: 'Project Presentation.pptx',
      type: 'presentation',
      size: '2.4 MB',
      modified: '2 hours ago',
      shared: true,
      thumbnail: null,
    },
    {
      id: 2,
      name: 'Design Assets.zip',
      type: 'archive',
      size: '45.2 MB',
      modified: '1 day ago',
      shared: false,
      thumbnail: null,
    },
    {
      id: 3,
      name: 'Meeting Recording.mp4',
      type: 'video',
      size: '128.5 MB',
      modified: '3 days ago',
      shared: true,
      thumbnail: null,
    },
    {
      id: 4,
      name: 'Financial Report.pdf',
      type: 'document',
      size: '1.8 MB',
      modified: '1 week ago',
      shared: false,
      thumbnail: null,
    },
    {
      id: 5,
      name: 'Team Photo.jpg',
      type: 'image',
      size: '3.2 MB',
      modified: '2 weeks ago',
      shared: true,
      thumbnail: null,
    },
    {
      id: 6,
      name: 'Background Music.mp3',
      type: 'audio',
      size: '4.7 MB',
      modified: '1 month ago',
      shared: false,
      thumbnail: null,
    },
  ];

  const quickStats: QuickStat[] = [
    {
      label: 'Total Files',
      value: '1,247',
      change: '+12%',
      trend: 'up',
      icon: FileText,
    },
    {
      label: 'Shared Files',
      value: '342',
      change: '+8%',
      trend: 'up',
      icon: Share2,
    },
    {
      label: 'Downloads',
      value: '2,156',
      change: '+24%',
      trend: 'up',
      icon: Download,
    },
    {
      label: 'Storage Saved',
      value: '95%',
      change: '3.2GB',
      trend: 'up',
      icon: HardDrive,
    },
  ];

  return (
    <AuthGuard>
      <div className="p-6">
        {/* Header Section */}
        <HomeHeader />

        {/* Quick Stats */}
        <QuickStatsGrid stats={quickStats} />

        {/* Storage Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <StorageCard storageStats={storageStats} />
          <div className="lg:col-span-2">
            <ActivityCard />
          </div>
        </div>

        {/* Files Section */}
        <FilesView files={recentFiles} />
      </div>
    </AuthGuard>
  );
}
