import React from 'react';
import { Upload, Shield, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { UploadHeaderProps } from '@/types/upload';

export default function UploadHeader({}: UploadHeaderProps) {
  return (
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
  );
}