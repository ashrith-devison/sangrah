import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { UserSideBar } from '@/components/user/UserSideBar';
import { Settings, Bell, Search } from 'lucide-react';
import { UserAvatar } from '@/components/common/UserAvatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black">
      <SidebarProvider>
        <UserSideBar />
        <main className="flex-1">
          {/* Top Navigation Bar */}
          <div className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-xl">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4 flex-1">
                <SidebarTrigger className="text-white hover:bg-zinc-800 hover:text-white" />

                {/* Global Search */}
                <div className="relative hidden md:block w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search across all files..."
                    className="pl-10 w-full bg-zinc-800/50 border-zinc-700 text-white placeholder:text-gray-500 focus:border-[#6e73fa]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Quick Actions */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white hover:bg-zinc-800"
                >
                  <Bell className="w-4 h-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white hover:bg-zinc-800"
                >
                  <Settings className="w-4 h-4" />
                </Button>

                <div className="h-6 w-px bg-zinc-700" />

                <UserAvatar />
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">{children}</div>
        </main>
      </SidebarProvider>
    </div>
  );
}
