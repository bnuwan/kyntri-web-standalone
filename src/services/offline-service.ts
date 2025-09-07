import { openDB, IDBPDatabase } from 'idb';

export interface OfflineAction {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  entity: string;
  data: any;
  url: string;
  method: string;
  timestamp: number;
  retryCount: number;
}

export interface OfflineData {
  id: string;
  entity: string;
  data: any;
  timestamp: number;
  synced: boolean;
}

class OfflineService {
  private db: IDBPDatabase | null = null;
  private readonly DB_NAME = 'KyntriOfflineDB';
  private readonly DB_VERSION = 1;

  async initialize(): Promise<void> {
    if (this.db) return;

    this.db = await openDB(this.DB_NAME, this.DB_VERSION, {
      upgrade(db) {
        // Offline actions queue
        if (!db.objectStoreNames.contains('actions')) {
          const actionsStore = db.createObjectStore('actions', { keyPath: 'id' });
          actionsStore.createIndex('timestamp', 'timestamp');
          actionsStore.createIndex('entity', 'entity');
        }

        // Cached data
        if (!db.objectStoreNames.contains('data')) {
          const dataStore = db.createObjectStore('data', { keyPath: 'id' });
          dataStore.createIndex('entity', 'entity');
          dataStore.createIndex('timestamp', 'timestamp');
          dataStore.createIndex('synced', 'synced');
        }

        // Form drafts
        if (!db.objectStoreNames.contains('drafts')) {
          const draftsStore = db.createObjectStore('drafts', { keyPath: 'id' });
          draftsStore.createIndex('entity', 'entity');
          draftsStore.createIndex('timestamp', 'timestamp');
        }
      },
    });
  }

  // Queue actions for when we're back online
  async queueAction(action: Omit<OfflineAction, 'id' | 'timestamp' | 'retryCount'>): Promise<void> {
    await this.initialize();
    
    const fullAction: OfflineAction = {
      ...action,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      retryCount: 0,
    };

    await this.db!.add('actions', fullAction);
  }

  // Get queued actions
  async getQueuedActions(): Promise<OfflineAction[]> {
    await this.initialize();
    return this.db!.getAll('actions');
  }

  // Remove action from queue
  async removeAction(actionId: string): Promise<void> {
    await this.initialize();
    await this.db!.delete('actions', actionId);
  }

  // Update action retry count
  async updateActionRetryCount(actionId: string, retryCount: number): Promise<void> {
    await this.initialize();
    const action = await this.db!.get('actions', actionId);
    if (action) {
      action.retryCount = retryCount;
      await this.db!.put('actions', action);
    }
  }

  // Cache data for offline access
  async cacheData(entity: string, id: string, data: any): Promise<void> {
    await this.initialize();
    
    const offlineData: OfflineData = {
      id: `${entity}-${id}`,
      entity,
      data,
      timestamp: Date.now(),
      synced: true,
    };

    await this.db!.put('data', offlineData);
  }

  // Get cached data
  async getCachedData(entity: string, id?: string): Promise<OfflineData[]> {
    await this.initialize();
    
    if (id) {
      const data = await this.db!.get('data', `${entity}-${id}`);
      return data ? [data] : [];
    }

    // Get all data for entity
    const tx = this.db!.transaction('data');
    const index = tx.store.index('entity');
    return index.getAll(entity);
  }

  // Save form draft
  async saveDraft(entity: string, formId: string, data: any): Promise<void> {
    await this.initialize();
    
    const draft = {
      id: `${entity}-${formId}`,
      entity,
      data,
      timestamp: Date.now(),
    };

    await this.db!.put('drafts', draft);
  }

  // Get form draft
  async getDraft(entity: string, formId: string): Promise<any | null> {
    await this.initialize();
    const draft = await this.db!.get('drafts', `${entity}-${formId}`);
    return draft?.data || null;
  }

  // Remove form draft
  async removeDraft(entity: string, formId: string): Promise<void> {
    await this.initialize();
    await this.db!.delete('drafts', `${entity}-${formId}`);
  }

  // Get all drafts for an entity
  async getDrafts(entity: string): Promise<any[]> {
    await this.initialize();
    const tx = this.db!.transaction('drafts');
    const index = tx.store.index('entity');
    return index.getAll(entity);
  }

  // Clear old cached data (older than 7 days)
  async clearOldCache(): Promise<void> {
    await this.initialize();
    const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    
    const tx = this.db!.transaction('data', 'readwrite');
    const index = tx.store.index('timestamp');
    const oldData = await index.getAll(IDBKeyRange.upperBound(weekAgo));
    
    for (const item of oldData) {
      await tx.store.delete(item.id);
    }
  }

  // Sync pending actions when back online
  async syncPendingActions(): Promise<void> {
    if (!navigator.onLine) return;

    const actions = await this.getQueuedActions();
    const { apiClient } = await import('./api-client');

    for (const action of actions) {
      try {
        // Retry logic with exponential backoff
        if (action.retryCount >= 3) {
          console.warn(`Removing action after 3 retries:`, action);
          await this.removeAction(action.id);
          continue;
        }

        // Execute the API call
        const response = await apiClient[action.method.toLowerCase() as keyof typeof apiClient](
          action.url,
          action.data
        );

        if (response) {
          console.log(`Successfully synced action:`, action);
          await this.removeAction(action.id);
        }
      } catch (error) {
        console.error(`Failed to sync action:`, action, error);
        await this.updateActionRetryCount(action.id, action.retryCount + 1);
      }
    }
  }

  // Get storage usage
  async getStorageUsage(): Promise<{ used: number; quota: number }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return {
        used: estimate.usage || 0,
        quota: estimate.quota || 0,
      };
    }
    return { used: 0, quota: 0 };
  }

  // Clear all offline data
  async clearAllData(): Promise<void> {
    await this.initialize();
    
    const tx = this.db!.transaction(['actions', 'data', 'drafts'], 'readwrite');
    await Promise.all([
      tx.objectStore('actions').clear(),
      tx.objectStore('data').clear(),
      tx.objectStore('drafts').clear(),
    ]);
  }

  // Check if we have pending actions
  async hasPendingActions(): Promise<boolean> {
    await this.initialize();
    const count = await this.db!.count('actions');
    return count > 0;
  }
}

export const offlineService = new OfflineService();

// Auto-sync when coming back online
let syncInProgress = false;

async function handleOnline() {
  if (syncInProgress) return;
  syncInProgress = true;

  try {
    console.log('Back online, syncing pending actions...');
    await offlineService.syncPendingActions();
  } catch (error) {
    console.error('Error syncing offline actions:', error);
  } finally {
    syncInProgress = false;
  }
}

// Listen for online/offline events
window.addEventListener('online', handleOnline);

// Periodic cleanup
setInterval(async () => {
  try {
    await offlineService.clearOldCache();
  } catch (error) {
    console.error('Error clearing old cache:', error);
  }
}, 24 * 60 * 60 * 1000); // Once per day