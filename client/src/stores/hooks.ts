'use client';

import { useUserStore, useFileStore, useAppStore } from './index';

// User authentication hooks
export const useAuth = () => {
  // Only access store on client side
  if (typeof window === 'undefined') {
    return {
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: async () => {},
      logout: () => {},
      register: async () => {},
      setUser: () => {},
      setToken: () => {},
      setLoading: () => {},
      setAuthenticatedUser: () => {},
    };
  }

  const user = useUserStore((state) => state.user);
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  const isLoading = useUserStore((state) => state.isLoading);
  const login = useUserStore((state) => state.login);
  const logout = useUserStore((state) => state.logout);
  const register = useUserStore((state) => state.register);
  const setUser = useUserStore((state) => state.setUser);
  const setToken = useUserStore((state) => state.setToken);
  const setLoading = useUserStore((state) => state.setLoading);
  const setAuthenticatedUser = useUserStore((state) => state.setAuthenticatedUser);

  // Removed debug logging to prevent re-render issues

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    register,
    setUser,
    setToken,
    setLoading,
    setAuthenticatedUser,
  };
};

export const useCurrentUser = () => {
  if (typeof window === 'undefined') {
    return null;
  }
  return useUserStore((state) => state.user);
};

export const useIsAuthenticated = () => {
  if (typeof window === 'undefined') {
    return false;
  }
  return useUserStore((state) => state.isAuthenticated);
};

// File management hooks
export const useFiles = () => {
  if (typeof window === 'undefined') {
    return {
      files: [],
      isLoading: false,
      fetchFiles: async () => {},
      uploadFile: async () => {},
      createFolder: async () => {},
    };
  }

  const files = useFileStore((state) => state.files);
  const isLoading = useFileStore((state) => state.isLoading);
  const fetchFiles = useFileStore((state) => state.fetchFiles);
  const uploadFile = useFileStore((state) => state.uploadFile);
  const createFolder = useFileStore((state) => state.createFolder);

  return {
    files,
    isLoading,
    fetchFiles,
    uploadFile,
    createFolder,
  };
};

export const useFileSelection = () => {
  if (typeof window === 'undefined') {
    return {
      selectedFiles: [],
      setSelectedFiles: () => {},
      toggleFileSelection: () => {},
      clearSelection: () => {},
    };
  }

  const selectedFiles = useFileStore((state) => state.selectedFiles);
  const setSelectedFiles = useFileStore((state) => state.setSelectedFiles);
  const toggleFileSelection = useFileStore((state) => state.toggleFileSelection);
  const clearSelection = useFileStore((state) => state.clearSelection);

  return {
    selectedFiles,
    setSelectedFiles,
    toggleFileSelection,
    clearSelection,
  };
};

export const useStarredFiles = () => {
  const starredFiles = useFileStore((state) => state.starredFiles);
  const fetchStarredFiles = useFileStore((state) => state.fetchStarredFiles);
  const toggleStar = useFileStore((state) => state.toggleStar);

  return {
    starredFiles,
    fetchStarredFiles,
    toggleStar,
  };
};

export const useRecentFiles = () => {
  const recentFiles = useFileStore((state) => state.recentFiles);
  const fetchRecentFiles = useFileStore((state) => state.fetchRecentFiles);

  return {
    recentFiles,
    fetchRecentFiles,
  };
};

export const useSharedFiles = () => {
  const sharedFiles = useFileStore((state) => state.sharedFiles);
  const fetchSharedFiles = useFileStore((state) => state.fetchSharedFiles);
  const shareFile = useFileStore((state) => state.shareFile);
  const unshareFile = useFileStore((state) => state.unshareFile);

  return {
    sharedFiles,
    fetchSharedFiles,
    shareFile,
    unshareFile,
  };
};

export const useTrashFiles = () => {
  const trashedFiles = useFileStore((state) => state.trashedFiles);
  const fetchTrashedFiles = useFileStore((state) => state.fetchTrashedFiles);
  const moveToTrash = useFileStore((state) => state.moveToTrash);
  const restoreFromTrash = useFileStore((state) => state.restoreFromTrash);
  const permanentDelete = useFileStore((state) => state.permanentDelete);

  return {
    trashedFiles,
    fetchTrashedFiles,
    moveToTrash,
    restoreFromTrash,
    permanentDelete,
  };
};

