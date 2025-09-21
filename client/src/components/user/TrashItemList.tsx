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
  User,
  Square,
  CheckSquare,
} from 'lucide-react';
import { TrashItemListProps, TrashItem } from '@/types/trash';

export default function TrashItemList({
  items,
  selectedItems,
  onToggleSelect,
  onRestore,
  onPermanentDelete,
}: TrashItemListProps) {
  const getFileIcon = (item: TrashItem) => {
    if (item.type === 'folder') {
      return <Folder className="h-5 w-5 text-blue-500" />;
    }
    
    switch (item.fileType) {
      case 'image':
        return <Image className="h-5 w-5 text-green-500" />;
      case 'video':
        return <Video className="h-5 w-5 text-red-500" />;
      case 'audio':
        return <Music className="h-5 w-5 text-purple-500" />;
      case 'archive':
        return <Archive className="h-5 w-5 text-orange-500" />;
      case 'document':
        return <FileText className="h-5 w-5 text-blue-500" />;
      default:
        return <File className="h-5 w-5 text-zinc-500" />;
    }
  };

  const getDaysLeftColor = (days: number) => {
    if (days <= 3) return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    if (days <= 7) return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
    return 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300';
  };

  return (
    <div className="space-y-2 sm:space-y-3">
      {items.map((item) => (
        <Card 
          key={item.id}
          className={`transition-all hover:shadow-sm bg-zinc-900/50 border-zinc-800 backdrop-blur-sm ${
            selectedItems.includes(item.id) 
              ? 'ring-2 ring-primary bg-accent/50' 
              : 'hover:bg-accent/30'
          }`}
        >
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Checkbox */}
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 flex-shrink-0"
                onClick={() => onToggleSelect(item.id)}
              >
                {selectedItems.includes(item.id) ? (
                  <CheckSquare className="h-4 w-4 text-primary" />
                ) : (
                  <Square className="h-4 w-4 text-zinc-300" />
                )}
              </Button>

              {/* File icon and name */}
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                {getFileIcon(item)}
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium text-sm truncate text-white" title={item.name}>
                    {item.name}
                  </h3>
                  <div className="flex items-center text-xs text-zinc-300 mt-1">
                    <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                    <span className="truncate" title={item.originalLocation}>
                      {item.originalLocation}
                    </span>
                  </div>
                </div>
              </div>

              {/* Size */}
              <div className="hidden sm:block text-sm text-zinc-300 min-w-0">
                {item.size}
              </div>

              {/* Deleted date */}
              <div className="hidden md:flex items-center text-sm text-zinc-300 min-w-0">
                <Clock className="h-4 w-4 mr-1" />
                <span className="whitespace-nowrap">{item.deletedDate}</span>
              </div>

              {/* Deleted by */}
              <div className="hidden lg:flex items-center text-sm text-zinc-300 min-w-0">
                <User className="h-4 w-4 mr-1" />
                <span className="truncate">{item.deletedBy}</span>
              </div>

              {/* Days left badge */}
              <Badge 
                variant="secondary" 
                className={`text-xs whitespace-nowrap ${getDaysLeftColor(item.daysUntilPermanentDelete)}`}
              >
                {item.daysUntilPermanentDelete}d
              </Badge>

              {/* Actions */}
              <div className="flex items-center space-x-2 flex-shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 px-2 text-xs text-black bg-white border-zinc-300 hover:bg-zinc-100"
                  onClick={() => onRestore(item.id)}
                >
                  <RotateCcw className="h-3 w-3 mr-1 text-black" />
                  <span className="hidden sm:inline">Restore</span>
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-zinc-300 hover:text-white">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                      onClick={() => onRestore(item.id)}
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Restore
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onPermanentDelete(item.id)}
                      className="text-red-600 dark:text-red-400"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Forever
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}