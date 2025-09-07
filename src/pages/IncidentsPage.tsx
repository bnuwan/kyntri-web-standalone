import React from 'react';
import { Link } from 'react-router-dom';

export function IncidentsPage() {
  // Mock data for incidents
  const incidents = [
    {
      id: '1',
      title: 'Slip and fall in warehouse',
      severity: 'HIGH',
      status: 'INVESTIGATING',
      reportedBy: 'John Smith',
      reportedAt: '2025-09-06T10:30:00Z',
      location: 'Warehouse A, Section 3'
    },
    {
      id: '2', 
      title: 'Near miss with forklift',
      severity: 'MEDIUM',
      status: 'OPEN',
      reportedBy: 'Sarah Johnson',
      reportedAt: '2025-09-05T14:15:00Z',
      location: 'Loading Dock'
    },
    {
      id: '3',
      title: 'Chemical spill contained',
      severity: 'LOW',
      status: 'CLOSED',
      reportedBy: 'Mike Davis',
      reportedAt: '2025-09-04T09:20:00Z',
      location: 'Lab B'
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'HIGH': return '#dc2626';
      case 'MEDIUM': return '#f59e0b';
      case 'LOW': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return '#dc2626';
      case 'INVESTIGATING': return '#f59e0b';
      case 'CLOSED': return '#10b981';
      default: return '#6b7280';
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937', margin: '0 0 8px 0' }}>
            ⚠️ Incidents
          </h1>
          <p style={{ color: '#6b7280', margin: 0 }}>
            Manage and track safety incidents
          </p>
        </div>
        <Link
          to="/incidents/new"
          style={{
            backgroundColor: '#dc2626',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: '500',
            fontSize: '14px'
          }}
        >
          + Report Incident
        </Link>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '30px' }}>
        {[
          { label: 'Total', value: incidents.length, color: '#3b82f6' },
          { label: 'Open', value: incidents.filter(i => i.status === 'OPEN').length, color: '#dc2626' },
          { label: 'Investigating', value: incidents.filter(i => i.status === 'INVESTIGATING').length, color: '#f59e0b' },
          { label: 'Closed', value: incidents.filter(i => i.status === 'CLOSED').length, color: '#10b981' }
        ].map((stat, index) => (
          <div
            key={index}
            style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px rgb(0 0 0 / 0.1)',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: stat.color, marginBottom: '4px' }}>
              {stat.value}
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Incidents List */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgb(0 0 0 / 0.1)',
        overflow: 'hidden'
      }}>
        <div style={{
          backgroundColor: '#f8fafc',
          padding: '16px',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
            Recent Incidents
          </h2>
        </div>

        {incidents.map((incident, index) => (
          <Link
            key={incident.id}
            to={`/incidents/${incident.id}`}
            style={{
              display: 'block',
              padding: '20px',
              borderBottom: index < incidents.length - 1 ? '1px solid #e5e7eb' : 'none',
              textDecoration: 'none',
              color: 'inherit',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f8fafc';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', margin: '0 0 8px 0' }}>
                  {incident.title}
                </h3>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>Severity:</span>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: '500',
                      color: getSeverityColor(incident.severity),
                      backgroundColor: getSeverityColor(incident.severity) + '20',
                      padding: '2px 8px',
                      borderRadius: '4px'
                    }}>
                      {incident.severity}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>Status:</span>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: '500',
                      color: getStatusColor(incident.status),
                      backgroundColor: getStatusColor(incident.status) + '20',
                      padding: '2px 8px',
                      borderRadius: '4px'
                    }}>
                      {incident.status}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#6b7280' }}>
                  <span>📍 {incident.location}</span>
                  <span>👤 {incident.reportedBy}</span>
                  <span>🕐 {new Date(incident.reportedAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div style={{ fontSize: '16px', color: '#9ca3af' }}>→</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}