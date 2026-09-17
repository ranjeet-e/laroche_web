import { useState, useEffect } from 'react';
import { Camera, Image as ImageIcon, Loader2, Flame } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getActiveKitchenOrders, updateOrderStatus } from '../../services/orderService';
import { useSocket } from '../../hooks/useSocket';
import { playOrderBellSound, unlockAudio } from '../../utils/audioAlerts';
import { uploadImage } from '../../services/uploadService';
import api from '../../services/api';
import './KitchenDashboard.css';

const columns = [
  { key: 'paid', label: 'New', actionLabel: 'Start Prep', nextStatus: 'preparing' },
  { key: 'preparing', label: 'Preparing', actionLabel: 'Mark Ready', nextStatus: 'ready' },
  { key: 'ready', label: 'Ready', actionLabel: 'Mark Collected', nextStatus: 'collected' },
];

const KitchenOrderTimer = ({ createdAt, status }) => {
  const [elapsed, setElapsed] = useState(() => {
    return Math.max(0, Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000));
  });

  useEffect(() => {
    if (status === 'collected') return;

    const interval = setInterval(() => {
      setElapsed(Math.max(0, Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000)));
    }, 1000);

    return () => clearInterval(interval);
  }, [createdAt, status]);

  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  if (status === 'ready') {
    return (
      <div className="kitchen-order-timer timer-ready-state">
        <span className="kitchen-timer-digits">✓ Ready</span>
      </div>
    );
  }

  let timerClass = 'timer-fresh';
  let badgeLabel = 'Fresh';

  if (mins >= 10) {
    timerClass = 'timer-overdue';
    badgeLabel = '🔥 Expedite';
  } else if (mins >= 5) {
    timerClass = 'timer-active';
    badgeLabel = 'Active';
  }

  return (
    <div className={`kitchen-order-timer ${timerClass}`}>
      <span className="kitchen-timer-digits">⏱️ {timeStr}</span>
      <span className="kitchen-timer-badge">{badgeLabel}</span>
    </div>
  );
};

const KitchenDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('orders'); // orders | stock
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);


  const fetchOrders = async () => {
    try {
      const data = await getActiveKitchenOrders();
      setOrders(data);
    } catch (err) {
      console.error('Failed to fetch orders', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const response = await api.get('/menu');
      setMenuItems(response.data);
    } catch (err) {
      console.error('Failed to fetch menu', err);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchMenuItems();

    // Automatic background refresh every 4 seconds as a fallback
    const interval = setInterval(() => {
      fetchOrders();
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Real-time WebSocket: automatically play counter service bell sound on new orders
  useSocket({
    onNewOrder: (newOrder) => {
      // 1. Play crystal-clear counter bell chime automatically
      playOrderBellSound();

      // 2. Haptic vibration for kitchen touchpads/mobiles
      try {
        if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
      } catch (e) {}

      setOrders((prev) => {
        const exists = prev.some((o) => o._id === newOrder._id);
        if (exists) {
          return prev.map((o) => (o._id === newOrder._id ? newOrder : o));
        }
        return [newOrder, ...prev];
      });
    },
    onOrderStatusUpdated: (updatedOrder) => {
      if (updatedOrder.status === 'collected') {
        setOrders((prev) => prev.filter((o) => o._id !== updatedOrder._id));
      } else {
        setOrders((prev) =>
          prev.map((o) => (o._id === updatedOrder._id ? updatedOrder : o))
        );
      }
    },
  });

  const handleStatusUpdate = async (orderId, nextStatus) => {
    // 1. Snapshot previous state for rollback safety
    const previousOrders = [...orders];

    // 2. INSTANT OPTIMISTIC TRANSITION (0ms latency)
    setOrders((prev) => {
      if (nextStatus === 'collected') {
        return prev.filter((o) => o._id !== orderId);
      }
      return prev.map((o) =>
        o._id === orderId ? { ...o, status: nextStatus } : o
      );
    });

    // 3. Tactile haptic feedback for kitchen touchscreens / mobile
    try {
      if (navigator.vibrate) navigator.vibrate(30);
    } catch (e) {}

    // 4. Background network sync
    try {
      const updated = await updateOrderStatus(orderId, nextStatus);
      if (nextStatus !== 'collected' && updated) {
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, ...updated } : o))
        );
      }
    } catch (err) {
      console.error('Failed to update status, rolling back', err);
      setOrders(previousOrders);
    }
  };

  const handleStockToggle = async (itemId, currentAvailability) => {
    const nextAvailability = !currentAvailability;
    const previousMenuItems = [...menuItems];

    // INSTANT OPTIMISTIC UI FLIP (0ms latency)
    setMenuItems((prev) =>
      prev.map((item) =>
        item._id === itemId ? { ...item, isAvailable: nextAvailability } : item
      )
    );

    try {
      if (navigator.vibrate) navigator.vibrate(25);
    } catch (e) {}

    try {
      await api.put(`/menu/${itemId}`, { isAvailable: nextAvailability });
    } catch (err) {
      console.error('Failed to toggle stock, rolling back', err);
      setMenuItems(previousMenuItems);
    }
  };

  const [uploadingId, setUploadingId] = useState(null);

  const handleImageUpload = async (itemId, file) => {
    if (!file) return;
    setUploadingId(itemId);
    try {
      // 1. Upload to Cloudinary via backend
      const result = await uploadImage(file, 'laroche_cafe/menu_items');
      
      // 2. Save new image URL in MongoDB
      await api.put(`/menu/${itemId}`, { imageUrl: result.url });

      // 3. Update local state
      setMenuItems((prev) =>
        prev.map((item) =>
          item._id === itemId ? { ...item, imageUrl: result.url } : item
        )
      );
    } catch (err) {
      console.error('Image upload failed:', err);
      alert('Could not upload image. Please ensure you are connected and try again.');
    } finally {
      setUploadingId(null);
    }
  };

  if (loading) {
    return <div className="dashboard-loading">Loading dashboard...</div>;
  }

  return (
    <div className="kitchen-dashboard">
      <div className="flex items-center justify-between gap-4 flex-wrap mb-7">
        <div className="dashboard-tabs !mb-0">
          <button
            className={`tab ${activeTab === 'orders' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            Orders ({orders.length})
          </button>
          <button
            className={`tab ${activeTab === 'stock' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('stock')}
          >
            Menu Stock
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            unlockAudio();
            playOrderBellSound();
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-[#2B2421] border border-[#E5D7D0] dark:border-[#4A3B32] text-xs font-bold text-[#6B5B52] dark:text-[#E8D8CD] hover:text-[#231F20] dark:hover:text-white shadow-warm-sm hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <span>🔔</span>
          <span>Test Bell Sound</span>
        </button>
      </div>

      {activeTab === 'orders' ? (
        <div className="kanban-board">
          {columns.map((col) => {
            const colOrders = orders.filter((o) => o.status === col.key);
            return (
              <div className="kanban-column" key={col.key}>
                <h3>{col.label} ({colOrders.length})</h3>
                {colOrders.length === 0 ? (
                  <p className="kanban-empty">No orders yet</p>
                ) : (
                  colOrders.map((order) => (
                    <div className="order-card-kanban" key={order._id}>
                      <div className="order-card-kanban-top">
                        <span className="order-id">Order #{order.orderNumber ? order.orderNumber : order._id.slice(-4).toUpperCase()}</span>
                        <KitchenOrderTimer createdAt={order.createdAt} status={order.status} />
                      </div>
                      <div className="order-card-subinfo">
                        <span className="order-card-kanban-student">{order.student?.name}</span>
                        <span className="order-time">
                          {new Date(order.createdAt).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <ul className="order-card-kanban-items">
                        {order.items.map((item, idx) => (
                          <li key={idx}>
                            <div>{item.name} x {item.quantity}</div>
                            {Array.isArray(item.addons) && item.addons.length > 0 && (
                              <div className="text-[11px] text-[#9F7A60] dark:text-[#E8D8CD] pl-2 font-semibold">
                                ↳ + {item.addons.map((a) => a.name).join(', ')}
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                      <button
                        className="kanban-action-btn"
                        onClick={() => handleStatusUpdate(order._id, col.nextStatus)}
                      >
                        {col.actionLabel}
                      </button>
                    </div>
                  ))
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="stock-list">
          {menuItems.map((item) => (
            <div className="stock-row" key={item._id}>
              <div className="stock-item-info">
                <div className="stock-thumb-wrap">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="stock-thumb" />
                  ) : (
                    <div className="stock-thumb-placeholder">
                      <ImageIcon size={20} />
                    </div>
                  )}

                  {/* Cloudinary Image Upload Trigger */}
                  <label
                    className={`stock-img-upload-btn ${uploadingId === item._id ? 'uploading' : ''}`}
                    title="Upload / Change Photo to Cloudinary"
                  >
                    {uploadingId === item._id ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <Camera size={13} />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden-file-input"
                      disabled={uploadingId === item._id}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(item._id, file);
                      }}
                    />
                  </label>
                </div>

                <div className="stock-item-details">
                  <span className="stock-item-name">{item.name}</span>
                  <span className="stock-item-meta">{item.category} • ₹{item.price}</span>
                </div>
              </div>

              <button
                className={`stock-toggle ${item.isAvailable ? 'stock-in' : 'stock-out'}`}
                onClick={() => handleStockToggle(item._id, item.isAvailable)}
              >
                {item.isAvailable ? 'In Stock' : 'Sold Out'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default KitchenDashboard;
