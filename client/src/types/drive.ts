// Drive/My Files specific types based on API response
export interface DriveFileItem {
  fileId: string;
  filename: string;
  id: string; // Changed from number to string
  path: string;
  permission: 'owner' | 'viewer' | 'editor' | 'shared'; // Added 'shared'
  username: string;
  // Additional computed properties
  type?: 'document' | 'presentation' | 'image' | 'video' | 'audio' | 'archive' | 'other';
  size?: string;
  modified: string; // Made required
  shared?: boolean;
  thumbnail?: string | null;
  starred?: boolean; // Added starred property
}

export interface DriveAPIResponse {
  status: string;
  message: string;
  data: DriveFileItem[];
  total?: number;
  page?: number;
  limit?: number;
}

// Filter and sort types
export interface DriveFilters {
  fileTypes: string[];
  permissions: string[];
  dateRange?: {
    start: string;
    end: string;
  };
}

export type DriveSortBy = 'name' | 'modified' | 'size' | 'type';
export type DriveSortOrder = 'asc' | 'desc';

export interface DriveFilters {
  search: string;
  type: string;
  permission: string;
  sortBy: 'name' | 'modified' | 'size' | 'type';
  sortOrder: 'asc' | 'desc';
}

export interface DriveStats {
  totalFiles: number;
  ownedFiles: number;
  sharedFiles: number;
  totalSize: string;
}

export type DriveViewMode = 'grid' | 'list';

export interface DriveViewProps {
  files: DriveFileItem[];
  isLoading?: boolean;
  onRefresh?: () => void;
}