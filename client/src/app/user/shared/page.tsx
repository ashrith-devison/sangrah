import React from 'react';
import { SharedItem } from '@/types/shared';
import SharedHeader from '@/components/user/SharedHeader';
import SharedFilesView from '@/components/user/SharedFilesView';

export default function Page() {
  // Mock data for shared items
  const sharedWithMe: SharedItem[] = [
    {
      id: '1',
      name: 'Q4 Marketing Strategy.pptx',
      type: 'file',
      fileType: 'presentation',
      size: '4.2 MB',
      shared: '2 days ago',
      permissions: 'edit',
      sharedBy: 'Sarah Wilson',
      sharedWith: ['You', 'Mike Johnson', 'Alex Chen'],
      sharedDate: '2 days ago',
      lastAccessed: '1 hour ago',
      isPublic: false,
      accessCount: 15,
      starred: true,
    },
    {
      id: '2',
      name: 'Project Assets',
      type: 'folder',
      size: '156.8 MB',
      shared: '1 week ago',
      permissions: 'view',
      sharedBy: 'Design Team',
      sharedWith: ['You', '8 others'],
      sharedDate: '1 week ago',
      lastAccessed: '3 hours ago',
      isPublic: true,
      accessCount: 42,
      starred: false,
    },
    {
      id: '3',
      name: 'Budget Spreadsheet.xlsx',
      type: 'file',
      fileType: 'document',
      size: '2.1 MB',
      shared: '3 days ago',
      permissions: 'admin',
      sharedBy: 'Finance Team',
      sharedWith: ['You', 'Sarah Wilson', 'John Doe'],
      sharedDate: '3 days ago',
      lastAccessed: '2 days ago',
      isPublic: false,
      accessCount: 8,
      starred: false,
    },
    {
      id: '4',
      name: 'Meeting Recording.mp4',
      type: 'file',
      fileType: 'video',
      size: '89.4 MB',
      shared: '5 days ago',
      permissions: 'view',
      sharedBy: 'HR Department',
      sharedWith: ['You', 'All employees'],
      sharedDate: '5 days ago',
      lastAccessed: '1 day ago',
      isPublic: true,
      accessCount: 127,
      starred: true,
    },
  ];

  const sharedByMe: SharedItem[] = [
    {
      id: '5',
      name: 'API Documentation',
      type: 'folder',
      size: '23.7 MB',
      shared: '1 day ago',
      permissions: 'admin',
      sharedBy: 'You',
      sharedWith: ['Development Team', '12 members'],
      sharedDate: '1 day ago',
      lastAccessed: '30 minutes ago',
      isPublic: true,
      accessCount: 67,
      starred: false,
    },
    {
      id: '6',
      name: 'Client Proposal.pdf',
      type: 'file',
      fileType: 'document',
      size: '3.8 MB',
      shared: '4 days ago',
      permissions: 'admin',
      sharedBy: 'You',
      sharedWith: ['Client Team', 'Sarah Wilson'],
      sharedDate: '4 days ago',
      lastAccessed: '2 hours ago',
      isPublic: false,
      accessCount: 24,
      starred: true,
    },
  ];

  return (
    <div className="p-3 sm:p-4 lg:p-6">
      {/* Header Section */}
      <SharedHeader />

      {/* Shared Files View */}
      <SharedFilesView sharedWithMe={sharedWithMe} sharedByMe={sharedByMe} />
    </div>
  );
}
