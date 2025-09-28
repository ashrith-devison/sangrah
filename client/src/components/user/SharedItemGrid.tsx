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
  Copy,
  Globe,
  Folder,
  Settings,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
import { SharedItem } from '@/types/shared';

interface SharedItemGridProps {
  items: SharedItem[];
}

const getFileIcon = (item: SharedItem) => {
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

const getFileColor = (item: SharedItem) => {
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

const getPermissionBadge = (permission: string) => {
  switch (permission) {
    case 'view':
      return (
        <Badge
          variant="outline"
          className="border-blue-500 text-blue-400 text-xs"
        >
          View
        </Badge>
      );
    case 'edit':
      return (
        <Badge
          variant="outline"
          className="border-green-500 text-green-400 text-xs"
        >
          Edit
        </Badge>
      );
    case 'admin':
      return (
        <Badge
          variant="outline"
          className="border-purple-500 text-purple-400 text-xs"
        >
          Admin
        </Badge>
      );
    default:
      return (
        <Badge
          variant="outline"
          className="border-gray-500 text-gray-400 text-xs"
        >
          Unknown
        </Badge>
      );
  }
};

export default function SharedItemGrid({ items }: SharedItemGridProps) {
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
                            ? 'Shared folder'
                            : `${item.fileType} file`}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                    {item.isPublic && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Globe className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                        </TooltipTrigger>
                        <TooltipContent className="bg-zinc-800 border-zinc-700">
                          <p className="text-white">Public access</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    {item.starred && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current" />
                        </TooltipTrigger>
                        <TooltipContent className="bg-zinc-800 border-zinc-700">
                          <p className="text-white">Starred item</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                    {getPermissionBadge(item.permissions)}
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
                    <span className="text-xs">{item.accessCount} views</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
                    <span className="text-xs truncate">
                      Shared {item.shared}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Users className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
                    <span className="text-xs truncate">by {item.sharedBy}</span>
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
                Manage Access
              </ContextMenuItem>
              <ContextMenuItem className="text-red-400 hover:bg-zinc-700">
                <Trash2 className="w-4 h-4 mr-2" />
                Remove Access
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        );
      })}
    </div>
  );
}