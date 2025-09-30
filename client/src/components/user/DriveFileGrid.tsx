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
  File,
  Star,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RecentFileDropdown } from './RecentFileDropdown';
import { DriveFileItem } from '@/types/drive';

interface DriveFileGridProps {
  files: DriveFileItem[];
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

const getFileExtension = (filename: string) => {
  return filename.split('.').pop()?.toUpperCase() || 'FILE';
};


// Format file size for display
function displayFileSize(size: string | number | undefined): string {
  let sizeMb = 0;
  if (typeof size === 'string') {
    const match = size.match(/([\d.]+)\s*MB/i);
    if (match) {
      sizeMb = parseFloat(match[1]);
    } else if (size.match(/([\d.]+)\s*KB/i)) {
      // If already formatted as KB, just return
      return size;
    }
  } else if (typeof size === 'number') {
    sizeMb = size;
  }
  // Always show double with two decimals for MB
  if (sizeMb < 0.01) {
    return `${Math.round(sizeMb * 1024)} KB`;
  }
  return `${Number(sizeMb).toFixed(2)} MB`;
};

const formatDate = (dateString?: string) => {
  if (!dateString) return 'Unknown';
  return new Date(dateString).toLocaleDateString();
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

export default function DriveFileGrid({ files, onFileAction }: DriveFileGridProps) {
  const [localFiles, setLocalFiles] = React.useState(files);

  React.useEffect(() => {
    setLocalFiles(files);
  }, [files]);


  const handleStar = (updatedFile: any) => {
    setLocalFiles(prev => prev.map(f => (f.fileId === updatedFile.fileId ? { ...f, starred: updatedFile.starred } : f)));
  };

  const handleDelete = (deletedFile: any) => {
    setLocalFiles(prev => prev.filter(f => f.fileId !== deletedFile.fileId));
  };

  const handleRename = (renamedFile: any) => {
    setLocalFiles(prev => prev.map(f => (f.fileId === renamedFile.fileId ? { ...f, filename: renamedFile.filename } : f)));
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
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 w-full max-w-full overflow-hidden">
      {files.map((file) => {
        const fileType = getFileType(file.filename);
        const FileIcon = getFileIcon(fileType);
        const iconColor = getFileColor(fileType);
        const uniqueKey = `${file.fileId || file.id}-${file.filename}`;

        // Prefer size_mb if available, fallback to file.size
        const fileSize = typeof file.size_mb === 'number' ? file.size_mb : file.size;

        // Map DriveFileItem to RecentFile
        const recentFile = {
          id: typeof file.id === 'number' ? file.id : 0,
          name: file.filename || '',
          type: getFileType(file.filename) as any,
          size: typeof file.size_mb === 'number' ? `${file.size_mb} MB` : (typeof file.size === 'string' ? file.size : (file.size ? String(file.size) : '0 MB')),
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
          <div key={uniqueKey} className="group relative bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 hover:bg-zinc-800/50 hover:border-zinc-700 transition-all duration-200 cursor-pointer min-w-0 w-full">
            {/* File Icon */}
            <div className="flex items-center mb-3">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg bg-zinc-800/50 ${iconColor}`}>
                  <FileIcon className="w-6 h-6" />
                </div>
              </div>
              {/* RecentFileDropdown integration */}
              <RecentFileDropdown 
                file={recentFile} 
                onStar={handleStar} 
                onDelete={handleDelete} 
                onRename={handleRename}
                triggerClassName="absolute top-2 right-2 sm:top-2 sm:right-2 md:top-3 md:right-3 lg:top-4 lg:right-4 p-1 rounded-full hover:bg-zinc-700 focus:outline-none" 
              />
            </div>
            {/* File Info */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="text-white font-medium text-sm line-clamp-2 leading-tight flex-1">
                  {file.filename}
                </h3>
                {file.starred && (
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 flex-shrink-0" />
                )}
              </div>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>{getFileExtension(file.filename)}</span>
                <span>{displayFileSize(fileSize)}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                <span>{formatDate(file.modified)}</span>
              </div>
              {/* Permission Badge */}
              <div className="flex items-center justify-between">
                <Badge 
                  variant={file.permission === 'owner' ? 'default' : 'secondary'}
                  className={`text-xs ${
                    file.permission === 'owner' 
                      ? 'bg-blue-600/20 text-blue-400 border-blue-600/30' 
                      : 'bg-gray-600/20 text-gray-400 border-gray-600/30'
                  }`}
                >
                  {file.permission === 'owner' ? 'Owned' : 'Shared'}
                </Badge>
                {file.permission !== 'owner' && (
                  <div className="flex items-center text-xs text-gray-500">
                    <Users className="w-3 h-3 mr-1" />
                    <span>{file.username}</span>
                  </div>
                )}
              </div>
              {/* Path */}
              {file.path && file.path !== '/home' && (
                <div className="text-xs text-gray-500 truncate">
                  📁 {file.path}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}