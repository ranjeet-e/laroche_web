import { useState, useEffect } from 'react';
import { Clock, AlertTriangle, Sparkles } from 'lucide-react';
import { getStoreStatus } from '../services/orderService';
import { useSocket } from '../hooks/useSocket';

const CafeScheduleBanner = () => {
  const [storeStatus, setStoreStatus] = useState({
    paused: false,
    reason: '',
    resumeAt: null,
  });

  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    let mounted = true;
    getStoreStatus()
      .then((data) => {
        if (mounted && data) setStoreStatus(data);
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, []);

  useSocket({
    onStoreStatusChanged: (data) => {
      if (data) setStoreStatus(data);
    },
  });

  // Calculate live countdown if resumeAt is specified
  useEffect(() => {
    if (!storeStatus.paused || !storeStatus.resumeAt) {
      setTimeLeft(null);
      return;
    }

    const calcTime = () => {
      const diff = Math.max(0, Math.floor((new Date(storeStatus.resumeAt).getTime() - Date.now()) / 1000));
      if (diff <= 0) {
        setTimeLeft(null);
        setStoreStatus((prev) => ({ ...prev, paused: false }));
        return;
      }
      const mins = Math.floor(diff / 60);
      const secs = diff % 60;
      setTimeLeft(`${mins}:${secs < 10 ? '0' : ''}${secs}`);
    };

    calcTime();
    const interval = setInterval(calcTime, 1000);
    return () => clearInterval(interval);
  }, [storeStatus.paused, storeStatus.resumeAt]);

  if (!storeStatus.paused) {
    return null;
  }

  return (
    <div className="sticky top-16 sm:top-20 z-40 bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 text-white px-4 py-2.5 shadow-md transition-all animate-fadeIn">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium">
          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4 text-amber-200 animate-pulse" />
          </div>
          <div>
            <span className="font-bold tracking-wide uppercase text-[11px] sm:text-xs bg-black/20 px-2 py-0.5 rounded-full mr-2">
              Kitchen Rush Pause
            </span>
            <span>
              {storeStatus.reason || 'Our kitchen is currently overloaded and preparing active orders. Orders will reopen shortly.'}
            </span>
          </div>
        </div>

        {timeLeft && (
          <div className="flex items-center gap-1.5 text-xs font-bold bg-white/25 px-3 py-1 rounded-full shadow-inner ml-auto shrink-0">
            <Clock className="w-3.5 h-3.5" />
            <span>Reopening in ~{timeLeft}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CafeScheduleBanner;

