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
  Star,
  FolderOpen,
  Users,
  MoreHorizontal,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
} from '@/components/ui/dropdown-menu';
import { RecentFileDropdown } from './RecentFileDropdown';
import { RecentFile } from '@/types/recent';
import api from '@/lib/api';
import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

interface RecentFileListProps {
  files: RecentFile[];
}

const getFileIcon = (type: string) => {
  switch (type) {
    case 'document':
    case 'presentation':
      return FileText;
    case 'image':
    case 'design':
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

const getFileColor = (type: string) => {
  switch (type) {
    case 'document':
      return 'text-blue-400';
    case 'presentation':
      return 'text-orange-400';
    case 'image':
    case 'design':
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

function format24Hour(dateString: string) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return date
    .toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }) + ' ' + date.toLocaleDateString('en-GB');
}

export default function RecentFileList({ files }: RecentFileListProps) {
  const [previewFile, setPreviewFile] = useState<RecentFile | null>(null);
  const [fileList, setFileList] = useState(files);

  // ...existing code...

  const handleOpenInNewTab = (file: RecentFile) => {
    const fileExtension =
      file.filename && file.filename.includes('.') ? file.filename.split('.').pop() : '';
    if (!file.fileId || !fileExtension) {
      alert('File cannot be opened: missing fileId or file extension');
      return;
    }
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
        const blobUrl = URL.createObjectURL(res.data);
        // Open preview in a new window
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
        alert('Failed to open file in new tab: ' + err.message);
      });
  };

  // Handler to update file data after rename
  const handleFileUpdate = (updatedFile: RecentFile) => {
    setFileList(prev => prev.map(f => f.id === updatedFile.id ? { ...f, ...updatedFile } : f));
  };

  return (
    <>
      <div className="space-y-2">
  {fileList.map(file => {
          const FileIcon = getFileIcon(file.type);
          const iconColor = getFileColor(file.type);

          return (
            <div key={file.id} className="group flex items-center justify-between p-3 sm:p-4 bg-zinc-800/30 hover:bg-zinc-800/50 border border-zinc-700 rounded-lg cursor-pointer transition-all hover:border-[#6e73fa]/50 mb-2">
              <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                <FileIcon
                  className={`w-5 h-5 sm:w-6 sm:h-6 ${iconColor} flex-shrink-0`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p
                      className="text-white font-medium text-sm sm:text-base truncate"
                      title={file.name}
                    >
                      {file.name}
                    </p>
                    {file.starred && (
                      <Star className="w-3 h-3 text-yellow-400 fill-current flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-xs text-gray-400 mt-1 gap-1 sm:gap-0">
                    <span>{file.size}</span>
                    <div className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      <span>Opened {format24Hour(file.opened)}</span>
                    </div>
                    <div className="flex items-center">
                      <FolderOpen className="w-3 h-3 mr-1" />
                      <span>{file.folder}</span>
                    </div>
                    <span className="hidden sm:inline">by {file.owner}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
                {file.shared && (
                  <Badge
                    variant="secondary"
                    className="text-xs bg-[#6e73fa]/20 text-[#6e73fa] px-1 sm:px-2"
                  >
                    <Users className="w-2 h-2 sm:w-3 sm:h-3 mr-0 sm:mr-1" />
                    <span className="hidden sm:inline">Shared</span>
                  </Badge>
                )}
                <RecentFileDropdown
                  file={file}
                  onStar={handleFileUpdate}
                  onDelete={() => setFileList(prev => prev.filter(f => f.id !== file.id))}
                  triggerClassName="opacity-0 group-hover:opacity-100 transition-opacity p-1 sm:p-2"
                />
              </div>
            </div>
          );
        })}
      </div>
      <Sheet open={!!previewFile} onOpenChange={open => { if (!open) { setPreviewFile(null); } }}>
        <SheetContent side="right" className="w-full sm:w-[540px] md:w-[700px] bg-zinc-950 border-l border-zinc-800 p-0 flex flex-col">
          <SheetHeader className="p-6 pb-2 border-b border-zinc-800 flex items-center justify-between">
            <div>
              <SheetTitle className="text-white flex items-center gap-2 text-lg font-semibold">
                <Eye className="w-5 h-5 text-blue-500" />
                Preview File
              </SheetTitle>
              <div className="text-xs text-gray-400 mt-1 truncate">{previewFile?.filename}</div>
            </div>
            <button
              className="text-gray-400 hover:text-white px-3 py-1 rounded"
              onClick={() => setPreviewFile(null)}
            >
              Close
            </button>
          </SheetHeader>
          <div className="flex-1 flex items-center justify-center bg-zinc-900">
            {previewFile ? (
              <iframe src={previewFile ? `/v1/file/path/view?path=${encodeURIComponent(previewFile.fileId + '.' + (previewFile.filename?.split('.').pop() || ''))}` : ''} style={{ width: '95%', height: '90%', border: 'none', background: 'white', borderRadius: '0.5rem', boxShadow: '0 2px 16px rgba(0,0,0,0.12)' }} title="File Preview" />
            ) : (
              <div className="text-gray-400 text-center">Loading preview...</div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}