import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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
            { title: 'Safety Incidents', value: '0', icon: '⚠️', color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.1)' },
            { title: 'Active Workers', value: '124', icon: '👷', color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.1)' },
            { title: 'Inspections Due', value: '3', icon: '📋', color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.1)' },
            { title: 'Training Complete', value: '98%', icon: '🎓', color: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.1)' },
          ].map((stat, index) => (
            <div
              key={index}
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.1)',
                border: `1px solid ${stat.color}20`
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

        {/* Quick Actions */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{ 
            fontSize: '20px', 
            fontWeight: '600',
            color: '#1e293b',
            marginBottom: '24px'
          }}>
            Quick Actions
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px'
          }}>
            {[
              { title: 'Report Incident', icon: '📝', color: '#ef4444', path: '/incidents/new' },
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
    </div>
  );
}