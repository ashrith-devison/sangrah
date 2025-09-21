'use client';

import React from 'react';
import { ArrowUpDown, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { StarredSortDropdownProps } from '@/types/starred';

export default function StarredSortDropdown({
  sortBy,
  onSortChange,
}: StarredSortDropdownProps) {
  const getSortLabel = (sortBy: string) => {
    switch (sortBy) {
      case 'starredDate':
        return 'Recently Starred';
      case 'name':
        return 'Name';
      case 'size':
        return 'Size';
      case 'lastModified':
        return 'Last Modified';
      default:
        return 'Recently Starred';
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
          onClick={() => onSortChange('starredDate')}
          className="text-white hover:bg-zinc-700 cursor-pointer"
        >
          Recently Starred
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
          onClick={() => onSortChange('lastModified')}
          className="text-white hover:bg-zinc-700 cursor-pointer"
        >
          Last Modified
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}