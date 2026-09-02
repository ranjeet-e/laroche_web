import { useState, useEffect, useRef } from 'react';

const SiteLock = ({ children }) => {
  const sitePassword = import.meta.env.VITE_SITE_PASSWORD;
  const isLockEnabled = Boolean(sitePassword && sitePassword.trim() !== '');

  // Check if session is already unlocked in this browser tab
  const [isUnlocked, setIsUnlocked] = useState(() => {
    if (!isLockEnabled) return true;
    return sessionStorage.getItem('site_unlocked') === 'true';
  });

  const hasPrompted = useRef(false);

  useEffect(() => {
    // If lock is enabled, not yet unlocked, and hasn't prompted in this lifecycle
    if (isLockEnabled && !isUnlocked && !hasPrompted.current) {
      hasPrompted.current = true;
      const userInput = window.prompt("Enter access password to view this site:");

      if (userInput !== null && userInput.trim() === sitePassword.trim()) {
        sessionStorage.setItem('site_unlocked', 'true');
        setIsUnlocked(true);
      } else {
        alert("Incorrect password or action canceled.");
      }
    }
  }, [isLockEnabled, isUnlocked, sitePassword]);

  // If unlocked or lock is disabled, render the website directly
  if (!isLockEnabled || isUnlocked) {
    return <>{children}</>;
  }

  // Fallback screen if user canceled or entered wrong password
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'sans-serif', backgroundColor: '#f9f9f9', color: '#333' }}>
      <h2>Access Denied</h2>
      <p>You need the correct password to view this site.</p>
      <button 
        onClick={() => {
          sessionStorage.removeItem('site_unlocked');
          window.location.reload();
        }} 
        style={{ padding: '10px 20px', marginTop: '10px', cursor: 'pointer', borderRadius: '6px', border: '1px solid #ccc', backgroundColor: '#fff' }}
      >
        Refresh & Try Again
      </button>
    </div>
  );
};

export default SiteLock;
