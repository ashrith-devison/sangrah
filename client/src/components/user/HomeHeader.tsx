'use client';

import { Upload, FolderPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAuth } from '@/stores/hooks';
import { useEffect, useState } from 'react';

export default function HomeHeader() {
  const { user } = useAuth();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Render loading state during SSR and hydration
  if (!isClient) {
    return (
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome back, User! 👋
            </h1>
            <p className="text-gray-400">
              Manage your files with intelligent deduplication and secure
              sharing
            </p>
          </div>
          <div className="flex gap-3">
            <Button className="bg-gradient-to-r from-[#6e73fa] to-[#5e5e5e] text-white">
              <FolderPlus className="w-4 h-4 mr-2" />
              New Folder
            </Button>
            <Link href="/user/upload">
              <Button className="bg-gradient-to-r from-[#6e73fa] to-[#5e5e5e] text-white">
                <Upload className="w-4 h-4 mr-2" />
                Upload Files
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {user?.name || 'User'}! 👋
          </h1>
          <p className="text-gray-400">
            Manage your files with intelligent deduplication and secure
            sharing
          </p>
        </div>
        <div className="flex gap-3">
          <Button className="bg-gradient-to-r from-[#6e73fa] to-[#5e5e5e] text-white">
            <FolderPlus className="w-4 h-4 mr-2" />
            New Folder
          </Button>
          <Link href="/user/upload">
            <Button className="bg-gradient-to-r from-[#6e73fa] to-[#5e5e5e] text-white">
              <Upload className="w-4 h-4 mr-2" />
              Upload Files
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}