import React from 'react';
import { Link } from 'react-router-dom';
import { 
  AlertTriangle, 
  CheckSquare, 
  FileText, 
  ClipboardList,
  TrendingUp,
  TrendingDown,
  Plus,
  Filter
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuthStore, hasPermission } from '@/stores/auth-store';
import { UserRole } from '../types';

interface StatCard {
  title: string;
  value: string | number;
  change?: {
    value: string;
    trend: 'up' | 'down';
    period: string;
  };
  color: string;
  icon: React.ElementType;
  href: string;
}

export function Dashboard() {
  const { user } = useAuthStore();
  
  // Mock data - replace with actual API calls
  const stats: StatCard[] = [
    {
      title: 'Open Incidents',
      value: 12,
      change: { value: '-8%', trend: 'down', period: 'from last month' },
      color: 'text-red-600',
      icon: AlertTriangle,
      href: '/incidents?status=open',
    },
    {
      title: 'Pending Actions',
      value: 28,
      change: { value: '+12%', trend: 'up', period: 'from last week' },
      color: 'text-orange-600',
      icon: CheckSquare,
      href: '/actions?status=pending',
    },
    {
      title: 'Active Permits',
      value: 15,
      change: { value: '+3%', trend: 'up', period: 'from yesterday' },
      color: 'text-blue-600',
      icon: FileText,
      href: '/permits?status=active',
    },
    {
      title: 'Due Inspections',
      value: 7,
      change: { value: '-25%', trend: 'down', period: 'from last month' },
      color: 'text-green-600',
      icon: ClipboardList,
      href: '/inspections?status=due',
    },
  ];

  const recentIncidents = [
    {
      id: '1',
      title: 'Slip and fall in warehouse',
      severity: 3,
      site: 'Main Warehouse',
      reportedAt: '2 hours ago',
      status: 'Investigating',
    },
    {
      id: '2',
      title: 'Near miss - forklift operation',
      severity: 2,
      site: 'Manufacturing Floor',
      reportedAt: '5 hours ago',
      status: 'Triaged',
    },
    {
      id: '3',
      title: 'Chemical spill in lab',
      severity: 4,
      site: 'Research Lab',
      reportedAt: '1 day ago',
      status: 'Closed',
    },
  ];

  const pendingActions = [
    {
      id: '1',
      title: 'Install safety barriers',
      dueDate: '2024-01-15',
      assignee: 'John Smith',
      priority: 'High',
    },
    {
      id: '2',
      title: 'Update safety procedures',
      dueDate: '2024-01-20',
      assignee: 'Sarah Johnson',
      priority: 'Medium',
    },
    {
      id: '3',
      title: 'Conduct safety training',
      dueDate: '2024-01-25',
      assignee: 'Mike Davis',
      priority: 'Low',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your EHS activities today.
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Link to="/incidents/new">
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Report Incident
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Link key={stat.title} to={stat.href}>
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                {stat.change && (
                  <p className="text-xs text-muted-foreground flex items-center mt-1">
                    {stat.change.trend === 'up' ? (
                      <TrendingUp className="w-3 h-3 mr-1 text-green-600" />
                    ) : (
                      <TrendingDown className="w-3 h-3 mr-1 text-red-600" />
                    )}
                    <span className={stat.change.trend === 'up' ? 'text-green-600' : 'text-red-600'}>
                      {stat.change.value}
                    </span>
                    <span className="ml-1">{stat.change.period}</span>
                  </p>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Incidents */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Incidents</CardTitle>
              <Link to="/incidents">
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentIncidents.map((incident) => (
              <div key={incident.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full severity-${incident.severity}`} />
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {incident.title}
                    </h4>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {incident.site} • {incident.reportedAt}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full status-${incident.status.toLowerCase()}`}>
                  {incident.status}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Pending Actions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Pending Actions</CardTitle>
              <Link to="/actions">
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingActions.map((action) => (
              <div key={action.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {action.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Due: {new Date(action.dueDate).toLocaleDateString()} • {action.assignee}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  action.priority === 'High' ? 'bg-red-100 text-red-800' :
                  action.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {action.priority}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions - Only for certain roles */}
      {hasPermission([UserRole.HSE_MANAGER, UserRole.ORG_ADMIN, UserRole.SITE_SUPERVISOR]) && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks you can perform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link to="/incidents/new">
                <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2">
                  <AlertTriangle className="w-6 h-6" />
                  <span className="text-sm">Report Incident</span>
                </Button>
              </Link>
              
              <Link to="/permits/new">
                <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2">
                  <FileText className="w-6 h-6" />
                  <span className="text-sm">Request Permit</span>
                </Button>
              </Link>
              
              <Link to="/inspections/new">
                <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2">
                  <ClipboardList className="w-6 h-6" />
                  <span className="text-sm">Start Inspection</span>
                </Button>
              </Link>
              
              <Link to="/reports">
                <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2">
                  <TrendingUp className="w-6 h-6" />
                  <span className="text-sm">View Reports</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}