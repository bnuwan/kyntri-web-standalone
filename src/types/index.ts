// User and Authentication Types
export enum UserRole {
  ORG_ADMIN = 'ORG_ADMIN',
  HSE_MANAGER = 'HSE_MANAGER',
  SITE_SUPERVISOR = 'SITE_SUPERVISOR',
  WORKER = 'WORKER',
  CONTRACTOR = 'CONTRACTOR',
  AUDITOR = 'AUDITOR',
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  tenantId: string;
  siteIds: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  avatar?: string;
  phone?: string;
  department?: string;
}

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  name: string;
  attributes: Record<string, any>;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

// Incident Management Types
export enum IncidentSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum IncidentStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  UNDER_INVESTIGATION = 'UNDER_INVESTIGATION',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

export enum IncidentType {
  NEAR_MISS = 'NEAR_MISS',
  FIRST_AID = 'FIRST_AID',
  MEDICAL_TREATMENT = 'MEDICAL_TREATMENT',
  LOST_TIME_INJURY = 'LOST_TIME_INJURY',
  FATALITY = 'FATALITY',
  ENVIRONMENTAL = 'ENVIRONMENTAL',
  PROPERTY_DAMAGE = 'PROPERTY_DAMAGE',
  VEHICLE_ACCIDENT = 'VEHICLE_ACCIDENT',
}

export interface Location {
  id: string;
  name: string;
  address: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface Attachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedAt: Date;
  uploadedBy: string;
}

export interface Incident {
  id: string;
  incidentNumber: string;
  title: string;
  description: string;
  type: IncidentType;
  severity: IncidentSeverity;
  status: IncidentStatus;
  dateTime: Date;
  location: Location;
  reportedBy: User;
  assignedTo?: User;
  attachments: Attachment[];
  witnesses?: string[];
  immediateActions?: string;
  rootCause?: string;
  correctiveActions?: string[];
  preventiveActions?: string[];
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  isOffline?: boolean;
  syncStatus?: 'pending' | 'synced' | 'failed';
}

// Inspection Types
export enum InspectionType {
  SCHEDULED = 'SCHEDULED',
  AD_HOC = 'AD_HOC',
  AUDIT = 'AUDIT',
  FOLLOW_UP = 'FOLLOW_UP',
}

export enum InspectionStatus {
  PLANNED = 'PLANNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  OVERDUE = 'OVERDUE',
}

export interface ChecklistItem {
  id: string;
  question: string;
  isCompliant: boolean | null;
  comments?: string;
  attachments?: Attachment[];
  actionRequired?: boolean;
}

export interface Inspection {
  id: string;
  title: string;
  type: InspectionType;
  status: InspectionStatus;
  scheduledDate: Date;
  completedDate?: Date;
  location: Location;
  inspector: User;
  checklist: ChecklistItem[];
  overallScore?: number;
  actionItems: ActionItem[];
  attachments: Attachment[];
  createdAt: Date;
  updatedAt: Date;
}

// Work Permit Types
export enum PermitType {
  HOT_WORK = 'HOT_WORK',
  CONFINED_SPACE = 'CONFINED_SPACE',
  HEIGHT_WORK = 'HEIGHT_WORK',
  ELECTRICAL_WORK = 'ELECTRICAL_WORK',
  EXCAVATION = 'EXCAVATION',
  RADIATION = 'RADIATION',
}

export enum PermitStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  CLOSED = 'CLOSED',
  EXPIRED = 'EXPIRED',
  REJECTED = 'REJECTED',
}

export interface RiskAssessment {
  hazards: string[];
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  controls: string[];
  residualRisk: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface WorkPermit {
  id: string;
  permitNumber: string;
  type: PermitType;
  status: PermitStatus;
  title: string;
  description: string;
  location: Location;
  requestedBy: User;
  approvedBy?: User;
  validFrom: Date;
  validTo: Date;
  riskAssessment: RiskAssessment;
  attachments: Attachment[];
  qrCode?: string;
  createdAt: Date;
  updatedAt: Date;
}

// CAPA (Corrective and Preventive Action) Types
export enum CAPAType {
  CORRECTIVE = 'CORRECTIVE',
  PREVENTIVE = 'PREVENTIVE',
}

export enum CAPAStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  VERIFIED = 'VERIFIED',
  CLOSED = 'CLOSED',
  OVERDUE = 'OVERDUE',
}

export enum CAPAPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export interface ActionItem {
  id: string;
  title: string;
  description: string;
  assignedTo: User;
  dueDate: Date;
  completedDate?: Date;
  priority: CAPAPriority;
  status: CAPAStatus;
  attachments: Attachment[];
  comments?: string;
}

export interface CAPA {
  id: string;
  capaNumber: string;
  type: CAPAType;
  status: CAPAStatus;
  priority: CAPAPriority;
  title: string;
  description: string;
  source: 'INCIDENT' | 'INSPECTION' | 'AUDIT' | 'COMPLAINT' | 'OTHER';
  sourceId?: string;
  rootCause?: string;
  assignedTo: User;
  createdBy: User;
  dueDate: Date;
  completedDate?: Date;
  actionItems: ActionItem[];
  effectivenessVerification?: {
    verified: boolean;
    verifiedBy?: User;
    verificationDate?: Date;
    comments?: string;
  };
  attachments: Attachment[];
  createdAt: Date;
  updatedAt: Date;
}

// Dashboard and Analytics Types
export interface SafetyMetrics {
  totalIncidents: number;
  criticalIncidents: number;
  daysWithoutIncident: number;
  incidentRate: number;
  trendData: {
    period: string;
    incidents: number;
    inspections: number;
    completedActions: number;
  }[];
}

export interface DashboardData {
  metrics: SafetyMetrics;
  recentIncidents: Incident[];
  pendingInspections: Inspection[];
  overdueActions: ActionItem[];
  upcomingPermits: WorkPermit[];
  aiInsights?: {
    riskPredictions: string[];
    recommendations: string[];
    trendAnalysis: string[];
  };
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

// Form Types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'select' | 'textarea' | 'date' | 'file' | 'checkbox';
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  validation?: Record<string, any>;
}

// Notification Types
export enum NotificationType {
  INFO = 'INFO',
  SUCCESS = 'SUCCESS',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  userId: string;
  read: boolean;
  actionUrl?: string;
  createdAt: Date;
}

// Theme Types
export type Theme = 'light' | 'dark' | 'system';

// Store Types
export interface AppState {
  theme: Theme;
  isOnline: boolean;
  notifications: Notification[];
  loading: Record<string, boolean>;
  errors: Record<string, string>;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
}

// Utility Types
export type LoadingState = 'idle' | 'loading' | 'succeeded' | 'failed';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}