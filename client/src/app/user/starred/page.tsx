import React from 'react';
import StarredFilesView from '@/components/user/StarredFilesView';

export default function StarredFilesPage() {
  return (
    <div className="p-3 sm:p-4 lg:p-6">
      {/* Starred Files View with API integration */}
      <StarredFilesView />
    </div>
  );
}
