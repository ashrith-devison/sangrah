'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { 
  File, 
  Folder, 
  Image, 
  Video, 
  Music, 
  Archive,
  FileText,
  MoreVertical,
  RotateCcw,
  Trash2,
  Clock,
  MapPin,
} from 'lucide-react';
import { TrashItemGridProps, TrashItem } from '@/types/trash';

export default function TrashItemGrid({
  items,
  selectedItems,
  onToggleSelect,
  onRestore,
  onPermanentDelete,
}: TrashItemGridProps) {
  const getFileIcon = (item: TrashItem) => {
    if (item.type === 'folder') {
      return <Folder className="h-8 w-8 text-blue-500" />;
    }
    
    switch (item.fileType) {
      case 'image':
        return <Image className="h-8 w-8 text-green-500" />;
      case 'video':
        return <Video className="h-8 w-8 text-red-500" />;
      case 'audio':
        return <Music className="h-8 w-8 text-purple-500" />;
      case 'archive':
        return <Archive className="h-8 w-8 text-orange-500" />;
      case 'document':
        return <FileText className="h-8 w-8 text-blue-500" />;
      default:
        return <File className="h-8 w-8 text-zinc-500" />;
    }
  };

  const getDaysLeftColor = (days: number) => {
    if (days <= 3) return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    if (days <= 7) return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
    return 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300';
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4">
      {items.map((item) => (
        <Card 
          key={item.id}
          className={`relative cursor-pointer transition-all hover:shadow-md bg-zinc-900/50 border-zinc-800 backdrop-blur-sm ${
            selectedItems.includes(item.id) 
              ? 'ring-2 ring-primary bg-accent/50' 
              : 'hover:bg-accent/30'
          }`}
          onClick={() => onToggleSelect(item.id)}
        >
          <CardContent className="p-2 sm:p-3 md:p-4">
            {/* Header with actions */}
            <div className="flex justify-between items-start mb-2 sm:mb-3">
              <div className="flex items-center space-x-2">
                {getFileIcon(item)}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.stopPropagation();
                        onRestore(item.id);
                      }}
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Restore
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.stopPropagation();
                        onPermanentDelete(item.id);
                      }}
                      className="text-red-600 dark:text-red-400"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Forever
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* File info */}
            <div className="space-y-1 sm:space-y-2">
              <h3 className="font-medium text-xs sm:text-sm truncate text-white" title={item.name}>
                {item.name}
              </h3>
              
              <div className="text-xs text-zinc-300 space-y-0.5 sm:space-y-1">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] sm:text-xs">Size:</span>
                  <span className="text-[10px] sm:text-xs text-zinc-200">{item.size}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <span className="text-[10px] sm:text-xs">Deleted:</span>
                  <span className="text-[10px] sm:text-xs text-zinc-200">{item.deletedDate}</span>
                </div>
              </div>

              {/* Days until permanent delete badge */}
              <Badge 
                variant="secondary" 
                className={`text-xs ${getDaysLeftColor(item.daysUntilPermanentDelete)}`}
              >
                {item.daysUntilPermanentDelete} days left
              </Badge>
            </div>

            {/* Quick actions */}
            <div className="flex gap-1 sm:gap-2 mt-3">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 h-6 sm:h-7 text-xs text-black bg-white border-zinc-300 hover:bg-zinc-100 min-w-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onRestore(item.id);
                }}
              >
                <RotateCcw className="h-3 w-3 sm:mr-1 text-black" />
                <span className="hidden sm:inline">Restore</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 h-6 sm:h-7 text-xs text-red-400 border-red-800 hover:bg-red-950 hover:text-red-300 min-w-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onPermanentDelete(item.id);
                }}
              >
                <Trash2 className="h-3 w-3 sm:mr-1" />
                <span className="hidden sm:inline">Delete</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}