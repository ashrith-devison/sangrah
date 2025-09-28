'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import { Filter } from 'lucide-react';
import { TrashFilterDropdownProps } from '@/types/trash';

export default function TrashFilterDropdown({
  activeFilters,
  onFilterChange,
}: TrashFilterDropdownProps) {
  const filterOptions = [
    { value: 'all', label: 'All Items' },
    { value: 'files', label: 'Files Only' },
    { value: 'folders', label: 'Folders Only' },
  ];

  const fileTypeOptions = [
    { value: 'documents', label: 'Documents' },
    { value: 'images', label: 'Images' },
    { value: 'videos', label: 'Videos' },
    { value: 'audio', label: 'Audio' },
    { value: 'archives', label: 'Archives' },
    { value: 'other', label: 'Other' },
  ];

  const deletionTimeOptions = [
    { value: 'today', label: 'Deleted Today' },
    { value: 'week', label: 'Last 7 Days' },
    { value: 'month', label: 'Last 30 Days' },
    { value: 'older', label: 'Older than 30 Days' },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="h-8 border-dashed bg-zinc-800/50 border-zinc-700 hover:bg-accent/50 text-white"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filter
          {activeFilters.length > 0 && (
            <span className="ml-2 rounded-full bg-primary text-primary-foreground px-2 py-0.5 text-xs">
              {activeFilters.length}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>Item Type</DropdownMenuLabel>
        {filterOptions.map((option) => (
          <DropdownMenuCheckboxItem
            key={option.value}
            checked={activeFilters.includes(option.value)}
            onCheckedChange={(checked) => onFilterChange(option.value, checked)}
          >
            {option.label}
          </DropdownMenuCheckboxItem>
        ))}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuLabel>File Type</DropdownMenuLabel>
        {fileTypeOptions.map((option) => (
          <DropdownMenuCheckboxItem
            key={option.value}
            checked={activeFilters.includes(option.value)}
            onCheckedChange={(checked) => onFilterChange(option.value, checked)}
          >
            {option.label}
          </DropdownMenuCheckboxItem>
        ))}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuLabel>Deletion Time</DropdownMenuLabel>
        {deletionTimeOptions.map((option) => (
          <DropdownMenuCheckboxItem
            key={option.value}
            checked={activeFilters.includes(option.value)}
            onCheckedChange={(checked) => onFilterChange(option.value, checked)}
          >
            {option.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}