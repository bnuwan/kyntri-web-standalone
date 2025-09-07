import React from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function Layout() {
  const { user, logout, isLoading } = useAuth();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const navigation = [
    { name: 'Dashboard', path: '/', icon: '🏠' },
    { name: 'Incidents', path: '/incidents', icon: '⚠️' },
    { name: 'Actions', path: '/actions', icon: '🔧' },
    { name: 'Inspections', path: '/inspections', icon: '🔍' },
    { name: 'Permits', path: '/permits', icon: '📋' },
    { name: 'Reports', path: '/reports', icon: '📊' }
  ];

  const isActivePath = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Modern Navigation Header */}
      <header style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        borderBottom: '1px solid #e2e8f0',
        padding: '0 32px',
        height: '80px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        backdropFilter: 'blur(20px)',
        fontFamily: 'Inter, sans-serif'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {/* Logo Section */}
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              marginRight: '48px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <div style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '12px',
              fontSize: '20px',
              boxShadow: '0 4px 8px rgba(79, 70, 229, 0.3)'
            }}>
              🛡️
            </div>
            <div>
              <div style={{
                fontSize: '22px',
                fontWeight: '700',
                color: '#1e293b',
                lineHeight: '1',
                letterSpacing: '-0.01em'
              }}>
                Kyntri
              </div>
              <div style={{
                fontSize: '11px',
                color: '#4f46e5',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.1em'
              }}>
                EHS Platform
              </div>
            </div>
          </Link>
          
          {/* Modern Desktop Navigation */}
          <nav style={{ display: 'flex', gap: '8px' }}>
            {navigation.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 20px',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  fontSize: '15px',
                  fontWeight: '600',
                  color: isActivePath(item.path) ? '#4f46e5' : '#64748b',
                  backgroundColor: isActivePath(item.path) ? 'rgba(79, 70, 229, 0.1)' : 'transparent',
                  border: isActivePath(item.path) ? '2px solid rgba(79, 70, 229, 0.2)' : '2px solid transparent',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  if (!isActivePath(item.path)) {
                    e.currentTarget.style.backgroundColor = 'rgba(79, 70, 229, 0.05)';
                    e.currentTarget.style.color = '#4f46e5';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActivePath(item.path)) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#64748b';
                    e.currentTarget.style.transform = 'translateY(0px)';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
              >
                {isActivePath(item.path) && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    background: 'linear-gradient(90deg, #4f46e5, #6366f1)',
                    borderRadius: '0 0 2px 2px'
                  }} />
                )}
                <span style={{ fontSize: '16px' }}>{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Enhanced User Menu */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* User Profile Card */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            padding: '8px 16px',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            borderRadius: '12px',
            border: '1px solid rgba(226, 232, 240, 0.8)',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{
              width: '36px',
              height: '36px',
              backgroundColor: 'rgba(79, 70, 229, 0.1)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              color: '#4f46e5',
              fontWeight: '600'
            }}>
              👤
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ 
                fontSize: '14px', 
                fontWeight: '600', 
                color: '#1e293b',
                lineHeight: '1.2'
              }}>
                {user?.name || 'User'}
              </div>
              <div style={{ 
                fontSize: '12px', 
                color: '#64748b',
                lineHeight: '1.2'
              }}>
                {user?.email || 'user@kyntri.com'}
              </div>
            </div>
          </div>
          
          {/* Modern Logout Button */}
          <button
            onClick={handleLogout}
            disabled={isLoading}
            style={{
              backgroundColor: isLoading ? '#94a3b8' : '#1e293b',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '12px 20px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.6 : 1,
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.backgroundColor = '#0f172a';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.currentTarget.style.backgroundColor = '#1e293b';
                e.currentTarget.style.transform = 'translateY(0px)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
              }
            }}
          >
            <span style={{ fontSize: '16px' }}>🚪</span>
            {isLoading ? 'Signing Out...' : 'Sign Out'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ 
        maxWidth: '1400px', 
        margin: '0 auto', 
        padding: '0',
        minHeight: 'calc(100vh - 80px)'
      }}>
        <Outlet />
      </main>
    </div>
  );
}