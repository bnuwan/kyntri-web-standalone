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
}

