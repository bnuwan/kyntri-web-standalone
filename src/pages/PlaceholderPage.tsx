import React from 'react';

interface PlaceholderPageProps {
  title: string;
  icon: string;
  description: string;
  features: string[];
}

export function PlaceholderPage({ title, icon, description, features }: PlaceholderPageProps) {
  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937', margin: '0 0 8px 0' }}>
          {icon} {title}
        </h1>
        <p style={{ color: '#6b7280', margin: 0 }}>
          {description}
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
            Feature Under Development
          </h2>
          <p style={{ marginBottom: '20px' }}>
            This {title.toLowerCase()} module is coming soon. It will include:
          </p>
          <div style={{ textAlign: 'left', maxWidth: '400px', margin: '0 auto' }}>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {features.map((feature, index) => (
                <li key={index} style={{ 
                  padding: '8px 0', 
                  borderBottom: '1px solid #f3f4f6',
                  fontSize: '14px'
                }}>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}