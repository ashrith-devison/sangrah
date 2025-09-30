import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { UserStore, User } from '@/types/store';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      token: null,

      // Actions
      login: async (email: string, password: string) => {
        set({ isLoading: true });
        
        try {
          const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
          });

          if (!response.ok) {
            throw new Error('Login failed');
          }

          const data = await response.json();
          
          // Handle the response structure: data.data contains user info
          const userData = data.data || data;
          const userRole = userData.role || 'user';
          
          const user = {
            id: userData.id || '',
            email: userData.email,
            name: userData.name || '',
            username: userData.username || userData.name || '',
            role: userRole,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          
          set({
            user: user,
            token: userData.token,
            isAuthenticated: true,
            isLoading: false,
          });

          // Store token in localStorage for API calls
          if (typeof window !== 'undefined') {
            localStorage.setItem('auth_token', userData.token);
            // Also set token in cookies for middleware
            document.cookie = `auth-token=${userData.token}; path=/; max-age=${7 * 24 * 60 * 60}; secure; samesite=strict`;
          }
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });

        // Clear token from localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
          // Also clear the auth cookie
          document.cookie = 'auth-token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        }
      },

      register: async (email: string, password: string, name: string) => {
        set({ isLoading: true });
        
        try {
          const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password, name }),
          });

          if (!response.ok) {
            throw new Error('Registration failed');
          }

          const data = await response.json();
          
          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
          });

          // Store token in localStorage for API calls
          if (typeof window !== 'undefined') {
            localStorage.setItem('auth_token', data.token);
          }
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      updateProfile: async (data: Partial<User>) => {
        const { token, user } = get();
        
        if (!token || !user) {
          throw new Error('User not authenticated');
        }

        set({ isLoading: true });

        try {
          const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(data),
          });

          if (!response.ok) {
            throw new Error('Profile update failed');
          }

          const updatedUser = await response.json();
          
          set({
            user: updatedUser,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      setUser: (user: User | null) => {
        set({ user, isAuthenticated: !!user });
      },

      setToken: (token: string | null) => {
        set({ token });
        
        if (typeof window !== 'undefined') {
          if (token) {
            localStorage.setItem('auth_token', token);
          } else {
            localStorage.removeItem('auth_token');
          }
        }
      },

      setLoading: (isLoading: boolean) => {
        set({ isLoading });
      },

      // Complete authentication update in single call
      setAuthenticatedUser: (user: User, token: string) => {
        console.log('🔄 setAuthenticatedUser called with:', { user, token: !!token });
        console.log('👤 User role being stored:', user.role);
        
        set({ 
          user, 
          token, 
          isAuthenticated: true, 
          isLoading: false 
        });
        
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_token', token);
          // Store user data for debugging
          localStorage.setItem('user_data', JSON.stringify(user));
          // Also set cookie for middleware
          document.cookie = `auth-token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; samesite=lax`;
          
          console.log('💾 Data stored in localStorage');
          console.log('🍪 Cookie set for middleware');
        }
      },
    }),
    {
      name: 'user-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        console.log('🔄 Zustand rehydration completed');
        console.log('🔄 Rehydrated state:', {
          user: !!state?.user,
          isAuthenticated: state?.isAuthenticated,
          token: !!state?.token
        });
      },
    }
  )
);

// Helper function to get auth headers for API calls
export const getAuthHeaders = (): Record<string, string> => {
  const token = useUserStore.getState().token;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Helper function to check if user is authenticated
export const isAuthenticated = () => {
  return useUserStore.getState().isAuthenticated;
};