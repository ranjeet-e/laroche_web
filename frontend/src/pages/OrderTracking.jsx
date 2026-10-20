import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Bell,
  BellRing,
  CheckCircle2,
  ChefHat,
  Clock,
  Sparkles,
  ArrowLeft,
  ShieldCheck,
  AlertTriangle,
  Smartphone,
  Check,
  Volume2,
} from 'lucide-react';
import { getOrderById } from '../services/orderService';
import { useSocket } from '../hooks/useSocket';
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  notifyOrderPreparing,
  notifyOrderReady,
  isIOSDevice,
  isStandalonePWA,
} from '../utils/notifications';
import { playOrderBellSound, unlockAudio } from '../utils/audioAlerts';
import './OrderHistory.css';

const STATUS_STEPS = [
  { key: 'placed', label: 'Order Placed', desc: 'Order received by the cafe' },
  { key: 'paid', label: 'Payment Confirmed', desc: 'Sent to the kitchen queue' },
  { key: 'preparing', label: 'Being Prepared', desc: 'Chefs are crafting your meal hot & fresh' },
  { key: 'ready', label: 'Ready for Pickup', desc: 'Collect at the canteen counter' },
  { key: 'collected', label: 'Completed', desc: 'Order collected. Enjoy your meal!' },
];

const FreshnessCountdown = ({ readyAt, updatedAt }) => {
  const baseTime = readyAt
    ? new Date(readyAt).getTime()
    : updatedAt
    ? new Date(updatedAt).getTime()
    : Date.now();
  const FRESHNESS_DURATION = 10 * 60; // 10 minutes in seconds

  const [timeLeft, setTimeLeft] = useState(() => {
    const elapsed = Math.floor((Date.now() - baseTime) / 1000);
    return Math.max(0, FRESHNESS_DURATION - elapsed);
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - baseTime) / 1000);
      setTimeLeft(Math.max(0, FRESHNESS_DURATION - elapsed));
    }, 1000);
    return () => clearInterval(timer);
  }, [baseTime]);

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const timeFormatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  const progressPercent = Math.min(100, Math.max(0, (timeLeft / FRESHNESS_DURATION) * 100));

  if (timeLeft > 0) {
    return (
      <div className="my-5 p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-[#2B231D] dark:to-[#221B16] border-2 border-orange-300/80 dark:border-orange-800/60 shadow-warm-md animate-fadeIn">
        <div className="flex items-center justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold text-sm">
              🔥
            </span>
            <div>
              <h4 className="font-bold text-espresso dark:text-white text-sm sm:text-base">
                Peak Freshness Window
              </h4>
              <p className="text-[11px] text-taupe dark:text-stone-400">
                Freshly plated off the griddle & coffee bar
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="font-mono text-xl sm:text-2xl font-black text-orange-600 dark:text-orange-400">
              {timeFormatted}
            </span>
            <span className="block text-[10px] uppercase font-bold text-stone-500 tracking-wider">
              Remaining
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-orange-200/50 dark:bg-stone-800 h-2 rounded-full overflow-hidden mb-2.5">
          <div
            className="bg-gradient-to-r from-amber-500 to-orange-600 h-full rounded-full transition-all duration-1000"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed font-sans">
          ⚡ <strong>Head to the counter:</strong> Sourdough toasties, sandwiches & coffees are at peak crunch and temperature. Please collect before the timer expires!
        </p>
      </div>
    );
  }

  // Expired State
  return (
    <div className="my-5 p-4 sm:p-5 rounded-3xl bg-amber-500/10 dark:bg-amber-950/40 border-2 border-amber-500/40 dark:border-amber-700/60 shadow-warm-md animate-fadeIn">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center flex-shrink-0 font-bold mt-0.5">
          ⚠️
        </div>
        <div>
          <h4 className="font-bold text-amber-900 dark:text-amber-200 text-sm sm:text-base">
            Peak Freshness Window Expired
          </h4>
          <p className="text-xs text-amber-800/90 dark:text-amber-300/90 mt-1 leading-relaxed">
            This order was prepared over 10 minutes ago. Artisanal sourdough toasties and coffees naturally lose crispness and optimal heat over time.
          </p>
          <div className="mt-2 p-2.5 rounded-xl bg-amber-500/15 text-[11px] font-semibold text-amber-950 dark:text-amber-100 border border-amber-500/20">
            * Advisory Notice: To maintain food quality standards, the café is not liable for sogginess, texture change, or loss of temperature after this window expires. Please collect your order immediately at the pickup counter.
          </div>
        </div>
      </div>
    </div>
  );
};

