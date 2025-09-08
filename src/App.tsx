import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppProviders } from './app/AppProviders';

// Incident pages
import { IncidentsListPage } from './features/incidents/pages/IncidentsListPage';
import { NewIncidentPage } from './features/incidents/pages/NewIncidentPage';
import { IncidentDetailPage } from './features/incidents/pages/IncidentDetailPage';

function AppRoutes() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #e2e8f0',
            borderTop: '4px solid #4f46e5',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ 
            color: '#64748b',
            fontSize: '16px',
            margin: 0
          }}>
            Initializing Kyntri EHS...
          </p>
        </div>
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <Routes>
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} 
      />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } 
      />
      
      {/* Incident routes */}
      <Route 
        path="/incidents" 
        element={
          <ProtectedRoute>
            <IncidentsListPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/incidents/new" 
        element={
          <ProtectedRoute>
            <NewIncidentPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/incidents/:id" 
        element={
          <ProtectedRoute>
            <IncidentDetailPage />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/" 
        element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} 
      />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AppProviders>
        <AppRoutes />
      </AppProviders>
    </Router>
  );
}

export default App