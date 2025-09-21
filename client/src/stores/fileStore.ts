import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { FileStore, FileItem, UploadProgress } from '@/types/store';
import { getAuthHeaders } from './userStore';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const useFileStore = create<FileStore>()(
  persist(
    (set, get) => ({
      // Initial state
      files: [],
      currentFolder: null,
      selectedFiles: [],
      starredFiles: [],
      recentFiles: [],
      sharedFiles: [],
      trashedFiles: [],
      uploads: [],
      isLoading: false,
      searchQuery: '',
      viewMode: 'grid',
      sortBy: 'name',
      sortOrder: 'asc',

      // File operations
      fetchFiles: async (folderId?: string) => {
        set({ isLoading: true });
        
        try {
          const url = folderId 
            ? `${API_BASE_URL}/api/files?folderId=${folderId}`
            : `${API_BASE_URL}/api/files`;
            
          const response = await fetch(url, {
            headers: getAuthHeaders(),
          });

          if (!response.ok) {
            throw new Error('Failed to fetch files');
          }

          const files = await response.json();
          set({ files, currentFolder: folderId || null, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      uploadFile: async (file: File, folderId?: string) => {
        const fileId = Math.random().toString(36).substr(2, 9);
        
        // Add upload to progress tracking
        set((state) => ({
          uploads: [...state.uploads, {
            fileId,
            fileName: file.name,
            progress: 0,
            status: 'uploading',
          }],
        }));

        try {
          const formData = new FormData();
          formData.append('file', file);
          if (folderId) {
            formData.append('folderId', folderId);
          }

          const response = await fetch(`${API_BASE_URL}/api/files/upload`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: formData,
          });

          if (!response.ok) {
            throw new Error('Upload failed');
          }

          const uploadedFile = await response.json();
          
          // Update progress to completed
          set((state) => ({
            uploads: state.uploads.map((upload) =>
              upload.fileId === fileId
                ? { ...upload, progress: 100, status: 'completed' as const }
                : upload
            ),
            files: [...state.files, uploadedFile],
          }));

          // Remove completed upload after 3 seconds
          setTimeout(() => {
            set((state) => ({
              uploads: state.uploads.filter((upload) => upload.fileId !== fileId),
            }));
          }, 3000);
        } catch (error) {
          set((state) => ({
            uploads: state.uploads.map((upload) =>
              upload.fileId === fileId
                ? { ...upload, status: 'failed' as const, error: (error as Error).message }
                : upload
            ),
          }));
          throw error;
        }
      },

      createFolder: async (name: string, parentId?: string) => {
        try {
          const response = await fetch(`${API_BASE_URL}/api/files/folder`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...getAuthHeaders(),
            },
            body: JSON.stringify({ name, parentId }),
          });

          if (!response.ok) {
            throw new Error('Failed to create folder');
          }

          const folder = await response.json();
          set((state) => ({
            files: [...state.files, folder],
          }));
        } catch (error) {
          throw error;
        }
      },

      renameFile: async (fileId: string, newName: string) => {
        try {
          const response = await fetch(`${API_BASE_URL}/api/files/${fileId}/rename`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              ...getAuthHeaders(),
            },
            body: JSON.stringify({ name: newName }),
          });

          if (!response.ok) {
            throw new Error('Failed to rename file');
          }

          const updatedFile = await response.json();
          set((state) => ({
            files: state.files.map((file) =>
              file.id === fileId ? updatedFile : file
            ),
          }));
        } catch (error) {
          throw error;
        }
      },

      deleteFile: async (fileId: string) => {
        try {
          const response = await fetch(`${API_BASE_URL}/api/files/${fileId}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
          });

          if (!response.ok) {
            throw new Error('Failed to delete file');
          }

          set((state) => ({
            files: state.files.filter((file) => file.id !== fileId),
            selectedFiles: state.selectedFiles.filter((id) => id !== fileId),
          }));
        } catch (error) {
          throw error;
        }
      },

      moveFile: async (fileId: string, targetFolderId: string) => {
        try {
          const response = await fetch(`${API_BASE_URL}/api/files/${fileId}/move`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              ...getAuthHeaders(),
            },
            body: JSON.stringify({ targetFolderId }),
          });

          if (!response.ok) {
            throw new Error('Failed to move file');
          }

          // Refresh current folder
          const { currentFolder } = get();
          get().fetchFiles(currentFolder || undefined);
        } catch (error) {
          throw error;
        }
      },

      copyFile: async (fileId: string, targetFolderId: string) => {
        try {
          const response = await fetch(`${API_BASE_URL}/api/files/${fileId}/copy`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...getAuthHeaders(),
            },
            body: JSON.stringify({ targetFolderId }),
          });

          if (!response.ok) {
            throw new Error('Failed to copy file');
          }

          const copiedFile = await response.json();
          set((state) => ({
            files: [...state.files, copiedFile],
          }));
        } catch (error) {
          throw error;
        }
      },

      // Starred files
      toggleStar: async (fileId: string) => {
        try {
          const response = await fetch(`${API_BASE_URL}/api/files/${fileId}/star`, {
            method: 'POST',
            headers: getAuthHeaders(),
          });

          if (!response.ok) {
            throw new Error('Failed to toggle star');
          }

          const updatedFile = await response.json();
          set((state) => ({
            files: state.files.map((file) =>
              file.id === fileId ? updatedFile : file
            ),
            starredFiles: updatedFile.isStarred
              ? [...state.starredFiles, updatedFile]
              : state.starredFiles.filter((file) => file.id !== fileId),
          }));
        } catch (error) {
          throw error;
        }
      },

      fetchStarredFiles: async () => {
        set({ isLoading: true });
        
        try {
          const response = await fetch(`${API_BASE_URL}/api/files/starred`, {
            headers: getAuthHeaders(),
          });

          if (!response.ok) {
            throw new Error('Failed to fetch starred files');
          }

          const starredFiles = await response.json();
          set({ starredFiles, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      // Shared files
      shareFile: async (fileId: string, emails: string[], permissions: 'view' | 'edit') => {
        try {
          const response = await fetch(`${API_BASE_URL}/api/files/${fileId}/share`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...getAuthHeaders(),
            },
            body: JSON.stringify({ emails, permissions }),
          });

          if (!response.ok) {
            throw new Error('Failed to share file');
          }

          const updatedFile = await response.json();
          set((state) => ({
            files: state.files.map((file) =>
              file.id === fileId ? updatedFile : file
            ),
          }));
        } catch (error) {
          throw error;
        }
      },

      unshareFile: async (fileId: string, userId: string) => {
        try {
          const response = await fetch(`${API_BASE_URL}/api/files/${fileId}/unshare`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...getAuthHeaders(),
            },
            body: JSON.stringify({ userId }),
          });

          if (!response.ok) {
            throw new Error('Failed to unshare file');
          }

          const updatedFile = await response.json();
          set((state) => ({
            files: state.files.map((file) =>
              file.id === fileId ? updatedFile : file
            ),
          }));
        } catch (error) {
          throw error;
        }
      },

      fetchSharedFiles: async () => {
        set({ isLoading: true });
        
        try {
          const response = await fetch(`${API_BASE_URL}/api/files/shared`, {
            headers: getAuthHeaders(),
          });

          if (!response.ok) {
            throw new Error('Failed to fetch shared files');
          }

          const sharedFiles = await response.json();
          set({ sharedFiles, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      // Trash operations
      moveToTrash: async (fileId: string) => {
        try {
          const response = await fetch(`${API_BASE_URL}/api/files/${fileId}/trash`, {
            method: 'POST',
            headers: getAuthHeaders(),
          });

          if (!response.ok) {
            throw new Error('Failed to move to trash');
          }

          set((state) => ({
            files: state.files.filter((file) => file.id !== fileId),
            selectedFiles: state.selectedFiles.filter((id) => id !== fileId),
          }));
        } catch (error) {
          throw error;
        }
      },

      restoreFromTrash: async (fileId: string) => {
        try {
          const response = await fetch(`${API_BASE_URL}/api/files/${fileId}/restore`, {
            method: 'POST',
            headers: getAuthHeaders(),
          });

          if (!response.ok) {
            throw new Error('Failed to restore from trash');
          }

          set((state) => ({
            trashedFiles: state.trashedFiles.filter((file) => file.id !== fileId),
          }));
        } catch (error) {
          throw error;
        }
      },

      permanentDelete: async (fileId: string) => {
        try {
          const response = await fetch(`${API_BASE_URL}/api/files/${fileId}/permanent`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
          });

          if (!response.ok) {
            throw new Error('Failed to permanently delete file');
          }

          set((state) => ({
            trashedFiles: state.trashedFiles.filter((file) => file.id !== fileId),
          }));
        } catch (error) {
          throw error;
        }
      },

      fetchTrashedFiles: async () => {
        set({ isLoading: true });
        
        try {
          const response = await fetch(`${API_BASE_URL}/api/files/trash`, {
            headers: getAuthHeaders(),
          });

          if (!response.ok) {
            throw new Error('Failed to fetch trashed files');
          }

          const trashedFiles = await response.json();
          set({ trashedFiles, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      // Recent files
      fetchRecentFiles: async () => {
        set({ isLoading: true });
        
        try {
          const response = await fetch(`${API_BASE_URL}/api/files/recent`, {
            headers: getAuthHeaders(),
          });

          if (!response.ok) {
            throw new Error('Failed to fetch recent files');
          }

          const recentFiles = await response.json();
          set({ recentFiles, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      // UI state management
      setCurrentFolder: (folderId: string | null) => {
        set({ currentFolder: folderId });
      },

      setSelectedFiles: (fileIds: string[]) => {
        set({ selectedFiles: fileIds });
      },

      toggleFileSelection: (fileId: string) => {
        set((state) => ({
          selectedFiles: state.selectedFiles.includes(fileId)
            ? state.selectedFiles.filter((id) => id !== fileId)
            : [...state.selectedFiles, fileId],
        }));
      },

      clearSelection: () => {
        set({ selectedFiles: [] });
      },

      setSearchQuery: (query: string) => {
        set({ searchQuery: query });
      },

      setViewMode: (mode: 'grid' | 'list') => {
        set({ viewMode: mode });
      },

      setSortBy: (sortBy: 'name' | 'size' | 'date' | 'type') => {
        set({ sortBy });
      },

      setSortOrder: (order: 'asc' | 'desc') => {
        set({ sortOrder: order });
      },

      // Upload management
      updateUploadProgress: (fileId: string, progress: number) => {
        set((state) => ({
          uploads: state.uploads.map((upload) =>
            upload.fileId === fileId ? { ...upload, progress } : upload
          ),
        }));
      },

      setUploadStatus: (fileId: string, status: UploadProgress['status'], error?: string) => {
        set((state) => ({
          uploads: state.uploads.map((upload) =>
            upload.fileId === fileId ? { ...upload, status, error } : upload
          ),
        }));
      },

      removeUpload: (fileId: string) => {
        set((state) => ({
          uploads: state.uploads.filter((upload) => upload.fileId !== fileId),
        }));
      },

      clearCompletedUploads: () => {
        set((state) => ({
          uploads: state.uploads.filter((upload) => upload.status !== 'completed'),
        }));
      },

      setLoading: (isLoading: boolean) => {
        set({ isLoading });
      },
    }),
    {
      name: 'file-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        viewMode: state.viewMode,
        sortBy: state.sortBy,
        sortOrder: state.sortOrder,
      }),
    }
  )
);