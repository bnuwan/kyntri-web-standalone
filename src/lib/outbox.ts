import Dexie, { Table } from 'dexie';
import { OutboxJob, FileUploadJob } from '../features/incidents/types';
import { incidentsApi } from '../features/incidents/api';

// IndexedDB Schema
export class OutboxDatabase extends Dexie {
  outbox!: Table<OutboxJob>;
  cache!: Table<{ key: string; data: any; timestamp: number; ttl?: number }>;
  meta!: Table<{ key: string; value: any }>;

  constructor() {
    super('KyntriOutbox');
    
    this.version(1).stores({
      outbox: '++id, type, status, createdAt, retryCount',
      cache: '++key, timestamp',
      meta: '++key'
    });
  }
}

export const db = new OutboxDatabase();

export class OutboxManager {
  private isProcessing = false;
  private processingPromise: Promise<void> | null = null;
  
  constructor() {
    // Auto-sync when online
    window.addEventListener('online', () => {
      this.processJobs();
    });

    // Process jobs on startup if online
    if (navigator.onLine) {
      setTimeout(() => this.processJobs(), 1000);
    }
  }

  // Add job to outbox
  async enqueue(job: Omit<OutboxJob, 'id' | 'status' | 'createdAt' | 'retryCount'>): Promise<string> {
    const fullJob: OutboxJob = {
      ...job,
      id: crypto.randomUUID(),
      status: 'pending',
      createdAt: new Date().toISOString(),
      retryCount: 0
    };

    await db.outbox.add(fullJob);
    
    // Try to process immediately if online
    if (navigator.onLine) {
      setTimeout(() => this.processJobs(), 100);
    }

    return fullJob.id;
  }

  // Get pending jobs count
  async getPendingJobsCount(): Promise<number> {
    return db.outbox.where('status').anyOf(['pending', 'processing']).count();
  }

  // Get all jobs with stats
  async getJobStats(): Promise<{
    pending: number;
    processing: number;
    completed: number;
    failed: number;
    total: number;
  }> {
    const [pending, processing, completed, failed, total] = await Promise.all([
      db.outbox.where('status').equals('pending').count(),
      db.outbox.where('status').equals('processing').count(),
      db.outbox.where('status').equals('completed').count(),
      db.outbox.where('status').equals('failed').count(),
      db.outbox.count()
    ]);

    return { pending, processing, completed, failed, total };
  }

  // Process all pending jobs
  async processJobs(): Promise<void> {
    if (this.isProcessing) {
      return this.processingPromise!;
    }

    if (!navigator.onLine) {
      console.log('OutboxManager: Offline, skipping job processing');
      return;
    }

    this.isProcessing = true;
    this.processingPromise = this._processJobs();

    try {
      await this.processingPromise;
    } finally {
      this.isProcessing = false;
      this.processingPromise = null;
    }
  }

  private async _processJobs(): Promise<void> {
    console.log('OutboxManager: Processing pending jobs...');
    
    const pendingJobs = await db.outbox
      .where('status')
      .anyOf(['pending', 'processing'])
      .toArray();

    console.log(`OutboxManager: Found ${pendingJobs.length} pending jobs`);

    for (const job of pendingJobs) {
      try {
        await this.processJob(job);
      } catch (error) {
        console.error(`OutboxManager: Error processing job ${job.id}:`, error);
      }
    }
  }

  private async processJob(job: OutboxJob): Promise<void> {
    console.log(`OutboxManager: Processing job ${job.id} (${job.type})`);
    
    // Mark as processing
    await db.outbox.update(job.id, { 
      status: 'processing',
      retryCount: job.retryCount + 1 
    });

    try {
      switch (job.type) {
        case 'incident.create':
          await this.processIncidentCreate(job);
          break;
        case 'incident.update':
          await this.processIncidentUpdate(job);
          break;
        case 'action.create':
          await this.processActionCreate(job);
          break;
        case 'action.update':
          await this.processActionUpdate(job);
          break;
        default:
          throw new Error(`Unknown job type: ${job.type}`);
      }

      // Mark as completed
      await db.outbox.update(job.id, { 
        status: 'completed',
        error: undefined
      });

      console.log(`OutboxManager: Job ${job.id} completed successfully`);

    } catch (error: any) {
      console.error(`OutboxManager: Job ${job.id} failed:`, error);

      const shouldRetry = job.retryCount < 3 && this.isRetryableError(error);
      
      if (shouldRetry) {
        // Reset to pending for retry with exponential backoff
        const delay = Math.pow(2, job.retryCount) * 1000; // 1s, 2s, 4s
        setTimeout(async () => {
          await db.outbox.update(job.id, { status: 'pending' });
        }, delay);
        
        console.log(`OutboxManager: Job ${job.id} will retry in ${delay}ms`);
      } else {
        // Mark as failed
        await db.outbox.update(job.id, {
          status: 'failed',
          error: error.message || 'Unknown error'
        });
        
        console.error(`OutboxManager: Job ${job.id} permanently failed after ${job.retryCount} retries`);
      }
    }
  }