export const useUploads = () => {
  const uploads = useFileStore((state) => state.uploads);
  const updateUploadProgress = useFileStore((state) => state.updateUploadProgress);
  const setUploadStatus = useFileStore((state) => state.setUploadStatus);
  const removeUpload = useFileStore((state) => state.removeUpload);
  const clearCompletedUploads = useFileStore((state) => state.clearCompletedUploads);

  return {
    uploads,
    updateUploadProgress,
    setUploadStatus,
    removeUpload,
    clearCompletedUploads,
  };
};

export const useFileView = () => {
  const viewMode = useFileStore((state) => state.viewMode);
  const sortBy = useFileStore((state) => state.sortBy);
  const sortOrder = useFileStore((state) => state.sortOrder);
  const searchQuery = useFileStore((state) => state.searchQuery);
  const setViewMode = useFileStore((state) => state.setViewMode);
  const setSortBy = useFileStore((state) => state.setSortBy);
  const setSortOrder = useFileStore((state) => state.setSortOrder);
  const setSearchQuery = useFileStore((state) => state.setSearchQuery);

  return {
    viewMode,
    sortBy,
    sortOrder,
    searchQuery,
    setViewMode,
    setSortBy,
    setSortOrder,
    setSearchQuery,
  };
};

export const useCurrentFolder = () => {
  const currentFolder = useFileStore((state) => state.currentFolder);
  const setCurrentFolder = useFileStore((state) => state.setCurrentFolder);

  return {
    currentFolder,
    setCurrentFolder,
  };
};

// App settings hooks
export const useAppSettings = () => {
  const settings = useAppStore((state) => state.settings);
  const updateSettings = useAppStore((state) => state.updateSettings);

  return {
    settings,
    updateSettings,
  };
};

export const useThemeSettings = () => {
  const theme = useAppStore((state) => state.settings.theme);
  const updateSettings = useAppStore((state) => state.updateSettings);

  const setTheme = (theme: 'light' | 'dark' | 'system') => {
    updateSettings({ theme });
  };

  return {
    theme,
    setTheme,
  };
};

export const useNotificationSettings = () => {
  const notifications = useAppStore((state) => state.settings.notifications);
  const updateSettings = useAppStore((state) => state.updateSettings);

  const updateNotificationSettings = (newNotifications: Partial<typeof notifications>) => {
    updateSettings({
      notifications: {
        ...notifications,
        ...newNotifications,
      },
    });
  };

  return {
    notifications,
    updateNotificationSettings,
  };
};

export const useAppNotifications = () => {
  const notifications = useAppStore((state) => state.notifications);
  const addNotification = useAppStore((state) => state.addNotification);
  const markNotificationAsRead = useAppStore((state) => state.markNotificationAsRead);
  const removeNotification = useAppStore((state) => state.removeNotification);
  const clearAllNotifications = useAppStore((state) => state.clearAllNotifications);

  return {
    notifications,
    addNotification,
    markNotificationAsRead,
    removeNotification,
    clearAllNotifications,
  };
};

export const useOfflineStatus = () => {
  const isOffline = useAppStore((state) => state.isOffline);
  const lastSyncTime = useAppStore((state) => state.lastSyncTime);
  const setOfflineStatus = useAppStore((state) => state.setOfflineStatus);
  const updateLastSyncTime = useAppStore((state) => state.updateLastSyncTime);

  return {
    isOffline,
    lastSyncTime,
    setOfflineStatus,
    updateLastSyncTime,
  };
};

// Combined hooks for common use cases
export const useFileOperations = () => {
  const renameFile = useFileStore((state) => state.renameFile);
  const deleteFile = useFileStore((state) => state.deleteFile);
  const moveFile = useFileStore((state) => state.moveFile);
  const copyFile = useFileStore((state) => state.copyFile);

  return {
    renameFile,
    deleteFile,
    moveFile,
    copyFile,
  };
};

export const useSearch = () => {
  const searchQuery = useFileStore((state) => state.searchQuery);
  const setSearchQuery = useFileStore((state) => state.setSearchQuery);
  const files = useFileStore((state) => state.files);

  // Filter files based on search query
  const filteredFiles = searchQuery
    ? files.filter((file) =>
        file.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : files;

  return {
    searchQuery,
    setSearchQuery,
    filteredFiles,
  };
};