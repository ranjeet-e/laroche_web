import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Bell, BellRing, CheckCircle2, ChefHat, Clock, Sparkles, ArrowLeft, ShieldCheck } from 'lucide-react';
import { getOrderById } from '../services/orderService';
import { useSocket } from '../hooks/useSocket';
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  notifyOrderPreparing,
  notifyOrderReady,
} from '../utils/notifications';
import './OrderHistory.css';

const STATUS_STEPS = [
  { key: 'placed', label: 'Order Placed', desc: 'Order received by the cafe' },
  { key: 'paid', label: 'Payment Confirmed', desc: 'Sent to the kitchen queue' },
  { key: 'preparing', label: 'Being Prepared', desc: 'Chefs are crafting your meal hot & fresh' },
  { key: 'ready', label: 'Ready for Pickup', desc: 'Collect at the canteen counter' },
  { key: 'collected', label: 'Completed', desc: 'Order collected. Enjoy your meal!' },
];

const OrderTracking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notificationPermission, setNotificationPermission] = useState(getNotificationPermission());

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

  // Request browser notification permission automatically when customer arrives
  useEffect(() => {
    if (isNotificationSupported() && getNotificationPermission() === 'default') {
      requestNotificationPermission().then(() => {
        setNotificationPermission(getNotificationPermission());
      });
    }
  }, []);

  // Monitor order status transitions and fire browser notifications
  useEffect(() => {
    if (!order) return;

    const currentStatus = order.status;
    const prevStatus = previousStatusRef.current;

    if (prevStatus && prevStatus !== currentStatus) {
      if (currentStatus === 'preparing') {
        notifyOrderPreparing(order);
      } else if (currentStatus === 'ready') {
        notifyOrderReady(order);
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
    const granted = await requestNotificationPermission();
    setNotificationPermission(granted ? 'granted' : 'denied');
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

        {/* Browser Notification Permission Banner */}
        {isNotificationSupported() && notificationPermission !== 'granted' && (
          <div className="mb-6 p-4 sm:p-5 rounded-3xl bg-[#F5EBE6] dark:bg-[#362E2A] border border-[#E5D7D0] dark:border-[#4A3B32] shadow-warm-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-[#9F7A60] text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                <BellRing className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <h4 className="font-bold text-[#231F20] dark:text-white text-sm">Allow Order Alerts</h4>
                <p className="text-xs text-[#6B5B52] dark:text-[#C5B4A8] mt-0.5">
                  Get instant notifications the moment your order is ready for pickup!
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleEnableNotifications}
              className="px-5 py-2 rounded-full bg-[#9F7A60] hover:bg-[#87644C] text-white font-bold text-xs shadow-sm transition-all flex-shrink-0 whitespace-nowrap self-start sm:self-auto"
            >
              Allow Notifications
            </button>
          </div>
        )}

        {/* Main Tracking Card */}
        <div className="bg-white dark:bg-[#2B2421] rounded-3xl border border-[#E5D7D0] dark:border-[#4A3B32] shadow-warm-xl p-6 sm:p-8">
          
          {/* Card Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-[#E5D7D0] dark:border-[#4A3B32]">
            <div>
              <span className="text-xs font-bold text-[#6B5B52] dark:text-[#C5B4A8] uppercase tracking-wider block">
                Live Status Tracker
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#231F20] dark:text-white mt-0.5">
                Order #{order.orderNumber ? order.orderNumber : order._id.slice(-4).toUpperCase()}
              </h2>
              <span className="text-xs text-[#8F7E75] dark:text-[#A89B91] mt-1 inline-flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Placed at {new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#9F7A60]/15 text-[#9F7A60] dark:text-[#E8D8CD] border border-[#9F7A60]/30 text-xs font-black uppercase tracking-wider shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#9F7A60] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#9F7A60]"></span>
              </span>
              <span>{order.status}</span>
            </div>
          </div>

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
                        currentStepIndex > idx ? 'bg-[#9F7A60]' : 'bg-stone-200 dark:bg-[#4A3B32]'
                      }`}
                    />
                  )}

                  {/* Icon / Number Indicator */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 z-10 transition-all duration-300 ${
                      isCompleted
                        ? 'bg-[#9F7A60] text-white shadow-glow-terracotta'
                        : isCurrent
                        ? 'bg-[#231F20] dark:bg-[#9F7A60] text-white ring-4 ring-[#9F7A60]/20'
                        : 'bg-stone-100 dark:bg-[#362E2A] text-stone-400 dark:text-[#9F8E84] border border-stone-200 dark:border-[#4A3B32]'
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
                    <div className="text-xs text-[#6B5B52] dark:text-[#C5B4A8] mt-0.5">
                      {step.desc}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Ordered Items Summary */}
          <div className="pt-6 border-t border-[#E5D7D0] dark:border-[#4A3B32]">
            <h4 className="font-bold text-[#231F20] dark:text-white text-base mb-4">
              Your Items
            </h4>
            <div className="space-y-2.5">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start text-xs sm:text-sm text-taupe dark:text-[#C5B4A8]">
                  <div>
                    <div>{item.name} × <strong className="text-espresso dark:text-white">{item.quantity}</strong></div>
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
              #{order._id.slice(-6).toUpperCase()}
            </div>
            <p className="text-xs text-taupe dark:text-[#C5B4A8] mt-1">
              Tell this Order ID at the counter when your status turns <strong className="text-espresso dark:text-white">Ready for Pickup</strong>.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};

export default OrderTracking;
