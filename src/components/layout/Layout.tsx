import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Navigation } from './Navigation';
import { OfflineIndicator } from './OfflineIndicator';
import { PWAPrompt } from './PWAPrompt';
import { useAuthStore } from '@/stores/auth-store';

export function Layout() {
  const location = useLocation();
  const { isAuthenticated } = useAuthStore();
  
  // Don't show navigation on auth pages
  const isAuthPage = ['/login', '/register', '/forgot-password'].includes(location.pathname);
  
  if (!isAuthenticated || isAuthPage) {
    return (
      <div className="min-h-screen bg-background">
        <OfflineIndicator />
        <Outlet />
        <PWAPrompt />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <OfflineIndicator />
      
      {/* Mobile-first layout */}
      <div className="flex flex-col lg:flex-row">
        {/* Header - Always visible on mobile */}
        <Header />
        
        {/* Navigation - Bottom on mobile, side on desktop */}
        <Navigation />
        
        {/* Main content */}
        <main className="flex-1 pb-16 lg:pb-0 lg:ml-64">
          <div className="container max-w-7xl mx-auto px-4 py-6">
            <Outlet />
          </div>
        </main>
      </div>
      
      <PWAPrompt />
    </div>
  );
}