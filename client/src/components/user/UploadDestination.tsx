'use client';

import React from 'react';
import { FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UploadDestinationProps } from '@/types/upload';

export default function UploadDestination({
  selectedFolder,
  folders,
  onFolderChange,
}: UploadDestinationProps) {
  return (
    <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <FolderOpen className="w-5 h-5 mr-2" />
          Destination
        </CardTitle>
      </CardHeader>
      <CardContent>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start bg-zinc-800/50 border-zinc-700 text-white hover:bg-zinc-700"
            >
              <FolderOpen className="w-4 h-4 mr-2" />
              {folders.find(f => f.id === selectedFolder)?.path || '/'}
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
          </DropdownMenuContent>
        </DropdownMenu>
      </CardContent>
    </Card>
  );
}