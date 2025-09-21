'use client';

import { Download, Share2 } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SharedTab } from '@/types/shared';

interface SharedTabsProps {
  activeTab: SharedTab;
  onTabChange: (tab: SharedTab) => void;
  sharedWithMeCount: number;
  sharedByMeCount: number;
}

export default function SharedTabs({ 
  activeTab, 
  onTabChange, 
  sharedWithMeCount, 
  sharedByMeCount 
}: SharedTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={(value) => onTabChange(value as SharedTab)} className="mb-6">
      <TabsList className="bg-zinc-900/50 border border-zinc-800 p-1">
        <TabsTrigger
          value="shared-with-me"
          className="text-white data-[state=active]:bg-zinc-800 data-[state=active]:text-white"
        >
          <Download className="w-4 h-4 mr-2" />
          Shared with Me ({sharedWithMeCount})
        </TabsTrigger>
        <TabsTrigger
          value="shared-by-me"
          className="text-white data-[state=active]:bg-zinc-800 data-[state=active]:text-white"
        >
          <Share2 className="w-4 h-4 mr-2" />
          Shared by Me ({sharedByMeCount})
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}