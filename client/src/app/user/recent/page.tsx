import React from 'react';
import { RecentFile } from '@/types/recent';
import RecentHeader from '@/components/user/RecentHeader';
import RecentFilesView from '@/components/user/RecentFilesView';

export default function RecentFilesPage() {
  // Mock data for recent files
  const recentFiles: RecentFile[] = [
    {
      id: 1,
      name: 'Q4 Financial Report.pdf',
      type: 'document',
      size: '2.4 MB',
      modified: '10 minutes ago',
      opened: '10 minutes ago',
      shared: true,
      starred: false,
      folder: 'Documents',
      owner: 'You',
    },
    {
      id: 2,
      name: 'Team Meeting Recording.mp4',
      type: 'video',
      size: '156.8 MB',
      modified: '2 hours ago',
      opened: '2 hours ago',
      shared: true,
      starred: true,
      folder: 'Meetings',
      owner: 'John Doe',
    },
    {
      id: 3,
      name: 'Project Wireframes.sketch',
      type: 'design',
      size: '8.9 MB',
      modified: '5 hours ago',
      opened: '5 hours ago',
      shared: false,
      starred: false,
      folder: 'Design',
      owner: 'You',
    },
    {
      id: 4,
      name: 'Database Backup.zip',
      type: 'archive',
      size: '245.6 MB',
      modified: '1 day ago',
      opened: '1 day ago',
      shared: false,
      starred: false,
      folder: 'Backups',
      owner: 'You',
    },
    {
      id: 5,
      name: 'Marketing Assets.psd',
      type: 'image',
      size: '45.2 MB',
      modified: '2 days ago',
      opened: '2 days ago',
      shared: true,
      starred: true,
      folder: 'Marketing',
      owner: 'Sarah Wilson',
    },
    {
      id: 6,
      name: 'Podcast Episode 15.mp3',
      type: 'audio',
      size: '67.4 MB',
      modified: '3 days ago',
      opened: '3 days ago',
      shared: false,
      starred: false,
      folder: 'Podcasts',
      owner: 'You',
    },
    {
      id: 7,
      name: 'API Documentation.docx',
      type: 'document',
      size: '1.2 MB',
      modified: '4 days ago',
      opened: '4 days ago',
      shared: true,
      starred: false,
      folder: 'Documentation',
      owner: 'Mike Johnson',
    },
    {
      id: 8,
      name: 'User Interface Mockups.fig',
      type: 'design',
      size: '12.7 MB',
      modified: '1 week ago',
      opened: '1 week ago',
      shared: true,
      starred: true,
      folder: 'Design',
      owner: 'You',
    },
    {
      id: 9,
      name: 'Conference Presentation.pptx',
      type: 'presentation',
      size: '18.3 MB',
      modified: '1 week ago',
      opened: '1 week ago',
      shared: false,
      starred: false,
      folder: 'Presentations',
      owner: 'You',
    },
    {
      id: 10,
      name: 'Product Demo Video.mov',
      type: 'video',
      size: '89.1 MB',
      modified: '2 weeks ago',
      opened: '2 weeks ago',
      shared: true,
      starred: false,
      folder: 'Marketing',
      owner: 'Alex Chen',
    },
  ];

  return (
    <div className="p-3 sm:p-4 lg:p-6">
      {/* Header Section */}
      <RecentHeader fileCount={recentFiles.length} />

      {/* Files View */}
      <RecentFilesView files={recentFiles} />
    </div>
  );
}
