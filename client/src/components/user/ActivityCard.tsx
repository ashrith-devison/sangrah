import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Upload, Share2, Download } from 'lucide-react';

export default function ActivityCard() {
  return (
    <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 bg-zinc-800/50 rounded-lg">
            <Upload className="w-4 h-4 text-green-400" />
            <div className="flex-1">
              <p className="text-white text-sm">
                Uploaded 3 files to &quot;Project Assets&quot;
              </p>
              <p className="text-gray-400 text-xs">2 hours ago</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-zinc-800/50 rounded-lg">
            <Share2 className="w-4 h-4 text-blue-400" />
            <div className="flex-1">
              <p className="text-white text-sm">
                Shared &quot;Financial Report.pdf&quot; with team
              </p>
              <p className="text-gray-400 text-xs">1 day ago</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-zinc-800/50 rounded-lg">
            <Download className="w-4 h-4 text-purple-400" />
            <div className="flex-1">
              <p className="text-white text-sm">
                Downloaded &quot;Design Assets.zip&quot;
              </p>
              <p className="text-gray-400 text-xs">3 days ago</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}