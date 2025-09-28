'use client';

import React, { useState, useEffect } from 'react';
import { Grid3X3, List } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { TooltipProvider } from '@/components/ui/tooltip';
import StarredFilterDropdown from './StarredFilterDropdown';
import StarredSortDropdown from './StarredSortDropdown';
import StarredItemGrid from './StarredItemGrid';
import StarredItemList from './StarredItemList';
import StarredEmptyState from './StarredEmptyState';
import StarredHeader from './StarredHeader';
import { 
  StarredFilesViewProps, 
  StarredFilterOption, 
  StarredItem, 
  ApiStarredFile, 
  ApiStarredFilesResponse,
  UpdateFileInfoRequest,
  UpdateFileInfoResponse
} from '@/types/starred';
import { formatRelativeTime, getFileTypeFromExtension } from '@/lib/utils';
import { useUserStore } from '@/stores/userStore';
import api from '@/lib/api';
import { toast } from 'sonner';

// Transform API data to UI format
const transformApiDataToStarredItem = (apiFile: ApiStarredFile): StarredItem => {
  const fileType = getFileTypeFromExtension(apiFile.filename);

  return {
    id: apiFile.id.toString(),
    name: apiFile.filename,
    type: 'file',
    fileType,
    size: 'Unknown', // API doesn't provide size, you might want to add this to your API
    starredDate: formatRelativeTime(apiFile.upload_time),
    lastModified: formatRelativeTime(apiFile.upload_time),
    owner: apiFile.username,
    isShared: apiFile.permission !== 'owner',
    path: `/${apiFile.filename}`,
    shaFileId: apiFile.sha_file_id,
    tags: apiFile.tags
  };
};

export default function StarredFilesView({ items: propItems }: StarredFilesViewProps) {
  const { user } = useUserStore();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('starredDate');
  const [filterType, setFilterType] = useState('all');
  const [items, setItems] = useState<StarredItem[]>(propItems || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());

  // Fetch starred files function
  const fetchStarredFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get username from user store or fallback
      const username = user?.name || user?.email || 'ashrith-sai'; // fallback for demo
      
      if (!username) {
        setError('User not authenticated');
        return;
      }
      
      // Make API call directly
      const response = await api.get<ApiStarredFilesResponse>(
        `/v1/file/owned-info?username=${username}`
      );

      if (response.data.status === 'success') {
        // Filter only starred files
        const starredFiles = response.data.data.filter((file: ApiStarredFile) => file.starred);
        const transformedItems = starredFiles.map(transformApiDataToStarredItem);
        setItems(transformedItems);
        
        // Only show success toast on manual refresh (when there are existing items)
        if (items.length > 0) {
          toast.success(`Refreshed ${transformedItems.length} starred files`);
        }
      } else {
        setError('Failed to fetch starred files');
        toast.error('Failed to fetch starred files');
      }
    } catch (err) {
      console.error('Error fetching starred files:', err);
      const errorMessage = 'Failed to load starred files. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Add star to a file
  const handleAddStar = async (filename: string) => {
    try {
      // Get username
      const username = user?.name || user?.email || 'ashrith-sai';
      if (!username) {
        toast.error('User not authenticated');
        return;
      }

      // Show loading toast
      const loadingToast = toast.loading(`Adding "${filename}" to starred files...`);

      // Make API call to update file info
      const updateData: UpdateFileInfoRequest = {
        username: username,
        filename: filename,
        starred: true
      };

      const response = await api.post<UpdateFileInfoResponse>(
        '/v1/file/update-info',
        updateData
      );

      // Dismiss loading toast
      toast.dismiss(loadingToast);

      if (response.data.status === 'success') {
        toast.success(`"${filename}" added to starred files`);
        // Refresh the list to show updated data
        fetchStarredFiles();
      } else {
        throw new Error(response.data.message || 'Failed to update file info');
      }
      
    } catch (err) {
      console.error('Error adding star:', err);
      toast.error('Failed to add star. Please try again.');
    }
  };

  // Fetch starred files from API on component mount
  useEffect(() => {
    fetchStarredFiles();
  }, []);

  const filterOptions: StarredFilterOption[] = [
    { value: 'all', label: 'All Items' },
    { value: 'files', label: 'Files Only' },
    { value: 'folders', label: 'Folders Only' },
    { value: 'document', label: 'Documents' },
    { value: 'image', label: 'Images' },
    { value: 'video', label: 'Videos' },
    { value: 'audio', label: 'Audio' },
  ];

  const filteredItems = items
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

  const handleRemoveStar = async (itemId: string) => {
    // Prevent multiple operations on the same item
    if (updatingItems.has(itemId)) {
      return;
    }

    try {
      // Find the item to unstar
      const item = items.find(i => i.id === itemId);
      if (!item) {
        toast.error('File not found');
        return;
      }

      // Get username
      const username = user?.name || user?.email || 'ashrith-sai';
      if (!username) {
        toast.error('User not authenticated');
        return;
      }

      // Add to updating set and remove from local state immediately for better UX
      setUpdatingItems(prev => new Set(prev).add(itemId));
      setItems(prevItems => prevItems.filter(i => i.id !== itemId));
      
      // Show loading toast
      const loadingToast = toast.loading(`Removing "${item.name}" from starred files...`);
      
      // Make API call to update file info
      const updateData: UpdateFileInfoRequest = {
        username: username,
        filename: item.name,
        starred: false
      };

      const response = await api.post<UpdateFileInfoResponse>(
        '/v1/file/update-info',
        updateData
      );

      // Dismiss loading toast
      toast.dismiss(loadingToast);

      if (response.data.status === 'success') {
        toast.success(`"${item.name}" removed from starred files`);
      } else {
        throw new Error(response.data.message || 'Failed to update file info');
      }
      
    } catch (err) {
      console.error('Error removing star:', err);
      
      // Revert local state change on API failure
      const item = items.find(i => i.id === itemId);
      if (item) {
        setItems(prevItems => [...prevItems, item].sort((a, b) => 
          new Date(b.starredDate).getTime() - new Date(a.starredDate).getTime()
        ));
      }
      
      toast.error('Failed to remove star. Please try again.');
    } finally {
      // Remove from updating set
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  return (
    <TooltipProvider>
      <div>
        {/* Header Section */}
        <StarredHeader 
          totalItems={items.length} 
          onRefresh={fetchStarredFiles}
          isLoading={loading}
        />
        {/* Controls Section */}
        <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-1 w-full">
                {/* Search Input */}
                <div className="w-full sm:max-w-md">
                  <input
                    type="text"
                    placeholder="Search starred files..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-700 rounded-md text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                {/* Filter and Sort Controls */}
                <div className="flex flex-col md:flex-row gap-2 w-full sm:w-auto">
                  <StarredFilterDropdown
                    filterType={filterType}
                    onFilterChange={setFilterType}
                    filterOptions={filterOptions}
                  />
                  <StarredSortDropdown
                    sortBy={sortBy}
                    onSortChange={setSortBy}
                  />
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
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-zinc-400">Loading starred files...</div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-red-400">{error}</div>
              </div>
            ) : filteredItems.length === 0 ? (
              <StarredEmptyState searchQuery={searchQuery} />
            ) : viewMode === 'grid' ? (
              <StarredItemGrid items={filteredItems} onRemoveStar={handleRemoveStar} />
            ) : (
              <StarredItemList items={filteredItems} onRemoveStar={handleRemoveStar} />
            )}
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}