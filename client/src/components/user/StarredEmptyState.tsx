import React from 'react';
import { Star } from 'lucide-react';
import { StarredEmptyStateProps } from '@/types/starred';

export default function StarredEmptyState({ searchQuery }: StarredEmptyStateProps) {
  return (
    <div className="text-center py-8 sm:py-12">
      <Star className="w-10 h-10 sm:w-12 sm:h-12 text-yellow-400 mx-auto mb-4 fill-current" />
      <h3 className="text-white font-medium mb-2 text-sm sm:text-base">
        No starred items found
      </h3>
      <p className="text-gray-400 text-xs sm:text-sm">
        {searchQuery
          ? 'Try adjusting your search terms or filters'
          : 'Files and folders you star will appear here for quick access'}
      </p>
    </div>
  );
}