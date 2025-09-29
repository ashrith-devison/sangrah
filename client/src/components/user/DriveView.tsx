'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { DriveFileItem } from '@/types/drive';
import DriveFileGrid from './DriveFileGrid';
import DriveFileList from './DriveFileList';
import DriveBreadcrumb from './DriveBreadcrumb';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileX, AlertCircle, Grid3X3, List, Search, HardDrive, FolderPlus, Upload, X, Edit3, Music, Download, FileIcon, Eye, Link, Copy, Check, ExternalLink } from 'lucide-react';
import { Filter } from 'lucide-react';
import AdvancedSearchFilter from './AdvancedSearchFilter';
import { Input } from '@/components/ui/input';

import api from '@/lib/api';
import { useAuth } from '@/stores/hooks';
import { useFileStore } from '@/stores';
import { toast } from 'sonner';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

type ViewMode = 'grid' | 'list';

interface DriveViewProps {
  initialFiles?: DriveFileItem[];
  loading?: boolean;
  error?: string | null;
}

export default function DriveView({ initialFiles = [], loading = false, error = null }: DriveViewProps) {
  const [searchResults, setSearchResults] = useState<DriveFileItem[] | null>(null);
  // Map API response to DriveFileItem
  function mapApiToDriveFileItem(apiFile: any): DriveFileItem {
    return {
      id: apiFile.referenceID || apiFile.filename,
      filename: apiFile.filename,
      fileId: apiFile.referenceID || apiFile.filename,
      path: apiFile.path || '/',
      permission: 'owner',
      username: apiFile.uploader || '',
      type: apiFile.mimeType?.includes('image') ? 'image'
        : apiFile.mimeType?.includes('video') ? 'video'
        : apiFile.mimeType?.includes('audio') ? 'audio'
        : apiFile.mimeType?.includes('pdf') ? 'document' : 'other',
      size: apiFile.fileSize ? `${(apiFile.fileSize / 1024 / 1024).toFixed(2)} MB` : '0 MB',
      modified: apiFile.uploadDate || new Date().toISOString(),
      starred: false,
    };
  }
  const handleAdvancedSearch = (results: any[]) => {
    setSearchResults(results.map(mapApiToDriveFileItem));
    toast.info('Advanced search applied', { icon: '🔍' });
    setShowAdvancedSearch(false);
  };
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const { user } = useAuth();
  
  // Use file store for data and operations
  const { 
    files: storeFiles, 
    isLoading: storeLoading, 
    fetchDriveFiles,
    toggleStar 
  } = useFileStore();


  
  // Transform store files to DriveFileItem format
  const formatFileSize = (sizeMb: number) => {
    if (sizeMb < 0.01) {
      return `${Math.round(sizeMb * 1024)} KB`;
    }
    return `${sizeMb.toFixed(2)} MB`;
  };

  const files: DriveFileItem[] = storeFiles.map(file => ({
    id: file.id,
    filename: file.name,
    fileId: file.fileId || file.id,
    path: file.path || '/',
    modified: file.dateModified || file.updatedAt || new Date().toISOString(),
    username: file.username || user?.name || '',
    permission: file.permission as any || 'owner',
    starred: file.isStarred,
  size: formatFileSize(file.size_mb ?? 0),
    type: file.type === 'folder' ? undefined : 
          file.mimeType?.includes('image') ? 'image' :
          file.mimeType?.includes('video') ? 'video' :
          file.mimeType?.includes('audio') ? 'audio' :
          file.mimeType?.includes('pdf') ? 'document' : 'other'
  }));

  // Create stable fetchFiles function
  const fetchFiles = useCallback(async () => {
    if (!user?.name) return;
    try {
      await fetchDriveFiles(user.name);
    } catch (err) {
      console.error('Error fetching files:', err);
    }
  }, [user?.name, fetchDriveFiles]);

  // Initial fetch on mount - use a ref to prevent infinite loops
  const hasFetched = useRef(false);
  
  useEffect(() => {
    if (user?.name && !hasFetched.current) {
      hasFetched.current = true;
      fetchDriveFiles(user.name).catch(console.error);
    }
  }, [user?.name]); // Remove fetchDriveFiles from dependencies
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPath, setCurrentPath] = useState('/');
  const isLoading = storeLoading;
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadTargetPath, setUploadTargetPath] = useState('');
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);


  // Get unique directories for navigation
  const getDirectories = () => {
    const allPaths = files.map(file => file.path || '');
    const uniquePaths = [...new Set(allPaths)];
    
    // Get all possible directory levels from current path
    const directories: Array<{name: string, path: string, isSubdirectory: boolean}> = [];
    
    uniquePaths.forEach(fullPath => {
      if (!fullPath) return;
      // Skip if it's the current path
      if (fullPath === currentPath) return;
      // Check if this path is a subdirectory of current path
      if (typeof fullPath === 'string' && fullPath.startsWith(currentPath) && fullPath !== currentPath) {
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


  // Remove a file from the uploadFiles array by index
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

      // Refresh files after upload using the function that preserves starred data
      await fetchFiles();
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






  const handleToggleStar = async (file: DriveFileItem) => {
    if (!user?.name) {
      toast.error('Please log in to star files', {
        icon: '❌',
        duration: 4000,
      });
      return;
    }

    try {
      // Use the store's toggleStar function, but call the correct API endpoint
      const currentStarred = file.starred || false;
      const newStarred = !currentStarred;
      
      const response = await api.post('/v1/file/update-info', {
        username: user.name,
        filename: file.filename,
        starred: newStarred
      });
      
      if (response.data.status === 'success') {
        // Refresh files from both endpoints to ensure sync
        await fetchFiles();
        
        // Show success toast
        if (newStarred) {
          toast.success(`"${file.filename}" added to starred files`, {
            icon: '⭐',
            duration: 3000,
          });
        } else {
          toast.success(`"${file.filename}" removed from starred files`, {
            icon: '✨',
            duration: 3000,
          });
        }
      } else {
        throw new Error(response.data.message || 'Failed to update star status');
      }
    } catch (error: any) {
      console.error('Toggle star failed:', error);
      toast.error(`Failed to update "${file.filename}" star status`, {
        icon: '❌',
        duration: 4000,
      });
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

  // Remove a file from the uploadFiles array by index
  const removeUploadFile = (index: number) => {
    setUploadFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="h-full flex flex-col overflow-hidden w-full max-w-full">
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
              {files.length} total files • {(() => {
                const currentDirFiles = files.filter(file => file.path === currentPath);
                return searchQuery 
                  ? currentDirFiles.filter(file => 
                      file.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      file.path.toLowerCase().includes(searchQuery.toLowerCase())
                    ).length
                  : currentDirFiles.length;
              })()} in current directory
            </p>
          </div>
          <div className="flex gap-2 sm:gap-3 items-center flex-wrap">
            {/* Advanced Search Icon triggers pop-up */}
            <Button
              variant="ghost"
              size="sm"
              className="p-2"
              onClick={() => setShowAdvancedSearch(true)}
              title="Advanced Search"
            >
              <Filter className="w-5 h-5 text-blue-400" />
            </Button>
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
      {/* Advanced Search Pop-up (single instance) */}
      <AdvancedSearchFilter
        onSearch={handleAdvancedSearch}
        open={showAdvancedSearch}
        setOpen={setShowAdvancedSearch}
      />
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
      <div className="flex-1 overflow-y-auto overflow-x-hidden mt-4 sm:mt-6 min-h-0 pr-2">
        <div className="space-y-4 sm:space-y-6 pb-4 sm:pb-6 max-w-full">

      {/* Directory Folders */}
      {!isLoading && getSubDirectories().length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-400 mb-3">Folders</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 w-full max-w-full overflow-hidden">
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
          {/* Show search results if present, else normal files */}
          {searchResults ? (
            searchResults.length === 0 ? (
              <div className="flex items-center justify-center h-96">
                <Card className="bg-zinc-900/50 border-zinc-800 max-w-md">
                  <CardContent className="flex flex-col items-center gap-4 p-8">
                    <FileX className="w-12 h-12 text-gray-400" />
                    <div className="text-center space-y-2">
                      <h3 className="text-white font-semibold">No Files Found</h3>
                      <p className="text-gray-400 text-sm">No files match your search filters.</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <>
                {viewMode === 'grid' ? (
                  <DriveFileGrid files={searchResults} />
                ) : (
                  <DriveFileList files={searchResults} sortBy="name" sortOrder="asc" />
                )}
              </>
            )
          ) : (
            (() => {
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
                    <DriveFileGrid files={displayFiles} />
                  ) : (
                    <DriveFileList files={displayFiles} sortBy="name" sortOrder="asc" />
                  )}
                </>
              );
            })()
          )}
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
        </div>
      </div>
    </div>
  );
}