'use client';

import { ArrowUpDown, ChevronDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DriveSortDropdownProps {
  sortBy: 'name' | 'modified' | 'size' | 'type';
  sortOrder: 'asc' | 'desc';
  onSortChange: (sortBy: 'name' | 'modified' | 'size' | 'type', sortOrder: 'asc' | 'desc') => void;
}

const SORT_OPTIONS = [
  { value: 'name', label: 'Name' },
  { value: 'modified', label: 'Modified Date' },
  { value: 'size', label: 'File Size' },
  { value: 'type', label: 'File Type' },
] as const;

export default function DriveSortDropdown({ 
  sortBy, 
  sortOrder, 
  onSortChange 
}: DriveSortDropdownProps) {
  const getSortLabel = () => {
    const option = SORT_OPTIONS.find(opt => opt.value === sortBy);
    return option?.label || 'Name';
  };

  const SortIcon = sortOrder === 'asc' ? ArrowUp : ArrowDown;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="bg-zinc-800/50 border-zinc-700 text-white hover:bg-zinc-700"
        >
          <ArrowUpDown className="w-4 h-4 mr-2" />
          {getSortLabel()}
          <SortIcon className="w-3 h-3 ml-2" />
          <ChevronDown className="w-4 h-4 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48 bg-zinc-800 border-zinc-700">
        {SORT_OPTIONS.map(option => (
          <div key={option.value}>
            <DropdownMenuItem
              onClick={() => onSortChange(option.value, 'asc')}
              className={`text-white hover:bg-zinc-700 cursor-pointer ${
                sortBy === option.value && sortOrder === 'asc' ? 'bg-zinc-700' : ''
              }`}
            >
              <ArrowUp className="w-4 h-4 mr-2" />
              {option.label} (A-Z)
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onSortChange(option.value, 'desc')}
              className={`text-white hover:bg-zinc-700 cursor-pointer ${
                sortBy === option.value && sortOrder === 'desc' ? 'bg-zinc-700' : ''
              }`}
            >
              <ArrowDown className="w-4 h-4 mr-2" />
              {option.label} (Z-A)
            </DropdownMenuItem>
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}