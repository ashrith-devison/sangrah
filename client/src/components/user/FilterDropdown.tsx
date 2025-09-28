'use client';

import { Filter, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FileTypeOption } from '@/types/recent';

interface FilterDropdownProps {
  filterType: string;
  onFilterChange: (value: string) => void;
  options: FileTypeOption[];
}

export default function FilterDropdown({ 
  filterType, 
  onFilterChange, 
  options 
}: FilterDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-full md:min-w-40 bg-zinc-800/50 border-zinc-700 text-white hover:bg-zinc-700 justify-start"
        >
          <Filter className="w-4 h-4 mr-2 flex-shrink-0" />
          <span className="truncate">
            {options.find(opt => opt.value === filterType)?.label || 'All Types'}
          </span>
          <ChevronDown className="w-4 h-4 ml-auto flex-shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-zinc-800 border-zinc-700">
        {options.map(option => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => onFilterChange(option.value)}
            className="text-white hover:bg-zinc-700 cursor-pointer"
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}