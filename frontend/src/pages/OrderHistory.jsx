import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyOrders } from '../services/orderService';
//import OrderStatusBadge from '../components/OrderStatusBadge';
import './OrderHistory.css';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await getMyOrders();
        setOrders(data);
      } catch (err) {
        setError('Could not load your orders.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-transparent dark:bg-[#1A1718] px-4">
        <div className="w-12 h-12 rounded-full border-3 border-terracotta/20 border-t-terracotta animate-spin mb-4" />
        <p className="text-sm font-bold text-taupe dark:text-stone-400 tracking-wide">Loading your orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-transparent dark:bg-[#1A1718] px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-950/40 text-red-500 flex items-center justify-center mb-4 text-2xl font-bold">
          ⚠️
        </div>
        <h3 className="text-xl font-bold text-espresso dark:text-white mb-2">Unable to Load Orders</h3>
        <p className="text-sm text-taupe dark:text-stone-400 max-w-sm mb-6">{error}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="px-6 py-2.5 rounded-full bg-terracotta hover:bg-terracotta-hover text-white font-bold text-sm shadow-warm-md transition-all"
        >
          Retry
        </button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-transparent dark:bg-[#1A1718] px-4 text-center">
        <div className="w-20 h-20 rounded-full bg-[#FFF9EC] dark:bg-[#2B2421] border border-[#ECD5A5] dark:border-[#4A3B32] shadow-warm-md flex items-center justify-center mb-5 text-terracotta">
          🍽️
        </div>
        <h2 className="text-2xl font-serif font-bold text-espresso dark:text-white mb-2">
          No Orders Yet
        </h2>
        <p className="text-sm text-taupe dark:text-stone-400 max-w-sm mb-6">
          Time to grab a bite! Explore our freshly made dishes and beverages.
        </p>
        <button
          type="button"
          onClick={() => navigate('/menu')}
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-terracotta hover:bg-terracotta-hover text-white font-bold text-sm shadow-glow-terracotta transition-all"
        >
          Browse Fresh Menu
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent dark:bg-[#1A1718] py-8 px-4 sm:px-6 pb-28 transition-colors">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-espresso dark:text-white mb-6 tracking-tight">
          My Orders
        </h1>

        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id}
              onClick={() => navigate(`/orders/${order._id}`)}
              className="p-5 sm:p-6 bg-[#FFF9EC] dark:bg-[#2B2421] rounded-3xl border border-[#ECD5A5] dark:border-[#4A3B32] shadow-warm-sm hover:shadow-warm-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-center justify-between gap-3 mb-3">
                <span className="font-extrabold text-espresso dark:text-white text-base">
                  Order #{order.orderNumber ? order.orderNumber : order._id.slice(-4).toUpperCase()}
                </span>
                <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-terracotta/15 text-terracotta dark:text-terracotta-light border border-terracotta/30">
                  {order.status}
                </span>
              </div>

              <p className="text-sm text-taupe dark:text-stone-300 line-clamp-2 mb-4 leading-relaxed">
                {order.items
                  .map((i) => {
                    const addonText = Array.isArray(i.addons) && i.addons.length > 0
                      ? ` (+ ${i.addons.map((a) => a.name).join(', ')})`
                      : '';
                    return `${i.quantity}x ${i.name}${addonText}`;
                  })
                  .join(', ')}
              </p>

              <div className="flex items-center justify-between pt-3 border-t border-stone-100 dark:border-stone-800 text-xs sm:text-sm">
                <span className="text-stone-400 dark:text-stone-500">
                  {new Date(order.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                <span className="font-extrabold text-espresso dark:text-white text-base">
                  ₹{order.totalAmount}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderHistory;
