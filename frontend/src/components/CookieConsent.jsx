import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Cookie, X } from 'lucide-react';

const CookieConsent = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('laroche_cookie_consent');
    if (!consent) {
      const timer = setTimeout(() => setShow(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('laroche_cookie_consent', 'accepted');
    setShow(false);
  };

  const handleDecline = () => {
    localStorage.setItem('laroche_cookie_consent', 'declined');
    setShow(false);
  };

  if (!show) return null;

  return (
    <aside
      aria-label="Cookie consent"
      className="fixed bottom-4 left-4 right-4 max-w-xl mx-auto z-50 bg-white dark:bg-[#23231C] text-espresso dark:text-white rounded-3xl p-4 sm:p-5 shadow-warm-xl border border-[#DDD4C0] dark:border-[#3D3D30] animate-slideUp flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-2xl bg-terracotta/10 text-terracotta dark:bg-terracotta/20 dark:text-amber-300 flex items-center justify-center flex-shrink-0">
          <Cookie className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-bold text-xs sm:text-sm">We value your privacy</h4>
          <p className="text-[11px] sm:text-xs text-stone-500 dark:text-stone-400 mt-0.5 leading-snug font-sans">
            We use essential local storage & cookies to keep you signed in, remember your cart, and deliver live counter pickup notifications.{' '}
            <Link to="/privacy-policy" className="underline text-terracotta hover:text-terracotta-hover font-bold">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto flex-shrink-0">
        <button
          type="button"
          onClick={handleDecline}
          className="flex-1 sm:flex-initial px-3.5 py-2 rounded-full border border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-300 text-xs font-bold hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
        >
          Decline
        </button>
        <button
          type="button"
          onClick={handleAccept}
          className="flex-1 sm:flex-initial px-4 py-2 rounded-full bg-terracotta hover:bg-terracotta-hover text-white text-xs font-bold shadow-sm transition-all"
        >
          Accept All
        </button>
      </div>
    </aside>
  );
};

export default CookieConsent;
