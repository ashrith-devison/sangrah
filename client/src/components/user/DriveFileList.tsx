'use client';

import React from 'react';
import {
  FileText,
  Image,
  Video,
  Music,
  Archive,

  Clock,
  File,
  ChevronUp,
  ChevronDown,

  Star,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { RecentFileDropdown } from './RecentFileDropdown';

import { DriveFileItem } from '@/types/drive';

interface DriveFileListProps {
  files: DriveFileItem[];
  sortBy: 'name' | 'modified' | 'size' | 'type';
  sortOrder: 'asc' | 'desc';
  onSort?: (column: 'name' | 'modified' | 'size' | 'type') => void;
  onFileAction?: (action: string, file: DriveFileItem) => void;
}

const getFileIcon = (type: string = 'other') => {
  switch (type) {
    case 'document':
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
      return File;
  }
};

const getFileColor = (type: string = 'other') => {
  switch (type) {
    case 'document':
      return 'text-blue-400';
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

const getFileType = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase();
  if (!ext) return 'other';
  
  const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
  const videoExts = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'];
  const audioExts = ['mp3', 'wav', 'flac', 'aac', 'ogg'];
  const docExts = ['pdf', 'doc', 'docx', 'txt', 'rtf'];
  const archiveExts = ['zip', 'rar', '7z', 'tar', 'gz'];
  
  if (imageExts.includes(ext)) return 'image';
  if (videoExts.includes(ext)) return 'video';
  if (audioExts.includes(ext)) return 'audio';
  if (docExts.includes(ext)) return 'document';
  if (archiveExts.includes(ext)) return 'archive';
  
  return 'other';
};

const formatFileSize = (filename: string) => {
  // Placeholder - in real app you'd get size from API
  return '2.4 MB';
};

const formatDate = (dateString?: string) => {
  if (!dateString) return 'Unknown';
  return new Date(dateString).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export default function DriveFileList({ 
  files, 
  sortBy, 
  sortOrder, 
  onSort, 
  onFileAction 
}: DriveFileListProps) {
  const [localFiles, setLocalFiles] = React.useState(files);

  React.useEffect(() => {
    setLocalFiles(files);
  }, [files]);

  const handleAction = (action: string, file: DriveFileItem) => {
    onFileAction?.(action, file);
  };

  const handleStar = (updatedFile: any) => {
    setLocalFiles(prev => prev.map(f => (f.fileId === updatedFile.fileId ? { ...f, starred: updatedFile.starred } : f)));
  };

  const handleDelete = (deletedFile: any) => {
    setLocalFiles(prev => prev.filter(f => f.fileId !== deletedFile.fileId));
  };

  const handleRename = (renamedFile: any) => {
    setLocalFiles(prev => prev.map(f => (f.fileId === renamedFile.fileId ? { ...f, filename: renamedFile.filename } : f)));
  };

  const handleSort = (column: 'name' | 'modified' | 'size' | 'type') => {
    onSort?.(column);
  };

  const SortIcon = ({ column }: { column: 'name' | 'modified' | 'size' | 'type' }) => {
    if (sortBy !== column) return null;
    return sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
  };

  if (localFiles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileText className="w-16 h-16 text-gray-600 mb-4" />
        <h3 className="text-lg font-semibold text-gray-400 mb-2">No files found</h3>
        <p className="text-gray-500">Upload some files or adjust your filters to see content here.</p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900/30 border border-zinc-800 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-12 gap-2 sm:gap-4 p-3 sm:p-4 border-b border-zinc-800 bg-zinc-900/50">
        <div 
          className="col-span-6 sm:col-span-5 md:col-span-4 text-gray-300 font-medium cursor-pointer hover:text-white transition-colors flex items-center gap-2 text-sm sm:text-base"
          onClick={() => handleSort('name')}
        >
          Name
          <SortIcon column="name" />
        </div>
        <div 
          className="col-span-2 hidden sm:block text-gray-300 font-medium cursor-pointer hover:text-white transition-colors flex items-center gap-2 text-sm sm:text-base"
          onClick={() => handleSort('type')}
        >
          Type
          <SortIcon column="type" />
        </div>
        <div 
          className="col-span-2 hidden md:block text-gray-300 font-medium cursor-pointer hover:text-white transition-colors flex items-center gap-2 text-sm sm:text-base"
          onClick={() => handleSort('size')}
        >
          Size
          <SortIcon column="size" />
        </div>
        <div 
          className="col-span-2 hidden lg:block text-gray-300 font-medium cursor-pointer hover:text-white transition-colors flex items-center gap-2"
          onClick={() => handleSort('modified')}
        >
          Modified
          <SortIcon column="modified" />
        </div>
        <div className="col-span-2 hidden xl:block text-gray-300 font-medium">Owner</div>
        <div className="col-span-1"></div>
      </div>

      {/* File Rows */}
      <div className="divide-y divide-zinc-800 overflow-hidden">
        {files.map((file) => {
          const fileType = getFileType(file.filename);
          const FileIcon = getFileIcon(fileType);
          const iconColor = getFileColor(fileType);
          // Create a unique key combining fileId and filename to avoid duplicates
          const uniqueKey = `${file.fileId || file.id}-${file.filename}`;

          // Map DriveFileItem to RecentFile as currentfile
          const currentfile = {
            id: typeof file.id === 'number' ? file.id : 0,
            name: file.filename || '',
            type: getFileType(file.filename) as any,
            size: formatFileSize(file.filename),
            modified: file.modified || '',
            opened: '',
            shared: file.permission !== 'owner',
            starred: !!file.starred,
            folder: file.path || '',
            owner: file.username || '',
            fileId: file.fileId,
            filename: file.filename,
          };

          return (
            <div 
              key={uniqueKey} 
              className="grid grid-cols-12 gap-2 sm:gap-4 p-3 sm:p-4 hover:bg-zinc-800/30 transition-colors cursor-pointer group min-w-0 relative"
              onClick={() => handleAction('view', file)}
            >
              {/* File Name */}
              <div className="col-span-6 sm:col-span-5 md:col-span-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className={`p-1.5 sm:p-2 rounded-lg bg-zinc-800/50 ${iconColor} flex-shrink-0`}>
                    <FileIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="text-white font-medium truncate text-sm sm:text-base">{file.filename}</div>
                      {file.starred && (
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 flex-shrink-0" />
                      )}
                    </div>
                    <div className="text-xs text-gray-500 truncate hidden sm:block">
                      {file.path && file.path !== '/home' && `📁 ${file.path}`}
                    </div>
                </div>
              </div>
            </div>
            
            {/* Type */}
            <div className="col-span-2 hidden sm:flex items-center">
              <Badge 
                variant="outline" 
                className="bg-zinc-800/50 border-zinc-700 text-gray-300"
              >
                {fileType}
              </Badge>
            </div>
          
            {/* Size */}
            <div className="col-span-2 hidden md:flex items-center text-gray-400">
              {formatFileSize(file.filename)}
            </div>
          
            {/* Modified */}
            <div className="col-span-2 hidden lg:flex items-center text-gray-400">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDate(file.modified)}
                <RecentFileDropdown 
                  file={currentfile} 
                  onStar={handleStar} 
                  onDelete={handleDelete} 
                  onRename={handleRename}
                  triggerClassName="opacity-100 flex items-center text-white ml-2" 
                />
              </div>
            </div>
          
            {/* Owner */}
            <div className="col-span-2 hidden xl:flex items-center">
              <Badge 
                variant={file.permission === 'owner' ? 'default' : 'secondary'}
                className={`text-xs ${
                  file.permission === 'owner' 
                    ? 'bg-blue-600/20 text-blue-400 border-blue-600/30' 
                    : 'bg-gray-600/20 text-gray-400 border-gray-600/30'
                }`}
              >
                {file.permission === 'owner' ? 'You' : file.username}
              </Badge>
            </div>
          </div>
        );
      })}
      </div>
    </div>
  );
}