'use client';

import { ArrowUpDown, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SharedSortOption } from '@/types/shared';

interface SharedSortDropdownProps {
  sortBy: SharedSortOption;
  onSortChange: (value: SharedSortOption) => void;
}

export default function SharedSortDropdown({ sortBy, onSortChange }: SharedSortDropdownProps) {
  const getSortLabel = (sort: SharedSortOption) => {
    switch (sort) {
      case 'shared':
        return 'Recently Shared';
      case 'name':
        return 'Name';
      case 'size':
        return 'Size';
      case 'permissions':
        return 'Permissions';
      default:
        return 'Recently Shared';
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
          onClick={() => onSortChange('shared')}
          className="text-white hover:bg-zinc-700 cursor-pointer"
        >
          Recently Shared
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
          onClick={() => onSortChange('permissions')}
          className="text-white hover:bg-zinc-700 cursor-pointer"
        >
          Permissions
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}