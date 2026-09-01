import { useState } from 'react';
import { Lock, KeyRound, Eye, EyeOff, ShieldCheck } from 'lucide-react';

const SiteLock = ({ children }) => {
  const sitePassword = import.meta.env.VITE_SITE_PASSWORD;

  // If no password is configured in .env / Vercel, allow full public access
  const isLockEnabled = Boolean(sitePassword && sitePassword.trim() !== '');

  const [isUnlocked, setIsUnlocked] = useState(() => {
    if (!isLockEnabled) return true;
    return localStorage.getItem('site_unlocked') === 'true';
  });

  const [inputPassword, setInputPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isShaking, setIsShaking] = useState(false);

  // If lock is disabled or already unlocked, render the website directly
  if (!isLockEnabled || isUnlocked) {
    return <>{children}</>;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (inputPassword.trim() === sitePassword.trim()) {
      localStorage.setItem('site_unlocked', 'true');
      setIsUnlocked(true);
    } else {
      setError('Incorrect access code. Please try again.');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  return (
    <div className="site-lock-overlay">
      <div className={`site-lock-card ${isShaking ? 'shake' : ''}`}>
        <div className="site-lock-icon-wrap">
          <Lock className="site-lock-icon" size={32} />
        </div>

        

        <form onSubmit={handleSubmit} className="site-lock-form">
          <div className="site-lock-input-wrap">
            <KeyRound className="site-lock-input-icon" size={18} />
            <input
              type={showPassword ? 'text' : 'password'}
              value={inputPassword}
              onChange={(e) => {
                setInputPassword(e.target.value);
                if (error) setError('');
              }}
              placeholder="Enter access password"
              autoFocus
              className="site-lock-input"
            />
            <button
              type="button"
              className="site-lock-toggle-btn"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {error && <p className="site-lock-error">{error}</p>}

          <button type="submit" className="site-lock-btn">
            <ShieldCheck size={18} />
            <span>Unlock Access</span>
          </button>
        </form>

        
      </div>
    </div>
  );
};

export default SiteLock;
