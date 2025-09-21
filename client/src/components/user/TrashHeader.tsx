import React from 'react';
import { Trash2, Clock, HardDrive } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { TrashHeaderProps } from '@/types/trash';

export default function TrashHeader({ totalItems, totalSize }: TrashHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="w-full lg:w-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 flex items-center">
            <Trash2 className="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-3 text-red-400" />
            Trash
          </h1>
          <p className="text-sm sm:text-base text-gray-400">
            Deleted files and folders. Items are permanently deleted after 30 days.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 w-full lg:w-auto">
          <Badge
            variant="outline"
            className="border-red-500 text-red-400 px-3 py-1 text-sm"
          >
            <Trash2 className="w-3 h-3 mr-1" />
            {totalItems} items
          </Badge>
          <Badge
            variant="outline"
            className="border-gray-500 text-gray-400 px-3 py-1 text-sm"
          >
            <HardDrive className="w-3 h-3 mr-1" />
            {totalSize}
          </Badge>
          <Badge
            variant="outline"
            className="border-orange-500 text-orange-400 px-3 py-1 text-sm"
          >
            <Clock className="w-3 h-3 mr-1" />
            Auto-delete: 30 days
          </Badge>
        </div>
      </div>
    </div>
  );
}