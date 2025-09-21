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
  Star,
  FolderOpen,
  Users,
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
import { RecentFile } from '@/types/recent';

interface RecentFileListProps {
  files: RecentFile[];
}

const getFileIcon = (type: string) => {
  switch (type) {
    case 'document':
    case 'presentation':
      return FileText;
    case 'image':
    case 'design':
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

const getFileColor = (type: string) => {
  switch (type) {
    case 'document':
      return 'text-blue-400';
    case 'presentation':
      return 'text-orange-400';
    case 'image':
    case 'design':
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

export default function RecentFileList({ files }: RecentFileListProps) {
  return (
    <div className="space-y-2">
      {files.map(file => {
        const FileIcon = getFileIcon(file.type);
        const iconColor = getFileColor(file.type);

        return (
          <ContextMenu key={file.id}>
            <ContextMenuTrigger>
              <div className="group flex items-center justify-between p-3 sm:p-4 bg-zinc-800/30 hover:bg-zinc-800/50 border border-zinc-700 rounded-lg cursor-pointer transition-all hover:border-[#6e73fa]/50 mb-2">
                <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                  <FileIcon
                    className={`w-5 h-5 sm:w-6 sm:h-6 ${iconColor} flex-shrink-0`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p
                        className="text-white font-medium text-sm sm:text-base truncate"
                        title={file.name}
                      >
                        {file.name}
                      </p>
                      {file.starred && (
                        <Star className="w-3 h-3 text-yellow-400 fill-current flex-shrink-0" />
                      )}
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-xs text-gray-400 mt-1 gap-1 sm:gap-0">
                      <span>{file.size}</span>
                      <div className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        <span>Opened {file.opened}</span>
                      </div>
                      <div className="flex items-center">
                        <FolderOpen className="w-3 h-3 mr-1" />
                        <span>{file.folder}</span>
                      </div>
                      <span className="hidden sm:inline">by {file.owner}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
                  {file.shared && (
                    <Badge
                      variant="secondary"
                      className="text-xs bg-[#6e73fa]/20 text-[#6e73fa] px-1 sm:px-2"
                    >
                      <Users className="w-2 h-2 sm:w-3 sm:h-3 mr-0 sm:mr-1" />
                      <span className="hidden sm:inline">Shared</span>
                    </Badge>
                  )}
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
                <Star className="w-4 h-4 mr-2" />
                {file.starred ? 'Unstar' : 'Star'}
              </ContextMenuItem>
              <ContextMenuSeparator className="bg-zinc-700" />
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