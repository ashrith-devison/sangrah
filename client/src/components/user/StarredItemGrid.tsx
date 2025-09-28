'use client';

import React from 'react';
import {
  FileText,
  Image,
  Video,
  Music,
  Archive,
  Download,
  Share2,
  Trash2,
  Eye,
  Clock,
  Users,
  Star,
  Folder,
  Copy,
  Settings,
  StarOff,
  MoreVertical,
  ExternalLink,
} from 'lucide-react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { StarredItemGridProps, StarredItem } from '@/types/starred';
import api from '@/lib/api';
import { toast } from 'sonner';
import { useUserStore } from '@/stores/userStore';

// Component to handle authenticated iframe loading with browser compatibility
function PreviewFrame({ item, getPreviewUrl }: { item: StarredItem; getPreviewUrl: (item: StarredItem) => Promise<{ url: string; mimeType: string } | null> }) {
  const [blobUrl, setBlobUrl] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [mimeType, setMimeType] = React.useState<string>('');
  const [isEmbeddable, setIsEmbeddable] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    
    const loadPreview = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await getPreviewUrl(item);
        
        if (mounted) {
          if (result && result.url) {
            setBlobUrl(result.url);
            setMimeType(result.mimeType || '');
            
            // Check if file type is embeddable in iframe
            const embeddableTypes = [
              'text/', 'image/', 'application/pdf',
              'video/', 'audio/', 'application/json'
            ];
            const isEmbeddableType = embeddableTypes.some(type => 
              result.mimeType?.startsWith(type)
            );
            setIsEmbeddable(isEmbeddableType);
          } else {
            setError('Failed to load preview');
          }
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError('Failed to load preview');
          setLoading(false);
        }
      }
    };

    loadPreview();

    return () => {
      mounted = false;
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [item, getPreviewUrl]);

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-zinc-800/50 rounded-md">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
          <div className="text-white text-sm">Loading preview...</div>
        </div>
      </div>
    );
  }

  if (error || !blobUrl) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-zinc-800/50 rounded-md">
        <div className="flex flex-col items-center gap-3">
          <Eye className="w-12 h-12 text-red-400" />
          <div className="text-red-400 text-sm text-center">
            <div>Failed to load preview</div>
            <div className="text-xs text-gray-500 mt-1">File type may not be supported</div>
          </div>
        </div>
      </div>
    );
  }

  // Handle different file types for better browser compatibility
  if (!isEmbeddable) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-zinc-800/50 rounded-md">
        <div className="flex flex-col items-center gap-4">
          <FileText className="w-16 h-16 text-blue-400" />
          <div className="text-center">
            <div className="text-white font-medium">{item.name}</div>
            <div className="text-gray-400 text-sm mt-1">Preview not available for this file type</div>
            <div className="text-xs text-gray-500 mt-1">MIME: {mimeType}</div>
          </div>
          <button
            onClick={() => window.open(blobUrl, '_blank')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm transition-colors"
          >
            Open in New Tab
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative bg-white rounded-md overflow-hidden">
      <iframe
        src={blobUrl}
        className="w-full h-full border-0 bg-white"
        title={`Preview of ${item.name}`}
        sandbox="allow-same-origin allow-scripts allow-forms allow-downloads"
        loading="lazy"
        style={{ minHeight: '400px' }}
        onLoad={() => {
          console.log('Iframe loaded successfully for:', item.name);
        }}
        onError={(e) => {
          console.error('Iframe failed to load:', e);
          setError('Iframe failed to load content');
        }}
      />
      {/* Fallback overlay for iframe loading issues */}
      <div className="absolute top-2 right-2 z-10">
        <button
          onClick={() => window.open(blobUrl, '_blank')}
          className="p-1 bg-black/50 hover:bg-black/70 text-white rounded text-xs transition-colors"
          title="Open in new tab"
        >
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

export default function StarredItemGrid({
  items,
  onRemoveStar,
}: StarredItemGridProps) {
  const { user } = useUserStore();
  const [previewItem, setPreviewItem] = React.useState<StarredItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  // Handle file actions
  const handleAction = async (action: string, item: StarredItem) => {
    const username = user?.name ;
    
    switch (action) {
      case 'view':
        handlePreview(item);
        break;
      case 'openNewTab':
        handleOpenNewTab(item);
        break;
      case 'download':
        handleDownload(item);
        break;
      case 'share':
        handleShare(item);
        break;
      case 'unstar':
        onRemoveStar(item.id);
        break;
      default:
        console.log('Unknown action:', action);
    }
  };

  const handlePreview = async (item: StarredItem) => {
    try {
      setPreviewItem(item);
      setIsDialogOpen(true);
      
      console.log('File preview opened in dialog:', item.name);
    } catch (error) {
      console.error('Preview failed:', error);
      toast.error(`Cannot preview "${item.name}"`);
    }
  };

  // Create authenticated blob URL for preview with detailed response
  const getPreviewUrl = async (item: StarredItem): Promise<{ url: string; mimeType: string } | null> => {
    try {
      const fileExtension = item.name.split('.').pop() || '';
      const pathParam = fileExtension ? `${item.shaFileId}.${fileExtension}` : item.shaFileId || item.name;
      
      const response = await fetch(`${api.defaults.baseURL || 'http://localhost:8080'}/v1/file/path/view?path=${encodeURIComponent(pathParam)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
        },
      });
      
      if (response.ok) {
        const contentType = response.headers.get('Content-Type') || 'application/octet-stream';
        const blob = await response.blob();
        
        // Ensure the blob has the correct MIME type for better browser compatibility
        const typedBlob = new Blob([blob], { type: contentType });
        
        return {
          url: URL.createObjectURL(typedBlob),
          mimeType: contentType
        };
      } else {
        console.error('Failed to fetch file for preview:', response.status, response.statusText);
        return null;
      }
    } catch (error) {
      console.error('Error creating preview URL:', error);
      return null;
    }
  };

  const handleOpenNewTab = async (item: StarredItem) => {
    try {
      const fileExtension = item.name.split('.').pop() || '';
      const pathParam = fileExtension ? `${item.shaFileId}.${fileExtension}` : item.shaFileId || item.name;
      
      // Show loading toast
      const loadingToast = toast.loading(`Opening "${item.name}"...`);
      
      const response = await fetch(`${api.defaults.baseURL || 'http://localhost:8080'}/v1/file/path/view?path=${encodeURIComponent(pathParam)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
        },
      });
      
      toast.dismiss(loadingToast);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        
        // Open in new tab
        const newWindow = window.open(url, '_blank');
        
        if (!newWindow) {
          toast.error('Failed to open new tab. Please check your popup blocker settings.');
          URL.revokeObjectURL(url);
        } else {
          toast.success(`"${item.name}" opened in new tab`);
          // Clean up the blob URL after a delay
          setTimeout(() => URL.revokeObjectURL(url), 10000);
        }
      } else {
        throw new Error(`Failed to fetch file: ${response.status}`);
      }
      
      console.log('File opened in new tab:', item.name);
    } catch (error) {
      console.error('Open in new tab failed:', error);
      toast.error(`Cannot open "${item.name}" in new tab`);
    }
  };

  const handleDownload = async (item: StarredItem) => {
    try {
      // Extract file extension from filename
      const fileExtension = item.name.split('.').pop() || '';
      
      // Use shaFileId with extension as required by the API
      const pathParam = fileExtension ? `${item.shaFileId}.${fileExtension}` : item.shaFileId || item.name;
      
      // Create download URL
      const baseURL = api.defaults.baseURL || 'http://localhost:8080';
      const downloadUrl = `${baseURL}/v1/file/path/download?path=${encodeURIComponent(pathParam)}`;
      
      // Get auth token for the request
      const token = localStorage.getItem('auth_token');
      
      // Create a fetch request with auth headers
      const response = await fetch(downloadUrl, {
        method: 'GET',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        
        // Create a temporary link and trigger download
        const link = document.createElement('a');
        link.href = url;
        link.download = item.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up the blob URL
        window.URL.revokeObjectURL(url);
        
        toast.success(`"${item.name}" downloaded successfully`);
        console.log('File downloaded successfully:', item.name);
      } else {
        throw new Error(`Download failed with status: ${response.status}`);
      }
    } catch (error) {
      console.error('Download failed:', error);
      toast.error(`Failed to download "${item.name}"`);
    }
  };

  const handleShare = async (item: StarredItem) => {
    try {
      const username = user?.name || user?.email || 'ashrith-sai';
      if (!username) {
        toast.error('User not authenticated');
        return;
      }

      // Show loading toast
      const loadingToast = toast.loading(`Generating share link for "${item.name}"...`);

      // Generate public share link
      const response = await api.post('/v1/file/public-share', {
        filename: item.name,
        username: username
      });

      // Dismiss loading toast
      toast.dismiss(loadingToast);

      if (response.data.status === 'success' && response.data.data) {
        const publicUrl = response.data.data.publicUrl;
        
        // Copy to clipboard
        try {
          await navigator.clipboard.writeText(publicUrl);
          toast.success(`Share link for "${item.name}" copied to clipboard!`);
        } catch (clipboardError) {
          // Fallback for older browsers
          const textArea = document.createElement('textarea');
          textArea.value = publicUrl;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          toast.success(`Share link for "${item.name}" copied to clipboard!`);
        }
        
        console.log('Share link generated:', publicUrl);
      } else {
        throw new Error(response.data.message || 'Failed to generate share link');
      }
    } catch (error) {
      console.error('Share failed:', error);
      toast.error(`Failed to generate share link for "${item.name}"`);
    }
  };

  const getFileIcon = (item: StarredItem) => {
    if (item.type === 'folder') return Folder;

    switch (item.fileType) {
      case 'document':
      case 'presentation':
        return FileText;
      case 'image':
        return Image;
      case 'video':
        return Video;
      case 'audio':
        return Music;
      case 'archive':
        return Archive;
      default:
        return FileText;
    }
  };

  const getFileColor = (item: StarredItem) => {
    if (item.type === 'folder') return 'text-blue-400';

    switch (item.fileType) {
      case 'document':
        return 'text-blue-400';
      case 'presentation':
        return 'text-orange-400';
      case 'image':
        return 'text-green-400';
      case 'video':
        return 'text-purple-400';
      case 'audio':
        return 'text-pink-400';
      case 'archive':
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4">
      {items.map(item => {
        const ItemIcon = getFileIcon(item);
        const iconColor = getFileColor(item);

        return (
          <ContextMenu key={item.id}>
            <ContextMenuTrigger>
              <div 
                className="group bg-zinc-800/30 hover:bg-zinc-800/50 border border-zinc-700 rounded-xl p-3 sm:p-4 cursor-pointer transition-all hover:border-[#6e73fa]/50 min-w-0 w-full"
                onClick={() => handleAction('view', item)}
              >
                <div className="flex items-start justify-between mb-2 sm:mb-3">
                  <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <ItemIcon
                          className={`w-6 h-6 sm:w-8 sm:h-8 ${iconColor} flex-shrink-0`}
                        />
                      </TooltipTrigger>
                      <TooltipContent className="bg-zinc-800 border-zinc-700">
                        <p className="text-white">
                          {item.type === 'folder'
                            ? 'Starred folder'
                            : `${item.fileType} file`}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                    {item.isShared && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Users className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400 flex-shrink-0" />
                        </TooltipTrigger>
                        <TooltipContent className="bg-zinc-800 border-zinc-700">
                          <p className="text-white">Shared item</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                    {/* Star indicator - always visible */}
                    <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current flex-shrink-0" />
                    
                    {/* Dropdown menu - visible on hover */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-zinc-700/50"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="w-4 h-4 text-gray-400 hover:text-white" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-zinc-800 border-zinc-700 w-48">
                        <DropdownMenuItem
                          className="text-white hover:bg-zinc-700 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAction('view', item);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-white hover:bg-zinc-700 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAction('openNewTab', item);
                          }}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Open in New Tab
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-white hover:bg-zinc-700 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAction('download', item);
                          }}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-white hover:bg-zinc-700 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAction('share', item);
                          }}
                        >
                          <Share2 className="w-4 h-4 mr-2" />
                          Share
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-zinc-700" />
                        <DropdownMenuItem
                          className="text-yellow-400 hover:bg-zinc-700 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAction('unstar', item);
                          }}
                        >
                          <StarOff className="w-4 h-4 mr-2" />
                          Remove Star
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <h3
                  className="text-white font-medium text-xs sm:text-sm mb-1 sm:mb-2 truncate leading-tight"
                  title={item.name}
                >
                  {item.name}
                </h3>
                <div className="space-y-0.5 sm:space-y-1 text-xs text-gray-400">
                  <div className="flex items-center justify-between">
                    <span className="text-xs">{item.size}</span>
                    <span className="text-xs truncate">{item.path}</span>
                  </div>
                  <div className="flex items-center">
                    <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1 text-yellow-400" />
                    <span className="text-xs truncate">
                      Starred {item.starredDate}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
                    <span className="text-xs truncate">
                      Modified {item.lastModified}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Users className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
                    <span className="text-xs truncate">by {item.owner}</span>
                  </div>
                </div>
              </div>
            </ContextMenuTrigger>
            <ContextMenuContent className="bg-zinc-800 border-zinc-700">
              <ContextMenuItem
                className="text-white hover:bg-zinc-700 cursor-pointer"
                onClick={() => handleAction('view', item)}
              >
                <Eye className="w-4 h-4 mr-2" />
                View
              </ContextMenuItem>
              <ContextMenuItem
                className="text-white hover:bg-zinc-700 cursor-pointer"
                onClick={() => handleAction('openNewTab', item)}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open in New Tab
              </ContextMenuItem>
              <ContextMenuItem
                className="text-white hover:bg-zinc-700 cursor-pointer"
                onClick={() => handleAction('download', item)}
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </ContextMenuItem>
              <ContextMenuItem
                className="text-white hover:bg-zinc-700 cursor-pointer"
                onClick={() => handleAction('share', item)}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </ContextMenuItem>
              <ContextMenuSeparator className="bg-zinc-700" />
              <ContextMenuItem
                className="text-yellow-400 hover:bg-zinc-700 cursor-pointer"
                onClick={() => handleAction('unstar', item)}
              >
                <StarOff className="w-4 h-4 mr-2" />
                Remove Star
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        );
      })}
      
      {/* File Preview Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-5xl w-[95vw] h-[85vh] bg-zinc-900 border-zinc-700 p-0 gap-0">
          <DialogHeader className="p-4 pb-2 border-b border-zinc-700">
            <DialogTitle className="text-white text-left flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-400" />
              {previewItem?.name || 'File Preview'}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 p-4 overflow-hidden">
            <div className="w-full h-full rounded-md border border-zinc-700 overflow-hidden bg-white">
              {previewItem && (
                <PreviewFrame item={previewItem} getPreviewUrl={getPreviewUrl} />
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}