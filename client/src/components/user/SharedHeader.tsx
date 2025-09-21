import { Users, UserPlus, Link } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SharedHeader() {
  return (
    <div className="mb-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="w-full lg:w-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 flex items-center">
            <Users className="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-3" />
            Shared Files & Folders
          </h1>
          <p className="text-sm sm:text-base text-gray-400">
            Manage files and folders shared with you and by you
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 w-full lg:w-auto">
          <Button
            variant="outline"
            className="w-full sm:w-auto bg-gradient-to-r from-[#6e73fa] to-[#5e5e5e] text-white hover:from-[#5e5e5e] hover:to-[#6e73fa] text-sm"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Share New
          </Button>
          <Button
            variant="outline"
            className="w-full sm:w-auto border-zinc-700 text-black hover:bg-zinc-800/50 hover:text-white text-sm"
          >
            <Link className="w-4 h-4 mr-2" />
            Create Link
          </Button>
        </div>
      </div>
    </div>
  );
}