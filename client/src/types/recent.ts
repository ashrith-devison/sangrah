export interface RecentFile {
  id: number;
  name: string;
  type: 'document' | 'presentation' | 'image' | 'video' | 'audio' | 'archive' | 'design';
  size: string;
  modified: string;
  opened: string;
  shared: boolean;
  starred: boolean;
  folder: string;
  owner: string;
}

export interface FileTypeOption {
  value: string;
  label: string;
}

export type SortOption = 'modified' | 'name' | 'size' | 'type';