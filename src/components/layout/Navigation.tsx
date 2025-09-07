import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  AlertTriangle, 
  CheckSquare, 
  FileText, 
  ClipboardList,
  BarChart3,
  Plus
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useAuthStore, hasPermission } from '@/stores/auth-store';
// import { UserRole } from '@kyntri/types';

// Temporary inline enum to avoid build issues
enum UserRole {
  ORG_ADMIN = 'ORG_ADMIN',
  HSE_MANAGER = 'HSE_MANAGER',
  SITE_SUPERVISOR = 'SITE_SUPERVISOR',
  WORKER = 'WORKER',
  CONTRACTOR = 'CONTRACTOR',
  AUDITOR = 'AUDITOR',
}

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    requiredRole: null,
  },
  {
    name: 'Incidents',
    href: '/incidents',
    icon: AlertTriangle,
    requiredRole: null,
  },
  {
    name: 'Actions',
    href: '/actions',
    icon: CheckSquare,
    requiredRole: null,
  },
  {
    name: 'Permits',
    href: '/permits',
    icon: FileText,
    requiredRole: null,
  },
  {
    name: 'Inspections',
    href: '/inspections',
    icon: ClipboardList,
    requiredRole: null,
  },
  {
    name: 'Reports',
    href: '/reports',
    icon: BarChart3,
    requiredRole: [UserRole.HSE_MANAGER, UserRole.ORG_ADMIN, UserRole.SITE_SUPERVISOR],
  },
];

export function Navigation() {
  const location = useLocation();
  
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:w-64 lg:bg-white lg:border-r lg:border-gray-200">
        {/* Logo */}
        <div className="flex items-center justify-center h-16 px-6 border-b border-gray-200">
          <Link to="/dashboard" className="flex items-center">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">K</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">Kyntri</span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navigationItems.map((item) => {
            if (item.requiredRole && !hasPermission(item.requiredRole)) {
              return null;
            }

            const isActive = location.pathname === item.href || 
              (item.href !== '/dashboard' && location.pathname.startsWith(item.href));

            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                )}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Quick actions */}
        <div className="px-4 py-4 border-t border-gray-200">
          <Link
            to="/incidents/new"
            className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Report Incident
          </Link>
        </div>
      </aside>

      {/* Mobile bottom navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="flex justify-around">
          {navigationItems.slice(0, 4).map((item) => {
            if (item.requiredRole && !hasPermission(item.requiredRole)) {
              return null;
            }

            const isActive = location.pathname === item.href || 
              (item.href !== '/dashboard' && location.pathname.startsWith(item.href));

            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'flex flex-col items-center justify-center px-2 py-2 text-xs font-medium transition-colors min-w-0 flex-1',
                  isActive
                    ? 'text-primary'
                    : 'text-gray-500 hover:text-gray-900'
                )}
              >
                <item.icon className="w-5 h-5 mb-1" />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}

          {/* More button for additional items */}
          <Link
            to="/menu"
            className={cn(
              'flex flex-col items-center justify-center px-2 py-2 text-xs font-medium transition-colors min-w-0 flex-1',
              location.pathname === '/menu'
                ? 'text-primary'
                : 'text-gray-500 hover:text-gray-900'
            )}
          >
            <div className="w-5 h-5 mb-1 flex items-center justify-center">
              <div className="grid grid-cols-2 gap-0.5">
                <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
                <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
                <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
                <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
              </div>
            </div>
            <span className="truncate">More</span>
          </Link>
        </div>
      </nav>
    </>
  );
}