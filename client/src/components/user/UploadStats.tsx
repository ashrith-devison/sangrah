import React from 'react';
import { Upload, Check, AlertCircle, HardDrive } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { UploadStatsProps } from '@/types/upload';

export default function UploadStats({
  totalFiles,
  completedFiles,
  errorFiles,
  totalSize,
}: UploadStatsProps) {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (totalFiles === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Files</p>
              <p className="text-2xl font-bold text-white">{totalFiles}</p>
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
              <p className="text-2xl font-bold text-green-400">{completedFiles}</p>
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
              <p className="text-2xl font-bold text-red-400">{errorFiles}</p>
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
  );
}