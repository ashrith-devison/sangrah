'use client';

import React, { useState, useEffect } from 'react';
import { DriveFileItem } from '@/types/drive';
import DriveStats from './DriveStats';
import DriveFileGrid from './DriveFileGrid';
import DriveFileList from './DriveFileList';
import DriveBreadcrumb from './DriveBreadcrumb';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileX, AlertCircle, Grid3X3, List, Search, HardDrive, FolderPlus, Upload, X, Edit3, Music, Download, FileIcon, Eye, Link, Copy, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';

import api from '@/lib/api';
import { useAuth } from '@/stores/hooks';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

type ViewMode = 'grid' | 'list';

interface DriveViewProps {
  initialFiles?: DriveFileItem[];
  loading?: boolean;
  error?: string | null;
}

export default function DriveView({ initialFiles = [], loading = false, error = null }: DriveViewProps) {
  const { user } = useAuth();
  const [files, setFiles] = useState<DriveFileItem[]>(initialFiles);
  const [filteredFiles, setFilteredFiles] = useState<DriveFileItem[]>(initialFiles);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPath, setCurrentPath] = useState('/');
  const [isLoading, setIsLoading] = useState(loading);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadTargetPath, setUploadTargetPath] = useState('');
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [fileToRename, setFileToRename] = useState<DriveFileItem | null>(null);
  const [newFileName, setNewFileName] = useState('');
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [fileToPreview, setFileToPreview] = useState<DriveFileItem | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [fileToShare, setFileToShare] = useState<DriveFileItem | null>(null);
  const [publicLink, setPublicLink] = useState<string>('');
  const [shareToken, setShareToken] = useState<string>('');
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  // Mock stats - in real app, this would come from API
  const mockStats = {
    totalFiles: files.length,
    recentFiles: files.filter(f => {
      const fileDate = new Date(f.modified);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return fileDate > sevenDaysAgo;
    }).length,
    sharedFiles: files.filter(f => f.permission === 'shared').length,
    starredFiles: files.filter(f => f.starred || false).length,
    storageUsed: 2.5 * 1024 * 1024 * 1024, // 2.5 GB
    storageTotal: 10 * 1024 * 1024 * 1024, // 10 GB
    fileTypes: {
      documents: files.filter(f => ['pdf', 'doc', 'docx', 'txt'].includes(getFileExtension(f.filename))).length,
      images: files.filter(f => ['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(getFileExtension(f.filename))).length,
      videos: files.filter(f => ['mp4', 'avi', 'mov', 'wmv'].includes(getFileExtension(f.filename))).length,
      audio: files.filter(f => ['mp3', 'wav', 'flac', 'aac'].includes(getFileExtension(f.filename))).length,
      archives: files.filter(f => ['zip', 'rar', '7z', 'tar'].includes(getFileExtension(f.filename))).length,
      others: files.filter(f => !['pdf', 'doc', 'docx', 'txt', 'jpg', 'jpeg', 'png', 'gif', 'bmp', 'mp4', 'avi', 'mov', 'wmv', 'mp3', 'wav', 'flac', 'aac', 'zip', 'rar', '7z', 'tar'].includes(getFileExtension(f.filename))).length,
    }
  };

  function getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || '';
  }

  // Filter files based on search and current directory
  useEffect(() => {
    let result = [...files];

    // Filter by current path/directory - show files that are exactly in this directory
    if (currentPath === '/') {
      // Root level: show files that are in root OR show top-level directories
      result = result.filter(file => {
        // For root, we want to see files in subdirectories to create folder structure
        return file.path.startsWith('/');
      });
    } else {
      // Specific directory: show only files exactly in this path
      result = result.filter(file => file.path === currentPath);
    }

    // Apply search filter
    if (searchQuery) {
      result = result.filter(file =>
        file.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
        file.path.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredFiles(result);
  }, [files, searchQuery, currentPath]);

  // Get unique directories for navigation
  const getDirectories = () => {
    const allPaths = files.map(file => file.path);
    const uniquePaths = [...new Set(allPaths)];
    
    // Get all possible directory levels from current path
    const directories: Array<{name: string, path: string, isSubdirectory: boolean}> = [];
    
    uniquePaths.forEach(fullPath => {
      // Skip if it's the current path
      if (fullPath === currentPath) return;
      
      // Check if this path is a subdirectory of current path
      if (fullPath.startsWith(currentPath) && fullPath !== currentPath) {
        // Get the immediate subdirectory name
        const relativePath = fullPath.substring(currentPath.length);
        const pathParts = relativePath.split('/').filter(part => part.length > 0);
        
        if (pathParts.length > 0) {
          const immediateSubdir = pathParts[0];
          const subdirPath = currentPath === '/' ? `/${immediateSubdir}` : `${currentPath}/${immediateSubdir}`;
          
          // Only add if not already in directories
          if (!directories.find(dir => dir.path === subdirPath)) {
            directories.push({
              name: immediateSubdir,
              path: subdirPath,
              isSubdirectory: true
            });
          }
        }
      }
    });
    
    return directories.sort((a, b) => a.name.localeCompare(b.name));
  };

  // Navigate to directory
  const handleNavigateToPath = (path: string) => {
    setCurrentPath(path);
    setSearchQuery(''); // Clear search when navigating
  };

  // Get subdirectories in current path
  const getSubDirectories = () => {
    const directories = getDirectories();
    return directories.filter(dir => dir.isSubdirectory);
  };

  // Load files from API
  useEffect(() => {
    const loadFiles = async () => {
      if (initialFiles.length > 0) return;
      if (!user?.name) return; // Wait for user to be loaded
      
      setIsLoading(true);
      try {
        const response = await api.get(`/v1/file/owned?username=${user.name}`);
        
        console.log('API Response:', response.data); // Debug log
        
        // Handle different possible response structures
        let filesData = [];
        if (response.data && response.data.status === 'success' && Array.isArray(response.data.data)) {
          filesData = response.data.data;
        } else if (Array.isArray(response.data)) {
          filesData = response.data;
        } else if (response.data && Array.isArray(response.data.files)) {
          filesData = response.data.files;
        } else {
          console.warn('Unexpected API response structure:', response.data);
          filesData = [];
        }
        
        // Transform API response to match our DriveFileItem interface
        const apiFiles: DriveFileItem[] = filesData.map((file: any) => ({
          id: file.id || file.fileId || Math.random().toString(),
          filename: file.filename || file.name || 'Unknown File',
          path: file.path || '/home',
          modified: file.modified || file.updatedAt || new Date().toISOString(),
          fileId: file.fileId || file.id || '',
          username: file.username || user.name || '',
          permission: file.permission || 'owner',
          starred: file.starred || false
        }));
        
        setFiles(apiFiles);
      } catch (err: any) {
        console.error('Error loading files:', err);
        console.error('Error details:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status
        });
        
        // Set empty array on error to prevent UI issues
        setFiles([]);
        
        // You can add error handling here, e.g., show a toast notification
      } finally {
        setIsLoading(false);
      }
    };

    loadFiles();
  }, [initialFiles.length, user?.name]);

  // Upload functionality
  const handleFolderClick = (folderPath: string) => {
    setUploadTargetPath(folderPath);
    setUploadModalOpen(true);
  };

  const handleFileSelect = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.onchange = (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      setUploadFiles(files);
    };
    input.click();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    setUploadFiles(files);
  };

  const handleUpload = async () => {
    if (!uploadFiles.length || !user?.name) return;

    setIsUploading(true);
    
    try {
      for (const file of uploadFiles) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('uploader', user.name);
        formData.append('path', uploadTargetPath);

        await api.post('/v1/file/upload-meta', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      // Refresh files after upload
      const response = await api.get(`/v1/file/owned?username=${user.name}`);
      let filesData = [];
      if (response.data && response.data.status === 'success' && Array.isArray(response.data.data)) {
        filesData = response.data.data;
      }
      
      const apiFiles: DriveFileItem[] = filesData.map((file: any) => ({
        id: file.id || file.fileId || Math.random().toString(),
        filename: file.filename || file.name || 'Unknown File',
        path: file.path || '/home',
        modified: file.modified || file.updatedAt || new Date().toISOString(),
        fileId: file.fileId || file.id || '',
        username: file.username || user.name || '',
        permission: file.permission || 'owner',
        starred: file.starred || false
      }));
      
      setFiles(apiFiles);
      setUploadModalOpen(false);
      setUploadFiles([]);
      setIsCreatingFolder(false);
      setNewFolderName('');
      
      // Show success message
      console.log(`Successfully uploaded ${uploadFiles.length} file(s) to ${uploadTargetPath}`);
      
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const removeUploadFile = (index: number) => {
    setUploadFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleRename = async () => {
    if (!fileToRename || !newFileName.trim() || !user?.name) return;

    try {
      const response = await api.post('/v1/file/rename', {
        filename: fileToRename.filename,
        newName: newFileName.trim(),
        username: user.name
      });

      if (response.data.status === 'success') {
        // Update the file in the local state
        setFiles(prev => prev.map(f => 
          f.id === fileToRename.id 
            ? { ...f, filename: newFileName.trim() }
            : f
        ));

        setRenameModalOpen(false);
        setFileToRename(null);
        setNewFileName('');
        
        console.log('File renamed successfully:', response.data);
      }
    } catch (error) {
      console.error('Rename failed:', error);
      // You can add error handling here, e.g., show a toast notification
    }
  };

  const handleShare = async (file: DriveFileItem) => {
    if (!user?.name) {
      console.error('Username not found - user not authenticated');
      return;
    }

    setFileToShare(file);
    setShareModalOpen(true);
    setPublicLink('');
    setShareToken('');
    setLinkCopied(false);
  };

  const generatePublicLink = async () => {
    if (!fileToShare || !user?.name) return;

    setIsGeneratingLink(true);
    try {
      const response = await api.post('/v1/file/public-share', {
        filename: fileToShare.filename,
        username: user.name
      });

      console.log('API Response:', response.data);

      // Handle different response structures
      if (response.data.status === 'success' && response.data.data) {
        // If response has nested data structure
        setPublicLink(response.data.data.publicUrl);
        setShareToken(response.data.data.token || '');
        console.log('Public link generated:', response.data.data);
      } else if (response.data.publicUrl) {
        // If response has direct publicUrl field
        setPublicLink(response.data.publicUrl);
        setShareToken(response.data.token || '');
        console.log('Public link generated:', response.data);
      } else if (response.status === 200 && response.data.publicUrl) {
        // Handle 200 response with direct fields
        setPublicLink(response.data.publicUrl);
        setShareToken(response.data.token || '');
        console.log('Public link generated:', response.data);
      } else {
        throw new Error(response.data.message || 'Failed to generate public link');
      }
    } catch (error) {
      console.error('Failed to generate public link:', error);
      // Show user-friendly error message
      alert('Failed to generate public link. Please try again.');
    } finally {
      setIsGeneratingLink(false);
    }
  };

  const copyToClipboard = async () => {
    if (!publicLink) return;

    try {
      await navigator.clipboard.writeText(publicLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = publicLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  const handleDownload = async (file: DriveFileItem) => {
    try {
      // Extract file extension from filename
      const fileExtension = file.filename.split('.').pop() || '';
      
      // Concatenate fileId with extension as required by the API
      const pathParam = fileExtension ? `${file.fileId}.${fileExtension}` : file.fileId;
      
      // Create download URL
      const downloadUrl = `${api.defaults.baseURL}/v1/file/path/download?path=${encodeURIComponent(pathParam)}`;
      
      // Get auth token for the request
      const token = localStorage.getItem('auth_token');
      
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = file.filename;
      
      // Add authorization header by creating a fetch request instead
      const response = await fetch(downloadUrl, {
        method: 'GET',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up the blob URL
        window.URL.revokeObjectURL(url);
        
        console.log('File downloaded successfully:', file.filename);
      } else {
        throw new Error(`Download failed with status: ${response.status}`);
      }
    } catch (error) {
      console.error('Download failed:', error);
      // You can add error handling here, e.g., show a toast notification
    }
  };

  const handlePreview = async (file: DriveFileItem) => {
    try {
      // Extract file extension from filename
      const fileExtension = file.filename.split('.').pop() || '';
      
      // Concatenate fileId with extension as required by the API
      const pathParam = fileExtension ? `${file.fileId}.${fileExtension}` : file.fileId;
      
      // Use the same format as download (fileId.extension)
      const viewUrl = `${api.defaults.baseURL}/v1/file/path/view?path=${encodeURIComponent(pathParam)}`;
      
      // Get auth token for the request
      const token = localStorage.getItem('auth_token');
      
      // For PDFs and images, we can set the URL directly for iframe/img display
      // For other file types, we might need different handling
      const response = await fetch(viewUrl, {
        method: 'GET',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      
      if (response.ok) {
        // Create a blob URL for the preview
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        
        setFileToPreview(file);
        setPreviewUrl(blobUrl);
        setPreviewModalOpen(true);
        
        console.log('File preview loaded:', file.filename);
      } else {
        // If preview fails, show error message and offer download option
        console.error(`Preview failed with status: ${response.status}`);
        alert(`Cannot preview this file. File not found or not accessible. You can try downloading it instead.`);
      }
    } catch (error) {
      console.error('Preview failed:', error);
      alert(`Cannot preview this file: ${error}. You can try downloading it instead.`);
    }
  };

  const closePreview = () => {
    if (previewUrl) {
      window.URL.revokeObjectURL(previewUrl);
    }
    setPreviewModalOpen(false);
    setFileToPreview(null);
    setPreviewUrl('');
  };

  const handleDelete = async (file: DriveFileItem) => {
    try {
      if (!user?.name) {
        console.error('Username not found - user not authenticated');
        return;
      }

      const response = await api.post('/v1/file/delete-filename', {
        filename: file.filename,
        username: user.name
      });

      if (response.data.status === 'success') {
        // Remove the file from the local state
        setFiles(prev => prev.filter(f => f.id !== file.id));
        console.log('File deleted successfully:', file.filename);
      } else {
        throw new Error(response.data.message || 'Delete failed');
      }
    } catch (error) {
      console.error('Delete failed:', error);
      // You can add error handling here, e.g., show a toast notification
    }
  };

  const getFileType = (filename: string): string => {
    const extension = filename.split('.').pop()?.toLowerCase() || '';
    
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'].includes(extension)) {
      return 'image';
    } else if (['pdf'].includes(extension)) {
      return 'pdf';
    } else if (['mp4', 'avi', 'mov', 'wmv', 'webm'].includes(extension)) {
      return 'video';
    } else if (['mp3', 'wav', 'flac', 'aac', 'ogg'].includes(extension)) {
      return 'audio';
    } else if (['txt', 'md', 'json', 'csv'].includes(extension)) {
      return 'text';
    } else {
      return 'other';
    }
  };

  const renderPreviewContent = () => {
    if (!fileToPreview || !previewUrl) return null;
    
    const fileType = getFileType(fileToPreview.filename);
    
    switch (fileType) {
      case 'image':
        return (
          <img 
            src={previewUrl} 
            alt={fileToPreview.filename}
            className="max-w-full max-h-full object-contain"
          />
        );
      case 'pdf':
        return (
          <iframe
            src={previewUrl}
            title={fileToPreview.filename}
            className="w-full h-full border-0"
            style={{ minHeight: '600px' }}
          />
        );
      case 'video':
        return (
          <video 
            controls 
            className="max-w-full max-h-full"
            src={previewUrl}
          >
            Your browser does not support the video tag.
          </video>
        );
      case 'audio':
        return (
          <div className="flex flex-col items-center gap-4 p-8">
            <Music className="w-16 h-16 text-gray-400" />
            <h3 className="text-white text-lg">{fileToPreview.filename}</h3>
            <audio controls className="w-full max-w-md">
              <source src={previewUrl} />
              Your browser does not support the audio tag.
            </audio>
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center gap-4 p-8 text-center">
            <FileIcon className="w-16 h-16 text-gray-400" />
            <h3 className="text-white text-lg">{fileToPreview.filename}</h3>
            <p className="text-gray-400">Preview not available for this file type</p>
            <Button 
              onClick={() => handleDownload(fileToPreview)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Download to View
            </Button>
          </div>
        );
    }
  };

  const handleAction = async (action: string, file: DriveFileItem) => {
    switch (action) {
      case 'view':
        handlePreview(file);
        break;
      case 'download':
        handleDownload(file);
        break;
      case 'share':
        handleShare(file);
        break;
      case 'rename':
        setFileToRename(file);
        setNewFileName(file.filename);
        setRenameModalOpen(true);
        break;
      case 'star':
        setFiles(prev => prev.map(f => 
          f.id === file.id ? { ...f, starred: !f.starred } : f
        ));
        break;
      case 'delete':
        if (confirm(`Are you sure you want to delete "${file.filename}"?`)) {
          await handleDelete(file);
        }
        break;
      default:
        console.log('Unknown action:', action);
    }
  };

  const handleCreateFolder = () => {
    setIsCreatingFolder(true);
    setUploadTargetPath(currentPath);
    setUploadModalOpen(true);
    setNewFolderName('');
  };

  const createFolderAndUpload = async () => {
    if (!newFolderName.trim()) return;
    
    const newFolderPath = currentPath === '/' 
      ? `/${newFolderName.trim()}` 
      : `${currentPath}/${newFolderName.trim()}`;
    
    setUploadTargetPath(newFolderPath);
    setIsCreatingFolder(false);
    setNewFolderName('');
    
    // Note: Folder will be created in backend when first file is uploaded to it
    // This is how the backend API works - folders are created implicitly with file uploads
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="bg-zinc-900/50 border-zinc-800 max-w-md">
          <CardContent className="flex flex-col items-center gap-4 p-8">
            <AlertCircle className="w-12 h-12 text-red-400" />
            <div className="text-center space-y-2">
              <h3 className="text-white font-semibold">Error Loading Files</h3>
              <p className="text-gray-400 text-sm">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header Section - Fixed */}
      <div className="flex-shrink-0 space-y-4 sm:space-y-6">
        {/* Simple Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 flex items-center">
              <HardDrive className="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-3 flex-shrink-0" />
              <span className="truncate">My Drive</span>
            </h1>
            <p className="text-gray-400 text-sm sm:text-base">
              {files.length} total files • {filteredFiles.length} in current directory
            </p>
          </div>
          <div className="flex gap-2 sm:gap-3 items-center flex-wrap">
            {/* Upload to Current Directory Button */}
            <Button
              onClick={() => handleFolderClick(currentPath)}
              className="bg-green-600 hover:bg-green-700 text-white text-sm sm:text-base px-3 sm:px-4 py-2"
              size="sm"
            >
              <Upload className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Upload Here</span>
              <span className="sm:hidden">Upload</span>
            </Button>
            
            {/* Create Folder Button */}
            <Button
              onClick={handleCreateFolder}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base px-3 sm:px-4 py-2"
              size="sm"
            >
              <FolderPlus className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Add Folder</span>
              <span className="sm:hidden">Folder</span>
            </Button>
            
            {/* View Toggle */}
            <div className="flex border border-zinc-700 rounded-lg overflow-hidden">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className={`px-2 sm:px-3 py-2 ${
                  viewMode === 'grid'
                    ? 'bg-blue-600 text-white'
                    : 'bg-zinc-800/50 text-gray-400 hover:text-white hover:bg-zinc-700'
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className={`px-2 sm:px-3 py-2 ${
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'bg-zinc-800/50 text-gray-400 hover:text-white hover:bg-zinc-700'
                }`}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Breadcrumb Navigation */}
        <DriveBreadcrumb 
          currentPath={currentPath}
          onNavigate={handleNavigateToPath}
        />
      </div>

      {/* Content Area - Scrollable */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden mt-4 sm:mt-6 min-h-0">
        <div className="space-y-4 sm:space-y-6 pb-4 sm:pb-6">

      {/* Directory Folders */}
      {!isLoading && getSubDirectories().length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-400 mb-3">Folders</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {getSubDirectories().map((directory) => (
              <Card 
                key={directory.path}
                className="bg-zinc-900/50 border-zinc-800 hover:bg-zinc-800/50 transition-colors cursor-pointer group relative"
              >
                <CardContent className="p-4 flex flex-col items-center gap-2">
                  <div className="flex items-center justify-between w-full">
                    <div 
                      className="flex flex-col items-center gap-2 flex-1"
                      onClick={() => handleNavigateToPath(directory.path)}
                    >
                      <FolderPlus className="w-8 h-8 text-blue-400" />
                      <span className="text-sm text-white truncate w-full text-center">
                        {directory.name}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFolderClick(directory.path);
                      }}
                      title={`Upload files to ${directory.name}`}
                    >
                      <Upload className="w-4 h-4 text-gray-400 hover:text-white" />
                    </Button>
                  </div>
                  
                  {/* Upload hint on hover */}
                  <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <span className="text-xs text-gray-300 bg-zinc-800 px-2 py-1 rounded">
                      Click folder to browse • Click upload icon to add files
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-24 mb-4 bg-zinc-700" />
                  <Skeleton className="h-8 w-16 mb-2 bg-zinc-700" />
                  <Skeleton className="h-2 w-full bg-zinc-700" />
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="p-4">
                  <Skeleton className="h-32 w-full mb-3 bg-zinc-700" />
                  <Skeleton className="h-4 w-full mb-2 bg-zinc-700" />
                  <Skeleton className="h-3 w-24 bg-zinc-700" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Files View */}
      {!isLoading && (
        <>
          {/* Show actual files in current directory */}
          {(() => {
            const currentDirFiles = files.filter(file => file.path === currentPath);
            const displayFiles = searchQuery 
              ? currentDirFiles.filter(file => 
                  file.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  file.path.toLowerCase().includes(searchQuery.toLowerCase())
                )
              : currentDirFiles;

            return displayFiles.length === 0 ? (
              <div className="flex items-center justify-center h-96">
                <Card className="bg-zinc-900/50 border-zinc-800 max-w-md">
                  <CardContent className="flex flex-col items-center gap-4 p-8">
                    <FileX className="w-12 h-12 text-gray-400" />
                    <div className="text-center space-y-2">
                      <h3 className="text-white font-semibold">No Files Found</h3>
                      <p className="text-gray-400 text-sm">
                        {searchQuery 
                          ? 'Try adjusting your search terms'
                          : `No files found in ${currentPath === '/' ? 'root directory' : currentPath}`
                        }
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <>
                {viewMode === 'grid' ? (
                  <DriveFileGrid 
                    files={displayFiles}
                    onFileAction={handleAction}
                  />
                ) : (
                  <DriveFileList 
                    files={displayFiles}
                    sortBy="name"
                    sortOrder="asc"
                    onFileAction={handleAction}
                  />
                )}
              </>
            );
          })()}
        </>
      )}

      {/* Upload Modal */}
      <Sheet open={uploadModalOpen} onOpenChange={(open) => {
        setUploadModalOpen(open);
        if (!open) {
          setIsCreatingFolder(false);
          setNewFolderName('');
          setUploadFiles([]);
        }
      }}>
        <SheetContent side="right" className="w-[400px] sm:w-[540px] bg-black border-zinc-800">
          <SheetHeader>
            <SheetTitle className="text-white flex items-center gap-2">
              {isCreatingFolder ? (
                <>
                  <FolderPlus className="w-5 h-5" />
                  Create New Folder
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Upload to {uploadTargetPath}
                </>
              )}
            </SheetTitle>
          </SheetHeader>
          
          <div className="mt-6 space-y-6">
            {/* Folder Creation Form */}
            {isCreatingFolder ? (
              <div className="space-y-4">
                <div className="p-4 bg-zinc-900/50 rounded-lg border border-zinc-800">
                  <h3 className="text-white font-medium mb-3">Create a new folder</h3>
                  <Input
                    placeholder="Enter folder name"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-white"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        createFolderAndUpload();
                      }
                    }}
                  />
                  <p className="text-gray-400 text-sm mt-2">
                    Folder will be created at: <code className="bg-zinc-800 px-1 py-0.5 rounded">
                      {currentPath === '/' ? `/${newFolderName || 'folder-name'}` : `${currentPath}/${newFolderName || 'folder-name'}`}
                    </code>
                  </p>
                </div>
                
                <div className="flex gap-3">
                  <Button
                    onClick={() => setIsCreatingFolder(false)}
                    variant="outline"
                    className="flex-1 border-zinc-700 text-gray-300 hover:text-white"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={createFolderAndUpload}
                    disabled={!newFolderName.trim()}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Create Folder
                  </Button>
                </div>
                
                <div className="text-center">
                  <p className="text-gray-400 text-xs">
                    The folder will be created when you upload the first file to it
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Drag and Drop Area */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`
                    border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer
                    ${
                      isDragOver
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800/30'
                    }
                  `}
                  onClick={handleFileSelect}
                >
                  <div className="flex flex-col items-center gap-4">
                    <div
                      className={`
                      w-12 h-12 rounded-full flex items-center justify-center transition-colors
                      ${
                        isDragOver
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-zinc-800 text-zinc-400'
                      }
                    `}
                    >
                      <Upload className="w-6 h-6" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-white font-medium">
                        {isDragOver
                          ? 'Drop files here'
                          : 'Drag files here or click to browse'
                        }
                      </p>
                      <p className="text-gray-400 text-sm">
                        Support for multiple files
                      </p>
                    </div>
                  </div>
                </div>

                {/* Selected Files */}
                {uploadFiles.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-white font-medium">Selected Files ({uploadFiles.length})</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {uploadFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-zinc-900/50 rounded-lg">
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm truncate">{file.name}</p>
                            <p className="text-gray-400 text-xs">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeUploadFile(index)}
                            className="h-8 w-8 p-0"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upload Actions */}
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => setUploadModalOpen(false)}
                    variant="outline"
                    className="flex-1 border-zinc-700 text-gray-300 hover:text-white"
                    disabled={isUploading}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpload}
                    disabled={uploadFiles.length === 0 || isUploading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isUploading ? 'Uploading...' : `Upload ${uploadFiles.length} file${uploadFiles.length !== 1 ? 's' : ''}`}
                  </Button>
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Rename Modal */}
      <Sheet open={renameModalOpen} onOpenChange={(open) => {
        setRenameModalOpen(open);
        if (!open) {
          setFileToRename(null);
          setNewFileName('');
        }
      }}>
        <SheetContent 
          side="right" 
          className="w-full sm:w-[400px] md:w-[540px] bg-white dark:bg-black border-gray-200 dark:border-zinc-800 p-4 sm:p-6"
        >
          <SheetHeader className="pb-4">
            <SheetTitle className="text-gray-900 dark:text-white flex items-center gap-2 text-lg font-semibold">
              <Edit3 className="w-5 h-5 text-blue-600" />
              Rename File
            </SheetTitle>
          </SheetHeader>
          
          <div className="space-y-6">
            {fileToRename && (
              <div className="space-y-6">
                <div className="p-4 bg-gray-50 dark:bg-zinc-900/50 rounded-lg border border-gray-200 dark:border-zinc-800">
                  <h3 className="text-gray-900 dark:text-white font-semibold mb-3 text-sm uppercase tracking-wide">
                    Current filename
                  </h3>
                  <div className="bg-white dark:bg-zinc-800 px-4 py-3 rounded-md border border-gray-200 dark:border-zinc-700">
                    <p className="text-gray-800 dark:text-gray-200 font-mono text-sm break-all">
                      {fileToRename.filename}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <label 
                    htmlFor="newFileName" 
                    className="text-gray-900 dark:text-white font-semibold text-sm uppercase tracking-wide block"
                  >
                    New filename
                  </label>
                  <Input
                    id="newFileName"
                    placeholder="Enter new filename"
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    className="bg-white dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 h-12 text-base"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleRename();
                      }
                    }}
                  />
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                    Keep the file extension to maintain file type
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200 dark:border-zinc-800">
                  <Button
                    onClick={() => setRenameModalOpen(false)}
                    variant="outline"
                    className="w-full sm:w-auto sm:flex-1 h-12 border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-zinc-800 font-medium"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleRename}
                    disabled={!newFileName.trim() || newFileName === fileToRename.filename}
                    className="w-full sm:w-auto sm:flex-1 h-12 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-zinc-700 text-white font-medium shadow-sm"
                  >
                    Rename File
                  </Button>
                </div>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Share Modal */}
      <Sheet open={shareModalOpen} onOpenChange={(open) => {
        setShareModalOpen(open);
        if (!open) {
          setFileToShare(null);
          setPublicLink('');
          setShareToken('');
          setLinkCopied(false);
        }
      }}>
        <SheetContent 
          side="right" 
          className="w-full sm:w-[400px] md:w-[540px] bg-white dark:bg-black border-gray-200 dark:border-zinc-800 p-4 sm:p-6"
        >
          <SheetHeader className="pb-4">
            <SheetTitle className="text-gray-900 dark:text-white flex items-center gap-2 text-lg font-semibold">
              <Link className="w-5 h-5 text-blue-600" />
              Share File
            </SheetTitle>
          </SheetHeader>
          
          <div className="space-y-6">
            {fileToShare && (
              <div className="space-y-6">
                {/* File Info */}
                <div className="p-4 bg-gray-50 dark:bg-zinc-900/50 rounded-lg border border-gray-200 dark:border-zinc-800">
                  <h3 className="text-gray-900 dark:text-white font-semibold mb-3 text-sm uppercase tracking-wide">
                    File to share
                  </h3>
                  <div className="bg-white dark:bg-zinc-800 px-4 py-3 rounded-md border border-gray-200 dark:border-zinc-700">
                    <p className="text-gray-800 dark:text-gray-200 font-mono text-sm break-all">
                      {fileToShare.filename}
                    </p>
                  </div>
                </div>
                
                {/* Public Link Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-gray-900 dark:text-white font-semibold text-sm uppercase tracking-wide">
                      Public Link
                    </h3>
                    {!publicLink && (
                      <Button
                        onClick={generatePublicLink}
                        disabled={isGeneratingLink}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm"
                      >
                        {isGeneratingLink ? 'Generating...' : 'Generate Link'}
                      </Button>
                    )}
                  </div>
                  
                  {publicLink && (
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <Input
                          value={publicLink}
                          readOnly
                          className="bg-gray-50 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white font-mono text-sm"
                        />
                        <Button
                          onClick={copyToClipboard}
                          variant="outline"
                          className="px-3 border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                        >
                          {linkCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                      
                      {linkCopied && (
                        <p className="text-green-600 dark:text-green-400 text-sm font-medium">
                          ✓ Link copied to clipboard!
                        </p>
                      )}

                      {/* Show token for debugging/advanced users */}
                      {shareToken && (
                        <details className="mt-3">
                          <summary className="text-gray-600 dark:text-gray-400 text-sm cursor-pointer hover:text-gray-800 dark:hover:text-gray-200">
                            Advanced Details
                          </summary>
                          <div className="mt-2 p-3 bg-gray-100 dark:bg-zinc-900 rounded-md">
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Share Token:</p>
                            <code className="text-xs text-gray-800 dark:text-gray-200 break-all">{shareToken}</code>
                          </div>
                        </details>
                      )}
                      
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800">
                        <p className="text-blue-800 dark:text-blue-200 text-sm">
                          <strong>Share this link:</strong> Anyone with this link can view and download the file. The link will remain active until you revoke access.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200 dark:border-zinc-800">
                  <Button
                    onClick={() => setShareModalOpen(false)}
                    variant="outline"
                    className="w-full sm:w-auto sm:flex-1 h-12 border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-zinc-800 font-medium"
                  >
                    Close
                  </Button>
                  {publicLink && (
                    <Button
                      onClick={copyToClipboard}
                      className="w-full sm:w-auto sm:flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm"
                    >
                      {linkCopied ? 'Copied!' : 'Copy Link'}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* File Preview Modal */}
      <Sheet open={previewModalOpen} onOpenChange={(open) => {
        if (!open) {
          closePreview();
        }
      }}>
        <SheetContent side="right" className="w-[90vw] max-w-4xl bg-black border-zinc-800 p-0">
          <SheetHeader className="p-6 border-b border-zinc-800">
            <SheetTitle className="text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                File Preview
              </div>
              <Button
                onClick={closePreview}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </SheetTitle>
            {fileToPreview && (
              <p className="text-gray-400 text-sm mt-2">
                {fileToPreview.filename}
              </p>
            )}
          </SheetHeader>
          
          <div className="flex-1 p-6 overflow-auto" style={{ height: 'calc(100vh - 120px)' }}>
            <div className="w-full h-full flex items-center justify-center">
              {renderPreviewContent()}
            </div>
          </div>
          
          {/* Action Bar */}
          <div className="border-t border-zinc-800 p-4 flex gap-3 justify-end">
            <Button
              onClick={() => fileToPreview && handleDownload(fileToPreview)}
              variant="outline"
              className="border-zinc-700 text-gray-300 hover:text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button
              onClick={closePreview}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Close
            </Button>
          </div>
        </SheetContent>
      </Sheet>
        </div>
      </div>
    </div>
  );
}