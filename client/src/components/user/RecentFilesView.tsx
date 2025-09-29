'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { TooltipProvider } from '@/components/ui/tooltip';
import { RecentFile, FileTypeOption, SortOption } from '@/types/recent';
import { ViewMode } from '@/types/home';
import FilterDropdown from './FilterDropdown';
import SortDropdown from './SortDropdown';
import RecentViewToggle from './RecentViewToggle';
import RecentFileGrid from './RecentFileGrid';
import RecentFileList from './RecentFileList';
import EmptyState from './EmptyState';

export interface RecentFilesViewProps {
  files: RecentFile[];
  loading?: boolean;
}

const fileTypeOptions: FileTypeOption[] = [
  { value: 'all', label: 'All Types' },
  { value: 'document', label: 'Documents' },
  { value: 'image', label: 'Images' },
  { value: 'video', label: 'Videos' },
  { value: 'audio', label: 'Audio' },
  { value: 'archive', label: 'Archives' },
  { value: 'design', label: 'Design Files' },
  { value: 'presentation', label: 'Presentations' },
];

export default function RecentFilesView({ files, loading }: RecentFilesViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('modified');
  const [filterType, setFilterType] = useState('all');
  const isLoading = loading;

  const filteredFiles = files
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

  // Loading is controlled by parent prop

  return (
    <TooltipProvider>
      {/* Controls Section */}
      <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm mb-6">
        <CardContent className="py-1 px-2 sm:px-4">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            {/* Filter and Sort Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-1 w-full">
              <div className="flex flex-col md:flex-row gap-2 w-full sm:w-auto">
                <FilterDropdown
                  filterType={filterType}
                  onFilterChange={setFilterType}
                  options={fileTypeOptions}
                />
                <SortDropdown sortBy={sortBy} onSortChange={setSortBy} />
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

      {/* Files Display */}
      <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm">
        <CardContent className="p-6">
          {isLoading ? (
            <EmptyState
              searchQuery={searchQuery}
              isLoading={isLoading}
              viewMode={viewMode}
            />
          ) : filteredFiles.length === 0 ? (
            <EmptyState
              searchQuery={searchQuery}
              isLoading={false}
              viewMode={viewMode}
            />
          ) : viewMode === 'grid' ? (
            <RecentFileGrid files={filteredFiles} />
          ) : (
            <RecentFileList files={filteredFiles} />
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}