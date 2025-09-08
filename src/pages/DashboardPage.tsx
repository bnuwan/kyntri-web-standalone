import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useIncidents, useOutboxStatus } from '../features/incidents/hooks';

export function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // Fetch incident data for dashboard stats
  const { data: incidentsData, isLoading: incidentsLoading } = useIncidents();
  const { data: outboxStatus } = useOutboxStatus();
  
  const incidents = incidentsData?.pages?.flatMap(page => page.incidents) || [];
  
  // Calculate incident statistics
  const incidentStats = {
    total: incidents.length,
    open: incidents.filter(i => i.status === 'OPEN').length,
    inProgress: incidents.filter(i => i.status === 'IN_PROGRESS').length,
    critical: incidents.filter(i => i.severity === 'CRITICAL').length,
    thisWeek: incidents.filter(i => {
      const incidentDate = new Date(i.reportedAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return incidentDate > weekAgo;
    }).length
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Header */}
      <header style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e2e8f0',
        padding: '16px 24px',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              backgroundColor: '#4f46e5',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              color: 'white',
              fontWeight: 'bold',
              marginRight: '12px'
            }}>
              🛡️
            </div>
            <div>
              <h1 style={{ 
                fontSize: '24px', 
                fontWeight: '700', 
                margin: 0,
                color: '#1e293b'
              }}>
                Kyntri EHS
              </h1>
              <p style={{ 
                fontSize: '14px', 
                color: '#64748b',
                margin: 0
              }}>
                Safety Platform Dashboard
              </p>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ 
                fontSize: '14px', 
                fontWeight: '600',
                color: '#1e293b'
              }}>
                {user?.name || 'User'}
              </div>
              <div style={{ 
                fontSize: '12px', 
                color: '#64748b'
              }}>
                {user?.email}
              </div>
            </div>
            
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#4f46e5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '14px'
            }}>
              {user?.name?.[0] || 'U'}
            </div>
            
            <button
              onClick={handleLogout}
              style={{
                padding: '8px 16px',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#dc2626';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#ef4444';
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ 
        maxWidth: '1200px', 
        margin: '0 auto',
        padding: '32px 24px'
      }}>
        {/* Welcome Section */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '32px',
          marginBottom: '32px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{ 
            fontSize: '28px', 
            fontWeight: '700',
            color: '#1e293b',
            marginBottom: '8px'
          }}>
            Welcome back, {user?.name?.split(' ')[0] || 'User'}! 👋
          </h2>
          <p style={{ 
            fontSize: '16px', 
            color: '#64748b',
            margin: 0
          }}>
            Here's your safety dashboard overview for today.
          </p>
        </div>

        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          marginBottom: '32px'
        }}>
          {[
            { 
              title: 'Total Incidents', 
              value: incidentsLoading ? '...' : incidentStats.total.toString(), 
              icon: '📊', 
              color: '#3b82f6', 
              bgColor: 'rgba(59, 130, 246, 0.1)',
              onClick: () => navigate('/incidents')
            },
            { 
              title: 'Open Incidents', 
              value: incidentsLoading ? '...' : incidentStats.open.toString(), 
              icon: '⚠️', 
              color: '#ef4444', 
              bgColor: 'rgba(239, 68, 68, 0.1)',
              onClick: () => navigate('/incidents?status=OPEN')
            },
            { 
              title: 'In Progress', 
              value: incidentsLoading ? '...' : incidentStats.inProgress.toString(), 
              icon: '🔄', 
              color: '#f59e0b', 
              bgColor: 'rgba(245, 158, 11, 0.1)',
              onClick: () => navigate('/incidents?status=IN_PROGRESS')
            },
            { 
              title: 'Critical Priority', 
              value: incidentsLoading ? '...' : incidentStats.critical.toString(), 
              icon: '🚨', 
              color: '#dc2626', 
              bgColor: 'rgba(220, 38, 38, 0.1)',
              onClick: () => navigate('/incidents?severity=CRITICAL')
            },
          ].map((stat, index) => (
            <div
              key={index}
              onClick={stat.onClick}
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.1)',
                border: `1px solid ${stat.color}20`,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 16px -4px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 4px -1px rgba(0, 0, 0, 0.1)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: stat.bgColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  marginRight: '16px'
                }}>
                  {stat.icon}
                </div>
                <div>
                  <div style={{
                    fontSize: '32px',
                    fontWeight: '800',
                    color: '#1e293b',
                    lineHeight: 1
                  }}>
                    {stat.value}
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: '#64748b',
                    fontWeight: '500'
                  }}>
                    {stat.title}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Incidents */}
        {incidents.length > 0 && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '32px',
            marginBottom: '32px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ 
                fontSize: '20px', 
                fontWeight: '600',
                color: '#1e293b',
                margin: 0
              }}>
                Recent Incidents
              </h3>
              <button
                onClick={() => navigate('/incidents')}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#2563eb';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#3b82f6';
                }}
              >
                View All
              </button>
            </div>
            
            <div style={{ display: 'grid', gap: '16px' }}>
              {incidents.slice(0, 3).map((incident) => (
                <div
                  key={incident.id}
                  onClick={() => navigate(`/incidents/${incident.id}`)}
                  style={{
                    padding: '16px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f9fafb';
                    e.currentTarget.style.borderColor = '#3b82f6';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                    e.currentTarget.style.borderColor = '#e5e7eb';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                    <h4 style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#1e293b',
                      margin: 0,
                      flex: 1
                    }}>
                      {incident.title}
                    </h4>
                    <div style={{
                      display: 'flex',
                      gap: '8px',
                      marginLeft: '12px'
                    }}>
                      <span style={{
                        fontSize: '10px',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontWeight: '500',
                        backgroundColor: incident.severity === 'CRITICAL' ? '#fef2f2' :
                                      incident.severity === 'HIGH' ? '#fff7ed' :
                                      incident.severity === 'MEDIUM' ? '#fffbeb' : '#f0fdf4',
                        color: incident.severity === 'CRITICAL' ? '#dc2626' :
                              incident.severity === 'HIGH' ? '#ea580c' :
                              incident.severity === 'MEDIUM' ? '#d97706' : '#16a34a'
                      }}>
                        {incident.severity}
                      </span>
                      <span style={{
                        fontSize: '10px',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontWeight: '500',
                        backgroundColor: incident.status === 'OPEN' ? '#eff6ff' :
                                      incident.status === 'IN_PROGRESS' ? '#f3e8ff' :
                                      incident.status === 'RESOLVED' ? '#f0fdf4' : '#f8fafc',
                        color: incident.status === 'OPEN' ? '#2563eb' :
                              incident.status === 'IN_PROGRESS' ? '#7c3aed' :
                              incident.status === 'RESOLVED' ? '#16a34a' : '#64748b'
                      }}>
                        {incident.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <p style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    margin: 0,
                    lineHeight: 1.4
                  }}>
                    {incident.siteName} • {new Date(incident.reportedAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ 
              fontSize: '20px', 
              fontWeight: '600',
              color: '#1e293b',
              margin: 0
            }}>
              Quick Actions
            </h3>
            
            {/* Sync Status */}
            {outboxStatus && outboxStatus.pending > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#f59e0b',
                  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                }} />
                <span style={{ fontSize: '12px', color: '#f59e0b', fontWeight: '500' }}>
                  {outboxStatus.pending} pending sync
                </span>
              </div>
            )}
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px'
          }}>
            {[
              { title: 'Report Incident', icon: '📝', color: '#ef4444', path: '/incidents' },
              { title: 'View Incidents', icon: '📋', color: '#3b82f6', path: '/incidents' },
              { title: 'Safety Inspection', icon: '🔍', color: '#f59e0b', path: '#' },
              { title: 'Equipment Check', icon: '⚙️', color: '#10b981', path: '#' },
            ].map((action, index) => (
              <button
                key={index}
                onClick={() => {
                  if (action.path !== '#') {
                    navigate(action.path);
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '16px',
                  backgroundColor: `${action.color}10`,
                  border: `1px solid ${action.color}30`,
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: action.color,
                  cursor: action.path !== '#' ? 'pointer' : 'default',
                  transition: 'all 0.2s ease',
                  opacity: action.path === '#' ? 0.6 : 1
                }}
                onMouseEnter={(e) => {
                  if (action.path !== '#') {
                    e.currentTarget.style.backgroundColor = `${action.color}20`;
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (action.path !== '#') {
                    e.currentTarget.style.backgroundColor = `${action.color}10`;
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
              >
                <span style={{ fontSize: '20px', marginRight: '12px' }}>
                  {action.icon}
                </span>
                {action.title}
              </button>
            ))}
          </div>
        </div>
      </main>
      
      {/* Floating Report Incident Button */}
      <button
        onClick={() => navigate('/incidents')}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '60px',
          height: '60px',
          backgroundColor: '#ef4444',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          fontSize: '24px',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)',
          transition: 'all 0.3s ease',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#dc2626';
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.boxShadow = '0 8px 20px rgba(239, 68, 68, 0.6)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#ef4444';
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.4)';
        }}
        title="Report New Incident"
      >
        📝
      </button>
    </div>
  );
}