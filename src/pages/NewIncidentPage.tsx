import React from 'react';
import { Link } from 'react-router-dom';

export function NewIncidentPage() {
  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <Link
            to="/incidents"
            style={{
              color: '#6b7280',
              textDecoration: 'none',
              fontSize: '14px'
            }}
          >
            ← Back to Incidents
          </Link>
        </div>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937', margin: '0 0 8px 0' }}>
          ⚠️ Report New Incident
        </h1>
        <p style={{ color: '#6b7280', margin: 0 }}>
          Report a safety incident or near miss
        </p>
      </div>

      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgb(0 0 0 / 0.1)',
        padding: '30px'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          color: '#6b7280'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚧</div>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px', color: '#1f2937' }}>
            Incident Reporting Form
          </h2>
          <p style={{ marginBottom: '20px' }}>
            This feature is under development. The incident reporting form will include:
          </p>
          <div style={{ textAlign: 'left', maxWidth: '400px', margin: '0 auto' }}>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {[
                '📝 Incident details and description',
                '📍 Location and time picker',
                '⚠️ Severity assessment',
                '👥 People involved and witnesses',
                '📸 Photo and document upload',
                '🏷️ Categories and tags',
                '📋 Immediate actions taken'
              ].map((item, index) => (
                <li key={index} style={{ 
                  padding: '8px 0', 
                  borderBottom: '1px solid #f3f4f6',
                  fontSize: '14px'
                }}>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}