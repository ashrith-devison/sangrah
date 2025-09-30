'use client';

import React from 'react';
import DriveStatsFromApi from '@/components/user/DriveStatsFromApi';

export default function Page() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Drive stats from API */}
        <React.Suspense fallback={<div className="text-gray-400">Loading drive stats...</div>}>
          {/* @ts-ignore */}
          <DriveStatsFromApi />
        </React.Suspense>
      </div>
    </div>
  );
}
