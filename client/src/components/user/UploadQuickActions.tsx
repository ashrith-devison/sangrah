'use client';

import React from 'react';
import { Plus, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UploadQuickActionsProps } from '@/types/upload';

export default function UploadQuickActions({
  onAddFiles,
  hasFiles,
}: UploadQuickActionsProps) {
  return (
    <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white text-sm">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start border-zinc-700 text-black"
          onClick={onAddFiles}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add More Files
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={!hasFiles}
          className="w-full justify-start border-zinc-700 text-black"
        >
          <Upload className="w-4 h-4 mr-2" />
          Start Upload
        </Button>
      </CardContent>
    </Card>
  );
}