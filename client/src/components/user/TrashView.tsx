'use client';

import { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Grid, List, Search } from 'lucide-react';

// Import our modular components
import TrashHeader from './TrashHeader';
import TrashFilterDropdown from './TrashFilterDropdown';
import TrashSortDropdown from './TrashSortDropdown';
import TrashItemGrid from './TrashItemGrid';
import TrashItemList from './TrashItemList';
import TrashEmptyState from './TrashEmptyState';
import TrashBulkActions from './TrashBulkActions';

import { TrashItem } from '@/types/trash';

export default function TrashView() {
  // Sample data - in real app this would come from props or API
  const [items] = useState<TrashItem[]>([
    {
      id: '1',
      name: 'Project Proposal.docx',
      type: 'file',
      fileType: 'document',
      size: '2.4 MB',
      deletedDate: '2 hours ago',
      originalLocation: '/Documents/Work',
      deletedBy: 'John Doe',
      daysUntilPermanentDelete: 28,
    },
    {
      id: '2',
      name: 'Vacation Photos',
      type: 'folder',
      size: '156 MB',
      deletedDate: '1 day ago',
      originalLocation: '/Pictures/2024',
      deletedBy: 'Jane Smith',
      daysUntilPermanentDelete: 27,
    },
    {
      id: '3',
      name: 'presentation.pptx',
      type: 'file',
      fileType: 'document',
      size: '8.7 MB',
      deletedDate: '3 days ago',
      originalLocation: '/Documents/Presentations',
      deletedBy: 'John Doe',
      daysUntilPermanentDelete: 25,
    },
  ]);

  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>(['all']);
  const [sortBy, setSortBy] = useState('deletedDate-desc');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [viewType, setViewType] = useState<'grid' | 'list'>('grid');

  // Filter and sort logic
  const filteredAndSortedItems = useMemo(() => {
    let filtered = items;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.originalLocation.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply type filters
    if (!activeFilters.includes('all')) {
      filtered = filtered.filter(item => {
        if (activeFilters.includes('files') && item.type === 'file') return true;
        if (activeFilters.includes('folders') && item.type === 'folder') return true;
        if (activeFilters.includes('documents') && item.fileType === 'document') return true;
        if (activeFilters.includes('images') && item.fileType === 'image') return true;
        if (activeFilters.includes('videos') && item.fileType === 'video') return true;
        if (activeFilters.includes('audio') && item.fileType === 'audio') return true;
        if (activeFilters.includes('archives') && item.fileType === 'archive') return true;
        return false;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'deletedDate-desc':
          return new Date(b.deletedDate).getTime() - new Date(a.deletedDate).getTime();
        case 'deletedDate-asc':
          return new Date(a.deletedDate).getTime() - new Date(b.deletedDate).getTime();
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'size-desc':
          return parseFloat(b.size) - parseFloat(a.size);
        case 'size-asc':
          return parseFloat(a.size) - parseFloat(b.size);
        case 'originalLocation-asc':
          return a.originalLocation.localeCompare(b.originalLocation);
        case 'daysLeft-asc':
          return a.daysUntilPermanentDelete - b.daysUntilPermanentDelete;
        default:
          return 0;
      }
    });

    return filtered;
  }, [items, searchQuery, activeFilters, sortBy]);

  // Event handlers
  const handleFilterChange = (filter: string, checked: boolean) => {
    setActiveFilters(prev => {
      if (filter === 'all') {
        return checked ? ['all'] : [];
      }
      
      const newFilters = checked 
        ? [...prev.filter(f => f !== 'all'), filter]
        : prev.filter(f => f !== filter);
      
      return newFilters.length === 0 ? ['all'] : newFilters;
    });
  };

  const handleToggleSelect = (itemId: string) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAll = () => {
    setSelectedItems(filteredAndSortedItems.map(item => item.id));
  };

  const handleDeselectAll = () => {
    setSelectedItems([]);
  };

  const handleRestore = (itemId: string) => {
    console.log('Restore item:', itemId);
    // Implement restore logic
  };

  const handlePermanentDelete = (itemId: string) => {
    console.log('Permanently delete item:', itemId);
    // Implement permanent delete logic
  };

  const handleRestoreSelected = () => {
    console.log('Restore selected items:', selectedItems);
    // Implement bulk restore logic
  };

  const handleDeleteSelected = () => {
    console.log('Delete selected items:', selectedItems);
    // Implement bulk delete logic
  };

  const handleEmptyTrash = () => {
    console.log('Empty entire trash');
    // Implement empty trash logic
  };

  // Calculate stats
  const totalSize = items.reduce((acc, item) => {
    const size = parseFloat(item.size);
    return acc + (isNaN(size) ? 0 : size);
  }, 0);

  return (
    <div className="w-full space-y-4 sm:space-y-6">
      {/* Header */}
      <TrashHeader 
        totalItems={items.length}
        totalSize={`${totalSize.toFixed(1)} MB`}
      />

      {/* Controls */}
      <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm">
        <CardContent className="py-3 px-3 sm:py-4 sm:px-6">
          <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
            {/* Search */}
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input
                placeholder="Search deleted files and folders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-400 w-full"
              />
            </div>

            {/* Filters and Sort */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2 lg:gap-3 min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <TrashFilterDropdown
                  activeFilters={activeFilters}
                  onFilterChange={handleFilterChange}
                />
                
                <TrashSortDropdown
                  sortBy={sortBy}
                  onSortChange={setSortBy}
                />
              </div>

              {/* View toggle */}
              <div className="flex border border-zinc-700 rounded-md flex-shrink-0">
                <Button
                  variant={viewType === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewType('grid')}
                  className={`rounded-r-none ${viewType !== 'grid' ? 'text-zinc-300 hover:text-white' : ''}`}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewType === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewType('list')}
                  className={`rounded-l-none ${viewType !== 'list' ? 'text-zinc-300 hover:text-white' : ''}`}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {(selectedItems.length > 0 || items.length > 0) && (
        <TrashBulkActions
          selectedCount={selectedItems.length}
          totalCount={filteredAndSortedItems.length}
          onSelectAll={handleSelectAll}
          onDeselectAll={handleDeselectAll}
          onRestoreSelected={handleRestoreSelected}
          onDeleteSelected={handleDeleteSelected}
          onEmptyTrash={handleEmptyTrash}
        />
      )}

      {/* Content */}
      <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm">
        <CardContent className="p-3 sm:p-4 md:p-6">
          {filteredAndSortedItems.length === 0 ? (
            <TrashEmptyState searchQuery={searchQuery} />
          ) : (
            <Tabs value={viewType} className="w-full">
              <TabsList className="sr-only">
                <TabsTrigger value="grid">Grid</TabsTrigger>
                <TabsTrigger value="list">List</TabsTrigger>
              </TabsList>
              
              <TabsContent value="grid" className="mt-0">
                <TrashItemGrid
                  items={filteredAndSortedItems}
                  selectedItems={selectedItems}
                  onToggleSelect={handleToggleSelect}
                  onRestore={handleRestore}
                  onPermanentDelete={handlePermanentDelete}
                />
              </TabsContent>
              
              <TabsContent value="list" className="mt-0">
                <TrashItemList
                  items={filteredAndSortedItems}
                  selectedItems={selectedItems}
                  onToggleSelect={handleToggleSelect}
                  onRestore={handleRestore}
                  onPermanentDelete={handlePermanentDelete}
                />
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}