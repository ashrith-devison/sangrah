'use client';

import { Button } from '../ui/button';
import { useRouter } from 'next/navigation';

const ExploreNowButton = () => {
  const router = useRouter();

  return (
    <Button
      onClick={() => router.push('/login')}
      className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg transition-colors"
    >
      Get Started
    </Button>
  );
};

export { ExploreNowButton };
