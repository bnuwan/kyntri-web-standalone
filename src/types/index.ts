// Local type definitions to replace @kyntri/types

export interface ApiResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
  timestamp: string;
  error?: {
    message: string;
    details?: string;
  };
}

export interface ApiError {
  message: string;
  code: string;
  details?: any;
  detail?: string; // Alternative naming
  status?: number;
  timestamp: string;
}

export enum UserRole {
  ORG_ADMIN = 'ORG_ADMIN',
  HSE_MANAGER = 'HSE_MANAGER', 
  SITE_SUPERVISOR = 'SITE_SUPERVISOR',
  WORKER = 'WORKER',
  CONTRACTOR = 'CONTRACTOR',
  AUDITOR = 'AUDITOR'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  avatar?: string;
  lastLogin?: Date;
  isActive: boolean;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'reported' | 'investigating' | 'resolved' | 'closed';
  reporterId: string;
  assignedTo?: string;
  location: string;
  createdAt: Date;
  updatedAt: Date;
  photos?: string[];
}

export interface Inspection {
  id: string;
  title: string;
  type: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  inspectorId: string;
  location: string;
  scheduledDate: Date;
  completedDate?: Date;
  findings: string[];
  score?: number;
}

export interface Permit {
  id: string;
  title: string;
  type: 'hot_work' | 'confined_space' | 'height_work' | 'electrical' | 'general';
  status: 'draft' | 'pending_approval' | 'approved' | 'active' | 'completed' | 'cancelled';
  requesterId: string;
  approvers: string[];
  validFrom: Date;
  validTo: Date;
  location: string;
  riskAssessment: string;
}