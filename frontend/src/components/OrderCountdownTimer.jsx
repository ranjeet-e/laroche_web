import { useState, useEffect } from 'react';
import { Clock, ChefHat, Sparkles, CheckCircle2, Flame, BellRing } from 'lucide-react';
import './OrderCountdownTimer.css';

const DEFAULT_PREP_MINUTES = 12; // 12 mins standard cafe preparation estimate

const OrderCountdownTimer = ({ order }) => {
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);

  const status = order?.status;
  const isCompleted = status === 'collected';
  const isReady = status === 'ready';

  useEffect(() => {
    if (!order || isReady || isCompleted) return;

    // Calculate total duration (12 mins base + 2 min for every 3 items)
    const itemCount = order.items?.reduce((s, i) => s + i.quantity, 0) || 1;
    const extraMinutes = Math.floor(itemCount / 3) * 2;
    const totalDurationSeconds = (DEFAULT_PREP_MINUTES + extraMinutes) * 60;

    const startTime = new Date(order.createdAt).getTime();
    const targetEndTime = startTime + totalDurationSeconds * 1000;

    const updateTimer = () => {
      const now = Date.now();
      const diffSeconds = Math.max(0, Math.floor((targetEndTime - now) / 1000));
      setSecondsRemaining(diffSeconds);

      const elapsedSeconds = totalDurationSeconds - diffSeconds;
      const progress = Math.min(100, Math.max(5, (elapsedSeconds / totalDurationSeconds) * 100));
      setProgressPercent(progress);
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [order, isReady, isCompleted]);

  // Ready State (Celebration Card)
  if (isReady) {
    return (
      <div className="order-timer-card timer-ready-card animate-scale-up">
        <div className="timer-ready-icon-wrap">
          <Sparkles className="timer-sparkle-icon" size={28} />
          <ChefHat className="timer-chef-icon" size={40} />
        </div>
        <span className="timer-ready-tag">Ready For Pickup</span>
        <h3 className="timer-ready-title">Your Order is Ready!</h3>
        <p className="timer-ready-desc">
          Hot and freshly prepared. Please head to the cafe counter and show your token.
        </p>
        <div className="timer-token-badge">
          <span>Token Number:</span>
          <strong>#{order._id.slice(-4).toUpperCase()}</strong>
        </div>
      </div>
    );
  }

  // Collected State
  if (isCompleted) {
    return (
      <div className="order-timer-card timer-completed-card">
        <div className="timer-completed-icon-wrap">
          <CheckCircle2 size={36} />
        </div>
        <h3 className="timer-completed-title">Order Enjoyed & Completed</h3>
        <p className="timer-completed-desc">Thank you for ordering with La Roche Cafe!</p>
      </div>
    );
  }

  // Active Countdown State (placed / paid / preparing)
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(seconds).padStart(2, '0');

  const getStatusStage = () => {
    if (status === 'preparing') {
      if (secondsRemaining > 360) return { label: 'Chefs are grilling & brewing', icon: <Flame size={16} className="text-amber-500 animate-pulse" /> };
      return { label: 'Final garnishing & packaging', icon: <Sparkles size={16} className="text-honey-dark animate-spin" /> };
    }
    return { label: 'Ticket queued in kitchen', icon: <Clock size={16} className="text-terracotta" /> };
  };

  const stage = getStatusStage();

  return (
    <div className="order-timer-card timer-active-card">
      <div className="timer-header">
        <div className="timer-badge">
          <span className="timer-live-dot" />
          <span>Live Preparation Tracker</span>
        </div>
        <div className="timer-stage-pill">
          {stage.icon}
          <span>{stage.label}</span>
        </div>
      </div>

      <div className="timer-main-display">
        <div className="timer-countdown-wrap">
          <span className="timer-digits">
            {formattedMinutes}:{formattedSeconds}
          </span>
          <span className="timer-unit">Estimated Minutes Left</span>
        </div>

        {/* Circular / Progress Ring representation */}
        <div className="timer-progress-container">
          <div className="timer-progress-track">
            <div
              className="timer-progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="timer-progress-labels">
            <span>Order Placed</span>
            <span className="font-bold text-espresso">{Math.round(progressPercent)}% Ready</span>
            <span>Counter Pickup</span>
          </div>
        </div>
      </div>

      <div className="timer-footer-hint">
        <BellRing size={15} className="text-terracotta flex-shrink-0" />
        <span>You will receive a notification the moment chefs mark this ready!</span>
      </div>
    </div>
  );
};

export default OrderCountdownTimer;
