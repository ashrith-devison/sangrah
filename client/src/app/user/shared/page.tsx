import React from 'react';
import { SharedItem } from '@/types/shared';
import SharedHeader from '@/components/user/SharedHeader';
import SharedFilesView from '@/components/user/SharedFilesView';

export default function Page() {
  return (
    <div className="p-3 sm:p-4 lg:p-6">
      {/* Header Section */}
      <SharedHeader />

      {/* Shared Files View */}
      <SharedFilesView />
    </div>
  );
}
