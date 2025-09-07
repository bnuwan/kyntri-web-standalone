import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
// import { UserRole } from '@kyntri/types';

// Temporary inline enum to avoid build issues
enum UserRole {
  ORG_ADMIN = 'ORG_ADMIN',
  HSE_MANAGER = 'HSE_MANAGER',
  SITE_SUPERVISOR = 'SITE_SUPERVISOR',
  WORKER = 'WORKER',
  CONTRACTOR = 'CONTRACTOR',
  AUDITOR = 'AUDITOR',
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  tenantId: string;
  siteIds: string[];
  isActive: boolean;
}

interface AuthState {
  // State
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: { username: string; password: string }) => Promise<void>;
  logout: () => void;
  refreshAccessToken: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      isAuthenticated: false,
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
      error: null,

      // Actions
      login: async (credentials) => {
        set({ isLoading: true, error: null });

        try {
          // Mock login - replace with actual Cognito authentication
          const mockResponse = {
            success: true,
            data: {
              accessToken: 'mock-access-token',
              refreshToken: 'mock-refresh-token',
              idToken: 'mock-id-token',
              expiresIn: 3600,
              user: {
                id: 'user-123',
                email: credentials.username,
                firstName: 'John',
                lastName: 'Doe',
                role: UserRole.WORKER,
                tenantId: 'tenant-123',
                siteIds: ['site-1', 'site-2'],
                isActive: true,
              },
            },
          };

          if (mockResponse.success) {
            set({
              isAuthenticated: true,
              user: mockResponse.data.user,
              accessToken: mockResponse.data.accessToken,
              refreshToken: mockResponse.data.refreshToken,
              isLoading: false,
              error: null,
            });
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Login failed';
          set({
            isAuthenticated: false,
            user: null,
            accessToken: null,
            refreshToken: null,
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      logout: () => {
        set({
          isAuthenticated: false,
          user: null,
          accessToken: null,
          refreshToken: null,
          isLoading: false,
          error: null,
        });

        // Clear any cached data
        localStorage.removeItem('kyntri-auth-storage');
        
        // Redirect to login
        window.location.href = '/login';
      },

      refreshAccessToken: async () => {
        const { refreshToken } = get();
        
        if (!refreshToken) {
          get().logout();
          return;
        }

        try {
          // Mock refresh - replace with actual Cognito token refresh
          const mockResponse = {
            success: true,
            data: {
              accessToken: 'new-mock-access-token',
              expiresIn: 3600,
            },
          };

          if (mockResponse.success) {
            set({
              accessToken: mockResponse.data.accessToken,
              error: null,
            });
          }
        } catch (error) {
          console.error('Token refresh failed:', error);
          get().logout();
        }
      },

      updateUser: (userUpdate) => {
        const { user } = get();
        if (user) {
          set({
            user: { ...user, ...userUpdate },
          });
        }
      },

      clearError: () => {
        set({ error: null });
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'kyntri-auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
);

// Utility functions
export const getAuthHeaders = () => {
  const { accessToken, user } = useAuthStore.getState();
  const headers: Record<string, string> = {};

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  if (user?.tenantId) {
    headers['X-Tenant-Id'] = user.tenantId;
  }

  return headers;
};

export const hasPermission = (requiredRole: UserRole | UserRole[]) => {
  const { user } = useAuthStore.getState();
  if (!user) return false;

  const roleHierarchy = {
    [UserRole.WORKER]: 1,
    [UserRole.CONTRACTOR]: 1,
    [UserRole.SITE_SUPERVISOR]: 2,
    [UserRole.HSE_MANAGER]: 3,
    [UserRole.ORG_ADMIN]: 4,
    [UserRole.AUDITOR]: 2, // Read-only access
  };

  const userLevel = roleHierarchy[user.role];
  
  if (Array.isArray(requiredRole)) {
    return requiredRole.some(role => userLevel >= roleHierarchy[role]);
  }

  return userLevel >= roleHierarchy[requiredRole];
};

export const canAccessSite = (siteId: string) => {
  const { user } = useAuthStore.getState();
  if (!user) return false;

  // Admins and HSE managers can access all sites
  if ([UserRole.ORG_ADMIN, UserRole.HSE_MANAGER].includes(user.role)) {
    return true;
  }

  return user.siteIds.includes(siteId);
};

export const getUserDisplayName = () => {
  const { user } = useAuthStore.getState();
  if (!user) return 'Guest';
  return `${user.firstName} ${user.lastName}`;
};

export const getUserInitials = () => {
  const { user } = useAuthStore.getState();
  if (!user) return 'G';
  return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
};