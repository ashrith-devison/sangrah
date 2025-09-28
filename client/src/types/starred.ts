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
  items: StarredItem[];
}