  private async processIncidentCreate(job: OutboxJob): Promise<void> {
    let payload = { ...job.payload };

    // Upload files first if any
    if (job.files && job.files.length > 0) {
      const attachments = [];
      
      for (const fileJob of job.files) {
        if (fileJob.status !== 'completed') {
          // Upload the file
          const attachment = await incidentsApi.uploadFile(fileJob.file);
          attachments.push(attachment);
          
          // Update file job status
          fileJob.status = 'completed';
          fileJob.progress = 100;
        }
      }
      
      payload.attachments = attachments;
      
      // Update job with file upload results
      await db.outbox.update(job.id, { files: job.files });
    }

    // Create the incident
    const result = await incidentsApi.createIncident(payload);
    
    // Store server ID mapping for potential updates
    await this.cacheServerMapping(job.payload.tempId, result.id);
    
    console.log(`OutboxManager: Incident created with ID ${result.id}`);
  }

  private async processIncidentUpdate(job: OutboxJob): Promise<void> {
    const { id, ...updates } = job.payload;
    const serverId = await this.getServerMapping(id) || id;
    
    await incidentsApi.updateIncident(serverId, updates);
    console.log(`OutboxManager: Incident ${serverId} updated`);
  }

  private async processActionCreate(job: OutboxJob): Promise<void> {
    const { incidentId, ...actionData } = job.payload;
    const serverIncidentId = await this.getServerMapping(incidentId) || incidentId;
    
    const result = await incidentsApi.createAction(serverIncidentId, actionData);
    
    // Store server ID mapping
    await this.cacheServerMapping(job.payload.tempId, result.id);
    
    console.log(`OutboxManager: Action created with ID ${result.id}`);
  }

  private async processActionUpdate(job: OutboxJob): Promise<void> {
    const { id, ...updates } = job.payload;
    const serverId = await this.getServerMapping(id) || id;
    
    await incidentsApi.updateAction(serverId, updates);
    console.log(`OutboxManager: Action ${serverId} updated`);
  }

  private isRetryableError(error: any): boolean {
    // Don't retry client errors (4xx), except for auth errors
    if (error.status >= 400 && error.status < 500) {
      return error.status === 401 || error.status === 403;
    }
    
    // Retry server errors (5xx) and network errors
    return error.status >= 500 || !error.status;
  }

  // ID mapping helpers for temp IDs to server IDs
  private async cacheServerMapping(tempId: string, serverId: string): Promise<void> {
    await db.meta.put({ key: `mapping:${tempId}`, value: serverId });
  }

  private async getServerMapping(tempId: string): Promise<string | null> {
    const mapping = await db.meta.get(`mapping:${tempId}`);
    return mapping?.value || null;
  }

  // Cache management
  async setCache(key: string, data: any, ttl?: number): Promise<void> {
    await db.cache.put({
      key,
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  async getCache(key: string): Promise<any | null> {
    const cached = await db.cache.get(key);
    
    if (!cached) return null;
    
    // Check TTL
    if (cached.ttl && Date.now() > cached.timestamp + cached.ttl) {
      await db.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  async clearCache(pattern?: string): Promise<void> {
    if (pattern) {
      await db.cache.where('key').startsWith(pattern).delete();
    } else {
      await db.cache.clear();
    }
  }

  // Cleanup old completed jobs
  async cleanup(olderThanDays = 7): Promise<void> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - olderThanDays);
    
    await db.outbox
      .where('status')
      .equals('completed')
      .and(job => new Date(job.createdAt) < cutoff)
      .delete();
      
    console.log(`OutboxManager: Cleaned up completed jobs older than ${olderThanDays} days`);
  }
}

export const outboxManager = new OutboxManager();