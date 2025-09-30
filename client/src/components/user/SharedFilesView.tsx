"use client";
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { TooltipProvider } from '@/components/ui/tooltip';
import { SharedItem, SharedFilterOption, SharedSortOption, SharedTab } from '@/types/shared';
import api from '@/lib/api';
import { useUserStore } from '@/stores/userStore';
import { ViewMode } from '@/types/home';
import SharedTabs from './SharedTabs';
import SharedFilterDropdown from './SharedFilterDropdown';
import SharedSortDropdown from './SharedSortDropdown';
import RecentViewToggle from './RecentViewToggle';
import SharedItemGrid from './SharedItemGrid';
import SharedItemList from './SharedItemList';
import SharedEmptyState from './SharedEmptyState';

export default function SharedFilesView() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const filterOptions: SharedFilterOption[] = [
    { value: 'all', label: 'All Items' },
    { value: 'files', label: 'Files Only' },
    { value: 'folders', label: 'Folders Only' },
    { value: 'document', label: 'Documents' },
    { value: 'image', label: 'Images' },
    { value: 'video', label: 'Videos' },
  ];
  const [sortBy, setSortBy] = useState<SharedSortOption>('shared');
  const [filterType, setFilterType] = useState('all');
  const [activeTab, setActiveTab] = useState<SharedTab>('shared-with-me');
  const [sharedWithMeState, setSharedWithMeState] = useState<SharedItem[]>([]);
  const [sharedByMeState] = useState<SharedItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Get username from Zustand or localStorage
  const user = useUserStore(state => state.user);
  const username = user?.username || (typeof window !== 'undefined' ? localStorage.getItem('username') : '');

  useEffect(() => {
    if (!username) {
      setLoading(false);
      return;
    }
    setLoading(true);
    api.get(`/v1/file/shared-with-me?username=${encodeURIComponent(username)}`)
      .then(res => {
        if (res.data && res.data.status === 'success' && Array.isArray(res.data.data)) {
          setSharedWithMeState(res.data.data);
        }
      })
      .catch(() => {
        // Optionally handle error
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  const getCurrentData = () => {
    return (activeTab === 'shared-with-me' ? sharedWithMeState : sharedByMeState) ?? [];
  };

  const filteredItems = getCurrentData()
    .filter(item => {
      if (!item) return false;
      const displayName = item.filename || item.name || '';
      const matchesSearch = displayName
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
      const aName = a.filename || a.name || '';
      const bName = b.filename || b.name || '';
      switch (sortBy) {
        case 'name':
          return aName.localeCompare(bName);
        case 'size':
          return parseFloat(a.size) - parseFloat(b.size);
        case 'permissions':
          return (a.permissions || '').localeCompare(b.permissions || '');
        default: // shared
          return (
            new Date(b.sharedDate).getTime() - new Date(a.sharedDate).getTime()
          );
      }
    });

  // ...existing render code...

  return (
    <TooltipProvider>
      {/* Tab Navigation */}
      <SharedTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        sharedWithMeCount={sharedWithMeState.length}
        sharedByMeCount={sharedByMeState.length}
      />

      {/* Controls Section */}
      <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            {/* Filter and Sort Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-1 w-full">
              <div className="flex flex-col md:flex-row gap-2 w-full sm:w-auto">
                <SharedFilterDropdown
                  filterType={filterType}
                  onFilterChange={setFilterType}
                  options={filterOptions}
                />
                <SharedSortDropdown 
                  sortBy={sortBy} 
                  onSortChange={setSortBy} 
                />
              </div>
            </div>

            {/* View Toggle */}
            <RecentViewToggle
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
          </div>
        </CardContent>
      </Card>

      <Separator className="my-6 bg-zinc-700" />

      {/* Shared Items Display */}
      <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm">
        <CardContent className="p-6">
          {loading ? (
            viewMode === 'grid' ? (
              <SharedItemGrid items={[]} loading={true} />
            ) : (
              <SharedItemList items={[]} loading={true} />
            )
          ) : filteredItems.length === 0 ? (
            <SharedEmptyState 
              searchQuery={searchQuery} 
              activeTab={activeTab} 
              filterType={filterType}
            />
          ) : viewMode === 'grid' ? (
            <SharedItemGrid items={filteredItems} loading={false} />
          ) : (
            <SharedItemList items={filteredItems} loading={false} />
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
