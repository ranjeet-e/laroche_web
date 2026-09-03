import { useState, useEffect } from 'react';
import { Download, X, Share, PlusSquare } from 'lucide-react';

const AddToHomeScreen = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    // Check if already in standalone / PWA mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;

    if (isStandalone || sessionStorage.getItem('pwa_dismissed')) {
      return;
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Android / Chrome beforeinstallprompt handler
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Scroll listener: trigger prompt after user scrolls 150px
    const handleScroll = () => {
      if (window.scrollY > 150 && !hasScrolled) {
        setHasScrolled(true);
        setShowPrompt(true);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [hasScrolled]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    sessionStorage.setItem('pwa_dismissed', 'true');
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 right-4 max-w-md mx-auto z-40 bg-espresso text-white rounded-3xl p-4 sm:p-5 shadow-warm-xl border border-stone-700/80 animate-slideUp flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-terracotta text-white flex items-center justify-center flex-shrink-0 shadow-glow-terracotta">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-white">
              Add La Roche to Home Screen
            </h4>
            <p className="text-xs text-stone-300 mt-0.5 leading-snug">
              Instant counter ordering & live preparation notifications.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDismiss}
          className="p-1 text-stone-400 hover:text-white rounded-full hover:bg-stone-800 transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {isIOS ? (
        <div className="bg-stone-800/80 rounded-2xl p-3 text-[11px] text-stone-300 flex items-center gap-2 border border-stone-700">
          <span>Tap</span>
          <Share className="w-3.5 h-3.5 text-terracotta" />
          <span>in Safari, then select</span>
          <strong className="text-white inline-flex items-center gap-1">
            <PlusSquare className="w-3 h-3" /> Add to Home Screen
          </strong>
        </div>
      ) : (
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={handleDismiss}
            className="flex-1 py-2 rounded-full border border-stone-700 text-stone-300 hover:text-white font-bold text-xs transition-colors"
          >
            Not Now
          </button>
          <button
            type="button"
            onClick={handleInstallClick}
            className="flex-1 py-2 rounded-full bg-terracotta hover:bg-terracotta-hover text-white font-bold text-xs shadow-glow-terracotta transition-all"
          >
            Install App
          </button>
        </div>
      )}
    </div>
  );
};

export default AddToHomeScreen;
