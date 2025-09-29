"use client";

import React, { useState } from 'react';
import { FileText, Image, Video, Music, Archive, Download, Share2, Eye, Clock, Users, Star, Folder, ExternalLink, StarOff } from 'lucide-react';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from '@/components/ui/context-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { StarredItemListProps, StarredItem } from '@/types/starred';
import { RecentFileDropdown } from './RecentFileDropdown';

function getFileIcon(item: StarredItem) {
  if (item.type === 'folder') return Folder;
  switch (item.fileType) {
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
}

function getFileColor(item: StarredItem) {
  if (item.type === 'folder') return 'text-blue-400';
  switch (item.fileType) {
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
}

const StarredItemList: React.FC<StarredItemListProps> = ({ items, onRemoveStar }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<StarredItem | null>(null);


  return (
    <div className="space-y-2">
      <div className="overflow-x-auto">
        <table className="min-w-full bg-zinc-800/30 border border-zinc-700 rounded-lg">
          <thead>
            <tr className="text-left text-xs text-gray-400 bg-zinc-900">
              <th className="px-4 py-2">Type</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Size</th>
              <th className="px-4 py-2">Starred</th>
              <th className="px-4 py-2">Modified</th>
              <th className="px-4 py-2">Owner</th>
              <th className="px-4 py-2">Path</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => {
              const ItemIcon = getFileIcon(item);
              const iconColor = getFileColor(item);
              const validTypes = ['document', 'audio', 'video', 'image', 'presentation', 'archive', 'design'];
              const mappedType: 'document' | 'audio' | 'video' | 'image' | 'presentation' | 'archive' | 'design' =
                validTypes.includes(item.fileType || '') ? (item.fileType as any) : 'document';
              const recentFile = {
                id: Number(item.id),
                name: item.name,
                type: mappedType,
                size: item.size,
                modified: item.lastModified,
                opened: item.starredDate,
                shared: item.isShared,
                starred: true,
                folder: '',
                owner: item.owner,
                fileId: item.shaFileId,
                filename: item.name,
              };
              return (
                <tr key={item.id} className="border-b border-zinc-700 hover:bg-zinc-800/50 transition">
                  <td className="px-4 py-2"><ItemIcon className={`w-5 h-5 ${iconColor}`} /></td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-white font-medium truncate" title={item.name}>{item.name}</span>
                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                    </div>
                  </td>
                  <td className="px-4 py-2 text-gray-300">{item.size}</td>
                  <td className="px-4 py-2 text-gray-300">{item.starredDate}</td>
                  <td className="px-4 py-2 text-gray-300">{item.lastModified}</td>
                  <td className="px-4 py-2 text-gray-300">{item.owner}</td>
                  <td className="px-4 py-2 text-gray-500 truncate max-w-[180px]">{item.path}</td>
                  <td className="px-4 py-2 text-right">
                    <RecentFileDropdown
                      file={recentFile}
                      onStar={file => onRemoveStar(item.id)}
                      onDelete={file => onRemoveStar(item.id)}
                      triggerClassName="bg-zinc-900 border border-zinc-700 rounded p-1 ml-2 text-white"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {/* File Preview Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-5xl w-[95vw] h-[85vh] bg-zinc-900 border-zinc-700 p-0 gap-0">
          <DialogHeader className="p-4 pb-2 border-b border-zinc-700">
            <DialogTitle className="text-white text-left flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-400" />
              {previewItem?.name || 'File Preview'}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 p-4 overflow-hidden">
            <div className="w-full h-full rounded-md border border-zinc-700 overflow-hidden bg-white">
              {/* Implement PreviewFrame if needed */}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StarredItemList;