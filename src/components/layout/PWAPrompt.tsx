import React from 'react';
import { X, Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function PWAPrompt() {
  const [showPrompt, setShowPrompt] = React.useState(false);
  const [deferredPrompt, setDeferredPrompt] = React.useState<any>(null);

  React.useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Check if user has previously dismissed the prompt
      const dismissed = localStorage.getItem('pwa-prompt-dismissed');
      const lastShown = localStorage.getItem('pwa-prompt-last-shown');
      const now = Date.now();
      const oneWeek = 7 * 24 * 60 * 60 * 1000;

      if (!dismissed || (lastShown && now - parseInt(lastShown) > oneWeek)) {
        setShowPrompt(true);
        localStorage.setItem('pwa-prompt-last-shown', now.toString());
      }
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setShowPrompt(false);
      localStorage.setItem('pwa-installed', 'true');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }
    
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = (permanent = false) => {
    setShowPrompt(false);
    
    if (permanent) {
      localStorage.setItem('pwa-prompt-dismissed', 'true');
    }
  };

  // Don't show if already installed or no prompt available
  if (!showPrompt || !deferredPrompt || localStorage.getItem('pwa-installed')) {
    return null;
  }

  return (
    <div className="pwa-prompt">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Download className="w-5 h-5 text-white" />
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-card-foreground">
            Install Kyntri App
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Install the app for a better experience with offline access, push notifications, and faster loading.
          </p>
        </div>
        
        <button
          onClick={() => handleDismiss(false)}
          className="flex-shrink-0 text-muted-foreground hover:text-card-foreground"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      <div className="flex items-center space-x-2 mt-4">
        <Button
          onClick={handleInstallClick}
          size="sm"
          className="flex-1"
        >
          Install App
        </Button>
        
        <Button
          onClick={() => handleDismiss(true)}
          variant="ghost"
          size="sm"
        >
          Don't ask again
        </Button>
      </div>
    </div>
  );
}