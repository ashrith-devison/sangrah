'use client';

import React, { useState, useCallback, useRef } from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import UploadHeader from './UploadHeader';
import UploadStats from './UploadStats';
import UploadDropZone from './UploadDropZone';
import UploadDestination from './UploadDestination';
import UploadQuickActions from './UploadQuickActions';
import { FileUpload, UploadFolder, UploadSettings, UploadViewProps } from '@/types/upload';

export default function UploadView({}: UploadViewProps) {
  const [files, setFiles] = useState<FileUpload[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState('root');
  const [uploadSettings, setUploadSettings] = useState<UploadSettings>({
    compression: true,
    deduplication: true,
    encryption: true,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFiles = useCallback((fileList: FileList) => {
    const newFiles: FileUpload[] = Array.from(fileList).map(file => ({
      id: Math.random().toString(36).substring(7),
      file,
      progress: 0,
      status: 'uploading' as const,
      size: formatFileSize(file.size),
      type: getFileType(file),
    }));

    setFiles(prev => [...prev, ...newFiles]);

    // Simulate upload progress
    newFiles.forEach(fileUpload => {
      const interval = setInterval(() => {
        setFiles(prev =>
          prev.map(f => {
            if (f.id === fileUpload.id) {
              const newProgress = Math.min(f.progress + Math.random() * 15, 100);
              const status = newProgress === 100 ? 'completed' : 'uploading';
              return { ...f, progress: newProgress, status };
            }
            return f;
          })
        );
      }, 300);

      setTimeout(() => clearInterval(interval), 6000);
    });
  }, []);

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
    setFiles(prev =>
      prev.map(f =>
        f.id === id
          ? { ...f, status: 'uploading', progress: 0, error: undefined }
          : f
      )
    );
    // Simulate retry logic here
  };

  const totalFiles = files.length;
  const completedFiles = files.filter(f => f.status === 'completed').length;
  const errorFiles = files.filter(f => f.status === 'error').length;
  const totalSize = files.reduce((acc, f) => acc + f.file.size, 0);

  const folders: UploadFolder[] = [
    { id: 'root', name: 'Root', path: '/' },
    { id: 'documents', name: 'Documents', path: '/Documents' },
    { id: 'images', name: 'Images', path: '/Images' },
    { id: 'videos', name: 'Videos', path: '/Videos' },
    { id: 'projects', name: 'Projects', path: '/Projects' },
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