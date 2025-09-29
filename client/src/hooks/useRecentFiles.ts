"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';

export function useRecentFiles(username: string) {
  const [recentFiles, setRecentFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('useRecentFiles invoked with username:', username);
    if (!username) return;
    setLoading(true);
    Promise.all([
      api.get(`/v1/file/owned-info?username=${username}`),
      api.get(`/v1/file/owned?username=${username}`)
    ])
      .then(([infoRes, ownedRes]) => {
        console.log('API responses:', { infoRes, ownedRes });
        let infoFiles = [];
        let ownedFiles = [];
        if (infoRes.data.status === 'success') {
          infoFiles = Array.isArray(infoRes.data.data) ? infoRes.data.data : [];
        }
        if (ownedRes.data.status === 'success') {
          ownedFiles = Array.isArray(ownedRes.data.data) ? ownedRes.data.data : [];
        }

        // Helper to infer file type from extension
        function inferType(filename: string): string {
          const ext = filename.split('.').pop()?.toLowerCase();
          if (!ext) return 'document';
          if (["pdf", "doc", "docx", "txt", "rtf"].includes(ext)) return "document";
          if (["jpg", "jpeg", "png", "gif", "bmp", "svg", "webp", "psd", "fig", "sketch"].includes(ext)) return "image";
          if (["mp4", "avi", "mov", "wmv", "flv", "webm"].includes(ext)) return "video";
          if (["mp3", "wav", "flac", "aac", "ogg"].includes(ext)) return "audio";
          if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) return "archive";
          if (["ppt", "pptx"].includes(ext)) return "presentation";
          if (["design", "fig", "sketch", "psd"].includes(ext)) return "design";
          return "document";
        }

        // Merge by fileId (or fallback to filename)
        const merged = infoFiles.map((info: any) => {
          const owned = ownedFiles.find((o: any) => o.fileId === info.sha_file_id || o.filename === info.filename);
          const filename = info.filename || owned?.filename || '';
          return {
            id: info.id || owned?.id || Math.random(),
            name: filename,
            type: inferType(filename),
            size: owned?.size_mb ? `${owned.size_mb.toFixed(2)} MB` : '',
            modified: info.upload_time || owned?.created_at || '',
            opened: info.upload_time || owned?.created_at || '',
            shared: info.permission === 'shared' || owned?.permission === 'shared',
            starred: info.starred || false,
            folder: owned?.path || '',
            owner: info.username || owned?.username || '',
            fileId: info.fileId || owned?.fileId,
            filename: info.filename || owned?.filename,
          };
        });

        // Add any files from ownedFiles not in infoFiles
        ownedFiles.forEach((owned: any) => {
          const filename = owned.filename || '';
          const exists = merged.find((m: any) => m.name === filename);
          if (!exists) {
            merged.push({
              id: owned.id || Math.random(),
              name: filename,
              type: inferType(filename),
              size: owned.size_mb ? `${owned.size_mb.toFixed(2)} MB` : '',
              modified: owned.created_at || '',
              opened: owned.created_at || '',
              shared: owned.permission === 'shared',
              starred: false,
              folder: owned.path || '',
              owner: owned.username || '',
              fileId: owned.fileId,
              filename: owned.filename,
            });
          }
        });

        // Debug output
        console.log("Merged recent files:", merged);

        // Sort by modified descending
        merged.sort((a: any, b: any) => new Date(b.modified).getTime() - new Date(a.modified).getTime());
        setRecentFiles(merged);
      })
      .catch((err) => {
        console.error('API error:', err);
        setRecentFiles([]);
        setError('Failed to fetch recent files: ' + (err?.message || 'Unknown error'));
      })
      .finally(() => setLoading(false));
  }, [username]);

  return { recentFiles, loading, error };
}
