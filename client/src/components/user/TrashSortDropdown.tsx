'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { ArrowUpDown } from 'lucide-react';
import { TrashSortDropdownProps } from '@/types/trash';

export default function TrashSortDropdown({
  sortBy,
  onSortChange,
}: TrashSortDropdownProps) {
  const sortOptions = [
    { value: 'deletedDate-desc', label: 'Recently Deleted' },
    { value: 'deletedDate-asc', label: 'Oldest Deleted' },
    { value: 'name-asc', label: 'Name (A-Z)' },
    { value: 'name-desc', label: 'Name (Z-A)' },
    { value: 'size-desc', label: 'Largest Size' },
    { value: 'size-asc', label: 'Smallest Size' },
    { value: 'originalLocation-asc', label: 'Original Location' },
    { value: 'daysLeft-asc', label: 'Days Until Permanent Delete' },
  ];

  const currentSort = sortOptions.find(option => option.value === sortBy);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="h-8 border-dashed bg-zinc-800/50 border-zinc-700 hover:bg-accent/50 text-white"
        >
          <ArrowUpDown className="h-4 w-4 mr-2" />
          Sort: {currentSort?.label || 'Recently Deleted'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>Sort by</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={sortBy} onValueChange={onSortChange}>
          {sortOptions.map((option) => (
            <DropdownMenuRadioItem
              key={option.value}
              value={option.value}
            >
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}