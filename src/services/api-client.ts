import axios, { AxiosInstance, AxiosError } from 'axios';
import { ApiResponse, ApiError } from '../types';
import { useAuthStore } from '@/stores/auth-store';
import toast from 'react-hot-toast';

export class ApiClient {
  private client: AxiosInstance;
  private baseURL: string;

  constructor(baseURL?: string) {
    this.baseURL = baseURL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - Add auth token
    this.client.interceptors.request.use(
      (config) => {
        const authStore = useAuthStore.getState();
        
        if (authStore.accessToken) {
          config.headers.Authorization = `Bearer ${authStore.accessToken}`;
        }

        if (authStore.user?.tenantId) {
          config.headers['X-Tenant-Id'] = authStore.user.tenantId;
        }

        // Add correlation ID for tracing
        config.headers['X-Correlation-ID'] = crypto.randomUUID();

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - Handle errors
    this.client.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config;

        // Handle 401 errors (unauthorized)
        if (error.response?.status === 401 && originalRequest && !originalRequest.url?.includes('/auth/')) {
          const authStore = useAuthStore.getState();
          
          // Try to refresh token
          if (authStore.refreshToken) {
            try {
              await authStore.refreshAccessToken();
              // Retry original request with new token
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${authStore.accessToken}`;
              }
              return this.client.request(originalRequest);
            } catch (refreshError) {
              // Refresh failed, logout user
              authStore.logout();
              window.location.href = '/login';
            }
          } else {
            // No refresh token, logout user
            authStore.logout();
            window.location.href = '/login';
          }
        }

        // Handle network errors
        if (!error.response) {
          // Check if we're offline
          if (!navigator.onLine) {
            toast.error('You are offline. Changes will be saved when connection is restored.');
            return Promise.reject(new Error('OFFLINE'));
          }
          
          toast.error('Network error. Please check your connection.');
          return Promise.reject(error);
        }

        // Handle API errors
        const apiError = error.response.data as ApiError;
        if (apiError?.detail) {
          // Don't show toast for validation errors (let components handle them)
          if (apiError.status !== 400) {
            toast.error(apiError.detail);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Generic request methods
  async get<T>(url: string, params?: any): Promise<ApiResponse<T>> {
    const response = await this.client.get(url, { params });
    return response.data;
  }

  async post<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response = await this.client.post(url, data);
    return response.data;
  }

  async put<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response = await this.client.put(url, data);
    return response.data;
  }

  async patch<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response = await this.client.patch(url, data);
    return response.data;
  }

  async delete<T>(url: string): Promise<ApiResponse<T>> {
    const response = await this.client.delete(url);
    return response.data;
  }

  // File upload with progress
  async uploadFile(
    url: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.client.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });

    return response.data;
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      await this.client.get('/health');
      return true;
    } catch {
      return false;
    }
  }

  // Update base URL (useful for switching environments)
  updateBaseURL(baseURL: string) {
    this.baseURL = baseURL;
    this.client.defaults.baseURL = baseURL;
  }

  // Get current base URL
  getBaseURL(): string {
    return this.baseURL;
  }
}

// Singleton instance
export const apiClient = new ApiClient();

// Typed API response handler
export function handleApiResponse<T>(response: ApiResponse<T>): T {
  if (!response.success) {
    throw new Error(response.error?.details || response.error?.message || 'API request failed');
  }
  return response.data!;
}

// Error boundary helper
export function isApiError(error: any): error is AxiosError<ApiError> {
  return error?.isAxiosError && error?.response?.data?.type;
}

// Retry utility for failed requests
export async function retryApiCall<T>(
  apiCall: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on client errors (4xx)
      if (isApiError(error) && error.response?.status && error.response.status < 500) {
        throw error;
      }

      if (i < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i))); // Exponential backoff
      }
    }
  }

  throw lastError!;
}