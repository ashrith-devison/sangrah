import {
  FileText,
  Image,
  Video,
  Music,
  Archive,
  Clock,
  Users,
} from 'lucide-react';
import { RecentFileDropdown } from './RecentFileDropdown';
import { Badge } from '@/components/ui/badge';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { FileItem } from '@/types/home';

interface FileGridProps {
  files: FileItem[];
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

export default function FileGrid({ files }: FileGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {files.map(file => {
        const FileIcon = getFileIcon(file.type);
        const iconColor = getFileColor(file.type);

        return (
            <div className="group bg-zinc-800/30 hover:bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 cursor-pointer transition-all hover:border-[#6e73fa]/50">
              <div className="flex items-center justify-between mb-3">
                <FileIcon className={`w-8 h-8 ${iconColor}`} />
                {file.shared && (
                  <Badge
                    variant="secondary"
                    className="text-xs bg-[#6e73fa]/20 text-[#6e73fa]"
                  >
                    <Users className="w-3 h-3 mr-1" />
                    Shared
                  </Badge>
                )}
              </div>
              <h3
                className="text-white font-medium text-sm mb-1 truncate"
                title={file.name}
              >
                {file.name}
              </h3>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>{file.size}</span>
                <div className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  <span>{file.modified}</span>
                </div>
              </div>
              <div className="flex justify-end mt-2">
                <RecentFileDropdown
                  file={{
                    ...file,
                    opened: file.modified,
                    starred: false,
                    folder: '',
                    owner: '',
                    fileId: file.id?.toString?.() || '',
                    filename: file.name,
                  }}
                  onStar={() => {}}
                  onDelete={() => {}}
                  actions={['view', 'download']}
                />
              </div>
            </div>
        );
      })}
    </div>
  );
}