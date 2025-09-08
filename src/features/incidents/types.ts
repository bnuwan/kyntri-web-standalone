import { z } from 'zod';

// Enums
export const IncidentSeverity = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM', 
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL'
} as const;

export const IncidentStatus = {
  OPEN: 'OPEN',
  IN_PROGRESS: 'IN_PROGRESS',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED'
} as const;

export const ActionStatus = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS', 
  COMPLETED: 'COMPLETED',
  OVERDUE: 'OVERDUE'
} as const;

// Validation schemas
export const AttachmentSchema = z.object({
  bucketKey: z.string().min(1, 'Bucket key is required'),
  contentType: z.string().min(1, 'Content type is required'),
  size: z.number().positive().optional(),
  originalName: z.string().optional()
});

export const IncidentCreateSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  siteId: z.string().uuid('Invalid site ID'),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  assetId: z.string().uuid().optional(),
  attachments: z.array(AttachmentSchema).optional(),
  location: z.string().optional(),
  reportedAt: z.string().datetime().optional(),
  reportedBy: z.string().optional()
});

export const IncidentUpdateSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().min(10).optional(),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']).optional(),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  assignedTo: z.string().uuid().optional()
});

export const ActionCreateSchema = z.object({
  title: z.string().min(3, 'Action title must be at least 3 characters'),
  description: z.string().optional(),
  assignee: z.string().uuid('Invalid assignee ID'),
  dueDate: z.string().datetime('Invalid due date'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
  notes: z.string().optional()
});

export const IncidentFiltersSchema = z.object({
  siteId: z.string().uuid().optional(),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']).optional(),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  q: z.string().optional(),
  pageKey: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(20)
});

// TypeScript types
export type IncidentSeverityType = keyof typeof IncidentSeverity;
export type IncidentStatusType = keyof typeof IncidentStatus;
export type ActionStatusType = keyof typeof ActionStatus;

export type Attachment = z.infer<typeof AttachmentSchema>;
export type IncidentCreate = z.infer<typeof IncidentCreateSchema>;
export type IncidentUpdate = z.infer<typeof IncidentUpdateSchema>;
export type ActionCreate = z.infer<typeof ActionCreateSchema>;
export type IncidentFilters = z.infer<typeof IncidentFiltersSchema>;

export interface Incident {
  id: string;
  title: string;
  description: string;
  status: IncidentStatusType;
  severity: IncidentSeverityType;
  siteId: string;
  siteName: string;
  assetId?: string;
  assetName?: string;
  location?: string;
  reportedBy: string;
  reportedAt: string;
  updatedAt: string;
  assignedTo?: string;
  attachments: Attachment[];
  timeline: TimelineEvent[];
  actions: Action[];
}

export interface Action {
  id: string;
  incidentId: string;
  title: string;
  description?: string;
  status: ActionStatusType;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  assignee: string;
  assigneeName: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export interface TimelineEvent {
  id: string;
  incidentId: string;
  type: 'CREATED' | 'UPDATED' | 'STATUS_CHANGED' | 'ACTION_CREATED' | 'COMMENT_ADDED';
  description: string;
  userId: string;
  userName: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface IncidentListResponse {
  incidents: Incident[];
  nextPageKey?: string;
  totalCount: number;
}

export interface Site {
  id: string;
  name: string;
  code: string;
  location: string;
}

export interface Asset {
  id: string;
  name: string;
  code: string;
  siteId: string;
  type: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface ApiError {
  type: string;
  title: string;
  detail: string;
  status: number;
  instance?: string;
  errors?: Record<string, string[]>;
}

// File upload types
export interface FileUploadJob {
  file: File;
  bucketKey: string;
  uploadUrl: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

export interface PresignedUploadResponse {
  url: string;
  method: string;
  headers: Record<string, string>;
  bucketKey: string;
}

// Offline/Outbox types
export interface OutboxJob {
  id: string;
  type: 'incident.create' | 'incident.update' | 'action.create' | 'action.update';
  payload: any;
  files?: FileUploadJob[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  retryCount: number;
  error?: string;
}