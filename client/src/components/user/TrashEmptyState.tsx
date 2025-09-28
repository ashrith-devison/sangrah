import { Button } from '@/components/ui/button';
import { Trash2, RefreshCw, Search } from 'lucide-react';
import { TrashEmptyStateProps } from '@/types/trash';

export default function TrashEmptyState({ searchQuery }: TrashEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
              {searchQuery ? (
                <Search className="h-8 w-8 text-zinc-400" />
              ) : (
                <Trash2 className="h-8 w-8 text-zinc-400" />
              )}
            </div>
            
            <h3 className="text-lg font-semibold text-white mb-2">
              {searchQuery ? 'No results found' : 'Trash is empty'}
            </h3>
            
            <p className="text-sm text-zinc-300">
              {searchQuery 
                ? `No items found matching "${searchQuery}". Try adjusting your search terms or filters.`
                : 'Items you delete will appear here. Deleted items are automatically removed after 30 days.'
              }
            </p>
          </div>

          <div className="space-y-3">
            {searchQuery ? (
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Clear search and filters
              </Button>
            ) : (
              <div className="text-xs text-zinc-300 space-y-2">
                <p>💡 <strong>Tip:</strong> Deleted files are kept for 30 days</p>
                <p>🔄 You can restore files anytime before they're permanently deleted</p>
                <p>⚡ Use Shift+Delete to bypass the trash and delete permanently</p>
              </div>
            )}
          </div>
      </div>
    </div>
  );
}