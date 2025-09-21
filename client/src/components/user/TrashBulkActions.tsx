'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  RotateCcw, 
  Trash2, 
  Square, 
  CheckSquare, 
  X,
  AlertTriangle,
} from 'lucide-react';
import { TrashBulkActionsProps } from '@/types/trash';

export default function TrashBulkActions({
  selectedCount,
  totalCount,
  onSelectAll,
  onDeselectAll,
  onRestoreSelected,
  onDeleteSelected,
  onEmptyTrash,
}: TrashBulkActionsProps) {
  const isAllSelected = selectedCount === totalCount && totalCount > 0;
  const hasSelection = selectedCount > 0;

  return (
    <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm border-l-4 border-l-primary">
      <CardContent className="p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
          {/* Selection info */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={isAllSelected ? onDeselectAll : onSelectAll}
              >
                {isAllSelected ? (
                  <CheckSquare className="h-4 w-4 text-primary" />
                ) : (
                  <Square className="h-4 w-4 text-zinc-300" />
                )}
              </Button>
              
              <span className="text-sm font-medium text-white">
                {hasSelection ? (
                  <>
                    <Badge variant="secondary" className="mr-2">
                      {selectedCount}
                    </Badge>
                    {selectedCount === 1 ? 'item' : 'items'} selected
                  </>
                ) : (
                  'Select items for bulk actions'
                )}
              </span>
            </div>

            {hasSelection && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDeselectAll}
                className="h-6 px-2 text-xs text-zinc-300 hover:text-white"
              >
                <X className="h-3 w-3 mr-1" />
                Clear
              </Button>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {hasSelection && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onRestoreSelected}
                  className="h-8 text-black bg-white border-zinc-300 hover:bg-zinc-100"
                >
                  <RotateCcw className="h-4 w-4 mr-2 text-black" />
                  <span className="hidden sm:inline">Restore ({selectedCount})</span>
                  <span className="sm:hidden">Restore</span>
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={onDeleteSelected}
                  className="h-8 text-red-400 border-red-800 hover:bg-red-950 hover:text-red-300"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Delete Forever ({selectedCount})</span>
                  <span className="sm:hidden">Delete</span>
                </Button>

                <Separator orientation="vertical" className="h-6" />
              </>
            )}

            <Button
              size="sm"
              variant="outline"
              onClick={onEmptyTrash}
              disabled={totalCount === 0}
              className="h-8 text-red-400 border-red-800 hover:bg-red-950 hover:text-red-300"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Empty Trash</span>
              <span className="sm:hidden">Empty</span>
            </Button>
          </div>
        </div>

        {hasSelection && (
          <div className="mt-3 pt-3 border-t border-zinc-700">
            <p className="text-xs text-zinc-300">
              <AlertTriangle className="h-3 w-3 inline mr-1" />
              <strong>Warning:</strong> Permanently deleted items cannot be recovered. 
              Consider restoring items first if you might need them later.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}