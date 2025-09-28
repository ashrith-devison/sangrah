'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Files, 
  Download, 
  Database, 
  HardDrive, 
  Activity,
  TrendingUp,
  RefreshCw,
  Eye,
  Save,
  BarChart3,
  PieChart,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/stores/hooks';
import api from '@/lib/api';

interface AdminStats {
  totalFiles: number;
  totalPhysicalFiles: number;
  totalUsers: number;
  totalDownloads: number;
  totalStorageUsed: number;
  totalLogicalStorage: number;
  spaceSaved: number;
  avgFilesPerUser: number;
  avgStoragePerUser: number;
  deduplicationRatio: number;
}

interface AdminStatsResponse {
  status: string;
  message: string;
  data: AdminStats;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchAdminStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get<AdminStatsResponse>('/v1/admin/stats');
      
      if (response.data.status === 'success') {
        setStats(response.data.data);
        setLastUpdated(new Date());
      } else {
        throw new Error(response.data.message || 'Failed to fetch stats');
      }
    } catch (error: any) {
      console.error('Failed to fetch admin stats:', error);
      setError(error.response?.data?.message || 'Failed to load admin statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminStats();
    
    // Auto-refresh stats every 30 seconds
    const interval = setInterval(fetchAdminStats, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const calculateStorageEfficiency = (): number => {
    if (!stats || stats.totalLogicalStorage === 0) return 0;
    return Math.round(stats.deduplicationRatio * 100);
  };

  const formatPercentage = (ratio: number): string => {
    return (ratio * 100).toFixed(1) + '%';
  };

  const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome back, <span className="text-[#6e73fa]">{user?.name || 'Admin'}</span>! 👋
            </h1>
            <p className="text-gray-400">
              Here's what's happening with your system today.
            </p>
          </div>
          
          <div className="flex items-center gap-3 mt-4 md:mt-0">
            {lastUpdated && (
              <span className="text-sm text-gray-400">
                Last updated: {getTimeAgo(lastUpdated)}
              </span>
            )}
            <Button 
              onClick={fetchAdminStats}
              disabled={loading}
              variant="outline"
              size="sm"
              className="border-zinc-700 text-black hover:text-black"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <Card className="bg-red-500/10 border-red-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-red-400">
                <Activity className="w-4 h-4" />
                <span>{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Total Users */}
          <Card className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Total Users</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {loading ? '...' : stats?.totalUsers?.toLocaleString() || '0'}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Registered accounts
              </p>
            </CardContent>
          </Card>

          {/* Total Files */}
          <Card className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Total Files</CardTitle>
              <Files className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {loading ? '...' : stats?.totalFiles?.toLocaleString() || '0'}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Logical files ({stats?.totalPhysicalFiles || 0} physical)
              </p>
            </CardContent>
          </Card>

          {/* Total Downloads */}
          <Card className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Downloads</CardTitle>
              <Download className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {loading ? '...' : stats?.totalDownloads?.toLocaleString() || '0'}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Total file downloads
              </p>
            </CardContent>
          </Card>

          {/* Storage Used */}
          <Card className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Storage Used</CardTitle>
              <Database className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {loading ? '...' : formatBytes(stats?.totalStorageUsed || 0)}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Physical storage consumed
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Storage Analytics */}
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <HardDrive className="w-5 h-5 text-[#6e73fa]" />
                Storage Analytics
              </CardTitle>
              <CardDescription className="text-gray-400">
                Storage usage and efficiency metrics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Physical Storage</span>
                  <span className="text-white font-medium">
                    {formatBytes(stats?.totalStorageUsed || 0)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Logical Storage</span>
                  <span className="text-white font-medium">
                    {formatBytes(stats?.totalLogicalStorage || 0)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Space Saved</span>
                  <span className="text-green-400 font-medium">
                    {formatBytes(stats?.spaceSaved || 0)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Deduplication Ratio</span>
                  <span className="text-purple-400 font-medium">
                    {stats ? formatPercentage(stats.deduplicationRatio) : '0%'}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Storage Efficiency</span>
                  <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                    {calculateStorageEfficiency()}% efficient
                  </Badge>
                </div>
                <Progress 
                  value={calculateStorageEfficiency()} 
                  className="h-2" 
                />
                <div className="text-xs text-gray-500 text-center">
                  {formatBytes(stats?.spaceSaved || 0)} saved through deduplication
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Deduplication Insights */}
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <PieChart className="w-5 h-5 text-[#6e73fa]" />
                Deduplication Insights
              </CardTitle>
              <CardDescription className="text-gray-400">
                File optimization and savings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center space-y-2">
                <div className="text-3xl font-bold text-white">
                  {stats ? formatPercentage(stats.deduplicationRatio) : '0%'}
                </div>
                <div className="text-sm text-gray-400">Space optimization</div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Duplicate Files Removed</span>
                  <span className="text-white">
                    {stats ? (stats.totalFiles - stats.totalPhysicalFiles) : 0}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Storage Efficiency</span>
                  <span className="text-green-400">
                    {stats && stats.totalLogicalStorage > 0 
                      ? ((stats.spaceSaved / stats.totalLogicalStorage) * 100).toFixed(1) + '%'
                      : '0%'
                    }
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Files Ratio</span>
                  <span className="text-blue-400">
                    {stats && stats.totalFiles > 0 
                      ? (stats.totalPhysicalFiles / stats.totalFiles * 100).toFixed(1) + '%'
                      : '0%'
                    } unique
                  </span>
                </div>
              </div>
              
              <div className="bg-zinc-800/50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-green-400">
                  {formatBytes(stats?.spaceSaved || 0)}
                </div>
                <div className="text-xs text-gray-400">Total space saved</div>
              </div>
            </CardContent>
          </Card>

          {/* System Overview */}
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#6e73fa]" />
                System Overview
              </CardTitle>
              <CardDescription className="text-gray-400">
                Key performance indicators
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-white">
                    {stats ? stats.avgFilesPerUser.toFixed(1) : '0'}
                  </div>
                  <div className="text-xs text-gray-400">Avg files per user</div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-white">
                    {stats ? formatBytes(stats.avgStoragePerUser) : '0'}
                  </div>
                  <div className="text-xs text-gray-400">Avg storage per user</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-zinc-800">
                <div className="space-y-1">
                  <div className="text-lg font-bold text-white">
                    {stats?.totalPhysicalFiles || 0}
                  </div>
                  <div className="text-xs text-gray-400">Physical files</div>
                </div>
                <div className="space-y-1">
                  <div className="text-lg font-bold text-white">
                    {stats?.totalFiles || 0}
                  </div>
                  <div className="text-xs text-gray-400">Logical files</div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-white">System Status</span>
                  </div>
                  <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                    Healthy
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-400" />
                    <span className="text-sm text-white">Deduplication</span>
                  </div>
                  <Badge variant="secondary" className={`${
                    stats && stats.deduplicationRatio > 0 
                      ? 'bg-blue-500/20 text-blue-400' 
                      : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {stats && stats.deduplicationRatio > 0 
                      ? `${formatPercentage(stats.deduplicationRatio)} Active` 
                      : 'Inactive'
                    }
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}