'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  HardDrive, 
  File, 
  Clock, 
  Share2, 
  Star,
  FileText,
  Image,
  Video,
  Music,
  Archive
} from 'lucide-react';

interface DriveStatsProps {
  stats: {
    totalFiles: number;
    recentFiles: number;
    sharedFiles: number;
    starredFiles: number;
    storageUsed: number; // in bytes
    storageTotal: number; // in bytes
    fileTypes: {
      documents: number;
      images: number;
      videos: number;
      audio: number;
      archives: number;
      others: number;
    };
  };
}

export default function DriveStats({ stats }: DriveStatsProps) {
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const storagePercentage = (stats.storageUsed / stats.storageTotal) * 100;
  
  const getStorageColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  const fileTypeIcons = {
    documents: { icon: FileText, color: 'text-blue-400' },
    images: { icon: Image, color: 'text-green-400' },
    videos: { icon: Video, color: 'text-purple-400' },
    audio: { icon: Music, color: 'text-orange-400' },
    archives: { icon: Archive, color: 'text-gray-400' },
    others: { icon: File, color: 'text-gray-500' }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">

      {/* File Counts */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-sm font-medium flex items-center gap-2">
            <File className="w-4 h-4 text-green-400" />
            Files
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-2xl font-bold text-white">
            {stats.totalFiles.toLocaleString()}
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Clock className="w-3 h-3 text-blue-400" />
                <span className="text-gray-400">Recent</span>
              </div>
              <span className="text-white">{stats.recentFiles}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Star className="w-3 h-3 text-yellow-400" />
                <span className="text-gray-400">Starred</span>
              </div>
              <span className="text-white">{stats.starredFiles}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Share2 className="w-3 h-3 text-purple-400" />
                <span className="text-gray-400">Shared</span>
              </div>
              <span className="text-white">{stats.sharedFiles}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File Types - Documents & Images */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-sm font-medium">File Types</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.entries(fileTypeIcons).slice(0, 3).map(([type, { icon: Icon, color }]) => {
            const count = stats.fileTypes[type as keyof typeof stats.fileTypes];
            const percentage = stats.totalFiles > 0 ? (count / stats.totalFiles) * 100 : 0;
            
            return (
              <div key={type} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-3 h-3 ${color}`} />
                    <span className="text-gray-400 capitalize">{type}</span>
                  </div>
                  <span className="text-white">{count}</span>
                </div>
                <Progress 
                  value={percentage} 
                  className="h-1 bg-zinc-800"
                />
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* File Types - Others */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-sm font-medium">More Types</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.entries(fileTypeIcons).slice(3).map(([type, { icon: Icon, color }]) => {
            const count = stats.fileTypes[type as keyof typeof stats.fileTypes];
            const percentage = stats.totalFiles > 0 ? (count / stats.totalFiles) * 100 : 0;
            
            return (
              <div key={type} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-3 h-3 ${color}`} />
                    <span className="text-gray-400 capitalize">{type}</span>
                  </div>
                  <span className="text-white">{count}</span>
                </div>
                <Progress 
                  value={percentage} 
                  className="h-1 bg-zinc-800"
                />
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}