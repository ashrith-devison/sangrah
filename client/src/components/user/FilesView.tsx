'use client';

import React, { useState } from 'react';
import { FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileItem, ViewMode } from '@/types/home';
import SearchBar from './SearchBar';
import ViewToggle from './ViewToggle';
import FileGrid from './FileGrid';
import FileList from './FileList';

interface FilesViewProps {
  files: FileItem[];
}

export default function FilesView({ files }: FilesViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="text-white flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Recent Files
          </CardTitle>
          <div className="flex items-center gap-3">
            <SearchBar 
              searchQuery={searchQuery} 
              onSearchChange={setSearchQuery} 
            />
            <ViewToggle 
              viewMode={viewMode} 
              onViewModeChange={setViewMode} 
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {viewMode === 'grid' ? (
          <FileGrid files={filteredFiles} />
        ) : (
          <FileList files={filteredFiles} />
        )}

        {filteredFiles.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-white font-medium mb-2">No files found</h3>
            <p className="text-gray-400 text-sm">
              {searchQuery
                ? 'Try adjusting your search terms'
                : 'Upload your first file to get started'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}