export interface FileItem {
  id: number;
  name: string;
  type: 'document' | 'presentation' | 'image' | 'video' | 'audio' | 'archive';
  size: string;
  modified: string;
  shared: boolean;
  thumbnail: string | null;
}

export interface StorageStats {
  used: number;
  total: number;
  percentage: number;
}

export interface QuickStat {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: any; // LucideIcon type
}

export interface Activity {
  id: number;
  type: 'upload' | 'share' | 'download';
  message: string;
  timestamp: string;
  icon: any; // LucideIcon type
  iconColor: string;
}

export type ViewMode = 'grid' | 'list';