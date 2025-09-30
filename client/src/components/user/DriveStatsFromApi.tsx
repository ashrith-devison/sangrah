import React, { useEffect, useState } from 'react';
import { Download, Star, FileText, Users, Copy, Archive, BarChart3, FolderKanban } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/stores/hooks';
import DriveStatsCharts from '@/components/user/DriveStatsCharts';
import api from '@/lib/api';

export default function DriveStatsFromApi() {
  const { user } = useAuth();
  // Get username from Zustand, fallback to localStorage
  let username = user?.username || user?.email || '';
  if (!username && typeof window !== 'undefined') {
    try {
      const userStore = localStorage.getItem('user-store');
      if (userStore) {
        const parsed = JSON.parse(userStore);
        username = parsed?.state?.user?.email || parsed?.state?.user?.name || '';
      }
    } catch (e) {
      // ignore
    }
  }
  const [stats, setStats] = useState<any>(null);
  const [statsRaw, setStatsRaw] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      try {
        if (!username) {
          setError('No username found');
          setLoading(false);
          return;
        }
        const response = await api.get(`/v1/file/stats?username=${username}`);
        if (response.data && response.data.status === 'success') {
          const d = response.data.data;
          setStatsRaw(d);
          setStats({
            totalFiles: d.owned_files || 0,
            recentFiles: d.uploaded_last_24h || 0,
            sharedFiles: d.public_shared_files || 0,
            starredFiles: d.starred_files || 0,
            storageUsed: (d.storage_used_mb || 0) * 1024 * 1024,
            storageTotal: 10 * 1024 * 1024, // Assume 10MB total
            fileTypes: {
              documents: d.duplicate_files || 0,
              images: 0,
              videos: 0,
              audio: 0,
              archives: d.large_files || 0,
              others: 0
            }
          });
        } else {
          setError('Failed to fetch drive stats');
        }
      } catch (err) {
        setError('Failed to fetch drive stats');
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) return <div className="text-gray-400">Loading drive stats...</div>;
  if (error) return <div className="text-red-400">{error}</div>;
  if (!stats) return null;

  // Render all API parameters
  return (
  <div className="w-full min-h-screen px-2 sm:px-4 py-4 flex flex-col gap-4 bg-black">
      {/* Dashboard Header */}
  <header className="w-full max-w-7xl mx-auto mb-2 flex flex-col items-center justify-center gap-2 text-center px-2 sm:px-0">
    <div className="flex items-center gap-2 justify-center flex-wrap">
      <FolderKanban className="text-violet-400" size={28} />
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">Drive Dashboard</h1>
    </div>
    <div className="flex items-center gap-2 justify-center flex-wrap">
      <BarChart3 className="text-cyan-400" size={18} />
      <p className="text-sm sm:text-base md:text-lg text-gray-400">Your file vault statistics and activity overview</p>
    </div>
      </header>
      {/* Charts section: full width, responsive */}
      <div className="w-full flex justify-center">
        <div className="w-full max-w-3xl flex flex-col md:flex-row gap-6 md:gap-8 items-stretch">
          {statsRaw && <DriveStatsCharts data={statsRaw} />}
        </div>
      </div>
      {/* Table section: full width, responsive */}
      <div className="w-full flex justify-center mt-2 px-1 sm:px-0">
        <div className="w-full max-w-3xl overflow-x-auto">
  <table className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl text-left text-xs sm:text-sm md:text-base">
          <thead>
            <tr className="text-gray-400 text-xs uppercase">
              <th className="p-3" colSpan={2}>Brief  Analysis</th>
            </tr>
          </thead>
          <tbody>
              <tr className="bg-zinc-900/60">
                <td className="p-2 sm:p-3 font-medium text-white flex items-center gap-2 whitespace-nowrap">
                  <Badge variant="default" className="bg-blue-600/20 text-blue-400 border-blue-600/30">Owner</Badge>
                  <span className="truncate">Username</span>
                </td>
                <td className="p-2 sm:p-3 text-base font-bold text-blue-400 whitespace-nowrap">{username || 'Unknown'}</td>
              </tr>
            {[
              { label: 'Downloads So Far', value: statsRaw?.download_count, icon: <Download className="text-violet-400" size={20} />, highlight: true },
              { label: 'Duplicate Files', value: statsRaw?.duplicate_files, icon: <Copy className="text-pink-400" size={20} /> },
              { label: 'Large Files', value: statsRaw?.large_files, icon: <Archive className="text-green-400" size={20} /> },
              { label: 'Owned Files', value: statsRaw?.owned_files, icon: <FileText className="text-blue-400" size={20} /> },
              { label: 'Public Shared Files', value: statsRaw?.public_shared_files, icon: <Users className="text-indigo-400" size={20} /> },
              { label: 'Starred Files', value: statsRaw?.starred_files, icon: <Star className="text-yellow-400" size={20} /> },
              { label: 'Storage Used (MB)', value: statsRaw?.storage_used_mb?.toFixed(2), icon: <Archive className="text-violet-400" size={20} />, highlight: true },
              { label: 'Uploaded Last 24h', value: statsRaw?.uploaded_last_24h, icon: <FileText className="text-cyan-400" size={20} /> },
              { label: 'Uploaded Last Week', value: statsRaw?.uploaded_last_week, icon: <FileText className="text-cyan-400" size={20} /> },
            ].map((stat, idx) => (
              <tr key={stat.label} className={stat.highlight ? 'bg-violet-950/40' : idx % 2 === 0 ? 'bg-zinc-900/60' : 'bg-zinc-900/40'}>
                <td className="p-2 sm:p-3 font-medium text-white flex items-center gap-2 whitespace-nowrap">
                  <Badge variant={stat.highlight ? 'secondary' : 'default'}>{stat.icon}</Badge>
                  <span className="truncate">{stat.label}</span>
                </td>
                <td className={`p-2 sm:p-3 text-base font-bold ${stat.highlight ? 'text-violet-400' : 'text-white'} whitespace-nowrap`}>{stat.value ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );

}

// Modern stat card component
// ...StatCard removed, now using table layout above...