const OrderTracking = () => {

  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notificationPermission, setNotificationPermission] = useState(getNotificationPermission());
  const [inAppToast, setInAppToast] = useState(null);
  const [isRequesting, setIsRequesting] = useState(false);

  const previousStatusRef = useRef(null);

  const fetchOrder = async () => {
    try {
      const data = await getOrderById(id);
      setOrder(data);
    } catch (err) {
      setError('Could not load order details.');
    } finally {
      setLoading(false);
    }
  };

  // Initial order fetch & polling
  useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, 3500);
    return () => clearInterval(interval);
  }, [id]);

  // Monitor order status transitions and fire browser & in-app notifications
  useEffect(() => {
    if (!order) return;

    const currentStatus = order.status;
    const prevStatus = previousStatusRef.current;

    if (prevStatus && prevStatus !== currentStatus) {
      const shortId = order.orderNumber ? `#${order.orderNumber}` : `#${order._id.slice(-4).toUpperCase()}`;

      if (currentStatus === 'preparing') {
        notifyOrderPreparing(order);
        setInAppToast({
          type: 'preparing',
          title: '🍳 Chefs are Preparing Your Order!',
          message: `Order ${shortId} is now on the stove / griddle. It will be ready shortly.`,
        });
      } else if (currentStatus === 'ready') {
        notifyOrderReady(order);
        setInAppToast({
          type: 'ready',
          title: '🎉 Order Ready for Pickup!',
          message: `Order ${shortId} is hot & fresh at the counter. Grab it now!`,
        });
      } else if (currentStatus === 'collected') {
        setInAppToast({
          type: 'collected',
          title: '✨ Order Collected!',
          message: `Enjoy your meal from La Roche Cafe!`,
        });
      }
    }

    previousStatusRef.current = currentStatus;
  }, [order]);

  // Real-time live status updates via WebSockets
  useSocket({
    orderId: id,
    onOrderStatusUpdated: (updatedOrder) => {
      if (updatedOrder._id === id) {
        setOrder(updatedOrder);
      }
    },
    onOrderReady: (readyOrder) => {
      if (readyOrder._id === id) {
        setOrder(readyOrder);
      }
    },
  });

  const handleEnableNotifications = async () => {
    setIsRequesting(true);
    unlockAudio();
    playOrderBellSound();

    try {
      const result = await requestNotificationPermission();
      setNotificationPermission(result.permission);

      if (result.success) {
        setInAppToast({
          type: 'ready',
          title: '🔔 Order Alerts Enabled!',
          message: "You'll receive instant sound and browser alerts when your meal is ready.",
        });
      }
    } catch (err) {
      console.warn('Failed to enable notifications:', err);
    } finally {
      setIsRequesting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-oat px-4">
        <div className="w-12 h-12 rounded-full border-3 border-terracotta/20 border-t-terracotta animate-spin mb-4" />
        <p className="text-sm font-bold text-taupe tracking-wide">Tracking order live...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-oat px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-4 text-2xl font-bold">
          ⚠️
        </div>
        <h3 className="text-xl font-bold text-espresso mb-2">Order Not Found</h3>
        <p className="text-sm text-taupe max-w-sm mb-6">{error || 'Unable to locate order details.'}</p>
        <button
          type="button"
          onClick={() => navigate('/orders')}
          className="px-6 py-2.5 rounded-full bg-espresso text-white font-bold text-sm shadow-warm-md hover:bg-espresso-light transition-all"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  const currentStepIndex = STATUS_STEPS.findIndex((s) => s.key === order.status);
  const isIOS = isIOSDevice();
  const isPWA = isStandalonePWA();

  return (
    <div className="min-h-screen bg-oat py-8 px-4 sm:px-6 pb-28">
      <div className="max-w-2xl mx-auto">
        {/* Navigation Link */}
        <div className="mb-4">
          <Link
            to="/orders"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-taupe hover:text-espresso transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Orders</span>
          </Link>
        </div>

        {/* Live In-App Floating Toast Alert */}
        {inAppToast && (
          <div className="mb-6 p-4 rounded-3xl bg-espresso text-white border border-stone-700 shadow-warm-xl animate-slideUp flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-terracotta text-white flex items-center justify-center flex-shrink-0 shadow-glow-terracotta">
                <BellRing className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">{inAppToast.title}</h4>
                <p className="text-xs text-stone-300 mt-0.5">{inAppToast.message}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setInAppToast(null)}
              className="text-stone-400 hover:text-white text-xs font-bold px-2 py-1"
            >
              ✕
            </button>
          </div>
        )}

        {/* Notification Permission Card Banner */}
        {notificationPermission === 'granted' ? (
          <div className="mb-6 p-4 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 shadow-warm-sm flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
                <Check className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-emerald-900 dark:text-emerald-200 text-xs sm:text-sm">
                  Live Counter Alerts Active
                </h4>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                  You'll be alerted immediately when your meal is hot & ready for pickup.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                unlockAudio();
                playOrderBellSound();
              }}
              className="p-2 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-full transition-colors flex-shrink-0"
              title="Test Alert Chime"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>
        ) : notificationPermission === 'denied' ? (
          <div className="mb-6 p-4 rounded-3xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 shadow-warm-sm flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-amber-900 dark:text-amber-200 text-xs sm:text-sm">
                Notifications are blocked in your browser
              </h4>
              <p className="text-[11px] text-amber-800 dark:text-amber-300 mt-0.5 leading-snug">
                To enable live alerts, tap the <strong>🔒 padlock / tune icon</strong> in your browser address bar and switch Notifications to <strong>Allow</strong>.
              </p>
            </div>
          </div>
        ) : isIOS && !isPWA ? (
          <div className="mb-6 p-4 rounded-3xl bg-[#F2EDE2] dark:bg-[#2F2F26] border border-[#DDD4C0] dark:border-[#3D3D30] shadow-warm-sm flex items-start gap-3">
            <Smartphone className="w-5 h-5 text-terracotta flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-espresso dark:text-white text-xs sm:text-sm">
                Enable iPhone Push Alerts
              </h4>
              <p className="text-[11px] text-stone-600 dark:text-stone-300 mt-0.5 leading-snug">
                Tap <strong>Share ➔ Add to Home Screen</strong> in Safari to receive real-time counter pickup notifications on your lock screen.
              </p>
            </div>
          </div>
        ) : (
          <div className="mb-6 p-4 sm:p-5 rounded-3xl bg-[#F2EDE2] dark:bg-[#2F2F26] border border-[#DDD4C0] dark:border-[#3D3D30] shadow-warm-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-[#A6472B] text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                <BellRing className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <h4 className="font-bold text-[#2A2A22] dark:text-white text-sm">Allow Order Alerts</h4>
                <p className="text-xs text-[#5A5748] dark:text-[#C4BFB2] mt-0.5 font-sans">
                  Get instant notifications the moment your order is ready for pickup!
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleEnableNotifications}
              disabled={isRequesting}
              className="px-5 py-2.5 rounded-full bg-[#A6472B] hover:bg-[#7E351F] text-white font-bold text-xs shadow-sm hover:scale-105 active:scale-95 transition-all flex-shrink-0 whitespace-nowrap self-start sm:self-auto cursor-pointer"
            >
              {isRequesting ? 'Enabling...' : 'Allow Notifications'}
            </button>
          </div>
        )}

        {/* Main Tracking Card */}
        <div className="bg-white dark:bg-[#23231C] rounded-3xl border border-[#DDD4C0] dark:border-[#3D3D30] shadow-warm-xl p-6 sm:p-8">
          {/* Card Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-[#DDD4C0] dark:border-[#3D3D30]">
            <div>
              <span className="text-xs font-bold text-[#5A5748] dark:text-[#C4BFB2] uppercase tracking-wider block">
                Live Status Tracker
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-medium text-[#2A2A22] dark:text-white mt-0.5">
                Order #{order.orderNumber ? order.orderNumber : order._id.slice(-4).toUpperCase()}
              </h2>
              <span className="text-xs text-[#78826B] dark:text-[#A8A396] mt-1 inline-flex items-center gap-1 font-sans">
                <Clock className="w-3.5 h-3.5" />
                Placed at{' '}
                {new Date(order.createdAt).toLocaleTimeString('en-IN', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#A6472B]/15 text-[#A6472B] dark:text-[#E9E0CC] border border-[#A6472B]/30 text-xs font-black uppercase tracking-wider shadow-sm font-sans">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#A6472B] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#A6472B]"></span>
              </span>
              <span>{order.status}</span>
            </div>
          </div>

          {/* Freshness Countdown & Quality Advisory (Shows when order is Ready) */}
          {order.status === 'ready' && (
            <FreshnessCountdown readyAt={order.readyAt} updatedAt={order.updatedAt} />
          )}

          {/* Stepper Progress */}
          <div className="my-8 space-y-6">

            {STATUS_STEPS.map((step, idx) => {
              const isCompleted = currentStepIndex >= idx;
              const isCurrent = currentStepIndex === idx;

              return (
                <div key={step.key} className="flex items-start gap-4 relative">
                  {/* Connecting Line */}
                  {idx < STATUS_STEPS.length - 1 && (
                    <div
                      className={`absolute left-4 top-8 bottom-0 w-0.5 -mb-6 transition-colors duration-500 ${
                        currentStepIndex > idx ? 'bg-[#A6472B]' : 'bg-stone-200 dark:bg-[#3D3D30]'
                      }`}
                    />
                  )}

                  {/* Icon / Number Indicator */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 z-10 transition-all duration-300 ${
                      isCompleted
                        ? 'bg-[#A6472B] text-white shadow-glow-terracotta'
                        : isCurrent
                        ? 'bg-[#2A2A22] dark:bg-[#A6472B] text-white ring-4 ring-[#A6472B]/20'
                        : 'bg-[#F2EDE2] dark:bg-[#2F2F26] text-[#5A5748] dark:text-[#8D897A] border border-[#DDD4C0] dark:border-[#3D3D30]'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                  </div>

                  {/* Step Description */}
                  <div className="flex-1 pt-0.5">
                    <div
                      className={`text-sm font-bold transition-colors ${
                        isCurrent
                          ? 'text-[#9F7A60] text-base'
                          : isCompleted
                          ? 'text-[#231F20] dark:text-white'
                          : 'text-stone-400 dark:text-[#8F7E75]'
                      }`}
                    >
                      {step.label}
                    </div>
                    <div className="text-xs text-[#6B5B52] dark:text-[#C5B4A8] mt-0.5">{step.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Ordered Items Summary */}
          <div className="pt-6 border-t border-[#E5D7D0] dark:border-[#4A3B32]">
            <h4 className="font-bold text-[#231F20] dark:text-white text-base mb-4">Your Items</h4>
            <div className="space-y-2.5">
              {order.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-start text-xs sm:text-sm text-taupe dark:text-[#C5B4A8]"
                >
                  <div>
                    <div>
                      {item.name} × <strong className="text-espresso dark:text-white">{item.quantity}</strong>
                    </div>
                    {Array.isArray(item.addons) && item.addons.length > 0 && (
                      <div className="text-[11px] text-[#9F7A60] dark:text-[#E8D8CD] font-medium mt-0.5">
                        + {item.addons.map((a) => a.name).join(', ')}
                      </div>
                    )}
                  </div>
                  <span className="font-semibold text-espresso dark:text-white">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-stone-100 dark:border-[#4A3B32] flex justify-between items-center text-base sm:text-lg font-extrabold text-espresso dark:text-white">
              <span>Total Amount</span>
              <span className="text-terracotta">₹{order.totalAmount}</span>
            </div>
          </div>

          {/* Counter Pickup Callout (No QR) */}
          <div className="mt-6 p-4 rounded-2xl bg-stone-50 dark:bg-[#362E2A] border border-stone-200/80 dark:border-[#4A3B32] text-center">
            <span className="text-xs font-bold text-taupe dark:text-[#C5B4A8] uppercase tracking-wider block mb-1">
              Counter Pickup Pass
            </span>
            <div className="text-2xl font-black text-terracotta font-mono">
              #{order.orderNumber ? order.orderNumber : order._id.slice(-6).toUpperCase()}
            </div>
            <p className="text-xs text-taupe dark:text-[#C5B4A8] mt-1">
              Tell this Order ID at the counter when your status turns{' '}
              <strong className="text-espresso dark:text-white">Ready for Pickup</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
