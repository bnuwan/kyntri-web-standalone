import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { ulid } from 'ulid';
import { incidentsApi } from './api';
import { outboxManager } from '../../lib/outbox';
import {
  Incident,
  IncidentCreate,
  IncidentUpdate,
  IncidentFilters,
  ActionCreate,
  Site,
  Asset
} from './types';

// Query keys
export const incidentKeys = {
  all: ['incidents'] as const,
  lists: () => [...incidentKeys.all, 'list'] as const,
  list: (filters: IncidentFilters) => [...incidentKeys.lists(), filters] as const,
  details: () => [...incidentKeys.all, 'detail'] as const,
  detail: (id: string) => [...incidentKeys.details(), id] as const,
  actions: () => ['actions'] as const,
  actionsList: (incidentId?: string) => [...incidentKeys.actions(), 'list', incidentId] as const,
  sites: ['sites'] as const,
  assets: (siteId?: string) => ['assets', siteId] as const,
};

// Health check
export function useHealthCheck() {
  return useQuery({
    queryKey: ['health'],
    queryFn: () => incidentsApi.health(),
    staleTime: 30000, // 30 seconds
    retry: false,
  });
}

// Sites
export function useSites() {
  return useQuery({
    queryKey: incidentKeys.sites,
    queryFn: () => incidentsApi.getSites(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Assets
export function useAssets(siteId?: string) {
  return useQuery({
    queryKey: incidentKeys.assets(siteId),
    queryFn: () => incidentsApi.getAssets(siteId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!siteId,
  });
}

// Incidents list with infinite scroll
export function useIncidents(filters: IncidentFilters = {}) {
  return useInfiniteQuery({
    queryKey: incidentKeys.list(filters),
    queryFn: ({ pageParam }) => 
      incidentsApi.getIncidents({ ...filters, pageKey: pageParam }),
    getNextPageParam: (lastPage) => lastPage.nextPageKey,
    staleTime: 60000, // 1 minute
    initialPageParam: undefined as string | undefined,
  });
}

// Single incident
export function useIncident(id: string) {
  return useQuery({
    queryKey: incidentKeys.detail(id),
    queryFn: () => incidentsApi.getIncident(id),
    staleTime: 30000, // 30 seconds
    enabled: !!id,
  });
}

// Actions list
export function useActions(incidentId?: string) {
  return useQuery({
    queryKey: incidentKeys.actionsList(incidentId),
    queryFn: () => incidentsApi.getActions(incidentId),
    staleTime: 30000, // 30 seconds
  });
}

// Create incident mutation with offline support
export function useCreateIncident() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (incident: IncidentCreate & { files?: File[] }) => {
      const { files, ...incidentData } = incident;
      
      // Generate temporary ID for optimistic updates
      const tempId = ulid();
      const optimisticIncident: Incident = {
        id: tempId,
        ...incidentData,
        status: 'OPEN',
        siteName: '', // Will be populated when we fetch sites
        reportedBy: 'current-user', // TODO: Get from auth context
        reportedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        attachments: [],
        timeline: [],
        actions: [],
      };

      // If online, try to create immediately
      if (navigator.onLine) {
        try {
          // Upload files first if any
          let attachments = [];
          if (files && files.length > 0) {
            attachments = await incidentsApi.uploadFiles(files);
          }

          const finalIncident = { ...incidentData, attachments };
          const result = await incidentsApi.createIncident(finalIncident);
          
          return { ...optimisticIncident, id: result.id };
        } catch (error) {
          // Fall back to offline queue
          console.log('Failed to create incident online, adding to outbox:', error);
        }
      }

      // Add to offline queue
      const jobId = await outboxManager.enqueue({
        type: 'incident.create',
        payload: { ...incidentData, tempId },
        files: files?.map(file => ({
          file,
          bucketKey: '',
          uploadUrl: '',
          progress: 0,
          status: 'pending' as const,
        })) || [],
      });

      toast.success('Incident queued for sync when online', {
        icon: '📡',
      });

      return optimisticIncident;
    },
    onSuccess: (incident) => {
      // Invalidate and refetch incidents list
      queryClient.invalidateQueries({ queryKey: incidentKeys.lists() });
      
      // Add optimistic update to cache
      queryClient.setQueryData(incidentKeys.detail(incident.id), incident);
      
      if (navigator.onLine) {
        toast.success('Incident reported successfully');
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to report incident');
    },
  });
}

// Update incident mutation
export function useUpdateIncident() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: IncidentUpdate }) => {
      if (navigator.onLine) {
        try {
          return await incidentsApi.updateIncident(id, updates);
        } catch (error) {
          console.log('Failed to update incident online, adding to outbox:', error);
        }
      }

      // Add to offline queue
      await outboxManager.enqueue({
        type: 'incident.update',
        payload: { id, ...updates },
      });

      // Optimistic update
      const current = queryClient.getQueryData<Incident>(incidentKeys.detail(id));
      if (current) {
        const updated = { ...current, ...updates, updatedAt: new Date().toISOString() };
        queryClient.setQueryData(incidentKeys.detail(id), updated);
        return updated;
      }

      throw new Error('Incident not found in cache');
    },
    onSuccess: (incident) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: incidentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: incidentKeys.detail(incident.id) });
      
      if (navigator.onLine) {
        toast.success('Incident updated successfully');
      } else {
        toast.success('Incident update queued for sync');
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update incident');
    },
  });
}

