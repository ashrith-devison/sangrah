'use client';

import { useEffect, type ReactNode } from 'react';
import { StoreProvider, initializeStores } from '@/stores';

interface ClientProvidersProps {
  children: ReactNode;
}

export function ClientProviders({ children }: ClientProvidersProps) {
  useEffect(() => {
    // Initialize stores when the app loads
    const cleanup = initializeStores();
    
    // Cleanup on unmount
    return cleanup;
  }, []);

  return (
    <StoreProvider>
      {children}
    </StoreProvider>
  );
}