import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function DashboardPage() {
  const { user } = useAuth();

  return (
    <div style={{ 
      padding: '32px',
      backgroundColor: '#f8fafc',
      minHeight: 'calc(100vh - 64px)',
      fontFamily: 'Inter, sans-serif'
    }}>
      {/* Header Section */}
      <div style={{ 
        marginBottom: '32px',
        background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
        borderRadius: '24px',
        padding: '32px',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '-50%',
          right: '-20%',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%)',
          borderRadius: '50%'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-30%',
          left: '-10%',
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.05) 0%, transparent 70%)',
          borderRadius: '50%'
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{
              fontSize: '32px',
              marginRight: '16px',
              padding: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              backdropFilter: 'blur(10px)'
            }}>
              🛡️
            </div>
            <div>
              <h1 style={{ 
                fontSize: '36px', 
                fontWeight: '700', 
                margin: '0 0 4px 0',
                letterSpacing: '-0.02em'
              }}>
                Safety Dashboard
              </h1>
              <p style={{ 
                fontSize: '18px', 
                margin: 0,
                opacity: 0.9,
                fontWeight: '400'
              }}>
                Welcome back, {user?.name || 'User'}! Let's keep everyone safe today.
              </p>
            </div>
          </div>
          <div style={{
            display: 'flex',
            gap: '24px',
            fontSize: '14px',
            opacity: 0.8
          }}>
            <span>📅 {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            <span>⏰ Last updated: {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: '24px', 
        marginBottom: '40px' 
      }}>
        {[
          { 
            title: 'Open Incidents', 
            value: '3', 
            change: '-2 from last week',
            changeType: 'positive',
            color: '#dc2626', 
            bgColor: 'rgba(220, 38, 38, 0.1)',
            icon: '⚠️',
            trend: '📉'
          },
          { 
            title: 'Pending Actions', 
            value: '7', 
            change: '+3 new this week',
            changeType: 'negative',
            color: '#f59e0b', 
            bgColor: 'rgba(245, 158, 11, 0.1)',
            icon: '🔧',
            trend: '📈'
          },
          { 
            title: 'Safety Score', 
            value: '96%', 
            change: '+2% this month',
            changeType: 'positive',
            color: '#10b981', 
            bgColor: 'rgba(16, 185, 129, 0.1)',
            icon: '🎯',
            trend: '📈'
          },
          { 
            title: 'Overdue Items', 
            value: '2', 
            change: 'Due this week',
            changeType: 'warning',
            color: '#ef4444', 
            bgColor: 'rgba(239, 68, 68, 0.1)',
            icon: '⏰',
            trend: '⚠️'
          }
        ].map((stat, index) => (
          <div
            key={index}
            style={{
              backgroundColor: 'white',
              padding: '32px',
              borderRadius: '20px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0px)';
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
            }}
          >
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: `linear-gradient(90deg, ${stat.color} 0%, transparent 100%)`
            }} />
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{
                padding: '12px',
                backgroundColor: stat.bgColor,
                borderRadius: '12px',
                fontSize: '24px'
              }}>
                {stat.icon}
              </div>
              <div style={{ fontSize: '20px' }}>{stat.trend}</div>
            </div>
            <div>
              <p style={{ 
                fontSize: '14px', 
                color: '#6b7280', 
                margin: '0 0 8px 0',
                fontWeight: '500',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                {stat.title}
              </p>
              <p style={{ 
                fontSize: '32px', 
                fontWeight: '700', 
                color: '#1f2937', 
                margin: '0 0 8px 0',
                lineHeight: '1'
              }}>
                {stat.value}
              </p>
              <p style={{ 
                fontSize: '13px', 
                color: stat.changeType === 'positive' ? '#10b981' : 
                       stat.changeType === 'negative' ? '#ef4444' : '#f59e0b',
                margin: 0,
                fontWeight: '500'
              }}>
                {stat.change}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Two Column Layout for Actions and Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '40px' }}>
        
        {/* Quick Actions */}
        <div>
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: '700', 
            color: '#1f2937', 
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center'
          }}>
            <span style={{ marginRight: '12px' }}>⚡</span>
            Quick Actions
          </h2>
          <div style={{ display: 'grid', gap: '16px' }}>
            {[
              { 
                title: 'Report Incident', 
                desc: 'Submit a new safety incident report', 
                icon: '🚨', 
                path: '/incidents/new', 
                bgColor: 'rgba(239, 68, 68, 0.1)',
                hoverColor: '#ef4444'
              },
              { 
                title: 'Start Inspection', 
                desc: 'Begin a safety inspection checklist', 
                icon: '🔍', 
                path: '/inspections/new', 
                bgColor: 'rgba(16, 185, 129, 0.1)',
                hoverColor: '#10b981'
              },
              { 
                title: 'Create Permit', 
                desc: 'Generate a work permit document', 
                icon: '📋', 
                path: '/permits/new', 
                bgColor: 'rgba(59, 130, 246, 0.1)',
                hoverColor: '#3b82f6'
              },
              { 
                title: 'View Reports', 
                desc: 'Access safety analytics and reports', 
                icon: '📊', 
                path: '/reports', 
                bgColor: 'rgba(245, 158, 11, 0.1)',
                hoverColor: '#f59e0b'
              }
            ].map((action, index) => (
              <Link
                key={index}
                to={action.path}
                style={{
                  textDecoration: 'none',
                  backgroundColor: 'white',
                  padding: '20px',
                  borderRadius: '16px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateX(8px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                  e.currentTarget.style.borderColor = action.hoverColor;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateX(0px)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)';
                  e.currentTarget.style.borderColor = '#e5e7eb';
                }}
              >
                <div style={{
                  padding: '12px',
                  backgroundColor: action.bgColor,
                  borderRadius: '12px',
                  fontSize: '20px',
                  flexShrink: 0
                }}>
                  {action.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ 
                    fontSize: '16px', 
                    fontWeight: '600', 
                    color: '#1f2937', 
                    margin: '0 0 4px 0' 
                  }}>
                    {action.title}
                  </h3>
                  <p style={{ 
                    fontSize: '14px', 
                    color: '#6b7280', 
                    margin: 0 
                  }}>
                    {action.desc}
                  </p>
                </div>
                <div style={{ 
                  fontSize: '16px', 
                  color: '#9ca3af',
                  flexShrink: 0
                }}>
                  →
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: '700', 
            color: '#1f2937', 
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center'
          }}>
            <span style={{ marginRight: '12px' }}>📈</span>
            Recent Activity
          </h2>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
            overflow: 'hidden'
          }}>
            {[
              { 
                type: 'incident', 
                title: 'Near miss reported at Building A', 
                time: '2 hours ago', 
                severity: 'medium',
                icon: '⚠️',
                user: 'John Smith'
              },
              { 
                type: 'action', 
                title: 'Safety training completed', 
                time: '4 hours ago', 
                severity: 'low',
                icon: '✅',
                user: 'Jane Doe'
              },
              { 
                type: 'inspection', 
                title: 'Fire safety inspection overdue', 
                time: '1 day ago', 
                severity: 'high',
                icon: '🔥',
                user: 'System'
              },
              { 
                type: 'permit', 
                title: 'Hot work permit approved', 
                time: '2 days ago', 
                severity: 'medium',
                icon: '📋',
                user: 'Mike Johnson'
              }
            ].map((activity, index) => (
              <div
                key={index}
                style={{
                  padding: '20px',
                  borderBottom: index < 3 ? '1px solid #f3f4f6' : 'none',
                  transition: 'background-color 0.2s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f8fafc';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                  <div style={{
                    padding: '8px',
                    backgroundColor: activity.severity === 'high' ? 'rgba(239, 68, 68, 0.1)' : 
                                   activity.severity === 'medium' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                    borderRadius: '8px',
                    fontSize: '16px',
                    flexShrink: 0
                  }}>
                    {activity.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ 
                      fontSize: '15px', 
                      color: '#1f2937', 
                      margin: '0 0 4px 0',
                      fontWeight: '500'
                    }}>
                      {activity.title}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ 
                        fontSize: '13px', 
                        color: '#6b7280',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        👤 {activity.user}
                      </span>
                      <span style={{ 
                        width: '4px', 
                        height: '4px', 
                        backgroundColor: '#d1d5db', 
                        borderRadius: '50%' 
                      }} />
                      <span style={{ fontSize: '13px', color: '#6b7280' }}>
                        {activity.time}
                      </span>
                    </div>
                  </div>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: activity.severity === 'high' ? '#dc2626' : 
                                   activity.severity === 'medium' ? '#f59e0b' : '#10b981',
                    flexShrink: 0,
                    marginTop: '6px'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Additional Charts Section */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '32px',
        marginBottom: '40px'
      }}>
        {/* Safety Trends Chart */}
        <div style={{
          backgroundColor: 'white',
          padding: '32px',
          borderRadius: '20px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
        }}>
          <h3 style={{ 
            fontSize: '20px', 
            fontWeight: '600', 
            color: '#1f2937',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center'
          }}>
            <span style={{ marginRight: '8px' }}>📊</span>
            Safety Trends
          </h3>
          <div style={{ 
            height: '200px',
            backgroundColor: '#f8fafc',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px dashed #e2e8f0'
          }}>
            <div style={{ textAlign: 'center', color: '#6b7280' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>📈</div>
              <p style={{ margin: 0, fontSize: '14px' }}>Chart visualization coming soon</p>
            </div>
          </div>
        </div>
        
        {/* Team Performance */}
        <div style={{
          backgroundColor: 'white',
          padding: '32px',
          borderRadius: '20px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
        }}>
          <h3 style={{ 
            fontSize: '20px', 
            fontWeight: '600', 
            color: '#1f2937',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center'
          }}>
            <span style={{ marginRight: '8px' }}>👥</span>
            Team Performance
          </h3>
          <div style={{ display: 'grid', gap: '12px' }}>
            {[
              { name: 'Building A Team', score: 98, color: '#10b981' },
              { name: 'Building B Team', score: 94, color: '#3b82f6' },
              { name: 'Maintenance Team', score: 89, color: '#f59e0b' },
              { name: 'Security Team', score: 96, color: '#8b5cf6' }
            ].map((team, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ minWidth: '100px', fontSize: '14px', color: '#6b7280' }}>
                  {team.name}
                </div>
                <div style={{ flex: 1, height: '8px', backgroundColor: '#f3f4f6', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${team.score}%`,
                    height: '100%',
                    backgroundColor: team.color,
                    borderRadius: '4px',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
                <div style={{ minWidth: '32px', fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
                  {team.score}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}