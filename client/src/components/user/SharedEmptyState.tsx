import { Users } from 'lucide-react';
import { SharedTab } from '@/types/shared';

interface SharedEmptyStateProps {
  searchQuery: string;
  activeTab: SharedTab;
}

export default function SharedEmptyState({ searchQuery, activeTab }: SharedEmptyStateProps) {
  return (
    <div className="text-center py-8 sm:py-12">
      <Users className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-white font-medium mb-2 text-sm sm:text-base">
        No shared items found
      </h3>
      <p className="text-gray-400 text-xs sm:text-sm">
        {searchQuery
          ? 'Try adjusting your search terms or filters'
          : activeTab === 'shared-with-me'
            ? 'Files shared with you will appear here'
            : 'Files you share with others will appear here'}
      </p>
    </div>
  );
}