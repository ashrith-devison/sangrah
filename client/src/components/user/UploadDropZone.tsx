'use client';

import React from 'react';
import { Upload, Cloud } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import UploadFileList from './UploadFileList';
import { UploadDropZoneProps } from '@/types/upload';

export default function UploadDropZone({
  isDragOver,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileSelect,
  fileInputRef,
  onFilesSelected,
  files,
  onRemoveFile,
  onRetryFile,
}: UploadDropZoneProps) {
  return (
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
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={`
            border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 cursor-pointer
            ${
              isDragOver
                ? 'border-[#6e73fa] bg-[#6e73fa]/10'
                : 'border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800/30'
            }
          `}
          onClick={onFileSelect}
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
                {isDragOver ? 'Drop files here' : 'Drag & drop files here'}
              </h3>
              <p className="text-gray-400 mb-4">or click to browse your computer</p>
              <div className="flex flex-wrap justify-center gap-2 text-xs text-gray-500">
                <span>Supports: Images, Videos, Documents, Archives</span>
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
              onFilesSelected(e.target.files);
            }
          }}
        />

        {/* File List Component */}
        <UploadFileList
          files={files}
          onRemoveFile={onRemoveFile}
          onRetryFile={onRetryFile}
        />
      </CardContent>
    </Card>
  );
}