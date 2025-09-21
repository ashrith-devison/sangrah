import React from 'react';
import { StarredItem } from '@/types/starred';
import StarredHeader from '@/components/user/StarredHeader';
import StarredFilesView from '@/components/user/StarredFilesView';

export default function StarredFilesPage() {
  // Mock data for starred items
  const starredItems: StarredItem[] = [
    {
      id: '1',
      name: 'Q4 Marketing Strategy.pptx',
      type: 'file',
      fileType: 'presentation',
      size: '4.2 MB',
      starredDate: '2 days ago',
      lastModified: '1 hour ago',
      owner: 'Sarah Wilson',
      isShared: true,
      path: '/Projects/Marketing/Q4',
    },
    {
      id: '2',
      name: 'Important Documents',
      type: 'folder',
      size: '156.8 MB',
      starredDate: '1 week ago',
      lastModified: '3 hours ago',
      owner: 'You',
      isShared: false,
      path: '/Personal/Documents',
    },
    {
      id: '3',
      name: 'Budget Spreadsheet.xlsx',
      type: 'file',
      fileType: 'document',
      size: '2.1 MB',
      starredDate: '3 days ago',
      lastModified: '2 days ago',
      owner: 'Finance Team',
      isShared: true,
      path: '/Finance/2024',
    },
    {
      id: '4',
      name: 'Team Photo.jpg',
      type: 'file',
      fileType: 'image',
      size: '3.8 MB',
      starredDate: '5 days ago',
      lastModified: '1 week ago',
      owner: 'HR Department',
      isShared: true,
      path: '/Company/Events',
    },
    {
      id: '5',
      name: 'Project Demo.mp4',
      type: 'file',
      fileType: 'video',
      size: '89.4 MB',
      starredDate: '1 week ago',
      lastModified: '3 days ago',
      owner: 'Development Team',
      isShared: true,
      path: '/Projects/Demo',
    },
    {
      id: '6',
      name: 'Client Proposals',
      type: 'folder',
      size: '45.2 MB',
      starredDate: '2 weeks ago',
      lastModified: '4 days ago',
      owner: 'You',
      isShared: false,
      path: '/Business/Clients',
    },
  ];

  return (
    <div className="p-3 sm:p-4 lg:p-6">
      {/* Header Section */}
      <StarredHeader totalItems={starredItems.length} />

      {/* Starred Files View */}
      <StarredFilesView items={starredItems} />
    </div>
  );
}
