import { getCurrentUser, fetchAuthSession } from '@aws-amplify/auth';

class ApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL;
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn('Failed to get auth token:', error);
    }

    return headers;
  }

  async get<T>(endpoint: string): Promise<T> {
    const headers = await this.getAuthHeaders();
    
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    const headers = await this.getAuthHeaders();
    
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    const headers = await this.getAuthHeaders();
    
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async delete<T>(endpoint: string): Promise<T> {
    const headers = await this.getAuthHeaders();
    
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }
}

export const apiClient = new ApiClient();