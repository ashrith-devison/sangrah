import { Users } from 'lucide-react';
import { SharedTab } from '@/types/shared';

declare global {
  interface Window {
    starredFilesError?: string;
  }
}

interface SharedEmptyStateProps {
  searchQuery: string;
  activeTab: SharedTab;
  filterType?: string;
  error?: string;
}

export default function SharedEmptyState({ searchQuery, activeTab, filterType }: SharedEmptyStateProps) {
  const errorMessage = filterType === 'starred' && typeof window !== 'undefined' && window.starredFilesError;
  return (
    <div className="text-center py-8 sm:py-12">
      <Users className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-white font-medium mb-2 text-sm sm:text-base">
        {errorMessage
          ? 'Failed to load starred files. Please try again.'
          : filterType === 'starred'
            ? 'No starred files found'
            : 'No shared items found'}
      </h3>
      <p className="text-gray-400 text-xs sm:text-sm">
        {errorMessage
          ? ''
          : searchQuery
            ? 'Try adjusting your search terms or filters'
            : filterType === 'starred'
              ? 'Starred files will appear here'
              : activeTab === 'shared-with-me'
                ? 'Files shared with you will appear here'
                : 'Files you share with others will appear here'}
      </p>
    </div>
  );
}