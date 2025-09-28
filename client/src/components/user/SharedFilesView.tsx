'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { TooltipProvider } from '@/components/ui/tooltip';
import { SharedItem, SharedFilterOption, SharedSortOption, SharedTab } from '@/types/shared';
import { ViewMode } from '@/types/home';
import SharedTabs from './SharedTabs';
import SharedFilterDropdown from './SharedFilterDropdown';
import SharedSortDropdown from './SharedSortDropdown';
import RecentViewToggle from './RecentViewToggle';
import SharedItemGrid from './SharedItemGrid';
import SharedItemList from './SharedItemList';
import SharedEmptyState from './SharedEmptyState';

interface SharedFilesViewProps {
  sharedWithMe: SharedItem[];
  sharedByMe: SharedItem[];
}

const filterOptions: SharedFilterOption[] = [
  { value: 'all', label: 'All Items' },
  { value: 'files', label: 'Files Only' },
  { value: 'folders', label: 'Folders Only' },
  { value: 'document', label: 'Documents' },
  { value: 'image', label: 'Images' },
  { value: 'video', label: 'Videos' },
];

export default function SharedFilesView({ sharedWithMe, sharedByMe }: SharedFilesViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SharedSortOption>('shared');
  const [filterType, setFilterType] = useState('all');
  const [activeTab, setActiveTab] = useState<SharedTab>('shared-with-me');

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

  return (
    <TooltipProvider>
      {/* Tab Navigation */}
      <SharedTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        sharedWithMeCount={sharedWithMe.length}
        sharedByMeCount={sharedByMe.length}
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
          {filteredItems.length === 0 ? (
            <SharedEmptyState 
              searchQuery={searchQuery} 
              activeTab={activeTab} 
            />
          ) : viewMode === 'grid' ? (
            <SharedItemGrid items={filteredItems} />
          ) : (
            <SharedItemList items={filteredItems} />
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}