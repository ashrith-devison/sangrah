'use client';

import { Grid3X3, List } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ViewMode } from '@/types/home';

interface RecentViewToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export default function RecentViewToggle({ viewMode, onViewModeChange }: RecentViewToggleProps) {
  return (
    <div className="flex justify-center lg:justify-end w-full lg:w-auto">
      <Tabs
        value={viewMode}
        onValueChange={value => onViewModeChange(value as ViewMode)}
      >
        <TabsList className="bg-zinc-800/50 border border-zinc-700">
          <TabsTrigger
            value="grid"
            className="data-[state=active]:bg-zinc-700"
          >
            <Grid3X3 className="w-4 h-4" color="#fff" />
          </TabsTrigger>
          <TabsTrigger
            value="list"
            className="data-[state=active]:bg-zinc-700"
          >
            <List className="w-4 h-4" color="#fff" />
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}