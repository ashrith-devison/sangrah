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
  Edit3,
  ExternalLink,
  Star,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

const formatFileSize = (filename: string) => {
  // This is a placeholder - in real app you'd get size from API
  return '2.4 MB';
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
  const handleAction = (action: string, file: DriveFileItem) => {
    onFileAction?.(action, file);
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
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 w-full max-w-full overflow-hidden">
      {files.map((file) => {
        const fileType = getFileType(file.filename);
        const FileIcon = getFileIcon(fileType);
        const iconColor = getFileColor(fileType);
        // Create a unique key combining fileId and filename to avoid duplicates
        const uniqueKey = `${file.fileId || file.id}-${file.filename}`;

        return (
          <ContextMenu key={uniqueKey}>
            <ContextMenuTrigger>
              <div className="group relative bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 hover:bg-zinc-800/50 hover:border-zinc-700 transition-all duration-200 cursor-pointer min-w-0 w-full">
                {/* File Icon */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg bg-zinc-800/50 ${iconColor}`}>
                      <FileIcon className="w-6 h-6" />
                    </div>
                  </div>
                  
                  {/* More Actions */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 text-gray-400 hover:text-white"
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
                        onClick={() => handleAction('openNewTab', file)}
                        className="text-white hover:bg-zinc-700"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Open in New Tab
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
                      <DropdownMenuItem
                        onClick={() => handleAction('star', file)}
                        className="text-white hover:bg-zinc-700"
                      >
                        <Star className={`w-4 h-4 mr-2 ${file.starred ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                        {file.starred ? 'Unstar' : 'Star'}
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
                    <span>{formatFileSize(file.filename)}</span>
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
            </ContextMenuTrigger>
            
            <ContextMenuContent className="bg-zinc-800 border-zinc-700">
              <ContextMenuItem
                onClick={() => handleAction('view', file)}
                className="text-white hover:bg-zinc-700"
              >
                <Eye className="w-4 h-4 mr-2" />
                View
              </ContextMenuItem>
              <ContextMenuItem
                onClick={() => handleAction('openNewTab', file)}
                className="text-white hover:bg-zinc-700"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open in New Tab
              </ContextMenuItem>
              <ContextMenuItem
                onClick={() => handleAction('download', file)}
                className="text-white hover:bg-zinc-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </ContextMenuItem>
              <ContextMenuItem
                onClick={() => handleAction('share', file)}
                className="text-white hover:bg-zinc-700"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </ContextMenuItem>
              <ContextMenuItem
                onClick={() => handleAction('star', file)}
                className="text-white hover:bg-zinc-700"
              >
                <Star className={`w-4 h-4 mr-2 ${file.starred ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                {file.starred ? 'Unstar' : 'Star'}
              </ContextMenuItem>
              <ContextMenuSeparator className="bg-zinc-700" />
              <ContextMenuItem
                onClick={() => handleAction('delete', file)}
                className="text-red-400 hover:bg-zinc-700 hover:text-red-300"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Move to Trash
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        );
      })}
    </div>
  );
}