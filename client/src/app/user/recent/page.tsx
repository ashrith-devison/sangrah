'use client';

import React, { useState } from 'react';
import {
  Search,
  Filter,
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
  Clock,
  Calendar,
  Users,
  Star,
  FolderOpen,
  ArrowUpDown,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

export default function RecentFilesPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('modified');
  const [filterType, setFilterType] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  // Mock data for recent files
  const recentFiles = [
    {
      id: 1,
      name: 'Q4 Financial Report.pdf',
      type: 'document',
      size: '2.4 MB',
      modified: '10 minutes ago',
      opened: '10 minutes ago',
      shared: true,
      starred: false,
      folder: 'Documents',
      owner: 'You',
    },
    {
      id: 2,
      name: 'Team Meeting Recording.mp4',
      type: 'video',
      size: '156.8 MB',
      modified: '2 hours ago',
      opened: '2 hours ago',
      shared: true,
      starred: true,
      folder: 'Meetings',
      owner: 'John Doe',
    },
    {
      id: 3,
      name: 'Project Wireframes.sketch',
      type: 'design',
      size: '8.9 MB',
      modified: '5 hours ago',
      opened: '5 hours ago',
      shared: false,
      starred: false,
      folder: 'Design',
      owner: 'You',
    },
    {
      id: 4,
      name: 'Database Backup.zip',
      type: 'archive',
      size: '245.6 MB',
      modified: '1 day ago',
      opened: '1 day ago',
      shared: false,
      starred: false,
      folder: 'Backups',
      owner: 'You',
    },
    {
      id: 5,
      name: 'Marketing Assets.psd',
      type: 'image',
      size: '45.2 MB',
      modified: '2 days ago',
      opened: '2 days ago',
      shared: true,
      starred: true,
      folder: 'Marketing',
      owner: 'Sarah Wilson',
    },
    {
      id: 6,
      name: 'Podcast Episode 15.mp3',
      type: 'audio',
      size: '67.4 MB',
      modified: '3 days ago',
      opened: '3 days ago',
      shared: false,
      starred: false,
      folder: 'Podcasts',
      owner: 'You',
    },
    {
      id: 7,
      name: 'API Documentation.docx',
      type: 'document',
      size: '1.2 MB',
      modified: '4 days ago',
      opened: '4 days ago',
      shared: true,
      starred: false,
      folder: 'Documentation',
      owner: 'Mike Johnson',
    },
    {
      id: 8,
      name: 'User Interface Mockups.fig',
      type: 'design',
      size: '12.7 MB',
      modified: '1 week ago',
      opened: '1 week ago',
      shared: true,
      starred: true,
      folder: 'Design',
      owner: 'You',
    },
    {
      id: 9,
      name: 'Conference Presentation.pptx',
      type: 'presentation',
      size: '18.3 MB',
      modified: '1 week ago',
      opened: '1 week ago',
      shared: false,
      starred: false,
      folder: 'Presentations',
      owner: 'You',
    },
    {
      id: 10,
      name: 'Product Demo Video.mov',
      type: 'video',
      size: '89.1 MB',
      modified: '2 weeks ago',
      opened: '2 weeks ago',
      shared: true,
      starred: false,
      folder: 'Marketing',
      owner: 'Alex Chen',
    },
  ];

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'document':
      case 'presentation':
        return FileText;
      case 'image':
      case 'design':
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
      case 'design':
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

  const filteredFiles = recentFiles
    .filter(file => {
      const matchesSearch = file.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesType = filterType === 'all' || file.type === filterType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'size':
          return parseFloat(a.size) - parseFloat(b.size);
        case 'type':
          return a.type.localeCompare(b.type);
        default: // modified
          return (
            new Date(b.modified).getTime() - new Date(a.modified).getTime()
          );
      }
    });

  const fileTypeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'document', label: 'Documents' },
    { value: 'image', label: 'Images' },
    { value: 'video', label: 'Videos' },
    { value: 'audio', label: 'Audio' },
    { value: 'archive', label: 'Archives' },
    { value: 'design', label: 'Design Files' },
    { value: 'presentation', label: 'Presentations' },
  ];

  return (
    <TooltipProvider>
      <div className="p-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
                <Clock className="w-8 h-8 mr-3" />
                Recent Files
              </h1>
              <p className="text-gray-400">
                Files you've recently opened, modified, or accessed
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-gray-400">Last 30 days</span>
              <Badge
                variant="secondary"
                className="bg-[#6e73fa]/20 text-[#6e73fa]"
              >
                {filteredFiles.length} files
              </Badge>
            </div>
          </div>
        </div>

        {/* Controls Section */}
        <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm mb-6">
          <CardContent className="py-1 px-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              {/* Search and Filters */}
              <div className="flex items-center gap-3 flex-1">

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="min-w-40 bg-zinc-800/50 border-zinc-700 text-white hover:bg-zinc-700 justify-start"
                    >
                      <Filter className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="truncate">
                        {fileTypeOptions.find(opt => opt.value === filterType)
                          ?.label || 'All Types'}
                      </span>
                      <ChevronDown className="w-4 h-4 ml-auto flex-shrink-0" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 bg-zinc-800 border-zinc-700">
                    {fileTypeOptions.map(option => (
                      <DropdownMenuItem
                        key={option.value}
                        onClick={() => setFilterType(option.value)}
                        className="text-white hover:bg-zinc-700 cursor-pointer"
                      >
                        {option.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="min-w-48 bg-zinc-800/50 border-zinc-700 text-white hover:bg-zinc-700 justify-start"
                    >
                      <ArrowUpDown className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="truncate">
                        {sortBy === 'modified'
                          ? 'Recently Modified'
                          : sortBy === 'name'
                            ? 'Name'
                            : sortBy === 'size'
                              ? 'Size'
                              : 'Type'}
                      </span>
                      <ChevronDown className="w-4 h-4 ml-auto flex-shrink-0" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 bg-zinc-800 border-zinc-700">
                    <DropdownMenuItem
                      onClick={() => setSortBy('modified')}
                      className="text-white hover:bg-zinc-700 cursor-pointer"
                    >
                      Recently Modified
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setSortBy('name')}
                      className="text-white hover:bg-zinc-700 cursor-pointer"
                    >
                      Name
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setSortBy('size')}
                      className="text-white hover:bg-zinc-700 cursor-pointer"
                    >
                      Size
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setSortBy('type')}
                      className="text-white hover:bg-zinc-700 cursor-pointer"
                    >
                      Type
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* View Toggle */}
              <Tabs
                value={viewMode}
                onValueChange={value => setViewMode(value as 'grid' | 'list')}
              >
                <TabsList className="bg-zinc-800/50 border border-zinc-700">
                  <TabsTrigger
                    value="grid"
                    className="data-[state=active]:bg-zinc-700"
                  >
                    <Grid3X3 className="w-4 h-4" color="#fff" />
                  </TabsTrigger>
                  <TabsTrigger
                    value="list"
                    className="data-[state=active]:bg-zinc-700"
                  >
                    <List className="w-4 h-4" color="#fff" />
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        <Separator className="my-6 bg-zinc-700" />

        {/* Files Display */}
        <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm">
          <CardContent className="p-6">
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredFiles.map(file => {
                  const FileIcon = getFileIcon(file.type);
                  const iconColor = getFileColor(file.type);

                  return (
                    <ContextMenu key={file.id}>
                      <ContextMenuTrigger>
                        <div className="group bg-zinc-800/30 hover:bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 cursor-pointer transition-all hover:border-[#6e73fa]/50">
                          <div className="flex items-start justify-between mb-3">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <FileIcon className={`w-8 h-8 ${iconColor}`} />
                              </TooltipTrigger>
                              <TooltipContent className="bg-zinc-800 border-zinc-700">
                                <p className="text-white">{file.type} file</p>
                              </TooltipContent>
                            </Tooltip>
                            <div className="flex items-center gap-2">
                              {file.starred && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                  </TooltipTrigger>
                                  <TooltipContent className="bg-zinc-800 border-zinc-700">
                                    <p className="text-white">Starred file</p>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                              {file.shared && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Badge
                                      variant="secondary"
                                      className="text-xs bg-[#6e73fa]/20 text-[#6e73fa] cursor-help"
                                    >
                                      <Users className="w-3 h-3 mr-1" />
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent className="bg-zinc-800 border-zinc-700">
                                    <p className="text-white">
                                      Shared with{' '}
                                      {file.owner === 'You'
                                        ? 'others'
                                        : file.owner}
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                          </div>
                          <h3
                            className="text-white font-medium text-sm mb-2 truncate"
                            title={file.name}
                          >
                            {file.name}
                          </h3>
                          <div className="space-y-1 text-xs text-gray-400">
                            <div className="flex items-center justify-between">
                              <span>{file.size}</span>
                              <span>{file.type}</span>
                            </div>
                            <div className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              <span>Opened {file.opened}</span>
                            </div>
                            <div className="flex items-center">
                              <FolderOpen className="w-3 h-3 mr-1" />
                              <span className="truncate">{file.folder}</span>
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
                        <ContextMenuItem className="text-white hover:bg-zinc-700">
                          <Star className="w-4 h-4 mr-2" />
                          {file.starred ? 'Unstar' : 'Star'}
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
                        <div className="group flex items-center justify-between p-4 bg-zinc-800/30 hover:bg-zinc-800/50 border border-zinc-700 rounded-lg cursor-pointer transition-all hover:border-[#6e73fa]/50 mb-2">
                          <div className="flex items-center space-x-4 flex-1 min-w-0">
                            <FileIcon
                              className={`w-6 h-6 ${iconColor} flex-shrink-0`}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p
                                  className="text-white font-medium text-sm truncate"
                                  title={file.name}
                                >
                                  {file.name}
                                </p>
                                {file.starred && (
                                  <Star className="w-3 h-3 text-yellow-400 fill-current flex-shrink-0" />
                                )}
                              </div>
                              <div className="flex items-center space-x-4 text-xs text-gray-400 mt-1">
                                <span>{file.size}</span>
                                <div className="flex items-center">
                                  <Clock className="w-3 h-3 mr-1" />
                                  <span>Opened {file.opened}</span>
                                </div>
                                <div className="flex items-center">
                                  <FolderOpen className="w-3 h-3 mr-1" />
                                  <span>{file.folder}</span>
                                </div>
                                <span>by {file.owner}</span>
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
                        <ContextMenuItem className="text-white hover:bg-zinc-700">
                          <Star className="w-4 h-4 mr-2" />
                          {file.starred ? 'Unstar' : 'Star'}
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

            {isLoading ? (
              <div className="space-y-4">
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {[...Array(8)].map((_, i) => (
                      <div
                        key={i}
                        className="bg-zinc-800/30 border border-zinc-700 rounded-xl p-4"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <Skeleton className="w-8 h-8 rounded bg-zinc-700" />
                          <Skeleton className="w-12 h-4 rounded bg-zinc-700" />
                        </div>
                        <Skeleton className="w-full h-4 mb-2 rounded bg-zinc-700" />
                        <div className="space-y-1">
                          <Skeleton className="w-16 h-3 rounded bg-zinc-700" />
                          <Skeleton className="w-20 h-3 rounded bg-zinc-700" />
                          <Skeleton className="w-24 h-3 rounded bg-zinc-700" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className="flex items-center p-4 bg-zinc-800/30 border border-zinc-700 rounded-lg"
                      >
                        <Skeleton className="w-6 h-6 mr-4 rounded bg-zinc-700" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="w-48 h-4 rounded bg-zinc-700" />
                          <Skeleton className="w-32 h-3 rounded bg-zinc-700" />
                        </div>
                        <Skeleton className="w-12 h-4 rounded bg-zinc-700" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : filteredFiles.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-white font-medium mb-2">
                  No recent files found
                </h3>
                <p className="text-gray-400 text-sm">
                  {searchQuery
                    ? 'Try adjusting your search terms or filters'
                    : 'Files you open will appear here for quick access'}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsLoading(true);
                    setTimeout(() => setIsLoading(false), 2000);
                  }}
                  className="mt-4 border-zinc-700 text-white hover:bg-zinc-800"
                >
                  Simulate Loading
                </Button>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
