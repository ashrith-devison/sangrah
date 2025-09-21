'use client';

import React, { useState } from 'react';
import {
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
  UserPlus,
  Link,
  Copy,
  Globe,
  Folder,
  Settings,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
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

interface SharedItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  fileType?: string;
  size: string;
  shared: string;
  permissions: 'view' | 'edit' | 'admin';
  sharedBy: string;
  sharedWith: string[];
  sharedDate: string;
  lastAccessed: string;
  isPublic: boolean;
  accessCount: number;
  starred: boolean;
  thumbnail?: string;
}

export default function Page() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('shared');
  const [filterType, setFilterType] = useState('all');
  const [activeTab, setActiveTab] = useState('shared-with-me');

  // Mock data for shared items
  const sharedWithMe: SharedItem[] = [
    {
      id: '1',
      name: 'Q4 Marketing Strategy.pptx',
      type: 'file',
      fileType: 'presentation',
      size: '4.2 MB',
      shared: '2 days ago',
      permissions: 'edit',
      sharedBy: 'Sarah Wilson',
      sharedWith: ['You', 'Mike Johnson', 'Alex Chen'],
      sharedDate: '2 days ago',
      lastAccessed: '1 hour ago',
      isPublic: false,
      accessCount: 15,
      starred: true,
    },
    {
      id: '2',
      name: 'Project Assets',
      type: 'folder',
      size: '156.8 MB',
      shared: '1 week ago',
      permissions: 'view',
      sharedBy: 'Design Team',
      sharedWith: ['You', '8 others'],
      sharedDate: '1 week ago',
      lastAccessed: '3 hours ago',
      isPublic: true,
      accessCount: 42,
      starred: false,
    },
    {
      id: '3',
      name: 'Budget Spreadsheet.xlsx',
      type: 'file',
      fileType: 'document',
      size: '2.1 MB',
      shared: '3 days ago',
      permissions: 'admin',
      sharedBy: 'Finance Team',
      sharedWith: ['You', 'Sarah Wilson', 'John Doe'],
      sharedDate: '3 days ago',
      lastAccessed: '2 days ago',
      isPublic: false,
      accessCount: 8,
      starred: false,
    },
    {
      id: '4',
      name: 'Meeting Recording.mp4',
      type: 'file',
      fileType: 'video',
      size: '89.4 MB',
      shared: '5 days ago',
      permissions: 'view',
      sharedBy: 'HR Department',
      sharedWith: ['You', 'All employees'],
      sharedDate: '5 days ago',
      lastAccessed: '1 day ago',
      isPublic: true,
      accessCount: 127,
      starred: true,
    },
  ];

  const sharedByMe: SharedItem[] = [
    {
      id: '5',
      name: 'API Documentation',
      type: 'folder',
      size: '23.7 MB',
      shared: '1 day ago',
      permissions: 'admin',
      sharedBy: 'You',
      sharedWith: ['Development Team', '12 members'],
      sharedDate: '1 day ago',
      lastAccessed: '30 minutes ago',
      isPublic: true,
      accessCount: 67,
      starred: false,
    },
    {
      id: '6',
      name: 'Client Proposal.pdf',
      type: 'file',
      fileType: 'document',
      size: '3.8 MB',
      shared: '4 days ago',
      permissions: 'admin',
      sharedBy: 'You',
      sharedWith: ['Client Team', 'Sarah Wilson'],
      sharedDate: '4 days ago',
      lastAccessed: '2 hours ago',
      isPublic: false,
      accessCount: 24,
      starred: true,
    },
  ];

  const getFileIcon = (item: SharedItem) => {
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

  const getFileColor = (item: SharedItem) => {
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

  const getPermissionBadge = (permission: string) => {
    switch (permission) {
      case 'view':
        return (
          <Badge
            variant="outline"
            className="border-blue-500 text-blue-400 text-xs"
          >
            View
          </Badge>
        );
      case 'edit':
        return (
          <Badge
            variant="outline"
            className="border-green-500 text-green-400 text-xs"
          >
            Edit
          </Badge>
        );
      case 'admin':
        return (
          <Badge
            variant="outline"
            className="border-purple-500 text-purple-400 text-xs"
          >
            Admin
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="border-gray-500 text-gray-400 text-xs"
          >
            Unknown
          </Badge>
        );
    }
  };

  const getCurrentData = () => {
    return activeTab === 'shared-with-me' ? sharedWithMe : sharedByMe;
  };

  const filteredItems = getCurrentData()
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
        case 'permissions':
          return a.permissions.localeCompare(b.permissions);
        default: // shared
          return (
            new Date(b.sharedDate).getTime() - new Date(a.sharedDate).getTime()
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

  return (
    <TooltipProvider>
      <div className="p-3 sm:p-4 lg:p-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="w-full lg:w-auto">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 flex items-center">
                <Users className="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-3" />
                Shared Files & Folders
              </h1>
              <p className="text-sm sm:text-base text-gray-400">
                Manage files and folders shared with you and by you
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 w-full lg:w-auto">
              <Button
                variant="outline"
                className="w-full sm:w-auto bg-gradient-to-r from-[#6e73fa] to-[#5e5e5e] text-white hover:from-[#5e5e5e] hover:to-[#6e73fa] text-sm"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Share New
              </Button>
              <Button
                variant="outline"
                className="w-full sm:w-auto border-zinc-700 text-black hover:bg-zinc-800/50 hover:text-white text-sm"
              >
                <Link className="w-4 h-4 mr-2" />
                Create Link
              </Button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="bg-zinc-900/50 border border-zinc-800 p-1">
            <TabsTrigger
              value="shared-with-me"
              className="text-white data-[state=active]:bg-zinc-800 data-[state=active]:text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Shared with Me ({sharedWithMe.length})
            </TabsTrigger>
            <TabsTrigger
              value="shared-by-me"
              className="text-white data-[state=active]:bg-zinc-800 data-[state=active]:text-white"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Shared by Me ({sharedByMe.length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

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
                          {sortBy === 'shared'
                            ? 'Recently Shared'
                            : sortBy === 'name'
                              ? 'Name'
                              : sortBy === 'size'
                                ? 'Size'
                                : 'Permissions'}
                        </span>
                        <ChevronDown className="w-4 h-4 ml-auto flex-shrink-0" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 bg-zinc-800 border-zinc-700">
                      <DropdownMenuItem
                        onClick={() => setSortBy('shared')}
                        className="text-white hover:bg-zinc-700 cursor-pointer"
                      >
                        Recently Shared
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
                        onClick={() => setSortBy('permissions')}
                        className="text-white hover:bg-zinc-700 cursor-pointer"
                      >
                        Permissions
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

        {/* Shared Items Display */}
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
                                      ? 'Shared folder'
                                      : `${item.fileType} file`}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                              {item.isPublic && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Globe className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                                  </TooltipTrigger>
                                  <TooltipContent className="bg-zinc-800 border-zinc-700">
                                    <p className="text-white">Public access</p>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                            <div className="flex items-center gap-1 sm:gap-2">
                              {item.starred && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current" />
                                  </TooltipTrigger>
                                  <TooltipContent className="bg-zinc-800 border-zinc-700">
                                    <p className="text-white">Starred item</p>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                              {getPermissionBadge(item.permissions)}
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
                              <span className="text-xs">
                                {item.accessCount} views
                              </span>
                            </div>
                            <div className="flex items-center">
                              <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
                              <span className="text-xs truncate">
                                Shared {item.shared}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <Users className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
                              <span className="text-xs truncate">
                                by {item.sharedBy}
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
                          Manage Access
                        </ContextMenuItem>
                        <ContextMenuItem className="text-red-400 hover:bg-zinc-700">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remove Access
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
                              {item.isPublic && (
                                <Globe className="w-3 h-3 sm:w-4 sm:h-4 text-green-400 flex-shrink-0" />
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
                                {item.starred && (
                                  <Star className="w-3 h-3 text-yellow-400 fill-current flex-shrink-0" />
                                )}
                              </div>
                              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-xs text-gray-400 mt-1 gap-1 sm:gap-0">
                                <span>{item.size}</span>
                                <div className="flex items-center">
                                  <Clock className="w-3 h-3 mr-1" />
                                  <span>Shared {item.shared}</span>
                                </div>
                                <div className="flex items-center">
                                  <Users className="w-3 h-3 mr-1" />
                                  <span>by {item.sharedBy}</span>
                                </div>
                                <span className="hidden sm:inline">
                                  {item.accessCount} views
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
                            {getPermissionBadge(item.permissions)}
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
                          Manage Access
                        </ContextMenuItem>
                        <ContextMenuItem className="text-red-400 hover:bg-zinc-700">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remove Access
                        </ContextMenuItem>
                      </ContextMenuContent>
                    </ContextMenu>
                  );
                })}
              </div>
            )}

            {filteredItems.length === 0 && (
              <div className="text-center py-8 sm:py-12">
                <Users className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-white font-medium mb-2 text-sm sm:text-base">
                  No shared items found
                </h3>
                <p className="text-gray-400 text-xs sm:text-sm">
                  {searchQuery
                    ? 'Try adjusting your search terms or filters'
                    : activeTab === 'shared-with-me'
                      ? 'Files shared with you will appear here'
                      : 'Files you share with others will appear here'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
