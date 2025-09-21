import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AppStore, AppSettings, NotificationItem } from '@/types/store';

const defaultSettings: AppSettings = {
  theme: 'system',
  language: 'en',
  notifications: {
    email: true,
    push: true,
    uploads: true,
    shares: true,
  },
  storage: {
    autoSync: true,
    compressionEnabled: false,
    maxUploadSize: 100, // MB
  },
  privacy: {
    shareAnalytics: false,
    autoDeleteTrash: true,
    trashRetentionDays: 30,
  },
};

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // Initial state
      settings: defaultSettings,
      isOffline: false,
      lastSyncTime: null,
      notifications: [],

      // Actions
      updateSettings: (newSettings: Partial<AppSettings>) => {
        set((state) => ({
          settings: {
            ...state.settings,
            ...newSettings,
          },
        }));
      },

      setOfflineStatus: (offline: boolean) => {
        set({ isOffline: offline });
      },

      updateLastSyncTime: (time: string) => {
        set({ lastSyncTime: time });
      },

      addNotification: (notification: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => {
        const newNotification: NotificationItem = {
          ...notification,
          id: Math.random().toString(36).substr(2, 9),
          timestamp: new Date().toISOString(),
          read: false,
        };

        set((state) => ({
          notifications: [newNotification, ...state.notifications],
        }));
      },

      markNotificationAsRead: (notificationId: string) => {
        set((state) => ({
          notifications: state.notifications.map((notification) =>
            notification.id === notificationId
              ? { ...notification, read: true }
              : notification
          ),
        }));
      },

      removeNotification: (notificationId: string) => {
        set((state) => ({
          notifications: state.notifications.filter(
            (notification) => notification.id !== notificationId
          ),
        }));
      },

      clearAllNotifications: () => {
        set({ notifications: [] });
      },
    }),
    {
      name: 'app-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        settings: state.settings,
        lastSyncTime: state.lastSyncTime,
      }),
    }
  )
);

// Helper hooks for specific settings
export const useTheme = () => useAppStore((state) => state.settings.theme);
export const useNotifications = () => useAppStore((state) => state.notifications);
export const useOfflineStatus = () => useAppStore((state) => state.isOffline);