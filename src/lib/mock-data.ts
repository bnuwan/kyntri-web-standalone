import { Site, Asset, Incident, Action } from '../features/incidents/types';

export const mockSites: Site[] = [
  {
    id: 'site-1',
    name: 'Manufacturing Plant A',
    code: 'MPA',
    location: 'Detroit, MI'
  },
  {
    id: 'site-2', 
    name: 'Distribution Center',
    code: 'DC1',
    location: 'Chicago, IL'
  },
  {
    id: 'site-3',
    name: 'Corporate Headquarters',
    code: 'HQ',
    location: 'New York, NY'
  }
];

export const mockAssets: Asset[] = [
  {
    id: 'asset-1',
    name: 'Assembly Line 1',
    code: 'AL001',
    siteId: 'site-1',
    type: 'Production Equipment'
  },
  {
    id: 'asset-2',
    name: 'Forklift FL-123',
    code: 'FL123',
    siteId: 'site-1',
    type: 'Mobile Equipment'
  },
  {
    id: 'asset-3',
    name: 'Loading Dock A',
    code: 'LDA',
    siteId: 'site-2',
    type: 'Infrastructure'
  }
];

export const mockIncidents: Incident[] = [
  {
    id: 'incident-1',
    title: 'Slip and Fall at Loading Dock',
    description: 'Employee slipped on wet floor near loading dock entrance. No serious injuries reported.',
    status: 'OPEN',
    severity: 'MEDIUM',
    siteId: 'site-2',
    siteName: 'Distribution Center',
    assetId: 'asset-3',
    assetName: 'Loading Dock A',
    location: 'Loading Dock A, Bay 3',
    reportedBy: 'John Smith',
    reportedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    attachments: [
      {
        bucketKey: 'incidents/incident-1/photo1.jpg',
        contentType: 'image/jpeg',
        size: 245760,
        originalName: 'loading_dock_photo.jpg'
      }
    ],
    timeline: [
      {
        id: 'timeline-1',
        incidentId: 'incident-1',
        type: 'CREATED',
        description: 'Incident reported by John Smith',
        userId: 'user-1',
        userName: 'John Smith',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      }
    ],
    actions: []
  },
  {
    id: 'incident-2',
    title: 'Near Miss - Falling Object',
    description: 'Tool fell from scaffolding and nearly hit worker below. No contact made.',
    status: 'IN_PROGRESS',
    severity: 'HIGH',
    siteId: 'site-1',
    siteName: 'Manufacturing Plant A',
    assetId: 'asset-1',
    assetName: 'Assembly Line 1',
    location: 'Assembly Line 1, Station 5',
    reportedBy: 'Sarah Johnson',
    reportedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    attachments: [],
    timeline: [
      {
        id: 'timeline-2',
        incidentId: 'incident-2',
        type: 'CREATED',
        description: 'Incident reported by Sarah Johnson',
        userId: 'user-2',
        userName: 'Sarah Johnson',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'timeline-3',
        incidentId: 'incident-2',
        type: 'STATUS_CHANGED',
        description: 'Status changed from OPEN to IN_PROGRESS',
        userId: 'user-3',
        userName: 'Mike Wilson',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      }
    ],
    actions: []
  }
];

export const mockActions: Action[] = [
  {
    id: 'action-1',
    incidentId: 'incident-1',
    title: 'Install Warning Signs',
    description: 'Place wet floor warning signs at loading dock entrance',
    status: 'PENDING',
    priority: 'MEDIUM',
    assignee: 'user-4',
    assigneeName: 'David Brown',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  }
];

// Simple delay utility for simulating network latency
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));