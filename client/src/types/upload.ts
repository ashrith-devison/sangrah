export interface FileUpload {
  id: string;
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error' | 'paused';
  error?: string;
  size: string;
  type: string;
  thumbnail?: string;
  sha256?: string;
  message?: string;
}

export interface UploadFolder {
  id: string;
  name: string;
  path: string;
}

export interface UploadSettings {
  compression: boolean;
  deduplication: boolean;
  encryption: boolean;
}

export interface UploadHeaderProps {
  // No props needed for header
}

export interface UploadStatsProps {
  totalFiles: number;
  completedFiles: number;
  errorFiles: number;
  totalSize: number;
}

export interface UploadDropZoneProps {
  isDragOver: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onFileSelect: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFilesSelected: (files: FileList) => void;
  files: FileUpload[];
  onRemoveFile: (id: string) => void;
  onRetryFile: (id: string) => void;
}

export interface UploadFileListProps {
  files: FileUpload[];
  onRemoveFile: (id: string) => void;
  onRetryFile: (id: string) => void;
}

export interface UploadDestinationProps {
  selectedFolder: string;
  folders: UploadFolder[];
  onFolderChange: (folderId: string) => void;
  customPath?: string;
  onCustomPathChange?: (path: string) => void;
}

export interface UploadQuickActionsProps {
  onAddFiles: () => void;
  hasFiles: boolean;
}

export interface UploadViewProps {
  // No props needed for main view
}