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
  MoreVertical,
  ChevronUp,
  ChevronDown,
  Edit3,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  const handleAction = (action: string, file: DriveFileItem) => {
    onFileAction?.(action, file);
  };

  const handleSort = (column: 'name' | 'modified' | 'size' | 'type') => {
    onSort?.(column);
  };

  const SortIcon = ({ column }: { column: 'name' | 'modified' | 'size' | 'type' }) => {
    if (sortBy !== column) return null;
    return sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
  };

  if (files.length === 0) {
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
      <div className="grid grid-cols-12 gap-4 p-4 border-b border-zinc-800 bg-zinc-900/50">
        <div 
          className="col-span-5 md:col-span-4 text-gray-300 font-medium cursor-pointer hover:text-white transition-colors flex items-center gap-2"
          onClick={() => handleSort('name')}
        >
          Name
          <SortIcon column="name" />
        </div>
        <div 
          className="col-span-2 hidden sm:block text-gray-300 font-medium cursor-pointer hover:text-white transition-colors flex items-center gap-2"
          onClick={() => handleSort('type')}
        >
          Type
          <SortIcon column="type" />
        </div>
        <div 
          className="col-span-2 hidden md:block text-gray-300 font-medium cursor-pointer hover:text-white transition-colors flex items-center gap-2"
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
      <div className="divide-y divide-zinc-800">
        {files.map((file) => {
          const fileType = getFileType(file.filename);
          const FileIcon = getFileIcon(fileType);
          const iconColor = getFileColor(fileType);

          return (
            <div 
              key={file.id} 
              className="grid grid-cols-12 gap-4 p-4 hover:bg-zinc-800/30 transition-colors cursor-pointer group"
              onClick={() => handleAction('view', file)}
            >
              {/* File Name */}
              <div className="col-span-5 md:col-span-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-zinc-800/50 ${iconColor}`}>
                    <FileIcon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-white font-medium truncate">{file.filename}</div>
                    <div className="text-xs text-gray-500 truncate">
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
              
              {/* Actions */}
              <div 
                className="col-span-1 flex items-center justify-end"
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
              >
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-zinc-800 border-zinc-700">
                    <DropdownMenuItem
                      onClick={() => handleAction('view', file)}
                      className="text-white hover:bg-zinc-700"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleAction('download', file)}
                      className="text-white hover:bg-zinc-700"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleAction('share', file)}
                      className="text-white hover:bg-zinc-700"
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleAction('rename', file)}
                      className="text-white hover:bg-zinc-700"
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-zinc-700" />
                    <DropdownMenuItem
                      onClick={() => handleAction('delete', file)}
                      className="text-red-400 hover:bg-zinc-700 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}