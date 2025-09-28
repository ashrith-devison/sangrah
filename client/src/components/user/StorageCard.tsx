import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { HardDrive } from 'lucide-react';
import { StorageStats } from '@/types/home';

interface StorageCardProps {
  storageStats: StorageStats;
}

export default function StorageCard({ storageStats }: StorageCardProps) {
  return (
    <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <HardDrive className="w-5 h-5 mr-2" />
          Storage Usage
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Used Space</span>
            <span className="text-white font-medium">
              {storageStats.used}GB / {storageStats.total}GB
            </span>
          </div>
          <Progress value={storageStats.percentage} className="h-3" />
          <div className="flex justify-between text-sm">
            <span className="text-green-400">
              3.2GB saved by deduplication
            </span>
            <span className="text-gray-400">
              {storageStats.percentage}% used
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}