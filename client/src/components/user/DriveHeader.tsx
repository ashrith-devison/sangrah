'use client';

import React from 'react';
import { HardDrive, Upload, FolderPlus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import SearchBar from './SearchBar';
import ViewToggle from './ViewToggle';
import DriveSortDropdown from './DriveSortDropdown';
import DriveFilterDropdown from './DriveFilterDropdown';
import { DriveViewMode, DriveFilters } from '@/types/drive';

interface DriveHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  viewMode: DriveViewMode;
  onViewModeChange: (mode: DriveViewMode) => void;
  filters: DriveFilters;
  onFiltersChange: (filters: Partial<DriveFilters>) => void;
  onRefresh: () => void;
  isLoading?: boolean;
  totalFiles: number;
}

export default function DriveHeader({
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  filters,
  onFiltersChange,
  onRefresh,
  isLoading = false,
  totalFiles,
}: DriveHeaderProps) {
  return (
    <div className="mb-6">
      {/* Title Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
            <HardDrive className="w-8 h-8 mr-3" />
            My Drive
          </h1>
          <p className="text-gray-400">
            {totalFiles} files • Organize and access all your files
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <Button 
            variant="outline" 
            onClick={onRefresh}
            disabled={isLoading}
            className="bg-zinc-800/50 border-zinc-700 text-white hover:bg-zinc-700"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            variant="outline"
            className="bg-zinc-800/50 border-zinc-700 text-white hover:bg-zinc-700"
          >
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

      {/* Controls Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg backdrop-blur-sm">
        {/* Search Bar */}
        <div className="flex-1 max-w-md">
          <SearchBar 
            searchQuery={searchQuery} 
            onSearchChange={onSearchChange}
          />
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          <DriveFilterDropdown
            selectedType={filters.type}
            selectedPermission={filters.permission}
            onTypeChange={(type: string) => onFiltersChange({ type })}
            onPermissionChange={(permission: string) => onFiltersChange({ permission })}
          />
          <DriveSortDropdown
            sortBy={filters.sortBy}
            sortOrder={filters.sortOrder}
            onSortChange={(sortBy, sortOrder) => onFiltersChange({ sortBy, sortOrder })}
          />
          <ViewToggle 
            viewMode={viewMode} 
            onViewModeChange={onViewModeChange} 
          />
        </div>
      </div>
    </div>
  );
}