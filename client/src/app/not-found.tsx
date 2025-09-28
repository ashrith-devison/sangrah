import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black">
      <div className="bg-black rounded-2xl p-8 shadow-2xl border border-zinc-800 w-full max-w-md mx-auto">
        <div className="flex flex-col items-center gap-4">
          <span className="bg-gradient-to-r from-[#6e73fa] to-[#5e5e5e] p-4 rounded-full">
            <AlertTriangle className="w-8 h-8 text-white" />
          </span>
          <h1 className="text-3xl font-bold text-white">Page Not Found</h1>
          <p className="text-zinc-400 max-w-md">
            Sorry, the page you&apos;re looking for doesn&apos;t exist or has
            been moved.
            <br />
            <br />
            Please check the URL or return to your dashboard.
          </p>
          <Link href="/login">
            <Button className="mt-4 bg-gradient-to-r from-[#6e73fa] to-[#5e5e5e] text-white">
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
