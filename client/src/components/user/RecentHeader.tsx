import { Clock, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface RecentHeaderProps {
  fileCount: number;
}

export default function RecentHeader({ fileCount }: RecentHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="w-full lg:w-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 flex items-center">
            <Clock className="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-3" />
            Recent Files
          </h1>
          <p className="text-sm sm:text-base text-gray-400">
            Files you&apos;ve recently opened, modified, or accessed
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm w-full lg:w-auto justify-between lg:justify-end">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-gray-400">Last 30 days</span>
          </div>
          <Badge
            variant="secondary"
            className="bg-[#6e73fa]/20 text-[#6e73fa]"
          >
            {fileCount} files
          </Badge>
        </div>
      </div>
    </div>
  );
}