import { ApiError, ApiResponse } from '../features/incidents/types';

export class ApiClientError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: ApiError
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

export interface RequestConfig {
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

class ApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    // Add API key if in public mode
    const apiKey = import.meta.env.VITE_API_KEY;
    if (apiKey) {
      this.defaultHeaders['x-api-key'] = apiKey;
    }
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async fetchWithRetry(
    url: string,
    options: RequestInit,
    config: RequestConfig = {}
  ): Promise<Response> {
    const { retries = 3, retryDelay = 1000 } = config;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, options);
        
        // Don't retry on 4xx errors (client errors)
        if (response.status >= 400 && response.status < 500 && attempt === 0) {
          return response;
        }
        
        // Retry on 5xx errors or 429 (rate limit)
        if ((response.status >= 500 || response.status === 429) && attempt < retries) {
          const delay = retryDelay * Math.pow(2, attempt); // Exponential backoff
          await this.delay(delay);
          continue;
        }
        
        return response;
      } catch (error) {
        lastError = error as Error;
        if (attempt < retries) {
          const delay = retryDelay * Math.pow(2, attempt);
          await this.delay(delay);
          continue;
        }
      }
    }

    throw lastError || new Error('Request failed after retries');
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');

    if (!response.ok) {
      if (isJson) {
        try {
          const errorData = await response.json() as ApiError;
          throw new ApiClientError(
            errorData.title || `HTTP ${response.status}`,
            response.status,
            errorData
          );
        } catch (parseError) {
          throw new ApiClientError(
            `HTTP ${response.status}: ${response.statusText}`,
            response.status
          );
        }
      } else {
        const text = await response.text();
        throw new ApiClientError(
          text || `HTTP ${response.status}: ${response.statusText}`,
          response.status
        );
      }
    }

    if (!isJson) {
      return response.text() as any;
    }

    try {
      const data = await response.json();
      // Handle both direct data and wrapped responses
      return data.data !== undefined ? data.data : data;
    } catch (parseError) {
      throw new ApiClientError('Invalid JSON response', response.status);
    }
  }

  async get<T>(
    endpoint: string,
    params?: Record<string, string | number | boolean>,
    config?: RequestConfig
  ): Promise<T> {
    const url = new URL(endpoint, this.baseUrl);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const response = await this.fetchWithRetry(url.toString(), {
      method: 'GET',
      headers: {
        ...this.defaultHeaders,
        ...config?.headers
      }
    }, config);

    return this.handleResponse<T>(response);
  }

  async post<T>(
    endpoint: string,
    data?: any,
    config?: RequestConfig
  ): Promise<T> {
    const url = new URL(endpoint, this.baseUrl);

    const response = await this.fetchWithRetry(url.toString(), {
      method: 'POST',
      headers: {
        ...this.defaultHeaders,
        ...config?.headers
      },
      body: data ? JSON.stringify(data) : undefined
    }, config);

    return this.handleResponse<T>(response);
  }

  async put<T>(
    endpoint: string,
    data?: any,
    config?: RequestConfig
  ): Promise<T> {
    const url = new URL(endpoint, this.baseUrl);

    const response = await this.fetchWithRetry(url.toString(), {
      method: 'PUT',
      headers: {
        ...this.defaultHeaders,
        ...config?.headers
      },
      body: data ? JSON.stringify(data) : undefined
    }, config);

    return this.handleResponse<T>(response);
  }

  async patch<T>(
    endpoint: string,
    data?: any,
    config?: RequestConfig
  ): Promise<T> {
    const url = new URL(endpoint, this.baseUrl);

    const response = await this.fetchWithRetry(url.toString(), {
      method: 'PATCH',
      headers: {
        ...this.defaultHeaders,
        ...config?.headers
      },
      body: data ? JSON.stringify(data) : undefined
    }, config);

    return this.handleResponse<T>(response);
  }

  async delete<T>(
    endpoint: string,
    config?: RequestConfig
  ): Promise<T> {
    const url = new URL(endpoint, this.baseUrl);

    const response = await this.fetchWithRetry(url.toString(), {
      method: 'DELETE',
      headers: {
        ...this.defaultHeaders,
        ...config?.headers
      }
    }, config);

    return this.handleResponse<T>(response);
  }

  // Upload file to pre-signed URL
  async uploadFile(
    uploadUrl: string,
    file: File,
    headers: Record<string, string> = {},
    onProgress?: (progress: number) => void
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = (event.loaded / event.total) * 100;
          onProgress(progress);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new ApiClientError(`Upload failed: ${xhr.statusText}`, xhr.status));
        }
      };

      xhr.onerror = () => {
        reject(new ApiClientError('Upload failed: Network error', 0));
      };

      xhr.open('PUT', uploadUrl);
      
      // Set headers
      Object.entries(headers).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value);
      });

      xhr.send(file);
    });
  }

  // Check if online
  isOnline(): boolean {
    return navigator.onLine;
  }
}

export const apiClient = new ApiClient();