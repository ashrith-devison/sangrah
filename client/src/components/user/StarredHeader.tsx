import React from 'react';
import { Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { StarredHeaderProps } from '@/types/starred';

export default function StarredHeader({ totalItems }: StarredHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="w-full lg:w-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 flex items-center">
            <Star className="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-3 text-yellow-400 fill-current" />
            Starred Files & Folders
          </h1>
          <p className="text-sm sm:text-base text-gray-400">
            Quick access to your most important files and folders
          </p>
        </div>
        <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
          <Badge
            variant="outline"
            className="border-yellow-500 text-yellow-400 px-3 py-1 text-sm"
          >
            {totalItems} starred items
          </Badge>
        </div>
      </div>
    </div>
  );
}