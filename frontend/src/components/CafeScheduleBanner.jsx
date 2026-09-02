import { useState, useEffect } from 'react';
import { Clock, Coffee, AlertCircle, Sparkles, Moon } from 'lucide-react';
import { getCafeScheduleStatus } from '../utils/cafeSchedule';

const CafeScheduleBanner = () => {
  const [scheduleStatus, setScheduleStatus] = useState(() => getCafeScheduleStatus());

  useEffect(() => {
    // Refresh schedule status every 15 seconds
    const interval = setInterval(() => {
      setScheduleStatus(getCafeScheduleStatus());
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  // If regular open hours, we can display a subtle indicator or nothing if fully open
  if (scheduleStatus.status === 'open') {
    return null; // Silent when open normally
  }

  // Pre-order window (e.g. 08:30 AM - 09:00 AM)
  if (scheduleStatus.status === 'preorder') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 my-4">
        <div className="bg-gradient-to-r from-amber-500/15 via-terracotta/10 to-amber-500/15 border border-terracotta/30 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-warm-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-terracotta text-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <Sparkles className="w-5 h-5 animate-spin" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-terracotta text-white px-2 py-0.5 rounded-md">
                  Pre-Orders Active
                </span>
                <span className="text-xs font-bold text-espresso">
                  {scheduleStatus.countdownText}
                </span>
              </div>
              <p className="text-xs text-taupe mt-0.5">
                Place your order now! Kitchen prep & counter pickup starts at {scheduleStatus.formattedOpenTime}.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Closed in Morning (Before 08:30 AM) or Night (After 09:00 PM)
  const isNight = scheduleStatus.status === 'closed_night';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 my-4">
      <div className="bg-gradient-to-r from-stone-900 via-espresso to-stone-900 text-white border border-stone-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-warm-lg">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-white/10 text-amber-300 flex items-center justify-center flex-shrink-0 border border-white/15">
            {isNight ? <Moon className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-md">
                {isNight ? 'Kitchen Closed' : 'Pre-Orders Opening Soon'}
              </span>
              <span className="text-xs font-bold text-amber-200">
                {scheduleStatus.countdownText}
              </span>
            </div>
            <p className="text-xs text-stone-300 mt-1">
              {scheduleStatus.message}. Feel free to browse our menu and plan your order!
            </p>
          </div>
        </div>

        <div className="text-xs text-stone-400 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 self-stretch sm:self-auto text-center sm:text-right">
          Hours: {scheduleStatus.formattedOpenTime} – {scheduleStatus.formattedCloseTime}
        </div>
      </div>
    </div>
  );
};

export default CafeScheduleBanner;
