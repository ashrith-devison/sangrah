'use client';

import React, { useState } from 'react';
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
import { StarredFilesViewProps, StarredFilterOption } from '@/types/starred';

export default function StarredFilesView({ items }: StarredFilesViewProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('starredDate');
  const [filterType, setFilterType] = useState('all');

  const filterOptions: StarredFilterOption[] = [
    { value: 'all', label: 'All Items' },
    { value: 'files', label: 'Files Only' },
    { value: 'folders', label: 'Folders Only' },
    { value: 'document', label: 'Documents' },
    { value: 'image', label: 'Images' },
    { value: 'video', label: 'Videos' },
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

  const handleRemoveStar = (itemId: string) => {
    // Handle removing star from item
    console.log('Remove star from item:', itemId);
  };

  return (
    <TooltipProvider>
      <div>
        {/* Controls Section */}
        <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-1 w-full">
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
            {filteredItems.length === 0 ? (
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