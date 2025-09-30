interface RecentFileGridProps {
  files: RecentFile[];
}

function getFileIcon(type: string) {
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
}
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
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { RecentFileDropdown } from './RecentFileDropdown';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { RecentFile } from '@/types/recent';

function getFileColor(type: string) {
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
}


import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

export default function RecentFileGrid({ files }: RecentFileGridProps) {
  const [previewFile, setPreviewFile] = useState<RecentFile | null>(null);
  const [fileList, setFileList] = useState(files);

  // Handler to update file data after rename/star
  const handleFileUpdate = (updatedFile: RecentFile) => {
    setFileList(prev => prev.map(f => f.id === updatedFile.id ? { ...f, ...updatedFile } : f));
  };
  const handleDelete = (file: RecentFile) => {};

  return (
    <>
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4">
  {fileList.map(file => {
          const FileIcon = getFileIcon(file.type);
          const iconColor = getFileColor(file.type);

          return (
            <div key={file.id} className="group bg-zinc-800/30 hover:bg-zinc-800/50 border border-zinc-700 rounded-xl p-3 sm:p-4 cursor-pointer transition-all hover:border-[#6e73fa]/50">
              <div className="flex items-start justify-between mb-2 sm:mb-3">
                <FileIcon
                  className={`w-6 h-6 sm:w-8 sm:h-8 ${iconColor}`}
                />
                <div className="flex items-center gap-1 sm:gap-2">
                  {file.starred && (
                    <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current" />
                  )}
                  {file.shared && (
                    <Badge
                      variant="secondary"
                      className="text-xs bg-[#6e73fa]/20 text-[#6e73fa] cursor-help px-1 py-0"
                    >
                      <Users className="w-2 h-2 sm:w-3 sm:h-3" />
                    </Badge>
                  )}
                  <RecentFileDropdown
                    file={file}
                    onStar={handleFileUpdate}
                    onDelete={() => setFileList(prev => prev.filter(f => f.id !== file.id))}
                    triggerClassName="p-1 rounded-full hover:bg-zinc-700 focus:outline-none"
                  />
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
          );
        })}
      </div>
      {/* Preview Side Dialog */}
      <Sheet open={!!previewFile} onOpenChange={open => { if (!open) { setPreviewFile(null); } }}>
        <SheetContent side="right" className="w-full sm:w-[540px] md:w-[700px] bg-zinc-950 border-l border-zinc-800 p-0 flex flex-col">
          <SheetHeader className="p-6 pb-2 border-b border-zinc-800 flex items-center justify-between">
            <div>
              <SheetTitle className="text-white flex items-center gap-2 text-lg font-semibold">
                <Eye className="w-5 h-5 text-blue-500" />
                Preview File
              </SheetTitle>
              <div className="text-xs text-gray-400 mt-1 truncate">{previewFile?.filename}</div>
            </div>
            <button
              className="text-gray-400 hover:text-white px-3 py-1 rounded"
              onClick={() => setPreviewFile(null)}
            >
              Close
            </button>
          </SheetHeader>
          <div className="flex-1 flex items-center justify-center bg-zinc-900">
            {previewFile ? (
              <iframe src={previewFile ? `/v1/file/path/view?path=${encodeURIComponent(previewFile.fileId + '.' + (previewFile.filename?.split('.').pop() || ''))}` : ''} style={{ width: '95%', height: '90%', border: 'none', background: 'white', borderRadius: '0.5rem', boxShadow: '0 2px 16px rgba(0,0,0,0.12)' }} title="File Preview" />
            ) : (
              <div className="text-gray-400 text-center">Loading preview...</div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}