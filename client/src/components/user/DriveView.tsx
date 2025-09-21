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
import { FileX, AlertCircle, Grid3X3, List, Search, HardDrive, FolderPlus } from 'lucide-react';
import { Input } from '@/components/ui/input';

import api from '@/lib/api';
import { useAuth } from '@/stores/hooks';

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
  const [currentPath, setCurrentPath] = useState('/home');
  const [isLoading, setIsLoading] = useState(loading);

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

    // Filter by current path/directory
    result = result.filter(file => file.path === currentPath);

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
    
    return uniquePaths
      .filter(path => path !== currentPath)
      .map(path => ({
        name: path.split('/').pop() || path,
        path: path,
        isSubdirectory: path.startsWith(currentPath) && path !== currentPath
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
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
        if (Array.isArray(response.data)) {
          filesData = response.data;
        } else if (response.data && Array.isArray(response.data.data)) {
          filesData = response.data.data;
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

  const handleAction = async (action: string, file: DriveFileItem) => {
    switch (action) {
      case 'view':
        console.log('View file:', file.filename);
        break;
      case 'download':
        console.log('Download file:', file.filename);
        break;
      case 'share':
        console.log('Share file:', file.filename);
        break;
      case 'star':
        setFiles(prev => prev.map(f => 
          f.id === file.id ? { ...f, starred: !f.starred } : f
        ));
        break;
      case 'delete':
        if (confirm(`Are you sure you want to delete "${file.filename}"?`)) {
          setFiles(prev => prev.filter(f => f.id !== file.id));
        }
        break;
      default:
        console.log('Unknown action:', action);
    }
  };

  const handleCreateFolder = () => {
    const folderName = prompt('Enter folder name:');
    if (folderName && folderName.trim()) {
      const newPath = currentPath === '/home' ? `/${folderName.trim()}` : `${currentPath}/${folderName.trim()}`;
      // In a real app, this would create the folder via API
      console.log('Creating folder:', newPath);
      // For demo, we could add a placeholder file to represent the folder
    }
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
    <div className="space-y-6">
      {/* Simple Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
            <HardDrive className="w-8 h-8 mr-3" />
            My Drive
          </h1>
          <p className="text-gray-400">
            {files.length} total files • {filteredFiles.length} in current directory
          </p>
        </div>
        <div className="flex gap-3 items-center">
          {/* Create Folder Button */}
          <Button
            onClick={handleCreateFolder}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            size="sm"
          >
            <FolderPlus className="w-4 h-4 mr-2" />
            New Folder
          </Button>
          
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-zinc-800/50 border-zinc-700 text-white placeholder-gray-400 w-64"
            />
          </div>
          
          {/* View Toggle */}
          <div className="flex border border-zinc-700 rounded-lg overflow-hidden">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 ${
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
              className={`px-3 py-2 ${
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

      {/* Directory Folders */}
      {!isLoading && getSubDirectories().length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-400 mb-3">Folders</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {getSubDirectories().map((directory) => (
              <Card 
                key={directory.path}
                className="bg-zinc-900/50 border-zinc-800 hover:bg-zinc-800/50 transition-colors cursor-pointer"
                onClick={() => handleNavigateToPath(directory.path)}
              >
                <CardContent className="p-4 flex flex-col items-center gap-2">
                  <FolderPlus className="w-8 h-8 text-blue-400" />
                  <span className="text-sm text-white truncate w-full text-center">
                    {directory.name}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Drive Stats */}
      {!isLoading && (
        <DriveStats stats={mockStats} />
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
          {filteredFiles.length === 0 ? (
            <div className="flex items-center justify-center h-96">
              <Card className="bg-zinc-900/50 border-zinc-800 max-w-md">
                <CardContent className="flex flex-col items-center gap-4 p-8">
                  <FileX className="w-12 h-12 text-gray-400" />
                  <div className="text-center space-y-2">
                    <h3 className="text-white font-semibold">No Files Found</h3>
                    <p className="text-gray-400 text-sm">
                      {searchQuery 
                        ? 'Try adjusting your search terms'
                        : `No files found in ${currentPath === '/home' ? 'home directory' : currentPath}`
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
                  files={filteredFiles} 
                />
              ) : (
                <DriveFileList 
                  files={filteredFiles}
                  sortBy="name"
                  sortOrder="asc"
                />
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}