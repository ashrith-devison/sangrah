// API Response Types
export interface ApiStarredFile {
  filename: string;
  id: number;
  permission: string;
  sha_file_id: string;
  starred: boolean;
  tags: string;
  upload_time: string;
  username: string;
}

export interface ApiStarredFilesResponse {
  status: string;
  message: string;
  data: ApiStarredFile[];
}

// API Update Types
export interface UpdateFileInfoRequest {
  username: string;
  filename: string;
  starred: boolean;
}

export interface UpdateFileInfoResponse {
  status: string;
  message: string;
}

// UI Types
export interface StarredItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  fileType?: string;
  size: string;
  starredDate: string;
  lastModified: string;
  owner: string;
  isShared: boolean;
  path: string;
  thumbnail?: string;
  shaFileId?: string;
  tags?: string;
}

export interface StarredFilterOption {
  value: string;
  label: string;
}

export interface StarredSortOption {
  value: string;
  label: string;
}

export interface StarredHeaderProps {
  totalItems: number;
}

export interface StarredFilterDropdownProps {
  filterType: string;
  onFilterChange: (filter: string) => void;
  filterOptions: StarredFilterOption[];
}

export interface StarredSortDropdownProps {
  sortBy: string;
  onSortChange: (sort: string) => void;
}

export interface StarredItemGridProps {
  items: StarredItem[];
  onRemoveStar: (itemId: string) => void;
}

export interface StarredItemListProps {
  items: StarredItem[];
  onRemoveStar: (itemId: string) => void;
}

export interface StarredEmptyStateProps {
  searchQuery?: string;
}

export interface StarredFilesViewProps {
  items?: StarredItem[];
}