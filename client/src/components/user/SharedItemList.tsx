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
  MoreHorizontal,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { SharedItem } from '@/types/shared';

interface SharedItemListProps {
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

export default function SharedItemList({ items }: SharedItemListProps) {
  return (
    <div className="space-y-2">
      {items.map(item => {
        const ItemIcon = getFileIcon(item);
        const iconColor = getFileColor(item);

        return (
          <ContextMenu key={item.id}>
            <ContextMenuTrigger>
              <div className="group flex items-center justify-between p-3 sm:p-4 bg-zinc-800/30 hover:bg-zinc-800/50 border border-zinc-700 rounded-lg cursor-pointer transition-all hover:border-[#6e73fa]/50 mb-2">
                <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <ItemIcon
                      className={`w-5 h-5 sm:w-6 sm:h-6 ${iconColor} flex-shrink-0`}
                    />
                    {item.isPublic && (
                      <Globe className="w-3 h-3 sm:w-4 sm:h-4 text-green-400 flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p
                        className="text-white font-medium text-sm sm:text-base truncate"
                        title={item.name}
                      >
                        {item.name}
                      </p>
                      {item.starred && (
                        <Star className="w-3 h-3 text-yellow-400 fill-current flex-shrink-0" />
                      )}
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-xs text-gray-400 mt-1 gap-1 sm:gap-0">
                      <span>{item.size}</span>
                      <div className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        <span>Shared {item.shared}</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="w-3 h-3 mr-1" />
                        <span>by {item.sharedBy}</span>
                      </div>
                      <span className="hidden sm:inline">
                        {item.accessCount} views
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
                  {getPermissionBadge(item.permissions)}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 sm:p-2"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
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