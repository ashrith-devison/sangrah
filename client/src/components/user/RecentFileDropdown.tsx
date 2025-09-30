
import React, { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Eye, Download, Share2, MoreHorizontal, Star, Trash2, FileText } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import api from '@/lib/api';
import { RecentFile } from '@/types/recent';
import { toast } from 'sonner';

type RecentFileDropdownAction = 'view' | 'download' | 'share' | 'star' | 'rename' | 'openInNewTab' | 'delete';
interface RecentFileDropdownProps {
  file: RecentFile;
  onStar: (file: RecentFile) => void;
  onDelete: (file: RecentFile) => void;
  onRename?: (file: RecentFile) => void;
  triggerClassName?: string;
  actions?: RecentFileDropdownAction[];
}

  export const RecentFileDropdown = (props: RecentFileDropdownProps) => {
    const { file, onStar, onDelete, onRename, triggerClassName, actions = ['view', 'download', 'share', 'star', 'rename', 'openInNewTab', 'delete'] } = props;
  // All hooks must be inside the component
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  // Private share dialog state
  const [privateShareOpen, setPrivateShareOpen] = useState(false);

  // Handler for private share
  const handlePrivateShare = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target as typeof e.target & { recipient: { value: string }, permission: { value: string } };
    const recipient = form.recipient.value.trim();
    const permission = form.permission.value;
    if (!recipient) {
      toast.error('Recipient is required');
      return;
    }
    try {
      const owner = file.owner || localStorage.getItem('username') || '';
      const res = await api.post('/v1/file/share', {
        fileId: file.fileId,
        filename: file.filename,
        owner,
        permission,
        recipient,
      });
      if (res.data && res.data.success) {
        toast.success('File shared successfully');
        setPrivateShareOpen(false);
      } else {
        throw new Error(res.data?.message || 'Failed to share file');
      }
    } catch (err) {
      toast.error('Failed to share file: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const handleView = () => {
    const fileExtension = file.filename && file.filename.includes('.') ? file.filename.split('.').pop() : '';
    if (!file.fileId || !fileExtension) {
      toast.error('File cannot be previewed: missing fileId or file extension');
      return;
    }
    toast.loading('Fetching file for preview...');
    const pathParam = `${file.fileId}.${fileExtension}`;
    const viewUrl = `/v1/file/path/view?path=${encodeURIComponent(pathParam)}`;
    const token = localStorage.getItem('auth_token');
    api.get(viewUrl, {
      headers: {
        accept: '*/*',
        Authorization: `Bearer ${token}`,
      },
      responseType: 'blob',
    })
      .then(res => {
        toast.dismiss();
        toast.success('File ready to preview!');
        const blobUrl = URL.createObjectURL(res.data);
        setPreviewUrl(blobUrl);
        setShowPreview(true);
      })
      .catch(err => {
        toast.dismiss();
        toast.error('Failed to preview file: ' + err.message);
      });
  };

  const handleDownload = async () => {
    try {
      const fileExtension = file.filename && file.filename.includes('.') ? file.filename.split('.').pop() : '';
      if (!file.fileId || !fileExtension) {
        toast.error('File cannot be downloaded: missing fileId or file extension');
        return;
      }
      toast.loading('Downloading file...');
      const pathParam = `${file.fileId}.${fileExtension}`;
      const downloadUrl = `${api.defaults.baseURL}/v1/file/path/download?path=${encodeURIComponent(pathParam)}`;
      const token = localStorage.getItem('auth_token');
      const response = await fetch(downloadUrl, {
        method: 'GET',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      if (response.ok) {
        toast.dismiss();
        toast.success('File downloaded!');
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = file.filename || 'download';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        toast.dismiss();
        throw new Error(`Download failed with status: ${response.status}`);
      }
    } catch (error) {
      toast.dismiss();
      toast.error('Download failed: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  const handleOpenInNewTab = () => {
    const fileExtension = file.filename && file.filename.includes('.') ? file.filename.split('.').pop() : '';
    if (!file.fileId || !fileExtension) {
      toast.error('File cannot be opened: missing fileId or file extension');
      return;
    }
    toast.loading('Opening file in new tab...');
    const pathParam = `${file.fileId}.${fileExtension}`;
    const viewUrl = `/v1/file/path/view?path=${encodeURIComponent(pathParam)}`;
    const token = localStorage.getItem('auth_token');
    api.get(viewUrl, {
      headers: {
        accept: '*/*',
        Authorization: `Bearer ${token}`,
      },
      responseType: 'blob',
    })
      .then(res => {
        toast.dismiss();
        toast.success('File opened in new tab!');
        const blobUrl = URL.createObjectURL(res.data);
        const previewWindow = window.open('', '_blank');
        if (previewWindow) {
          previewWindow.document.write(
            `<html><body style='margin:0'><iframe src='${blobUrl}' style='width:100vw;height:100vh;border:none'></iframe></body></html>`
          );
        } else {
          window.location.href = blobUrl;
        }
      })
      .catch(err => {
        toast.dismiss();
        toast.error('Failed to open file in new tab: ' + err.message);
      });
  };

          // Share logic adapted from DriveView
          // Rename logic
          const [renameModalOpen, setRenameModalOpen] = useState(false);
          const [newFileName, setNewFileName] = useState(file.filename || file.name || '');
          const [isRenaming, setIsRenaming] = useState(false);

          const handleRename = () => {
            setRenameModalOpen(true);
            setNewFileName(file.filename || file.name || '');
          };

          const submitRename = async () => {
            let username = localStorage.getItem('username');
            if (!username) username = file.owner || '';
            if (!file.filename && !file.name) {
              toast.error('Missing filename');
              return;
            }
            if (!newFileName.trim()) {
              toast.error('Please enter a new file name');
              return;
            }
            setIsRenaming(true);
            try {
              const response = await api.post('/v1/file/rename', {
                filename: file.filename || file.name,
                newName: newFileName.trim(),
                username
              });
              if (response.data.status === 'success') {
                toast.success(`File renamed to "${newFileName.trim()}"`);
                setRenameModalOpen(false);
                if (typeof onRename === 'function') onRename({ ...file, filename: newFileName.trim(), name: newFileName.trim() });
              } else {
                throw new Error(response.data.message || 'Failed to rename file');
              }
            } catch (error) {
              toast.error('Rename failed: ' + (error instanceof Error ? error.message : String(error)));
            } finally {
              setIsRenaming(false);
            }
          };
          const [shareModalOpen, setShareModalOpen] = useState(false);
          const [publicLink, setPublicLink] = useState('');
          const [shareToken, setShareToken] = useState('');
          const [isGeneratingLink, setIsGeneratingLink] = useState(false);
          const [linkCopied, setLinkCopied] = useState(false);

          const handleShare = () => {
            setShareModalOpen(true);
            setPublicLink('');
            setShareToken('');
            setLinkCopied(false);
          };

          const generatePublicLink = async () => {
            // Ensure both filename and username are present
            const filename = file.filename || file.name;
            let username = localStorage.getItem('username');
            if (!username) {
              username = file.owner || '';
            }
            if (!file.fileId || !filename || !username) {
              toast.error('Cannot share: missing filename or username');
              return;
            }
            setIsGeneratingLink(true);
            try {
              const response = await api.post('/v1/file/public-share', {
                filename,
                username
              });
              if (response.data.status === 'success' && response.data.data) {
                setPublicLink(response.data.data.publicUrl);
                setShareToken(response.data.data.token || '');
              } else if (response.data.publicUrl) {
                setPublicLink(response.data.publicUrl);
                setShareToken(response.data.token || '');
              } else if (response.status === 200 && response.data.publicUrl) {
                setPublicLink(response.data.publicUrl);
                setShareToken(response.data.token || '');
              } else {
                throw new Error(response.data.message || 'Failed to generate public link');
              }
            } catch (error) {
              toast.error('Failed to generate public link. Please try again.');
            } finally {
              setIsGeneratingLink(false);
            }
          };

          const copyToClipboard = async () => {
            if (!publicLink) return;
            try {
              await navigator.clipboard.writeText(publicLink);
              setLinkCopied(true);
              setTimeout(() => setLinkCopied(false), 2000);
            } catch (error) {
              // Fallback for older browsers
              const textArea = document.createElement('textarea');
              textArea.value = publicLink;
              document.body.appendChild(textArea);
              textArea.select();
              document.execCommand('copy');
              document.body.removeChild(textArea);
              setLinkCopied(true);
              setTimeout(() => setLinkCopied(false), 2000);
            }
          };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={triggerClassName || 'p-1 sm:p-2 bg-transparent hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-100 shadow-none'}
            aria-label="File actions"
            style={{ minWidth: 0, minHeight: 0, lineHeight: 1 }}
          >
            <MoreHorizontal className="w-5 h-5 text-zinc-700 dark:text-zinc-100" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-zinc-800 border-zinc-700">
          {actions.includes('view') && (
            <DropdownMenuItem className="text-white hover:bg-zinc-700" onClick={handleView}>
              <Eye className="w-4 h-4 mr-2" />
              View
            </DropdownMenuItem>
          )}
          {actions.includes('download') && (
            <DropdownMenuItem className="text-white hover:bg-zinc-700" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </DropdownMenuItem>
          )}
          {actions.includes('share') && (
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="text-white hover:bg-zinc-700">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="bg-zinc-800 border-zinc-700">
                <DropdownMenuItem className="text-white hover:bg-zinc-700" onClick={handleShare}>
                  as public
                </DropdownMenuItem>
                <DropdownMenuItem className="text-white hover:bg-zinc-700" onClick={() => setPrivateShareOpen(true)}>
                  as private with others
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          )}
          {actions.includes('rename') && (
            <DropdownMenuItem
              className="text-white hover:bg-zinc-700"
              onClick={e => {
                e.preventDefault();
                e.stopPropagation();
                handleRename();
              }}
            >
              <FileText className="w-4 h-4 mr-2" />
              Rename
            </DropdownMenuItem>
          )}
          {actions.includes('openInNewTab') && (
            <DropdownMenuItem className="text-white hover:bg-zinc-700" onClick={handleOpenInNewTab}>
              <MoreHorizontal className="w-4 h-4 mr-2" />
              Open in New Tab
            </DropdownMenuItem>
          )}
          {actions.includes('star') && (
            <DropdownMenuItem className="text-white hover:bg-zinc-700" onClick={async () => {
                // Toggle star using API
                const currentStarred = file.starred || false;
                const newStarred = !currentStarred;
                let username = localStorage.getItem('username');
                if (!username) username = file.owner || '';
                try {
                  const response = await api.post('/v1/file/update-info', {
                    username,
                    filename: file.filename || file.name,
                    starred: newStarred
                  });
                  if (response.data.status === 'success') {
                    toast.success(newStarred ? `"${file.filename || file.name}" added to starred files` : `"${file.filename || file.name}" removed from starred files`);
                    if (typeof onStar === 'function') onStar({ ...file, starred: newStarred });
                  } else {
                    throw new Error(response.data.message || 'Failed to update star status');
                  }
                } catch (error) {
                  toast.error('Failed to update star status: ' + (error instanceof Error ? error.message : String(error)));
                }
              }}>
              <Star className="w-4 h-4 mr-2" />
              {file.starred ? 'Unstar' : 'Star'}
            </DropdownMenuItem>
          )}
          {actions.includes('delete') && (
            <>
              <DropdownMenuSeparator className="bg-zinc-700" />
              <DropdownMenuItem
                className="text-red-400 hover:bg-zinc-700"
                onClick={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const filename = file.filename || file.name;
                  let username = localStorage.getItem('username');
                  if (!username) username = file.owner || '';
                  if (!filename || !username) {
                    toast.error('Missing filename or username');
                    return;
                  }
                  if (window.confirm(`Are you sure you want to delete "${filename}"?`)) {
                    try {
                      const response = await api.post('/v1/file/delete-filename', {
                        filename,
                        username
                      });
                      if (response.data.status === 'success') {
                        toast.success(`"${filename}" deleted successfully`);
                        if (typeof onDelete === 'function') onDelete(file);
                      } else {
                        throw new Error(response.data.message || 'Delete failed');
                      }
                    } catch (error) {
                      toast.error('Delete failed: ' + (error instanceof Error ? error.message : String(error)));
                    }
                  }
                }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Modals/Sheets at the root of the fragment */}
      {showPreview && previewUrl && (
        <Sheet open={showPreview} onOpenChange={open => { if (!open) setShowPreview(false); }}>
          <SheetContent side="right" className="w-full sm:w-[540px] md:w-[700px] bg-zinc-950 border-l border-zinc-800 p-0 flex flex-col">
            <SheetHeader className="p-6 pb-2 border-b border-zinc-800 flex items-center justify-between relative">
              <SheetTitle className="text-white flex items-center gap-2 text-lg font-semibold">
                <Eye className="w-5 h-5 text-blue-500" />
                {file.filename}
              </SheetTitle>
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-white p-2 rounded-full"
                onClick={() => setShowPreview(false)}
                aria-label="Close preview"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </SheetHeader>
            <div className="flex-1 flex items-center justify-center bg-zinc-900">
              <iframe src={previewUrl} style={{ width: '95%', height: '90%', border: 'none', background: 'white', borderRadius: '0.5rem', boxShadow: '0 2px 16px rgba(0,0,0,0.12)' }} title="File Preview" />
            </div>
          </SheetContent>
        </Sheet>
      )}
      {/* Share Modal */}
      <Sheet open={shareModalOpen} onOpenChange={open => {
        setShareModalOpen(open);
        if (!open) {
          setPublicLink('');
          setShareToken('');
          setLinkCopied(false);
        }
      }}>
        <SheetContent side="right" className="w-full sm:w-[400px] md:w-[540px] bg-white dark:bg-black border-gray-200 dark:border-zinc-800 p-4 sm:p-6">
          <SheetHeader className="pb-4">
            <SheetTitle className="text-gray-900 dark:text-white flex items-center gap-2 text-lg font-semibold">
              <Share2 className="w-5 h-5 text-blue-600" />
              Share File
            </SheetTitle>
          </SheetHeader>
          <div className="space-y-6">
            {/* File Info */}
            <div className="p-4 bg-gray-50 dark:bg-zinc-900/50 rounded-lg border border-gray-200 dark:border-zinc-800">
              <h3 className="text-gray-900 dark:text-white font-semibold mb-3 text-sm uppercase tracking-wide">File to share</h3>
              <div className="bg-white dark:bg-zinc-800 px-4 py-3 rounded-md border border-gray-200 dark:border-zinc-700">
                <p className="text-gray-800 dark:text-gray-200 font-mono text-sm break-all">{file.filename}</p>
              </div>
            </div>
            {/* Public Link Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-gray-900 dark:text-white font-semibold text-sm uppercase tracking-wide">Public Link</h3>
                {!publicLink && (
                  <Button
                    onClick={generatePublicLink}
                    disabled={isGeneratingLink}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm"
                  >
                    {isGeneratingLink ? 'Generating...' : 'Generate Link'}
                  </Button>
                )}
              </div>
              {publicLink && (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      value={publicLink}
                      readOnly
                      className="bg-gray-50 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white font-mono text-sm flex-1 px-2 py-1 rounded"
                    />
                    <Button
                      onClick={copyToClipboard}
                      variant="outline"
                      className="px-3 border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                    >
                      {linkCopied ? '✓' : 'Copy'}
                    </Button>
                  </div>
                  {linkCopied && (
                    <p className="text-green-600 dark:text-green-400 text-sm font-medium">✓ Link copied to clipboard!</p>
                  )}
                  {/* Show token for debugging/advanced users */}
                  {shareToken && (
                    <details className="mt-3">
                      <summary className="text-gray-600 dark:text-gray-400 text-sm cursor-pointer hover:text-gray-800 dark:hover:text-gray-200">Advanced Details</summary>
                      <div className="mt-2 p-3 bg-gray-100 dark:bg-zinc-900 rounded-md">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Share Token:</p>
                        <code className="text-xs text-gray-800 dark:text-gray-200 break-all">{shareToken}</code>
                      </div>
                    </details>
                  )}
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800">
                    <p className="text-blue-800 dark:text-blue-200 text-sm">
                      <strong>Share this link:</strong> Anyone with this link can view and download the file. The link will remain active until you revoke access.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
      {/* Private Share Side Dialog (placeholder) */}
      <Sheet open={privateShareOpen} onOpenChange={setPrivateShareOpen}>
        <SheetContent side="right" className="w-full sm:w-[400px] md:w-[540px] bg-white dark:bg-black border-gray-200 dark:border-zinc-800 p-4 sm:p-6">
          <SheetHeader className="pb-4">
            <SheetTitle className="text-gray-900 dark:text-white flex items-center gap-2 text-lg font-semibold">
              <Share2 className="w-5 h-5 text-blue-600" />
              Private Share
            </SheetTitle>
          </SheetHeader>
          <div className="space-y-6">
            <div className="p-4 bg-gray-50 dark:bg-zinc-900/50 rounded-lg border border-gray-200 dark:border-zinc-800">
              <h3 className="text-gray-900 dark:text-white font-semibold mb-3 text-sm uppercase tracking-wide">File to share</h3>
              <div className="bg-white dark:bg-zinc-800 px-4 py-3 rounded-md border border-gray-200 dark:border-zinc-700">
                <p className="text-gray-800 dark:text-gray-200 font-mono text-sm break-all">{file.filename}</p>
              </div>
            </div>
            <form className="space-y-4" onSubmit={handlePrivateShare}>
              <div>
                <label className="block text-gray-900 dark:text-white font-semibold text-sm mb-2">Recipient</label>
                <input
                  name="recipient"
                  type="text"
                  placeholder="Enter recipient user ID or email"
                  className="bg-gray-50 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white font-mono text-sm px-2 py-1 rounded w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-900 dark:text-white font-semibold text-sm mb-2">Permission</label>
                <select
                  name="permission"
                  className="bg-gray-50 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white font-mono text-sm px-2 py-1 rounded w-full"
                  defaultValue="read"
                >
                  <option value="read">Read</option>
                  <option value="owner">Owner</option>
                </select>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm">Share</Button>
                <Button variant="outline" type="button" onClick={() => setPrivateShareOpen(false)} className="px-4 py-2 text-sm">Cancel</Button>
              </div>
            </form>
          </div>
        </SheetContent>
      </Sheet>
      {/* Rename Modal */}
      <Sheet key={file.id} open={renameModalOpen} onOpenChange={open => {
        setRenameModalOpen(open);
        if (!open) setIsRenaming(false);
      }}>
        <SheetContent side="right" className="w-full sm:w-[400px] md:w-[540px] bg-white dark:bg-black border-gray-200 dark:border-zinc-800 p-4 sm:p-6">
          <SheetHeader className="pb-4">
            <SheetTitle className="text-gray-900 dark:text-white flex items-center gap-2 text-lg font-semibold">
              <FileText className="w-5 h-5 text-blue-600" />
              Rename File
            </SheetTitle>
          </SheetHeader>
          <div className="space-y-6">
            <div className="p-4 bg-gray-50 dark:bg-zinc-900/50 rounded-lg border border-gray-200 dark:border-zinc-800">
              <h3 className="text-gray-900 dark:text-white font-semibold mb-3 text-sm uppercase tracking-wide">Current Name</h3>
              <div className="bg-white dark:bg-zinc-800 px-4 py-3 rounded-md border border-gray-200 dark:border-zinc-700">
                <p className="text-gray-800 dark:text-gray-200 font-mono text-sm break-all">{file.filename || file.name}</p>
              </div>
            </div>
            <div className="space-y-4">
              <label className="block text-gray-900 dark:text-white font-semibold text-sm mb-2">New Name</label>
              <input
                type="text"
                value={newFileName}
                onChange={e => setNewFileName(e.target.value)}
                className="bg-gray-50 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white font-mono text-sm flex-1 px-2 py-1 rounded w-full"
                disabled={isRenaming}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200 dark:border-zinc-800">
              <Button
                onClick={submitRename}
                disabled={isRenaming || !newFileName.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm"
              >
                {isRenaming ? 'Renaming...' : 'Rename'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setRenameModalOpen(false)}
                className="px-4 py-2 text-sm"
              >
                Cancel
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}