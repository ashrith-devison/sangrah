import { Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ViewMode } from '@/types/home';


interface EmptyStateProps {
  searchQuery: string;
  isLoading: boolean;
  viewMode: ViewMode;
}

export default function EmptyState({ searchQuery, isLoading, viewMode }: EmptyStateProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <svg className="animate-spin h-8 w-8 text-gray-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
        <div className="text-lg text-gray-500 font-medium">Loading recent files...</div>
      </div>
    );
  }

  return (
    <div className="text-center py-8 sm:py-12">
      <svg className="h-8 w-8 text-gray-400 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
      </svg>
      <p className="text-gray-400 text-xs sm:text-sm mb-4">
        {searchQuery
          ? 'Try adjusting your search terms or filters'
          : 'No files found'}
      </p>
    </div>
  );
}