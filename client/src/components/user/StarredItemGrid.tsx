'use client';

import React from 'react';
import {
  FileText,
  Image,
  Video,
  Music,
  Archive,
  Download,
  Share2,
  Trash2,
  Eye,
  Clock,
  Users,
  Star,
  Folder,
  Copy,
  Settings,
  StarOff,
  MoreVertical,
  ExternalLink,
} from 'lucide-react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { StarredItemGridProps, StarredItem } from '@/types/starred';
import api from '@/lib/api';
import { toast } from 'sonner';
import { useUserStore } from '@/stores/userStore';
import { RecentFileDropdown } from './RecentFileDropdown';

// Component to handle authenticated iframe loading with browser compatibility

export default function StarredItemGrid({
  items,
  onRemoveStar,
}: StarredItemGridProps) {
  const { user } = useUserStore();
  const [previewItem, setPreviewItem] = React.useState<StarredItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const getFileIcon = (item: StarredItem) => {
    if (item.type === 'folder') return Folder;

    switch (item.fileType) {
      case 'document':
      case 'presentation':
        return FileText;
      case 'image':
        return Image;
      case 'video':
        return Video;
      case 'audio':
        return Music;
      case 'archive':
        return Archive;
      default:
        return FileText;
    }
  };

  const getFileColor = (item: StarredItem) => {
    if (item.type === 'folder') return 'text-blue-400';

    switch (item.fileType) {
      case 'document':
        return 'text-blue-400';
      case 'presentation':
        return 'text-orange-400';
      case 'image':
        return 'text-green-400';
      case 'video':
        return 'text-purple-400';
      case 'audio':
        return 'text-pink-400';
      case 'archive':
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4">
      {items.map(item => {
        const ItemIcon = getFileIcon(item);
        const iconColor = getFileColor(item);
        // Map StarredItem to RecentFile shape
        const validTypes = ['document', 'audio', 'video', 'image', 'presentation', 'archive', 'design'];
        const mappedType: 'document' | 'audio' | 'video' | 'image' | 'presentation' | 'archive' | 'design' =
          validTypes.includes(item.fileType || '') ? (item.fileType as any) : 'document';
        const recentFile = {
          id: Number(item.id),
          name: item.name,
          type: mappedType,
          size: item.size,
          modified: item.lastModified,
          opened: item.starredDate,
          shared: item.isShared,
          starred: true,
          folder: '',
          owner: item.owner,
          fileId: item.shaFileId,
          filename: item.name,
        };
        return (
          <ContextMenu key={item.id}>
            <ContextMenuTrigger>
              <div
                className="group bg-zinc-800/30 hover:bg-zinc-800/50 border border-zinc-700 rounded-xl p-3 sm:p-4 cursor-pointer transition-all hover:border-[#6e73fa]/50 min-w-0 w-full"
              >
                <div className="flex items-start justify-between mb-2 sm:mb-3">
                  <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <ItemIcon
                          className={`w-6 h-6 sm:w-8 sm:h-8 ${iconColor} flex-shrink-0`}
                        />
                      </TooltipTrigger>
                      <TooltipContent className="bg-zinc-800 border-zinc-700">
                        <p className="text-white">
                          {item.type === 'folder'
                            ? 'Starred folder'
                            : `${item.fileType} file`}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                    {item.isShared && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Users className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400 flex-shrink-0" />
                        </TooltipTrigger>
                        <TooltipContent className="bg-zinc-800 border-zinc-700">
                          <p className="text-white">Shared item</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Star indicator - always visible */}
                    <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current flex-shrink-0" />
                    {/* Dropdown beside star */}
                    <RecentFileDropdown
                      file={recentFile}
                      onStar={file => onRemoveStar(item.id)}
                      onDelete={file => onRemoveStar(item.id)}
                      triggerClassName="ml-1"
                    />
                  </div>
                </div>
                <h3
                  className="text-white font-medium text-xs sm:text-sm mb-1 sm:mb-2 truncate leading-tight"
                  title={item.name}
                >
                  {item.name}
                </h3>
                <div className="space-y-0.5 sm:space-y-1 text-xs text-gray-400">
                  <div className="flex items-center justify-between">
                    <span className="text-xs">{item.size}</span>
                    <span className="text-xs truncate">{item.path}</span>
                  </div>
                  <div className="flex items-center">
                    <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1 text-yellow-400" />
                    <span className="text-xs truncate">
                      Starred {item.starredDate}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
                    <span className="text-xs truncate">
                      Modified {item.lastModified}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Users className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
                    <span className="text-xs truncate">by {item.owner}</span>
                  </div>
                </div>
              </div>
            </ContextMenuTrigger>
          </ContextMenu>
        );
      })}
    </div>
  );
}