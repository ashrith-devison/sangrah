import { Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ViewMode } from '@/types/home';

interface EmptyStateProps {
  searchQuery: string;
  isLoading: boolean;
  onSimulateLoading: () => void;
  viewMode: ViewMode;
}

export default function EmptyState({ 
  searchQuery, 
  isLoading, 
  onSimulateLoading,
  viewMode 
}: EmptyStateProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-zinc-800/30 border border-zinc-700 rounded-xl p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <Skeleton className="w-8 h-8 rounded bg-zinc-700" />
                  <Skeleton className="w-12 h-4 rounded bg-zinc-700" />
                </div>
                <Skeleton className="w-full h-4 mb-2 rounded bg-zinc-700" />
                <div className="space-y-1">
                  <Skeleton className="w-16 h-3 rounded bg-zinc-700" />
                  <Skeleton className="w-20 h-3 rounded bg-zinc-700" />
                  <Skeleton className="w-24 h-3 rounded bg-zinc-700" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="flex items-center p-4 bg-zinc-800/30 border border-zinc-700 rounded-lg"
              >
                <Skeleton className="w-6 h-6 mr-4 rounded bg-zinc-700" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="w-48 h-4 rounded bg-zinc-700" />
                  <Skeleton className="w-32 h-3 rounded bg-zinc-700" />
                </div>
                <Skeleton className="w-12 h-4 rounded bg-zinc-700" />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="text-center py-8 sm:py-12">
      <Clock className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-white font-medium mb-2 text-sm sm:text-base">
        No recent files found
      </h3>
      <p className="text-gray-400 text-xs sm:text-sm mb-4">
        {searchQuery
          ? 'Try adjusting your search terms or filters'
          : 'Files you open will appear here for quick access'}
      </p>
      <Button
        variant="outline"
        size="sm"
        onClick={onSimulateLoading}
        className="border-zinc-700 text-white hover:bg-zinc-800 text-xs sm:text-sm"
      >
        Simulate Loading
      </Button>
    </div>
  );
}