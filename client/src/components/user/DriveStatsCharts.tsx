import React from 'react';
import { Bar, Doughnut, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export default function DriveStatsCharts({ data }: { data: any }) {
  // Bar chart for uploads
  const uploadBarData = {
    labels: ['Last 24h', 'Last Week'],
    datasets: [
      {
        label: 'Uploads',
        data: [data.uploaded_last_24h, data.uploaded_last_week],
        backgroundColor: ['#6366f1', '#22d3ee'],
      },
    ],
  };

  // Doughnut chart for file types
  const fileTypeData = {
    labels: ['Owned', 'Starred', 'Shared', 'Duplicate', 'Large'],
    datasets: [
      {
        label: 'Files',
        data: [data.owned_files, data.starred_files, data.public_shared_files, data.duplicate_files, data.large_files],
        backgroundColor: [
          '#6366f1', '#facc15', '#a78bfa', '#f87171', '#34d399'
        ],
      },
    ],
  };


  return (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
        <h3 className="text-white text-sm font-semibold mb-2">Uploads</h3>
        <Bar data={uploadBarData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
      </div>
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
        <h3 className="text-white text-sm font-semibold mb-2">File Types</h3>
        <Doughnut data={fileTypeData} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
      </div>
      {/* Downloads chart removed, now shown as stat card in table */}
    </div>
  );
}
