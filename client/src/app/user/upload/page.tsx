'use client';

import React, { useState, useCallback, useRef } from 'react';
import {
  Upload,
  FileText,
  Image,
  Video,
  Music,
  Archive,
  File,
  X,
  Check,
  AlertCircle,
  Cloud,
  FolderOpen,
  Plus,
  Trash2,
  Eye,
  Download,
  RotateCcw,
  Settings,
  HardDrive,
  Zap,
  Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';

interface FileUpload {
  id: string;
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error' | 'paused';
  error?: string;
  size: string;
  type: string;
  thumbnail?: string;
}

export default function Page() {
  const [files, setFiles] = useState<FileUpload[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState('root');
  const [uploadSettings, setUploadSettings] = useState({
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

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image':
        return Image;
      case 'video':
        return Video;
      case 'audio':
        return Music;
      case 'document':
        return FileText;
      case 'archive':
        return Archive;
      default:
        return File;
    }
  };

  const getFileColor = (type: string) => {
    switch (type) {
      case 'image':
        return 'text-green-400';
      case 'video':
        return 'text-purple-400';
      case 'audio':
        return 'text-pink-400';
      case 'document':
        return 'text-blue-400';
      case 'archive':
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
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
              const newProgress = Math.min(
                f.progress + Math.random() * 15,
                100
              );
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

  const clearCompleted = () => {
    setFiles(prev => prev.filter(f => f.status !== 'completed'));
  };

  const totalFiles = files.length;
  const completedFiles = files.filter(f => f.status === 'completed').length;
  const errorFiles = files.filter(f => f.status === 'error').length;
  const totalSize = files.reduce((acc, f) => acc + f.file.size, 0);

  const folders = [
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
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
                <Upload className="w-8 h-8 mr-3" />
                Upload Files
              </h1>
              <p className="text-gray-400">
                Drag and drop files or click to browse. Intelligent compression
                and deduplication enabled.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge
                variant="secondary"
                className="bg-green-500/20 text-green-400"
              >
                <Shield className="w-3 h-3 mr-1" />
                Secure
              </Badge>
              <Badge
                variant="secondary"
                className="bg-[#6e73fa]/20 text-[#6e73fa]"
              >
                <Zap className="w-3 h-3 mr-1" />
                Fast Upload
              </Badge>
            </div>
          </div>
        </div>

        {/* Upload Stats */}
        {totalFiles > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Files</p>
                    <p className="text-2xl font-bold text-white">
                      {totalFiles}
                    </p>
                  </div>
                  <Upload className="w-8 h-8 text-[#6e73fa]" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Completed</p>
                    <p className="text-2xl font-bold text-green-400">
                      {completedFiles}
                    </p>
                  </div>
                  <Check className="w-8 h-8 text-green-400" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Errors</p>
                    <p className="text-2xl font-bold text-red-400">
                      {errorFiles}
                    </p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-red-400" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Size</p>
                    <p className="text-2xl font-bold text-white">
                      {formatFileSize(totalSize)}
                    </p>
                  </div>
                  <HardDrive className="w-8 h-8 text-[#6e73fa]" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upload Area */}
          <div className="lg:col-span-2">
            <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center">
                    <Cloud className="w-5 h-5 mr-2" />
                    Drop Zone
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {/* Drag and Drop Area */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`
                    border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 cursor-pointer
                    ${
                      isDragOver
                        ? 'border-[#6e73fa] bg-[#6e73fa]/10'
                        : 'border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800/30'
                    }
                  `}
                  onClick={handleFileSelect}
                >
                  <div className="flex flex-col items-center gap-4">
                    <div
                      className={`
                      w-16 h-16 rounded-full flex items-center justify-center transition-colors
                      ${isDragOver ? 'bg-[#6e73fa]/20' : 'bg-zinc-800'}
                    `}
                    >
                      <Upload
                        className={`w-8 h-8 ${isDragOver ? 'text-[#6e73fa]' : 'text-gray-400'}`}
                      />
                    </div>
                    <div>
                      <h3 className="text-white text-xl font-semibold mb-2">
                        {isDragOver
                          ? 'Drop files here'
                          : 'Drag & drop files here'}
                      </h3>
                      <p className="text-gray-400 mb-4">
                        or click to browse your computer
                      </p>
                      <div className="flex flex-wrap justify-center gap-2 text-xs text-gray-500">
                        <span>
                          Supports: Images, Videos, Documents, Archives
                        </span>
                        <span>•</span>
                        <span>Max size: 1GB per file</span>
                      </div>
                    </div>
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={e => {
                    if (e.target.files) {
                      handleFiles(e.target.files);
                    }
                  }}
                />

                {/* File List */}
                {files.length > 0 && (
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-white font-medium">Upload Queue</h4>
                      <div className="text-sm text-gray-400">
                        {completedFiles} of {totalFiles} completed
                      </div>
                    </div>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {files.map(fileUpload => {
                        const FileIcon = getFileIcon(fileUpload.type);
                        const iconColor = getFileColor(fileUpload.type);

                        return (
                          <div
                            key={fileUpload.id}
                            className="flex items-center gap-4 p-4 bg-zinc-800/50 border border-zinc-700 rounded-lg"
                          >
                            <FileIcon
                              className={`w-6 h-6 ${iconColor} flex-shrink-0`}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-2">
                                <p
                                  className="text-white font-medium truncate"
                                  title={fileUpload.file.name}
                                >
                                  {fileUpload.file.name}
                                </p>
                                <div className="flex items-center gap-2">
                                  {fileUpload.status === 'completed' && (
                                    <Tooltip>
                                      <TooltipTrigger>
                                        <Check className="w-4 h-4 text-green-400" />
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        Upload completed
                                      </TooltipContent>
                                    </Tooltip>
                                  )}
                                  {fileUpload.status === 'error' && (
                                    <Tooltip>
                                      <TooltipTrigger>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() =>
                                            retryFile(fileUpload.id)
                                          }
                                          className="p-1 h-6 w-6"
                                        >
                                          <RotateCcw className="w-4 h-4 text-orange-400" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        Retry upload
                                      </TooltipContent>
                                    </Tooltip>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeFile(fileUpload.id)}
                                    className="p-1 h-6 w-6 text-gray-400 hover:text-red-400"
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                              <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
                                <span>{fileUpload.size}</span>
                                <span className="capitalize">
                                  {fileUpload.status}
                                </span>
                              </div>
                              {fileUpload.status === 'uploading' && (
                                <Progress
                                  value={fileUpload.progress}
                                  className="h-2"
                                />
                              )}
                              {fileUpload.status === 'error' && (
                                <div className="text-red-400 text-xs">
                                  {fileUpload.error || 'Upload failed'}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Destination and Settings */}
          <div className="space-y-6">
            {/* Destination Folder */}
            <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <FolderOpen className="w-5 h-5 mr-2" />
                  Destination
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start bg-zinc-800/50 border-zinc-700 text-white hover:bg-zinc-700"
                    >
                      <FolderOpen className="w-4 h-4 mr-2" />
                      {folders.find(f => f.id === selectedFolder)?.path || '/'}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 bg-zinc-800 border-zinc-700">
                    {folders.map(folder => (
                      <DropdownMenuItem
                        key={folder.id}
                        onClick={() => setSelectedFolder(folder.id)}
                        className="text-white hover:bg-zinc-700 cursor-pointer"
                      >
                        <FolderOpen className="w-4 h-4 mr-2" />
                        {folder.path}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white text-sm">
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start border-zinc-700 text-black"
                  onClick={handleFileSelect}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add More Files
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={files.length === 0}
                  className="w-full justify-start border-zinc-700 text-black"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Start Upload
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
