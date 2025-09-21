export interface TrashItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  fileType?: string;
  size: string;
  deletedDate: string;
  originalLocation: string;
  deletedBy: string;
  daysUntilPermanentDelete: number;
  thumbnail?: string;
}

export interface TrashFilterOption {
  value: string;
  label: string;
}

export interface TrashSortOption {
  value: string;
  label: string;
}

export interface TrashHeaderProps {
  totalItems: number;
  totalSize: string;
}

export interface TrashFilterDropdownProps {
  activeFilters: string[];
  onFilterChange: (filter: string, checked: boolean) => void;
}

export interface TrashSortDropdownProps {
  sortBy: string;
  onSortChange: (sort: string) => void;
}

export interface TrashItemGridProps {
  items: TrashItem[];
  selectedItems: string[];
  onToggleSelect: (itemId: string) => void;
  onRestore: (itemId: string) => void;
  onPermanentDelete: (itemId: string) => void;
}

export interface TrashItemListProps {
  items: TrashItem[];
  selectedItems: string[];
  onToggleSelect: (itemId: string) => void;
  onRestore: (itemId: string) => void;
  onPermanentDelete: (itemId: string) => void;
}

export interface TrashEmptyStateProps {
  searchQuery?: string;
}

export interface TrashBulkActionsProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onRestoreSelected: () => void;
  onDeleteSelected: () => void;
  onEmptyTrash: () => void;
}

export interface TrashViewProps {
  // No props needed for main view
}