'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { useUserStore } from './userStore';
import { useFileStore } from './fileStore';
import { useAppStore } from './appStore';

// Context for providing store instances
interface StoreContextValue {
  userStore: typeof useUserStore;
  fileStore: typeof useFileStore;
  appStore: typeof useAppStore;
}

const StoreContext = createContext<StoreContextValue | null>(null);

interface StoreProviderProps {
  children: ReactNode;
}

// Store provider component
export function StoreProvider({ children }: StoreProviderProps) {
  const value: StoreContextValue = {
    userStore: useUserStore,
    fileStore: useFileStore,
    appStore: useAppStore,
  };

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
}

// Hook to use the store context
export function useStoreContext() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStoreContext must be used within a StoreProvider');
  }
  return context;
}

// Re-export all stores for convenience
export { useUserStore, useFileStore, useAppStore };

// Initialize stores on client side
export function initializeStores() {
  if (typeof window === 'undefined') return;

  // Hydrate stores from localStorage
  useUserStore.persist.rehydrate();
  useFileStore.persist.rehydrate();
  useAppStore.persist.rehydrate();

  // Set up offline/online listeners
  const handleOnline = () => {
    useAppStore.getState().setOfflineStatus(false);
    useAppStore.getState().updateLastSyncTime(new Date().toISOString());
  };

  const handleOffline = () => {
    useAppStore.getState().setOfflineStatus(true);
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // Set initial offline status
  useAppStore.getState().setOfflineStatus(!navigator.onLine);

  // Return cleanup function
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}