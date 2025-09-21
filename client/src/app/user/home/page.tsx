'use client';

import React from 'react';
import DriveView from '@/components/user/DriveView';

export default function Page() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <DriveView />
      </div>
    </div>
  );
}
