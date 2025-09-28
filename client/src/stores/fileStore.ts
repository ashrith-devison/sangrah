import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { FileStore, FileItem, UploadProgress } from '@/types/store';
import { getAuthHeaders } from './userStore';
import { toast } from 'sonner';

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

      // Fetch files from both /owned and /owned-info endpoints and merge data
      fetchDriveFiles: async (username: string) => {
        set({ isLoading: true });
        
        try {
          // Fetch both endpoints concurrently
          const [ownedResponse, ownedInfoResponse] = await Promise.all([
            fetch(`${API_BASE_URL}/api/v1/file/owned?username=${username}`, {
              headers: getAuthHeaders(),
            }),
            fetch(`${API_BASE_URL}/api/v1/file/owned-info?username=${username}`, {
              headers: getAuthHeaders(),
            })
          ]);

          if (!ownedResponse.ok || !ownedInfoResponse.ok) {
            throw new Error('Failed to fetch drive files');
          }

          const ownedData = await ownedResponse.json();
          const ownedInfoData = await ownedInfoResponse.json();

          // Create a map for quick lookup of starred status and additional info
          const fileInfoMap = new Map();
          if (ownedInfoData.status === 'success' && ownedInfoData.data) {
            ownedInfoData.data.forEach((fileInfo: any) => {
              fileInfoMap.set(fileInfo.filename, {
                starred: fileInfo.starred || false,
                tags: fileInfo.tags || '',
                upload_time: fileInfo.upload_time,
                id: fileInfo.id
              });
            });
          }

          // Merge the data from both endpoints
          let mergedFiles: FileItem[] = [];
          if (ownedData.status === 'success' && ownedData.data) {
            mergedFiles = ownedData.data.map((file: any) => {
              const fileInfo = fileInfoMap.get(file.filename) || {};
              return {
                id: fileInfo.id?.toString() || file.fileId || `${file.fileId}-${file.filename}`,
                name: file.filename,
                size: file.size_mb ? file.size_mb * 1024 * 1024 : 0, // Convert MB to bytes
                type: file.filename ? file.filename.split('.').pop()?.toLowerCase() || 'file' : 'file',
                dateModified: fileInfo.upload_time || new Date().toISOString(),
                isFolder: false,
                isStarred: fileInfo.starred || false,
                path: file.path || '/',
                fileId: file.fileId,
                username: file.username || username,
                permission: file.permission || 'owner',
                tags: fileInfo.tags || ''
              };
            });
          }

          set({ files: mergedFiles, isLoading: false });
          
          toast.success(`Loaded ${mergedFiles.length} files from your drive`, {
            icon: '📁',
            duration: 2000,
          });

        } catch (error) {
          set({ isLoading: false });
          toast.error('Failed to load drive files', {
            icon: '❌',
            duration: 4000,
          });
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
          
          // Show success toast
          toast.success(`"${file.name}" uploaded successfully`, {
            icon: '📁',
            duration: 3000,
          });
          
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
          toast.error(`Failed to upload "${file.name}"`, {
            icon: '❌',
            duration: 4000,
          });
          
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
          
          toast.success(`Folder "${name}" created successfully`, {
            icon: '📁',
            duration: 3000,
          });
          
          set((state) => ({
            files: [...state.files, folder],
          }));
        } catch (error) {
          toast.error(`Failed to create folder "${name}"`, {
            icon: '❌',
            duration: 4000,
          });
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
      toggleStar: async (filename: string, username?: string) => {
        try {
          // Get the current file to know its current star status
          const currentFile = get().files.find(file => file.name === filename);
          const currentStarred = currentFile?.isStarred || false;
          const newStarred = !currentStarred;
          
          // Get username from auth context if not provided
          const userToUse = username || 'current-user'; // This should come from auth context
          
          const response = await fetch(`${API_BASE_URL}/api/v1/file/update-info`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...getAuthHeaders(),
            },
            body: JSON.stringify({
              username: userToUse,
              filename: filename,
              starred: newStarred
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to toggle star');
          }

          const result = await response.json();
          
          if (result.status === 'success') {
            // Update local state
            set((state) => ({
              files: state.files.map((file) =>
                file.name === filename ? { ...file, isStarred: newStarred } : file
              ),
              starredFiles: newStarred
                ? [...state.starredFiles.filter(f => f.name !== filename), { ...currentFile!, isStarred: newStarred }]
                : state.starredFiles.filter((file) => file.name !== filename),
            }));

            // Show success toast based on the action
            if (newStarred) {
              toast.success(`"${filename}" added to starred files`, {
                icon: '⭐',
                duration: 3000,
              });
            } else {
              toast.success(`"${filename}" removed from starred files`, {
                icon: '✨',
                duration: 3000,
              });
            }
          } else {
            throw new Error(result.message || 'Failed to update star status');
          }
        } catch (error) {
          // Show error toast
          toast.error(`Failed to update "${filename}" star status`, {
            icon: '❌',
            duration: 4000,
          });
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
          // Get the current file to know its name
          const currentFile = get().files.find(file => file.id === fileId);
          const fileName = currentFile?.name || 'File';
          
          const response = await fetch(`${API_BASE_URL}/api/files/${fileId}/trash`, {
            method: 'POST',
            headers: getAuthHeaders(),
          });

          if (!response.ok) {
            throw new Error('Failed to move to trash');
          }

          toast.success(`"${fileName}" moved to trash`, {
            icon: '🗑️',
            duration: 3000,
          });

          set((state) => ({
            files: state.files.filter((file) => file.id !== fileId),
            selectedFiles: state.selectedFiles.filter((id) => id !== fileId),
          }));
        } catch (error) {
          const currentFile = get().files.find(file => file.id === fileId);
          const fileName = currentFile?.name || 'File';
          toast.error(`Failed to move "${fileName}" to trash`, {
            icon: '❌',
            duration: 4000,
          });
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