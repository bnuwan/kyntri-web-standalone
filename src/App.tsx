import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { IncidentsPage } from './pages/IncidentsPage';
import { NewIncidentPage } from './pages/NewIncidentPage';
import { PlaceholderPage } from './pages/PlaceholderPage';

// Modern Loading Component
function ModernLoadingScreen() {
  return (
    <>
      <style>{`
        @keyframes logoFloat {
          0%, 100% { 
            transform: translateY(0px) scale(1);
          }
          50% { 
            transform: translateY(-10px) scale(1.05);
          }
        }
        
        @keyframes pulse {
          0%, 100% { 
            opacity: 1;
          }
          50% { 
            opacity: 0.6;
          }
        }
        
        @keyframes spin {
          from { 
            transform: rotate(0deg);
          }
          to { 
            transform: rotate(360deg);
          }
        }
        
        @keyframes progressBar {
          0% { 
            width: 0%;
          }
          100% { 
            width: 75%;
          }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #f1f5f9 100%)',
        fontFamily: 'Inter, sans-serif',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background Animation Elements */}
        <div style={{
          position: 'absolute',
          top: '10%',
          right: '15%',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(79, 70, 229, 0.05) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'pulse 4s infinite ease-in-out'
        }} />
        
        <div style={{
          position: 'absolute',
          bottom: '15%',
          left: '10%',
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.03) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'pulse 3s infinite ease-in-out 1s'
        }} />
        
        {/* Main Loading Content */}
        <div style={{ 
          textAlign: 'center',
          animation: 'fadeInUp 0.8s ease-out'
        }}>
          {/* Animated Logo */}
          <div style={{
            marginBottom: '32px',
            animation: 'logoFloat 3s ease-in-out infinite'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
              borderRadius: '20px',
              margin: '0 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '36px',
              color: 'white',
              boxShadow: '0 10px 25px rgba(79, 70, 229, 0.4)',
              position: 'relative'
            }}>
              🛡️
              
              {/* Spinning Ring */}
              <div style={{
                position: 'absolute',
                top: '-8px',
                left: '-8px',
                right: '-8px',
                bottom: '-8px',
                border: '2px solid transparent',
                borderTop: '2px solid #4f46e5',
                borderRight: '2px solid #6366f1',
                borderRadius: '24px',
                animation: 'spin 2s linear infinite'
              }} />
            </div>
          </div>
          
          {/* Brand Text */}
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{
              fontSize: '32px',
              fontWeight: '700',
              color: '#1e293b',
              margin: '0 0 8px 0',
              letterSpacing: '-0.02em'
            }}>
              Kyntri EHS
            </h1>
            <p style={{
              fontSize: '16px',
              color: '#4f46e5',
              margin: '0 0 24px 0',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.1em'
            }}>
              Safety Platform
            </p>
          </div>
          
          {/* Loading Text */}
          <p style={{ 
            color: '#64748b', 
            fontSize: '18px',
            marginBottom: '32px',
            fontWeight: '500',
            animation: 'pulse 2s infinite ease-in-out'
          }}>
            Loading Kyntri EHS Platform...
          </p>
          
          {/* Progress Bar */}
          <div style={{
            width: '280px',
            height: '4px',
            backgroundColor: 'rgba(79, 70, 229, 0.1)',
            borderRadius: '2px',
            margin: '0 auto',
            overflow: 'hidden',
            position: 'relative'
          }}>
            <div style={{
              height: '100%',
              background: 'linear-gradient(90deg, #4f46e5, #6366f1)',
              borderRadius: '2px',
              animation: 'progressBar 2s ease-in-out infinite'
            }} />
          </div>
          
          {/* Loading Dots */}
          <div style={{ 
            marginTop: '24px',
            display: 'flex',
            justifyContent: 'center',
            gap: '8px'
          }}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#4f46e5',
                  borderRadius: '50%',
                  animation: `pulse 1.5s infinite ease-in-out ${i * 0.2}s`
                }}
              />
            ))}
          </div>
          
          {/* Status Text */}
          <p style={{
            marginTop: '24px',
            fontSize: '14px',
            color: '#94a3b8',
            fontWeight: '400'
          }}>
            Initializing secure environment...
          </p>
        </div>
      </div>
    </>
  );
}

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <ModernLoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

// Public Route Component
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <ModernLoadingScreen />;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />

          {/* Protected routes with layout */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            
            {/* Incidents */}
            <Route path="incidents" element={<IncidentsPage />} />
            <Route path="incidents/new" element={<NewIncidentPage />} />
            <Route 
              path="incidents/:id" 
              element={
                <PlaceholderPage
                  title="Incident Details"
                  icon="⚠️"
                  description="View and manage incident details"
                  features={[
                    '📝 Incident timeline and updates',
                    '👥 Assigned investigators',
                    '🔧 Corrective actions tracking',
                    '📸 Photos and documents',
                    '📊 Risk assessment details',
                    '✅ Investigation status',
                    '📋 Compliance reporting'
                  ]}
                />
              } 
            />
            
            {/* Actions (CAPA) */}
            <Route 
              path="actions" 
              element={
                <PlaceholderPage
                  title="Corrective Actions"
                  icon="🔧"
                  description="Manage corrective and preventive actions"
                  features={[
                    '📋 Action item management',
                    '👤 Assignment and ownership',
                    '📅 Due date tracking',
                    '✅ Progress monitoring',
                    '📊 Effectiveness verification',
                    '🔄 Root cause analysis',
                    '📈 Action trending'
                  ]}
                />
              } 
            />
            
            {/* Inspections */}
            <Route 
              path="inspections" 
              element={
                <PlaceholderPage
                  title="Inspections"
                  icon="🔍"
                  description="Schedule and conduct safety inspections"
                  features={[
                    '📅 Inspection scheduling',
                    '📋 Digital checklists',
                    '📸 Photo documentation',
                    '⚠️ Finding management',
                    '📊 Inspection analytics',
                    '🔄 Follow-up tracking',
                    '📱 Mobile inspection app'
                  ]}
                />
              } 
            />
            
            {/* Permits */}
            <Route 
              path="permits" 
              element={
                <PlaceholderPage
                  title="Permit to Work"
                  icon="📋"
                  description="Electronic permit management system"
                  features={[
                    '📝 Digital permit creation',
                    '✍️ Electronic signatures',
                    '🔒 Safety isolation tracking',
                    '👥 Multi-level approvals',
                    '⏰ Time-bound permits',
                    '📊 Permit analytics',
                    '🚨 Risk assessment integration'
                  ]}
                />
              } 
            />
            
            {/* Reports */}
            <Route 
              path="reports" 
              element={
                <PlaceholderPage
                  title="Reports & Analytics"
                  icon="📊"
                  description="Safety metrics and compliance reporting"
                  features={[
                    '📈 Safety performance metrics',
                    '📊 Interactive dashboards',
                    '📋 Regulatory reports',
                    '🎯 KPI tracking',
                    '📅 Scheduled reporting',
                    '📄 Custom report builder',
                    '📧 Automated notifications'
                  ]}
                />
              } 
            />
          </Route>

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;