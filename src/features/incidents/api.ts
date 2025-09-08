import { apiClient } from '../../lib/api-client';
import { mockSites, mockAssets, mockIncidents, mockActions, delay } from '../../lib/mock-data';
// Conditional import of Supabase API to avoid initialization errors
let supabaseIncidentsApi: any = null;
import {
  Incident,
  IncidentCreate,
  IncidentUpdate,
  IncidentListResponse,
  IncidentFilters,
  Action,
  ActionCreate,
  PresignedUploadResponse,
  Site,
  Asset
} from './types';

// Configuration flags
const USE_SUPABASE = import.meta.env.VITE_USE_SUPABASE === 'true';
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true' || (!USE_SUPABASE && import.meta.env.DEV);

// Lazy load Supabase API to avoid initialization errors
async function getSupabaseApi() {
  if (!supabaseIncidentsApi && USE_SUPABASE) {
    try {
      const { supabaseIncidentsApi: api } = await import('./api-supabase');
      supabaseIncidentsApi = api;
    } catch (error) {
      console.error('Failed to load Supabase API:', error);
      throw new Error('Supabase configuration error. Please check your environment variables.');
    }
  }
  return supabaseIncidentsApi;
}

export class IncidentsApi {
  // Health check
  async health(): Promise<{ ok: boolean }> {
    if (USE_SUPABASE) {
      const api = await getSupabaseApi();
      return api.health();
    }
    return apiClient.get('/health');
  }

  // Upload presigned URLs
  async getPresignedUploadUrls(files: { name: string; type: string; size: number }[]): Promise<PresignedUploadResponse[]> {
    return apiClient.post('/uploads/sign', { files });
  }

  // Incidents
  async getIncidents(filters: IncidentFilters = {}): Promise<IncidentListResponse> {
    if (USE_SUPABASE) {
      const api = await getSupabaseApi();
      return api.getIncidents(filters);
    }
    
    if (USE_MOCK_DATA) {
      await delay(800);
      
      let filteredIncidents = [...mockIncidents];
      
      // Apply filters
      if (filters.q) {
        const query = filters.q.toLowerCase();
        filteredIncidents = filteredIncidents.filter(incident => 
          incident.title.toLowerCase().includes(query) ||
          incident.description.toLowerCase().includes(query)
        );
      }
      
      if (filters.siteId) {
        filteredIncidents = filteredIncidents.filter(incident => incident.siteId === filters.siteId);
      }
      
      if (filters.severity) {
        filteredIncidents = filteredIncidents.filter(incident => incident.severity === filters.severity);
      }
      
      if (filters.status) {
        filteredIncidents = filteredIncidents.filter(incident => incident.status === filters.status);
      }
      
      return {
        incidents: filteredIncidents,
        totalCount: filteredIncidents.length,
        nextPageKey: undefined
      };
    }
    
    const params = Object.entries(filters).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, any>);

