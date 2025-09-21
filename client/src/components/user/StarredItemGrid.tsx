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
} from 'lucide-react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { StarredItemGridProps, StarredItem } from '@/types/starred';

export default function StarredItemGrid({
  items,
  onRemoveStar,
}: StarredItemGridProps) {
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

        return (
          <ContextMenu key={item.id}>
            <ContextMenuTrigger>
              <div className="group bg-zinc-800/30 hover:bg-zinc-800/50 border border-zinc-700 rounded-xl p-3 sm:p-4 cursor-pointer transition-all hover:border-[#6e73fa]/50">
                <div className="flex items-start justify-between mb-2 sm:mb-3">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <ItemIcon
                          className={`w-6 h-6 sm:w-8 sm:h-8 ${iconColor}`}
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
                          <Users className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
                        </TooltipTrigger>
                        <TooltipContent className="bg-zinc-800 border-zinc-700">
                          <p className="text-white">Shared item</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current" />
                      </TooltipTrigger>
                      <TooltipContent className="bg-zinc-800 border-zinc-700">
                        <p className="text-white">Starred item</p>
                      </TooltipContent>
                    </Tooltip>
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
            <ContextMenuContent className="bg-zinc-800 border-zinc-700">
              <ContextMenuItem className="text-white hover:bg-zinc-700">
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </ContextMenuItem>
              <ContextMenuItem className="text-white hover:bg-zinc-700">
                <Download className="w-4 h-4 mr-2" />
                Download
              </ContextMenuItem>
              <ContextMenuItem className="text-white hover:bg-zinc-700">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </ContextMenuItem>
              <ContextMenuItem className="text-white hover:bg-zinc-700">
                <Copy className="w-4 h-4 mr-2" />
                Copy Link
              </ContextMenuItem>
              <ContextMenuSeparator className="bg-zinc-700" />
              <ContextMenuItem className="text-white hover:bg-zinc-700">
                <Settings className="w-4 h-4 mr-2" />
                Properties
              </ContextMenuItem>
              <ContextMenuItem
                className="text-yellow-400 hover:bg-zinc-700"
                onClick={() => onRemoveStar(item.id)}
              >
                <StarOff className="w-4 h-4 mr-2" />
                Remove Star
              </ContextMenuItem>
              <ContextMenuItem className="text-red-400 hover:bg-zinc-700">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        );
      })}
    </div>
  );
}