// Create action mutation
export function useCreateAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ incidentId, action }: { incidentId: string; action: ActionCreate }) => {
      const tempId = ulid();
      
      if (navigator.onLine) {
        try {
          const result = await incidentsApi.createAction(incidentId, action);
          return { ...action, id: result.id, incidentId, status: 'PENDING' as const };
        } catch (error) {
          console.log('Failed to create action online, adding to outbox:', error);
        }
      }

      // Add to offline queue
      await outboxManager.enqueue({
        type: 'action.create',
        payload: { incidentId, ...action, tempId },
      });

      // Return optimistic action
      return {
        ...action,
        id: tempId,
        incidentId,
        status: 'PENDING' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        assigneeName: '', // Will be populated when we have user data
      };
    },
    onSuccess: (action, { incidentId }) => {
      // Invalidate actions list
      queryClient.invalidateQueries({ queryKey: incidentKeys.actionsList(incidentId) });
      queryClient.invalidateQueries({ queryKey: incidentKeys.actionsList() });
      
      // Invalidate incident detail to refresh timeline
      queryClient.invalidateQueries({ queryKey: incidentKeys.detail(incidentId) });
      
      if (navigator.onLine) {
        toast.success('Action created successfully');
      } else {
        toast.success('Action queued for sync when online');
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create action');
    },
  });
}

// Update action mutation
export function useUpdateAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<any> }) => {
      if (navigator.onLine) {
        try {
          return await incidentsApi.updateAction(id, updates);
        } catch (error) {
          console.log('Failed to update action online, adding to outbox:', error);
        }
      }

      // Add to offline queue
      await outboxManager.enqueue({
        type: 'action.update',
        payload: { id, ...updates },
      });

      // TODO: Optimistic update in cache
      return { id, ...updates };
    },
    onSuccess: () => {
      // Invalidate actions queries
      queryClient.invalidateQueries({ queryKey: incidentKeys.actions() });
      
      if (navigator.onLine) {
        toast.success('Action updated successfully');
      } else {
        toast.success('Action update queued for sync');
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update action');
    },
  });
}

// File upload hook
export function useFileUpload() {
  return useMutation({
    mutationFn: async (files: File[]) => {
      return incidentsApi.uploadFiles(files);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to upload files');
    },
  });
}

// Outbox status hook
export function useOutboxStatus() {
  return useQuery({
    queryKey: ['outbox', 'status'],
    queryFn: () => outboxManager.getJobStats(),
    refetchInterval: 5000, // Refresh every 5 seconds
    staleTime: 0,
  });
}

// Sync outbox hook
export function useSyncOutbox() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      await outboxManager.processJobs();
    },
    onSuccess: () => {
      // Invalidate all cached data to refresh with server state
      queryClient.invalidateQueries({ queryKey: incidentKeys.all });
      queryClient.invalidateQueries({ queryKey: ['outbox'] });
      
      toast.success('Sync completed successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Sync failed');
    },
  });
}