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
import { FileItem } from '@/types/home';

interface FileListProps {
  files: FileItem[];
  loading?: boolean;
}

const getFileIcon = (type: string) => {
  switch (type) {
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

const getFileColor = (type: string) => {
  switch (type) {
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

export default function FileList({ files, loading = false }: FileListProps) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px]">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="animate-spin mb-3">
          <circle cx="20" cy="20" r="18" stroke="#6e73fa" strokeWidth="4" strokeDasharray="90 60"/>
        </svg>
        <span className="text-white text-base">Loading files...</span>
      </div>
    );
  }

  if (!files || files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px]">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="mb-3">
          <circle cx="20" cy="20" r="18" stroke="#6e73fa" strokeWidth="4" strokeDasharray="90 60"/>
        </svg>
        <span className="text-white text-base">No files found</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {files.map(file => {
        const FileIcon = getFileIcon(file.type);
        const iconColor = getFileColor(file.type);

        return (
          <ContextMenu key={file.id}>
            <ContextMenuTrigger>
              <div className="group flex items-center justify-between p-4 bg-zinc-800/30 hover:bg-zinc-800/50 border border-zinc-700 rounded-lg cursor-pointer transition-all hover:border-[#6e73fa]/50">
                <div className="flex items-center space-x-4 flex-1 min-w-0">
                  <FileIcon
                    className={`w-6 h-6 ${iconColor} flex-shrink-0`}
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-white font-medium text-sm truncate"
                      title={file.name}
                    >
                      {file.name}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-gray-400">
                      <span>{file.size}</span>
                      <div className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        <span>{file.modified}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {file.shared && (
                    <Badge
                      variant="secondary"
                      className="text-xs bg-[#6e73fa]/20 text-[#6e73fa]"
                    >
                      <Users className="w-3 h-3 mr-1" />
                      Shared
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
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