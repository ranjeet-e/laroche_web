import { useState, useEffect } from 'react';
import { Download, X, Share, PlusSquare, Smartphone } from 'lucide-react';

const AddToHomeScreen = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already running in standalone / PWA mode
    const checkStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true ||
      document.referrer.includes('android-app://');

    if (checkStandalone) {
      setIsInstalled(true);
      return;
    }

    if (sessionStorage.getItem('pwa_dismissed')) {
      return;
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent) && !window.MSStream;
    setIsIOS(isIosDevice);

    // Capture native Chrome / Android / Desktop install event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // App installed event listener
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    };
    window.addEventListener('appinstalled', handleAppInstalled);

    // On iOS or browsers where prompt event hasn't fired yet, show after brief scroll/delay
    const timer = setTimeout(() => {
      if (!sessionStorage.getItem('pwa_dismissed') && !checkStandalone) {
        setShowPrompt(true);
      }
    }, 2500);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      clearTimeout(timer);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Trigger native browser install prompt
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    } else {
      // Fallback instructions if native prompt is not available
      alert('To install La Roche Cafe: Open your browser menu (⋮ or Share) and select "Add to Home Screen".');
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    sessionStorage.setItem('pwa_dismissed', 'true');
  };

  if (!showPrompt || isInstalled) return null;

  return (
    <aside aria-label="Add to home screen" className="fixed bottom-20 md:bottom-6 left-4 right-4 max-w-md mx-auto z-40 bg-espresso text-white rounded-3xl p-4 sm:p-5 shadow-warm-xl border border-stone-700/80 animate-slideUp flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-terracotta text-white flex items-center justify-center flex-shrink-0 shadow-glow-terracotta">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-white">
              Add La Roche Cafe to your Home Screen
            </h4>
            <p className="text-xs text-stone-300 mt-0.5 leading-snug">
              Instant counter ordering, 0-second queue & live kitchen pickup alerts. 
             </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDismiss}
          className="p-1 text-stone-400 hover:text-white rounded-full hover:bg-stone-800 transition-colors"
          aria-label="Dismiss install prompt"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {isIOS ? (
        <div className="bg-stone-800/90 rounded-2xl p-3 text-[11px] text-stone-300 flex items-center gap-2 border border-stone-700">
          <span>Tap</span>
          <Share className="w-3.5 h-3.5 text-terracotta flex-shrink-0" />
          <span>in Safari, then choose</span>
          <strong className="text-white inline-flex items-center gap-1 font-bold">
            <PlusSquare className="w-3 h-3 text-terracotta" /> Add to Home Screen
          </strong>
        </div>
      ) : (
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={handleDismiss}
            className="flex-1 py-2.5 rounded-full border border-stone-700 text-stone-300 hover:text-white font-bold text-xs transition-colors"
          >
            Not Now
          </button>
          <button
            type="button"
            onClick={handleInstallClick}
            className="flex-1 py-2.5 rounded-full bg-terracotta hover:bg-terracotta-hover text-white font-bold text-xs shadow-glow-terracotta transition-all inline-flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install App</span>
          </button>
        </div>
      )}
    </aside>
  );
};

export default AddToHomeScreen;
