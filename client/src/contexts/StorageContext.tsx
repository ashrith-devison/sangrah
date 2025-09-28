'use client';

import React, { createContext, useContext, useCallback } from 'react';

interface StorageContextType {
  refreshStorage: () => void;
}

const StorageContext = createContext<StorageContextType | null>(null);

interface StorageProviderProps {
  children: React.ReactNode;
  onRefreshStorage?: () => void;
}

export const StorageProvider: React.FC<StorageProviderProps> = ({ 
  children, 
  onRefreshStorage 
}) => {
  const refreshStorage = useCallback(() => {
    if (onRefreshStorage) {
      onRefreshStorage();
    }
  }, [onRefreshStorage]);

  return (
    <StorageContext.Provider value={{ refreshStorage }}>
      {children}
    </StorageContext.Provider>
  );
};

export const useStorageContext = () => {
  const context = useContext(StorageContext);
  return context; // Can be null if not wrapped in provider
};