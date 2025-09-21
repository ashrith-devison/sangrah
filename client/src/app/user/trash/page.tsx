import TrashView from '@/components/user/TrashView';

export default function TrashPage() {
  return (
    <div className="flex-1 w-full min-h-screen">
      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        <TrashView />
      </div>
    </div>
  );
}
