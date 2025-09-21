'use client';

import { Grid3X3, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ViewMode } from '@/types/home';

interface ViewToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export default function ViewToggle({ viewMode, onViewModeChange }: ViewToggleProps) {
  return (
    <div className="flex border border-zinc-700 rounded-lg overflow-hidden">
      <Button
        variant={viewMode === 'grid' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewModeChange('grid')}
        className="rounded-none hover:bg-zinc-800"
      >
        <Grid3X3 className="w-4 h-4" color="#fff" />
      </Button>
      <Button
        variant={viewMode === 'list' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewModeChange('list')}
        className="rounded-none hover:bg-zinc-800"
      >
        <List className="w-4 h-4" color="#fff" />
      </Button>
    </div>
  );
}