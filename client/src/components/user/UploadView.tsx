'use client';

import React, { useState, useCallback, useRef } from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import UploadHeader from './UploadHeader';
import UploadStats from './UploadStats';
import UploadDropZone from './UploadDropZone';
import UploadDestination from './UploadDestination';
import UploadQuickActions from './UploadQuickActions';
import { FileUpload, UploadFolder, UploadSettings, UploadViewProps } from '@/types/upload';
import api from '@/lib/api';
import { useAuth } from '@/stores/hooks';

interface UploadResponse {
  status: string;
  message: string;
  data: {
    filename: string;
    message: string;
    sha256: string;
  };
}

export default function UploadView({}: UploadViewProps) {
  const [files, setFiles] = useState<FileUpload[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState('root');
  const [customPath, setCustomPath] = useState('');
  const [uploadSettings, setUploadSettings] = useState<UploadSettings>({
    compression: true,
    deduplication: true,
    encryption: true,
  });
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileType = (file: File): string => {
    const type = file.type.toLowerCase();
    if (type.startsWith('image/')) return 'image';
    if (type.startsWith('video/')) return 'video';
    if (type.startsWith('audio/')) return 'audio';
    if (
      type.includes('pdf') ||
      type.includes('document') ||
      type.includes('text')
    )
      return 'document';
    if (type.includes('zip') || type.includes('rar') || type.includes('tar'))
      return 'archive';
    return 'file';
  };

  const uploadFileToServer = async (fileUpload: FileUpload): Promise<void> => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      
      // Determine the folder path based on selection
      let folderPath = '';
      if (selectedFolder === 'custom') {
        folderPath = customPath;
      } else {
        const selectedFolderData = folders.find(f => f.id === selectedFolder);
        folderPath = selectedFolderData?.path || '';
      }
      
      formData.append('file', fileUpload.file);
      formData.append('uploader', user?.name || 'unknown');
      formData.append('path', folderPath);

      const response = await api.post<UploadResponse>(
        '/v1/file/upload-meta',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const progress = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setFiles(prev =>
                prev.map(f =>
                  f.id === fileUpload.id
                    ? { ...f, progress }
                    : f
                )
              );
            }
          },
        }
      );

      if (response.data.status === 'success') {
        console.log('Upload response:', response.data); // Debug log
        const responseData = response.data.data;
        setFiles(prev =>
          prev.map(f =>
            f.id === fileUpload.id
              ? {
                  ...f,
                  status: 'completed',
                  progress: 100,
                  sha256: responseData?.sha256,
                  message: responseData?.message,
                }
              : f
          )
        );
        
        toast.success(
          `✅ "${fileUpload.file.name}" uploaded successfully!`,
          {
            description: responseData?.sha256 ? `SHA256: ${responseData.sha256.substring(0, 12)}...` : 'Upload completed',
            duration: 3000,
          }
        );
      } else {
        throw new Error(response.data.message || 'Upload failed');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Upload failed';
      
      setFiles(prev =>
        prev.map(f =>
          f.id === fileUpload.id
            ? {
                ...f,
                status: 'error',
                error: errorMessage,
              }
            : f
        )
      );
      
      toast.error(
        `❌ Failed to upload "${fileUpload.file.name}"`,
        {
          description: errorMessage,
          duration: 5000,
        }
      );
    } finally {
      // Check if all uploads are complete
      setTimeout(() => {
        setFiles(prev => {
          const stillUploading = prev.some(f => f.status === 'uploading');
          if (!stillUploading) {
            setIsUploading(false);
          }
          return prev;
        });
      }, 100);
    }
  };

  const validateFile = (file: File): string | null => {
    // Check file size (100MB limit)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      return `File size exceeds 100MB limit`;
    }

    // Check for empty files
    if (file.size === 0) {
      return `Cannot upload empty files`;
    }

    return null;
  };

  const handleFiles = useCallback((fileList: FileList) => {
    if (!user) {
      toast.error('Please log in to upload files');
      return;
    }

    const validFiles: File[] = [];
    const invalidFiles: { file: File; error: string }[] = [];

    Array.from(fileList).forEach(file => {
      const error = validateFile(file);
      if (error) {
        invalidFiles.push({ file, error });
      } else {
        validFiles.push(file);
      }
    });

    // Show errors for invalid files
    invalidFiles.forEach(({ file, error }) => {
      toast.error(`❌ "${file.name}": ${error}`);
    });

    if (validFiles.length === 0) return;

    const newFiles: FileUpload[] = validFiles.map(file => ({
      id: Math.random().toString(36).substring(7),
      file,
      progress: 0,
      status: 'uploading' as const,
      size: formatFileSize(file.size),
      type: getFileType(file),
    }));

    setFiles(prev => [...prev, ...newFiles]);

    // Upload each file to the server
    newFiles.forEach(fileUpload => {
      uploadFileToServer(fileUpload);
    });
  }, [selectedFolder, customPath, user?.name, user]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const droppedFiles = e.dataTransfer.files;
      if (droppedFiles.length > 0) {
        handleFiles(droppedFiles);
      }
    },
    [handleFiles]
  );

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const retryFile = (id: string) => {
    const fileToRetry = files.find(f => f.id === id);
    if (!fileToRetry) return;

    setFiles(prev =>
      prev.map(f =>
        f.id === id
          ? { ...f, status: 'uploading', progress: 0, error: undefined }
          : f
      )
    );
    
    // Retry the upload
    uploadFileToServer(fileToRetry);
  };

  const totalFiles = files.length;
  const completedFiles = files.filter(f => f.status === 'completed').length;
  const errorFiles = files.filter(f => f.status === 'error').length;
  const totalSize = files.reduce((acc, f) => acc + f.file.size, 0);

  const folders: UploadFolder[] = [
    { id: 'root', name: 'Root', path: '' },
    { id: 'documents', name: 'Documents', path: 'documents' },
    { id: 'images', name: 'Images', path: 'images' },
    { id: 'videos', name: 'Videos', path: 'videos' },
    { id: 'projects', name: 'Projects', path: 'projects' },
  ];

  return (
    <TooltipProvider>
      <div className="p-6">
        {/* Header Section */}
        <UploadHeader />

        {/* Upload Stats */}
        <UploadStats
          totalFiles={totalFiles}
          completedFiles={completedFiles}
          errorFiles={errorFiles}
          totalSize={totalSize}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upload Area */}
          <div className="lg:col-span-2">
            <UploadDropZone
              isDragOver={isDragOver}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onFileSelect={handleFileSelect}
              fileInputRef={fileInputRef}
              onFilesSelected={handleFiles}
              files={files}
              onRemoveFile={removeFile}
              onRetryFile={retryFile}
            />
          </div>

          {/* Destination and Settings */}
          <div className="space-y-6">
            {/* Destination Folder */}
            <UploadDestination
              selectedFolder={selectedFolder}
              folders={folders}
              onFolderChange={setSelectedFolder}
              customPath={customPath}
              onCustomPathChange={setCustomPath}
            />

            {/* Quick Actions */}
            <UploadQuickActions
              onAddFiles={handleFileSelect}
              hasFiles={files.length > 0}
            />
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}