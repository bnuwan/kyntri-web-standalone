import { format, formatDistance, formatRelative } from 'date-fns';
import type { IncidentSeverity, UserRole, IncidentStatus, PermitStatus } from '../types';

// Date formatting utilities
export const formatDate = (date: Date | string, pattern: string = 'MMM dd, yyyy') => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, pattern);
};

export const formatDateTime = (date: Date | string) => {
  return formatDate(date, 'MMM dd, yyyy HH:mm');
};

export const formatRelativeTime = (date: Date | string) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return formatRelative(dateObj, new Date());
};

export const formatTimeAgo = (date: Date | string) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return formatDistance(dateObj, new Date(), { addSuffix: true });
};

// Status formatting utilities
export const getSeverityColor = (severity: IncidentSeverity): string => {
  const colors = {
    LOW: 'text-success-600 bg-success-100',
    MEDIUM: 'text-warning-600 bg-warning-100',
    HIGH: 'text-danger-600 bg-danger-100',
    CRITICAL: 'text-white bg-danger-600',
  };
  return colors[severity] || 'text-gray-600 bg-gray-100';
};

export const getStatusColor = (status: IncidentStatus | PermitStatus): string => {
  const colors = {
    // Incident statuses
    DRAFT: 'text-gray-600 bg-gray-100',
    SUBMITTED: 'text-primary-600 bg-primary-100',
    UNDER_INVESTIGATION: 'text-warning-600 bg-warning-100',
    RESOLVED: 'text-success-600 bg-success-100',
    CLOSED: 'text-gray-600 bg-gray-100',
    
    // Permit statuses
    APPROVED: 'text-success-600 bg-success-100',
    ACTIVE: 'text-primary-600 bg-primary-100',
    SUSPENDED: 'text-warning-600 bg-warning-100',
    EXPIRED: 'text-danger-600 bg-danger-100',
    REJECTED: 'text-danger-600 bg-danger-100',
  };
  return colors[status] || 'text-gray-600 bg-gray-100';
};

export const getRoleDisplayName = (role: UserRole): string => {
  const names = {
    ORG_ADMIN: 'Organization Admin',
    HSE_MANAGER: 'HSE Manager',
    SITE_SUPERVISOR: 'Site Supervisor',
    WORKER: 'Worker',
    CONTRACTOR: 'Contractor',
    AUDITOR: 'Auditor',
  };
  return names[role] || role;
};

// Number formatting utilities
export const formatNumber = (num: number, decimals: number = 0): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
};

export const formatPercentage = (value: number, total: number): string => {
  if (total === 0) return '0%';
  return `${Math.round((value / total) * 100)}%`;
};

export const formatFileSize = (bytes: number): string => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`;
};

// Text utilities
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

export const capitalizeFirst = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const getInitials = (firstName: string, lastName: string): string => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

// Validation utilities
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s-()]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
};

// Color utilities
export const generateColorFromString = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const hue = hash % 360;
  return `hsl(${hue}, 65%, 50%)`;
};