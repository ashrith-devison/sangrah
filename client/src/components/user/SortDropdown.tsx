'use client';

import { ArrowUpDown, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SortOption } from '@/types/recent';

interface SortDropdownProps {
  sortBy: SortOption;
  onSortChange: (value: SortOption) => void;
}

export default function SortDropdown({ sortBy, onSortChange }: SortDropdownProps) {
  const getSortLabel = (sort: SortOption) => {
    switch (sort) {
      case 'modified':
        return 'Recently Modified';
      case 'name':
        return 'Name';
      case 'size':
        return 'Size';
      case 'type':
        return 'Type';
      default:
        return 'Recently Modified';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-full md:min-w-48 bg-zinc-800/50 border-zinc-700 text-white hover:bg-zinc-700 justify-start"
        >
          <ArrowUpDown className="w-4 h-4 mr-2 flex-shrink-0" />
          <span className="truncate">{getSortLabel(sortBy)}</span>
          <ChevronDown className="w-4 h-4 ml-auto flex-shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-zinc-800 border-zinc-700">
        <DropdownMenuItem
          onClick={() => onSortChange('modified')}
          className="text-white hover:bg-zinc-700 cursor-pointer"
        >
          Recently Modified
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onSortChange('name')}
          className="text-white hover:bg-zinc-700 cursor-pointer"
        >
          Name
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onSortChange('size')}
          className="text-white hover:bg-zinc-700 cursor-pointer"
        >
          Size
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onSortChange('type')}
          className="text-white hover:bg-zinc-700 cursor-pointer"
        >
          Type
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}