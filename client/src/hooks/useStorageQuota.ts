'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/stores/hooks';

interface StorageData {
  usedMB: number;
  username: string;
}

interface StorageQuotaResponse {
  status: string;
  message: string;
  data: StorageData;
}

export const useStorageQuota = () => {
  const { user } = useAuth();
  const [storageData, setStorageData] = useState<StorageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStorageQuota = async () => {
    if (!user?.name) return;

    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get<StorageQuotaResponse>(
        `/v1/file/storage-quota?username=${encodeURIComponent(user.name)}`
      );

      if (response.data.status === 'success') {
        setStorageData(response.data.data);
      } else {
        setError('Failed to fetch storage quota');
      }
    } catch (err) {
      console.error('Storage quota fetch error:', err);
      setError('Unable to load storage information');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStorageQuota();
  }, [user?.name]);

  // Helper functions for storage calculations
  const formatStorage = (mb: number): string => {
    if (mb >= 1024) {
      return `${(mb / 1024).toFixed(1)}GB`;
    }
    return `${mb.toFixed(0)}MB`;
  };

  const getStoragePercentage = (usedMB: number, totalMB: number = 10): number => {
    return Math.round((usedMB / totalMB) * 100);
  };

  const getStorageStats = () => {
    if (!storageData) return null;

    const totalMB = 10; // 10MB total storage
    const usedMB = Math.max(0, storageData.usedMB || 0); // Ensure non-negative
    const percentage = Math.min(100, getStoragePercentage(usedMB, totalMB)); // Cap at 100%
    
    return {
      used: formatStorage(usedMB),
      total: formatStorage(totalMB),
      percentage,
      usedMB,
      totalMB,
      remainingMB: Math.max(0, totalMB - usedMB),
      remaining: formatStorage(Math.max(0, totalMB - usedMB))
    };
  };

  return {
    storageData,
    loading,
    error,
    refetch: fetchStorageQuota,
    getStorageStats,
    formatStorage
  };
};