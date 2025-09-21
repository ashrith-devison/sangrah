'use client';

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export default function SearchBar({ searchQuery, onSearchChange }: SearchBarProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
      <Input
        placeholder="Search files..."
        value={searchQuery}
        onChange={e => onSearchChange(e.target.value)}
        className="pl-10 w-64 bg-zinc-800/50 border-zinc-700 text-white placeholder:text-gray-500 focus:border-[#6e73fa]"
      />
    </div>
  );
}