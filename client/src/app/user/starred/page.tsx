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
  Users,
  Star,
  ArrowUpDown,
  ChevronDown,
  Folder,
  Copy,
  Settings,
  StarOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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

interface StarredItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  fileType?: string;
  size: string;
  starredDate: string;
  lastModified: string;
  owner: string;
  isShared: boolean;
  path: string;
  thumbnail?: string;
}

export default function StarredFilesPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('starredDate');
  const [filterType, setFilterType] = useState('all');

  // Mock data for starred items
  const starredItems: StarredItem[] = [
    {
      id: '1',
      name: 'Q4 Marketing Strategy.pptx',
      type: 'file',
      fileType: 'presentation',
      size: '4.2 MB',
      starredDate: '2 days ago',
      lastModified: '1 hour ago',
      owner: 'Sarah Wilson',
      isShared: true,
      path: '/Projects/Marketing/Q4',
    },
    {
      id: '2',
      name: 'Important Documents',
      type: 'folder',
      size: '156.8 MB',
      starredDate: '1 week ago',
      lastModified: '3 hours ago',
      owner: 'You',
      isShared: false,
      path: '/Personal/Documents',
    },
    {
      id: '3',
      name: 'Budget Spreadsheet.xlsx',
      type: 'file',
      fileType: 'document',
      size: '2.1 MB',
      starredDate: '3 days ago',
      lastModified: '2 days ago',
      owner: 'Finance Team',
      isShared: true,
      path: '/Finance/2024',
    },
    {
      id: '4',
      name: 'Team Photo.jpg',
      type: 'file',
      fileType: 'image',
      size: '3.8 MB',
      starredDate: '5 days ago',
      lastModified: '1 week ago',
      owner: 'HR Department',
      isShared: true,
      path: '/Company/Events',
    },
    {
      id: '5',
      name: 'Project Demo.mp4',
      type: 'file',
      fileType: 'video',
      size: '89.4 MB',
      starredDate: '1 week ago',
      lastModified: '3 days ago',
      owner: 'Development Team',
      isShared: true,
      path: '/Projects/Demo',
    },
    {
      id: '6',
      name: 'Client Proposals',
      type: 'folder',
      size: '45.2 MB',
      starredDate: '2 weeks ago',
      lastModified: '4 days ago',
      owner: 'You',
      isShared: false,
      path: '/Business/Clients',
    },
  ];

  const getFileIcon = (item: StarredItem) => {
    if (item.type === 'folder') return Folder;

    switch (item.fileType) {
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

  const getFileColor = (item: StarredItem) => {
    if (item.type === 'folder') return 'text-blue-400';

    switch (item.fileType) {
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

  const filteredItems = starredItems
    .filter(item => {
      const matchesSearch = item.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesType =
        filterType === 'all' ||
        (filterType === 'folders' && item.type === 'folder') ||
        (filterType === 'files' && item.type === 'file') ||
        item.fileType === filterType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'size':
          return parseFloat(a.size) - parseFloat(b.size);
        case 'lastModified':
          return (
            new Date(b.lastModified).getTime() -
            new Date(a.lastModified).getTime()
          );
        default: // starredDate
          return (
            new Date(b.starredDate).getTime() -
            new Date(a.starredDate).getTime()
          );
      }
    });

  const filterOptions = [
    { value: 'all', label: 'All Items' },
    { value: 'files', label: 'Files Only' },
    { value: 'folders', label: 'Folders Only' },
    { value: 'document', label: 'Documents' },
    { value: 'image', label: 'Images' },
    { value: 'video', label: 'Videos' },
  ];

  const handleRemoveStar = (itemId: string) => {
    // Handle removing star from item
    console.log('Remove star from item:', itemId);
  };

  return (
    <TooltipProvider>
      <div className="p-3 sm:p-4 lg:p-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="w-full lg:w-auto">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 flex items-center">
                <Star className="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-3 text-yellow-400 fill-current" />
                Starred Files & Folders
              </h1>
              <p className="text-sm sm:text-base text-gray-400">
                Quick access to your most important files and folders
              </p>
            </div>
            <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
              <Badge
                variant="outline"
                className="border-yellow-500 text-yellow-400 px-3 py-1 text-sm"
              >
                {filteredItems.length} starred items
              </Badge>
            </div>
          </div>
        </div>

        {/* Controls Section */}
        <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-1 w-full">
                {/* Filter and Sort Controls */}
                <div className="flex flex-col md:flex-row gap-2 w-full sm:w-auto">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full md:min-w-40 bg-zinc-800/50 border-zinc-700 text-white hover:bg-zinc-700 justify-start"
                      >
                        <Filter className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="truncate">
                          {filterOptions.find(opt => opt.value === filterType)
                            ?.label || 'All Items'}
                        </span>
                        <ChevronDown className="w-4 h-4 ml-auto flex-shrink-0" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 bg-zinc-800 border-zinc-700">
                      {filterOptions.map(option => (
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
                        className="w-full md:min-w-48 bg-zinc-800/50 border-zinc-700 text-white hover:bg-zinc-700 justify-start"
                      >
                        <ArrowUpDown className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="truncate">
                          {sortBy === 'starredDate'
                            ? 'Recently Starred'
                            : sortBy === 'name'
                              ? 'Name'
                              : sortBy === 'size'
                                ? 'Size'
                                : 'Last Modified'}
                        </span>
                        <ChevronDown className="w-4 h-4 ml-auto flex-shrink-0" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 bg-zinc-800 border-zinc-700">
                      <DropdownMenuItem
                        onClick={() => setSortBy('starredDate')}
                        className="text-white hover:bg-zinc-700 cursor-pointer"
                      >
                        Recently Starred
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
                        onClick={() => setSortBy('lastModified')}
                        className="text-white hover:bg-zinc-700 cursor-pointer"
                      >
                        Last Modified
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* View Toggle */}
              <div className="flex justify-center lg:justify-end w-full lg:w-auto">
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
            </div>
          </CardContent>
        </Card>

        <Separator className="my-6 bg-zinc-700" />

        {/* Starred Items Display */}
        <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm">
          <CardContent className="p-6">
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4">
                {filteredItems.map(item => {
                  const ItemIcon = getFileIcon(item);
                  const iconColor = getFileColor(item);

                  return (
                    <ContextMenu key={item.id}>
                      <ContextMenuTrigger>
                        <div className="group bg-zinc-800/30 hover:bg-zinc-800/50 border border-zinc-700 rounded-xl p-3 sm:p-4 cursor-pointer transition-all hover:border-[#6e73fa]/50">
                          <div className="flex items-start justify-between mb-2 sm:mb-3">
                            <div className="flex items-center gap-1 sm:gap-2">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <ItemIcon
                                    className={`w-6 h-6 sm:w-8 sm:h-8 ${iconColor}`}
                                  />
                                </TooltipTrigger>
                                <TooltipContent className="bg-zinc-800 border-zinc-700">
                                  <p className="text-white">
                                    {item.type === 'folder'
                                      ? 'Starred folder'
                                      : `${item.fileType} file`}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                              {item.isShared && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Users className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
                                  </TooltipTrigger>
                                  <TooltipContent className="bg-zinc-800 border-zinc-700">
                                    <p className="text-white">Shared item</p>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                            <div className="flex items-center gap-1 sm:gap-2">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current" />
                                </TooltipTrigger>
                                <TooltipContent className="bg-zinc-800 border-zinc-700">
                                  <p className="text-white">Starred item</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </div>
                          <h3
                            className="text-white font-medium text-xs sm:text-sm mb-1 sm:mb-2 truncate leading-tight"
                            title={item.name}
                          >
                            {item.name}
                          </h3>
                          <div className="space-y-0.5 sm:space-y-1 text-xs text-gray-400">
                            <div className="flex items-center justify-between">
                              <span className="text-xs">{item.size}</span>
                              <span className="text-xs truncate">
                                {item.path}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1 text-yellow-400" />
                              <span className="text-xs truncate">
                                Starred {item.starredDate}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
                              <span className="text-xs truncate">
                                Modified {item.lastModified}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <Users className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
                              <span className="text-xs truncate">
                                by {item.owner}
                              </span>
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
                          <Copy className="w-4 h-4 mr-2" />
                          Copy Link
                        </ContextMenuItem>
                        <ContextMenuSeparator className="bg-zinc-700" />
                        <ContextMenuItem className="text-white hover:bg-zinc-700">
                          <Settings className="w-4 h-4 mr-2" />
                          Properties
                        </ContextMenuItem>
                        <ContextMenuItem
                          className="text-yellow-400 hover:bg-zinc-700"
                          onClick={() => handleRemoveStar(item.id)}
                        >
                          <StarOff className="w-4 h-4 mr-2" />
                          Remove Star
                        </ContextMenuItem>
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
                {filteredItems.map(item => {
                  const ItemIcon = getFileIcon(item);
                  const iconColor = getFileColor(item);

                  return (
                    <ContextMenu key={item.id}>
                      <ContextMenuTrigger>
                        <div className="group flex items-center justify-between p-3 sm:p-4 bg-zinc-800/30 hover:bg-zinc-800/50 border border-zinc-700 rounded-lg cursor-pointer transition-all hover:border-[#6e73fa]/50 mb-2">
                          <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <ItemIcon
                                className={`w-5 h-5 sm:w-6 sm:h-6 ${iconColor} flex-shrink-0`}
                              />
                              {item.isShared && (
                                <Users className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400 flex-shrink-0" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p
                                  className="text-white font-medium text-sm sm:text-base truncate"
                                  title={item.name}
                                >
                                  {item.name}
                                </p>
                                <Star className="w-3 h-3 text-yellow-400 fill-current flex-shrink-0" />
                              </div>
                              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-xs text-gray-400 mt-1 gap-1 sm:gap-0">
                                <span>{item.size}</span>
                                <div className="flex items-center">
                                  <Star className="w-3 h-3 mr-1 text-yellow-400" />
                                  <span>Starred {item.starredDate}</span>
                                </div>
                                <div className="flex items-center">
                                  <Clock className="w-3 h-3 mr-1" />
                                  <span>Modified {item.lastModified}</span>
                                </div>
                                <div className="flex items-center">
                                  <Users className="w-3 h-3 mr-1" />
                                  <span>by {item.owner}</span>
                                </div>
                                <span className="hidden sm:inline truncate text-gray-500">
                                  {item.path}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 sm:p-2"
                              onClick={e => {
                                e.stopPropagation();
                                handleRemoveStar(item.id);
                              }}
                            >
                              <StarOff className="w-4 h-4 text-yellow-400" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 sm:p-2"
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
                          <Copy className="w-4 h-4 mr-2" />
                          Copy Link
                        </ContextMenuItem>
                        <ContextMenuSeparator className="bg-zinc-700" />
                        <ContextMenuItem className="text-white hover:bg-zinc-700">
                          <Settings className="w-4 h-4 mr-2" />
                          Properties
                        </ContextMenuItem>
                        <ContextMenuItem
                          className="text-yellow-400 hover:bg-zinc-700"
                          onClick={() => handleRemoveStar(item.id)}
                        >
                          <StarOff className="w-4 h-4 mr-2" />
                          Remove Star
                        </ContextMenuItem>
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

            {filteredItems.length === 0 && (
              <div className="text-center py-8 sm:py-12">
                <Star className="w-10 h-10 sm:w-12 sm:h-12 text-yellow-400 mx-auto mb-4 fill-current" />
                <h3 className="text-white font-medium mb-2 text-sm sm:text-base">
                  No starred items found
                </h3>
                <p className="text-gray-400 text-xs sm:text-sm">
                  {searchQuery
                    ? 'Try adjusting your search terms or filters'
                    : 'Files and folders you star will appear here for quick access'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
