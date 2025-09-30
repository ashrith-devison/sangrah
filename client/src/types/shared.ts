export interface SharedItem {
  id: string;
  name: string;
  filename?: string; // for backend compatibility
  type: 'file' | 'folder';
  fileType?: string;
  size: string;
  shared: string;
  permissions: 'view' | 'edit' | 'admin';
  sharedBy: string;
  sharedWith: string[];
  sharedDate: string;
  lastAccessed: string;
  isPublic: boolean;
  accessCount: number;
  starred: boolean;
  thumbnail?: string;
}

export interface SharedFilterOption {
  value: string;
  label: string;
}

export type SharedSortOption = 'shared' | 'name' | 'size' | 'permissions';

export type SharedTab = 'shared-with-me' | 'shared-by-me';