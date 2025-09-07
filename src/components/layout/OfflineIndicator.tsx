import React from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { offlineService } from '@/services/offline-service';

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);
  const [hasPendingActions, setHasPendingActions] = React.useState(false);

  React.useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Small delay to let sync complete before checking pending actions
      setTimeout(checkPendingActions, 1000);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    const checkPendingActions = async () => {
      try {
        const pending = await offlineService.hasPendingActions();
        setHasPendingActions(pending);
      } catch (error) {
        console.error('Error checking pending actions:', error);
      }
    };

    // Check pending actions on mount
    checkPendingActions();

    // Listen for online/offline events
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check pending actions periodically
    const interval = setInterval(checkPendingActions, 10000); // Every 10 seconds

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  // Don't show anything if we're online and have no pending actions
  if (isOnline && !hasPendingActions) {
    return null;
  }

  return (
    <div className="offline-indicator">
      <div className="flex items-center justify-center space-x-2">
        {isOnline ? (
          <>
            <Wifi className="w-4 h-4" />
            <span>Syncing pending changes...</span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4" />
            <span>You're offline. Changes will sync when connection is restored.</span>
          </>
        )}
      </div>
    </div>
  );
}