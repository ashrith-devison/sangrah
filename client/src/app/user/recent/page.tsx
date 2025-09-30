"use client";

import React, { useEffect, useState } from 'react';
import RecentHeader from '@/components/user/RecentHeader';
import RecentFilesView from '@/components/user/RecentFilesView';
import { useRecentFiles } from '@/hooks/useRecentFiles';
import { useUserStore } from '@/stores/userStore';

export default function RecentFilesPage() {
  const [username, setUsername] = useState('');
  const zustandUser = useUserStore((state) => state.user);
  useEffect(() => {
    let name = '';
    if (typeof window !== 'undefined') {
      name = localStorage.getItem('auth_username') || '';
      if (!name && zustandUser?.name) {
        name = zustandUser.name;
        console.log('Fallback to Zustand user name:', name);
      }
      setUsername(name);
      console.log('Loaded username for recent files:', name);
    }
  }, [zustandUser]);
  const { recentFiles, loading, error } = useRecentFiles(username);

  return (
    <div className="p-3 sm:p-4 lg:p-6">
      <RecentHeader fileCount={recentFiles.length} />
      {/* Loading spinner now handled in EmptyState */}
      {error && <div className="text-red-400">{error}</div>}
  <RecentFilesView files={recentFiles} loading={loading} />
    </div>
  );
}