    return apiClient.get('/incidents', params);
  }

  async getIncident(id: string): Promise<Incident> {
    if (USE_SUPABASE) {
      const api = await getSupabaseApi();
      return api.getIncident(id);
    }
    if (USE_MOCK_DATA) {
      await delay(400);
      const incident = mockIncidents.find(inc => inc.id === id);
      if (!incident) {
        throw new Error('Incident not found');
      }
      return incident;
    }
    return apiClient.get(`/incidents/${id}`);
  }

  async createIncident(incident: IncidentCreate): Promise<{ id: string; status: string }> {
    if (USE_SUPABASE) {
      const api = await getSupabaseApi();
      return api.createIncident(incident);
    }
    if (USE_MOCK_DATA) {
      await delay(1000);
      const newId = `incident-${Date.now()}`;
      
      // Add to mock data for subsequent queries
      const newIncident: Incident = {
        ...incident,
        id: newId,
        status: 'OPEN',
        siteName: mockSites.find(s => s.id === incident.siteId)?.name || 'Unknown Site',
        assetName: incident.assetId ? mockAssets.find(a => a.id === incident.assetId)?.name : undefined,
        reportedBy: 'Current User',
        reportedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        attachments: incident.attachments || [],
        timeline: [{
          id: `timeline-${Date.now()}`,
          incidentId: newId,
          type: 'CREATED',
          description: 'Incident reported',
          userId: 'current-user',
          userName: 'Current User',
          timestamp: new Date().toISOString()
        }],
        actions: []
      };
      
      mockIncidents.unshift(newIncident);
      
      return { id: newId, status: 'created' };
    }
    return apiClient.post('/incidents', incident);
  }

  async updateIncident(id: string, updates: IncidentUpdate): Promise<Incident> {
    return apiClient.patch(`/incidents/${id}`, updates);
  }

  async deleteIncident(id: string): Promise<void> {
    return apiClient.delete(`/incidents/${id}`);
  }

  // Actions (CAPA)
  async createAction(incidentId: string, action: ActionCreate): Promise<{ id: string; status: string }> {
    return apiClient.post(`/incidents/${incidentId}/actions`, action);
  }

  async updateAction(actionId: string, updates: Partial<Action>): Promise<Action> {
    return apiClient.patch(`/actions/${actionId}`, updates);
  }

  async getActions(incidentId?: string): Promise<Action[]> {
    const endpoint = incidentId ? `/incidents/${incidentId}/actions` : '/actions';
    return apiClient.get(endpoint);
  }

  // Sites
  async getSites(): Promise<Site[]> {
    if (USE_SUPABASE) {
      const api = await getSupabaseApi();
      return api.getSites();
    }
    if (USE_MOCK_DATA) {
      await delay(500);
      return mockSites;
    }
    return apiClient.get('/sites');
  }

  async getSite(id: string): Promise<Site> {
    return apiClient.get(`/sites/${id}`);
  }

  // Assets
  async getAssets(siteId?: string): Promise<Asset[]> {
    if (USE_SUPABASE) {
      const api = await getSupabaseApi();
      return api.getAssets(siteId);
    }
    if (USE_MOCK_DATA) {
      await delay(300);
      return siteId ? mockAssets.filter(asset => asset.siteId === siteId) : mockAssets;
    }
    const params = siteId ? { siteId } : undefined;
    return apiClient.get('/assets', params);
  }

  async getAsset(id: string): Promise<Asset> {
    return apiClient.get(`/assets/${id}`);
  }

  // Upload file helper
  async uploadFile(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<{ bucketKey: string; contentType: string; size: number }> {
    if (USE_SUPABASE) {
      const api = await getSupabaseApi();
      return api.uploadFile(file, onProgress);
    }

    // Get presigned URL
    const [uploadInfo] = await this.getPresignedUploadUrls([
      { name: file.name, type: file.type, size: file.size }
    ]);

    // Upload file
    await apiClient.uploadFile(
      uploadInfo.url,
      file,
      uploadInfo.headers,
      onProgress
    );

    return {
      bucketKey: uploadInfo.bucketKey,
      contentType: file.type,
      size: file.size
    };
  }

  // Batch upload files
  async uploadFiles(
    files: File[],
    onProgress?: (fileIndex: number, progress: number) => void
  ): Promise<{ bucketKey: string; contentType: string; size: number }[]> {
    if (files.length === 0) return [];

    if (USE_SUPABASE) {
      const api = await getSupabaseApi();
      return api.uploadFiles(files, onProgress);
    }

    // Get presigned URLs for all files
    const uploadInfos = await this.getPresignedUploadUrls(
      files.map(file => ({ name: file.name, type: file.type, size: file.size }))
    );

    // Upload all files concurrently
    const uploadPromises = files.map(async (file, index) => {
      const uploadInfo = uploadInfos[index];
      
      await apiClient.uploadFile(
        uploadInfo.url,
        file,
        uploadInfo.headers,
        (progress) => onProgress?.(index, progress)
      );

      return {
        bucketKey: uploadInfo.bucketKey,
        contentType: file.type,
        size: file.size
      };
    });

    return Promise.all(uploadPromises);
  }
}

export const incidentsApi = new IncidentsApi();