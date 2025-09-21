'use client';

import React, { useState } from 'react';
import { FolderOpen, FolderPlus, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UploadDestinationProps } from '@/types/upload';

export default function UploadDestination({
  selectedFolder,
  folders,
  onFolderChange,
  customPath = '',
  onCustomPathChange,
}: UploadDestinationProps) {
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [tempCustomPath, setTempCustomPath] = useState(customPath);

  const handleCustomPathSave = () => {
    if (onCustomPathChange) {
      onCustomPathChange(tempCustomPath);
      onFolderChange('custom');
    }
    setIsCustomMode(false);
  };

  const handleCustomPathCancel = () => {
    setTempCustomPath(customPath);
    setIsCustomMode(false);
  };

  const getCurrentDisplayPath = () => {
    if (selectedFolder === 'custom') {
      return customPath || '/custom';
    }
    return folders.find(f => f.id === selectedFolder)?.path || '/';
  };
  return (
    <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <FolderOpen className="w-5 h-5 mr-2" />
          Destination
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Folder Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start bg-zinc-800/50 border-zinc-700 text-white hover:bg-zinc-700"
            >
              <FolderOpen className="w-4 h-4 mr-2" />
              {getCurrentDisplayPath()}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-zinc-800 border-zinc-700">
            {folders.map(folder => (
              <DropdownMenuItem
                key={folder.id}
                onClick={() => onFolderChange(folder.id)}
                className="text-white hover:bg-zinc-700 cursor-pointer"
              >
                <FolderOpen className="w-4 h-4 mr-2" />
                {folder.path}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator className="bg-zinc-700" />
            <DropdownMenuItem
              onClick={() => setIsCustomMode(true)}
              className="text-white hover:bg-zinc-700 cursor-pointer"
            >
              <FolderPlus className="w-4 h-4 mr-2" />
              Custom Folder...
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Custom Folder Input */}
        {isCustomMode && (
          <div className="space-y-2">
            <label className="text-sm text-zinc-400">Custom folder path:</label>
            <div className="flex gap-2">
              <Input
                value={tempCustomPath}
                onChange={(e) => setTempCustomPath(e.target.value)}
                placeholder="e.g., my-project/assets"
                className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCustomPathSave();
                  } else if (e.key === 'Escape') {
                    handleCustomPathCancel();
                  }
                }}
                autoFocus
              />
              <Button
                size="sm"
                onClick={handleCustomPathSave}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Check className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCustomPathCancel}
                className="border-zinc-700 text-white hover:bg-zinc-700"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-zinc-500">
              Leave empty for root directory. Use forward slashes for nested folders.
            </p>
          </div>
        )}

        {/* Current Selection Display */}
        {selectedFolder === 'custom' && customPath && !isCustomMode && (
          <div className="p-3 bg-zinc-800/30 rounded-lg border border-zinc-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-zinc-300">
                <FolderPlus className="w-4 h-4 mr-2 text-blue-400" />
                Custom: <span className="text-white ml-1">{customPath}</span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsCustomMode(true)}
                className="text-zinc-400 hover:text-white hover:bg-zinc-700"
              >
                Edit
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}