import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QuickStat } from '@/types/home';
import { TrendingUp } from 'lucide-react';

interface QuickStatsGridProps {
  stats: QuickStat[];
}

export default function QuickStatsGrid({ stats }: QuickStatsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <Card
          key={index}
          className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm hover:bg-zinc-800/50 transition-all"
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold text-white mt-1">
                  {stat.value}
                </p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-3 h-3 text-green-400 mr-1" />
                  <span className="text-green-400 text-xs">
                    {stat.change}
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-[#6e73fa]/20 to-[#5e5e5e]/20 rounded-xl flex items-center justify-center">
                <stat.icon className="w-6 h-6 text-[#6e73fa]" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}