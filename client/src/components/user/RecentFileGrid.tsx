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
import { RecentFile } from '@/types/recent';

interface RecentFileGridProps {
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

export default function RecentFileGrid({ files }: RecentFileGridProps) {
  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4">
      {files.map(file => {
        const FileIcon = getFileIcon(file.type);
        const iconColor = getFileColor(file.type);

        return (
          <ContextMenu key={file.id}>
            <ContextMenuTrigger>
              <div className="group bg-zinc-800/30 hover:bg-zinc-800/50 border border-zinc-700 rounded-xl p-3 sm:p-4 cursor-pointer transition-all hover:border-[#6e73fa]/50">
                <div className="flex items-start justify-between mb-2 sm:mb-3">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <FileIcon
                        className={`w-6 h-6 sm:w-8 sm:h-8 ${iconColor}`}
                      />
                    </TooltipTrigger>
                    <TooltipContent className="bg-zinc-800 border-zinc-700">
                      <p className="text-white">{file.type} file</p>
                    </TooltipContent>
                  </Tooltip>
                  <div className="flex items-center gap-1 sm:gap-2">
                    {file.starred && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current" />
                        </TooltipTrigger>
                        <TooltipContent className="bg-zinc-800 border-zinc-700">
                          <p className="text-white">Starred file</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                    {file.shared && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge
                            variant="secondary"
                            className="text-xs bg-[#6e73fa]/20 text-[#6e73fa] cursor-help px-1 py-0"
                          >
                            <Users className="w-2 h-2 sm:w-3 sm:h-3" />
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent className="bg-zinc-800 border-zinc-700">
                          <p className="text-white">
                            Shared with{' '}
                            {file.owner === 'You' ? 'others' : file.owner}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </div>
                <h3
                  className="text-white font-medium text-xs sm:text-sm mb-1 sm:mb-2 truncate leading-tight"
                  title={file.name}
                >
                  {file.name}
                </h3>
                <div className="space-y-0.5 sm:space-y-1 text-xs text-gray-400">
                  <div className="flex items-center justify-between">
                    <span className="text-xs">{file.size}</span>
                    <span className="text-xs capitalize">{file.type}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
                    <span className="text-xs truncate">
                      Opened {file.opened}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <FolderOpen className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
                    <span className="text-xs truncate">{file.folder}</span>
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