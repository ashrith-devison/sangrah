// User Authentication and Profile Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
}

export interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string, name: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  setAuthenticatedUser: (user: User, token: string) => void;
}

export interface UserStore extends AuthState, AuthActions {}

// File Management Types
export interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size: string;
  mimeType?: string;
  url?: string;
  thumbnailUrl?: string;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  parentId?: string;
  isStarred: boolean;
  isShared: boolean;
  sharedWith?: string[];
}

export interface UploadProgress {
  fileId: string;
  fileName: string;
  progress: number;
  status: 'uploading' | 'completed' | 'failed' | 'paused';
  error?: string;
}

export interface FileState {
  files: FileItem[];
  currentFolder: string | null;
  selectedFiles: string[];
  starredFiles: FileItem[];
  recentFiles: FileItem[];
  sharedFiles: FileItem[];
  trashedFiles: FileItem[];
  uploads: UploadProgress[];
  isLoading: boolean;
  searchQuery: string;
  viewMode: 'grid' | 'list';
  sortBy: 'name' | 'size' | 'date' | 'type';
  sortOrder: 'asc' | 'desc';
}

export interface FileActions {
  // File operations
  fetchFiles: (folderId?: string) => Promise<void>;
  uploadFile: (file: File, folderId?: string) => Promise<void>;
  createFolder: (name: string, parentId?: string) => Promise<void>;
  renameFile: (fileId: string, newName: string) => Promise<void>;
  deleteFile: (fileId: string) => Promise<void>;
  moveFile: (fileId: string, targetFolderId: string) => Promise<void>;
  copyFile: (fileId: string, targetFolderId: string) => Promise<void>;
  
  // Starred files
  toggleStar: (fileId: string) => Promise<void>;
  fetchStarredFiles: () => Promise<void>;
  
  // Shared files
  shareFile: (fileId: string, emails: string[], permissions: 'view' | 'edit') => Promise<void>;
  unshareFile: (fileId: string, userId: string) => Promise<void>;
  fetchSharedFiles: () => Promise<void>;
  
  // Trash operations
  moveToTrash: (fileId: string) => Promise<void>;
  restoreFromTrash: (fileId: string) => Promise<void>;
  permanentDelete: (fileId: string) => Promise<void>;
  fetchTrashedFiles: () => Promise<void>;
  
  // Recent files
  fetchRecentFiles: () => Promise<void>;
  
  // UI state
  setCurrentFolder: (folderId: string | null) => void;
  setSelectedFiles: (fileIds: string[]) => void;
  toggleFileSelection: (fileId: string) => void;
  clearSelection: () => void;
  setSearchQuery: (query: string) => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  setSortBy: (sortBy: 'name' | 'size' | 'date' | 'type') => void;
  setSortOrder: (order: 'asc' | 'desc') => void;
  
  // Upload management
  updateUploadProgress: (fileId: string, progress: number) => void;
  setUploadStatus: (fileId: string, status: UploadProgress['status'], error?: string) => void;
  removeUpload: (fileId: string) => void;
  clearCompletedUploads: () => void;
  
  // Loading states
  setLoading: (loading: boolean) => void;
}

export interface FileStore extends FileState, FileActions {}

// App Settings and Preferences
export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    uploads: boolean;
    shares: boolean;
  };
  storage: {
    autoSync: boolean;
    compressionEnabled: boolean;
    maxUploadSize: number;
  };
  privacy: {
    shareAnalytics: boolean;
    autoDeleteTrash: boolean;
    trashRetentionDays: number;
  };
}

export interface AppState {
  settings: AppSettings;
  isOffline: boolean;
  lastSyncTime: string | null;
  notifications: NotificationItem[];
}

export interface NotificationItem {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  action?: {
    label: string;
    callback: () => void;
  };
}

export interface AppActions {
  updateSettings: (settings: Partial<AppSettings>) => void;
  setOfflineStatus: (offline: boolean) => void;
  updateLastSyncTime: (time: string) => void;
  addNotification: (notification: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationAsRead: (notificationId: string) => void;
  removeNotification: (notificationId: string) => void;
  clearAllNotifications: () => void;
}

export interface AppStore extends AppState, AppActions {}

// Combined store type for context
export interface StoreContext {
  userStore: UserStore;
  fileStore: FileStore;
  appStore: AppStore;
}