'use client';

import { Filter, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DriveFilterDropdownProps {
  selectedType: string;
  selectedPermission: string;
  onTypeChange: (type: string) => void;
  onPermissionChange: (permission: string) => void;
}

const FILE_TYPES = [
  { value: 'all', label: 'All Types' },
  { value: 'document', label: 'Documents' },
  { value: 'image', label: 'Images' },
  { value: 'video', label: 'Videos' },
  { value: 'audio', label: 'Audio' },
  { value: 'archive', label: 'Archives' },
  { value: 'other', label: 'Other' },
];

const PERMISSIONS = [
  { value: 'all', label: 'All Permissions' },
  { value: 'owner', label: 'Owned by me' },
  { value: 'viewer', label: 'Shared with me' },
];

export default function DriveFilterDropdown({ 
  selectedType,
  selectedPermission,
  onTypeChange,
  onPermissionChange
}: DriveFilterDropdownProps) {
  const getActiveLabel = () => {
    const typeLabel = FILE_TYPES.find(t => t.value === selectedType)?.label || 'All Types';
    const permLabel = PERMISSIONS.find(p => p.value === selectedPermission)?.label || 'All Permissions';
    
    if (selectedType !== 'all' || selectedPermission !== 'all') {
      return 'Filtered';
    }
    return 'Filter';
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="bg-zinc-800/50 border-zinc-700 text-white hover:bg-zinc-700"
        >
          <Filter className="w-4 h-4 mr-2" />
          {getActiveLabel()}
          <ChevronDown className="w-4 h-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-zinc-800 border-zinc-700">
        {/* File Type Filter */}
        <div className="px-2 py-1 text-xs text-gray-400 font-semibold">File Type</div>
        {FILE_TYPES.map(type => (
          <DropdownMenuItem
            key={type.value}
            onClick={() => onTypeChange(type.value)}
            className={`text-white hover:bg-zinc-700 cursor-pointer ${
              selectedType === type.value ? 'bg-zinc-700' : ''
            }`}
          >
            {type.label}
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator className="bg-zinc-700" />
        
        {/* Permission Filter */}
        <div className="px-2 py-1 text-xs text-gray-400 font-semibold">Permission</div>
        {PERMISSIONS.map(permission => (
          <DropdownMenuItem
            key={permission.value}
            onClick={() => onPermissionChange(permission.value)}
            className={`text-white hover:bg-zinc-700 cursor-pointer ${
              selectedPermission === permission.value ? 'bg-zinc-700' : ''
            }`}
          >
            {permission.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}