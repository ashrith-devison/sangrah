'use client';

import React, { useState } from 'react';
import {
  Upload,
  Search,
  Grid3X3,
  List,
  MoreHorizontal,
  FileText,
  Image,
  Video,
  Music,
  Archive,
  Download,
  Share2,
  Trash2,
  Eye,
  Calendar,
  Clock,
  HardDrive,
  TrendingUp,
  Users,
  FolderPlus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import Link from 'next/link';

export default function Page() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data for demonstration
  const storageStats = {
    used: 7.2,
    total: 15,
    percentage: 48,
  };

  const recentFiles = [
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

  const quickStats = [
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

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'document':
      case 'presentation':
        return FileText;
      case 'image':
        return Image;
      case 'video':
        return Video;
      case 'audio':
        return Music;
      case 'archive':
        return Archive;
      default:
        return FileText;
    }
  };

  const getFileColor = (type: string) => {
    switch (type) {
      case 'document':
        return 'text-blue-400';
      case 'presentation':
        return 'text-orange-400';
      case 'image':
        return 'text-green-400';
      case 'video':
        return 'text-purple-400';
      case 'audio':
        return 'text-pink-400';
      case 'archive':
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  };

  const filteredFiles = recentFiles.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome back, Ashrith! 👋
            </h1>
            <p className="text-gray-400">
              Manage your files with intelligent deduplication and secure
              sharing
            </p>
          </div>
          <div className="flex gap-3">
            <Button className="bg-gradient-to-r from-[#6e73fa] to-[#5e5e5e] text-white">
              <FolderPlus className="w-4 h-4 mr-2" />
              New Folder
            </Button>
            <Link href="/user/upload">
              <Button className="bg-gradient-to-r from-[#6e73fa] to-[#5e5e5e] text-white">
                <Upload className="w-4 h-4 mr-2" />
                Upload Files
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {quickStats.map((stat, index) => (
          <Card
            key={index}
            className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm hover:bg-zinc-800/50 transition-all"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {stat.value}
                  </p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-3 h-3 text-green-400 mr-1" />
                    <span className="text-green-400 text-xs">
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-[#6e73fa]/20 to-[#5e5e5e]/20 rounded-xl flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-[#6e73fa]" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Storage Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-1 bg-zinc-900/50 border-zinc-800 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <HardDrive className="w-5 h-5 mr-2" />
              Storage Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Used Space</span>
                <span className="text-white font-medium">
                  {storageStats.used}GB / {storageStats.total}GB
                </span>
              </div>
              <Progress value={storageStats.percentage} className="h-3" />
              <div className="flex justify-between text-sm">
                <span className="text-green-400">
                  3.2GB saved by deduplication
                </span>
                <span className="text-gray-400">
                  {storageStats.percentage}% used
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 bg-zinc-900/50 border-zinc-800 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-zinc-800/50 rounded-lg">
                <Upload className="w-4 h-4 text-green-400" />
                <div className="flex-1">
                  <p className="text-white text-sm">
                    Uploaded 3 files to `&quot;`Project Assets`&quot;`
                  </p>
                  <p className="text-gray-400 text-xs">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-zinc-800/50 rounded-lg">
                <Share2 className="w-4 h-4 text-blue-400" />
                <div className="flex-1">
                  <p className="text-white text-sm">
                    Shared `&quot;`Financial Report.pdf`&quot;` with team
                  </p>
                  <p className="text-gray-400 text-xs">1 day ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-zinc-800/50 rounded-lg">
                <Download className="w-4 h-4 text-purple-400" />
                <div className="flex-1">
                  <p className="text-white text-sm">
                    Downloaded `&quot;`Design Assets.zip`&quot;`
                  </p>
                  <p className="text-gray-400 text-xs">3 days ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Files Section */}
      <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-white flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Recent Files
            </CardTitle>
            <div className="flex items-center gap-3">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-10 w-64 bg-zinc-800/50 border-zinc-700 text-white placeholder:text-gray-500 focus:border-[#6e73fa]"
                />
              </div>

              {/* View Toggle */}
              <div className="flex border border-zinc-700 rounded-lg overflow-hidden">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-none hover:bg-zinc-800"
                >
                  <Grid3X3 className="w-4 h-4" color="#fff" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-none hover:bg-zinc-800"
                >
                  <List className="w-4 h-4" color="#fff" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredFiles.map(file => {
                const FileIcon = getFileIcon(file.type);
                const iconColor = getFileColor(file.type);

                return (
                  <ContextMenu key={file.id}>
                    <ContextMenuTrigger>
                      <div className="group bg-zinc-800/30 hover:bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 cursor-pointer transition-all hover:border-[#6e73fa]/50">
                        <div className="flex items-center justify-between mb-3">
                          <FileIcon className={`w-8 h-8 ${iconColor}`} />
                          {file.shared && (
                            <Badge
                              variant="secondary"
                              className="text-xs bg-[#6e73fa]/20 text-[#6e73fa]"
                            >
                              <Users className="w-3 h-3 mr-1" />
                              Shared
                            </Badge>
                          )}
                        </div>
                        <h3
                          className="text-white font-medium text-sm mb-1 truncate"
                          title={file.name}
                        >
                          {file.name}
                        </h3>
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <span>{file.size}</span>
                          <div className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            <span>{file.modified}</span>
                          </div>
                        </div>
                      </div>
                    </ContextMenuTrigger>
                    <ContextMenuContent className="bg-zinc-800 border-zinc-700">
                      <ContextMenuItem className="text-white hover:bg-zinc-700">
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                      </ContextMenuItem>
                      <ContextMenuItem className="text-white hover:bg-zinc-700">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </ContextMenuItem>
                      <ContextMenuItem className="text-white hover:bg-zinc-700">
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </ContextMenuItem>
                      <ContextMenuSeparator className="bg-zinc-700" />
                      <ContextMenuItem className="text-red-400 hover:bg-zinc-700">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredFiles.map(file => {
                const FileIcon = getFileIcon(file.type);
                const iconColor = getFileColor(file.type);

                return (
                  <ContextMenu key={file.id}>
                    <ContextMenuTrigger>
                      <div className="group flex items-center justify-between p-4 bg-zinc-800/30 hover:bg-zinc-800/50 border border-zinc-700 rounded-lg cursor-pointer transition-all hover:border-[#6e73fa]/50">
                        <div className="flex items-center space-x-4 flex-1 min-w-0">
                          <FileIcon
                            className={`w-6 h-6 ${iconColor} flex-shrink-0`}
                          />
                          <div className="flex-1 min-w-0">
                            <p
                              className="text-white font-medium text-sm truncate"
                              title={file.name}
                            >
                              {file.name}
                            </p>
                            <div className="flex items-center space-x-4 text-xs text-gray-400">
                              <span>{file.size}</span>
                              <div className="flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                <span>{file.modified}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          {file.shared && (
                            <Badge
                              variant="secondary"
                              className="text-xs bg-[#6e73fa]/20 text-[#6e73fa]"
                            >
                              <Users className="w-3 h-3 mr-1" />
                              Shared
                            </Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </ContextMenuTrigger>
                    <ContextMenuContent className="bg-zinc-800 border-zinc-700">
                      <ContextMenuItem className="text-white hover:bg-zinc-700">
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                      </ContextMenuItem>
                      <ContextMenuItem className="text-white hover:bg-zinc-700">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </ContextMenuItem>
                      <ContextMenuItem className="text-white hover:bg-zinc-700">
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </ContextMenuItem>
                      <ContextMenuSeparator className="bg-zinc-700" />
                      <ContextMenuItem className="text-red-400 hover:bg-zinc-700">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>
                );
              })}
            </div>
          )}

          {filteredFiles.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-white font-medium mb-2">No files found</h3>
              <p className="text-gray-400 text-sm">
                {searchQuery
                  ? 'Try adjusting your search terms'
                  : 'Upload your first file to get started'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
