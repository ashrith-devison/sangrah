'use client';

import React from 'react';
import {
  FileText,
  Image,
  Video,
  Music,
  Archive,
  File,
  X,
  Check,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { UploadFileListProps, FileUpload } from '@/types/upload';

export default function UploadFileList({
  files,
  onRemoveFile,
  onRetryFile,
}: UploadFileListProps) {
  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image':
        return Image;
      case 'video':
        return Video;
      case 'audio':
        return Music;
      case 'document':
        return FileText;
      case 'archive':
        return Archive;
      default:
        return File;
    }
  };

  const getFileColor = (type: string) => {
    switch (type) {
      case 'image':
        return 'text-green-400';
      case 'video':
        return 'text-purple-400';
      case 'audio':
        return 'text-pink-400';
      case 'document':
        return 'text-blue-400';
      case 'archive':
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  };

  const completedFiles = files.filter(f => f.status === 'completed').length;
  const totalFiles = files.length;

  if (files.length === 0) return null;

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-white font-medium">Upload Queue</h4>
        <div className="text-sm text-gray-400">
          {completedFiles} of {totalFiles} completed
        </div>
      </div>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {files.map(fileUpload => {
          const FileIcon = getFileIcon(fileUpload.type);
          const iconColor = getFileColor(fileUpload.type);

          return (
            <div
              key={fileUpload.id}
              className="flex items-center gap-4 p-4 bg-zinc-800/50 border border-zinc-700 rounded-lg"
            >
              <FileIcon className={`w-6 h-6 ${iconColor} flex-shrink-0`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <p
                    className="text-white font-medium truncate"
                    title={fileUpload.file.name}
                  >
                    {fileUpload.file.name}
                  </p>
                  <div className="flex items-center gap-2">
                    {fileUpload.status === 'completed' && (
                      <Tooltip>
                        <TooltipTrigger>
                          <Check className="w-4 h-4 text-green-400" />
                        </TooltipTrigger>
                        <TooltipContent>Upload completed</TooltipContent>
                      </Tooltip>
                    )}
                    {fileUpload.status === 'error' && (
                      <Tooltip>
                        <TooltipTrigger>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onRetryFile(fileUpload.id)}
                            className="p-1 h-6 w-6"
                          >
                            <RotateCcw className="w-4 h-4 text-orange-400" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Retry upload</TooltipContent>
                      </Tooltip>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveFile(fileUpload.id)}
                      className="p-1 h-6 w-6 text-gray-400 hover:text-red-400"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
                  <span>{fileUpload.size}</span>
                  <span className="capitalize">{fileUpload.status}</span>
                </div>
                {fileUpload.status === 'uploading' && (
                  <Progress value={fileUpload.progress} className="h-2" />
                )}
                {fileUpload.status === 'error' && (
                  <div className="text-red-400 text-xs">
                    {fileUpload.error || 'Upload failed'}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}