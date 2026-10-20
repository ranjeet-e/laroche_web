import { useState, useEffect } from 'react';
import {
  Camera,
  Image as ImageIcon,
  Loader2,
  Flame,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Clock,
  Sparkles,
  RefreshCw,
  Search,
  Layers,
  Eye,
  EyeOff,
  AlertTriangle,
  Play,
  Pause,
} from 'lucide-react';
import {
  getActiveKitchenOrders,
  updateOrderStatus,
  getKitchenStoreStatus,
  toggleKitchenStoreOrders,
} from '../../services/orderService';
import { useSocket } from '../../hooks/useSocket';
import {
  playOrderBellSound,
  playReminderPingSound,
  unlockAudio,
  speakOrderAnnouncement,
} from '../../utils/audioAlerts';
import { uploadImage } from '../../services/uploadService';

import api, { resolveAssetUrl } from '../../services/api';
import './KitchenDashboard.css';


const columns = [
  { key: 'paid', label: 'New', actionLabel: 'Start Prep', nextStatus: 'preparing' },
  { key: 'preparing', label: 'Preparing', actionLabel: 'Mark Ready', nextStatus: 'ready' },
  { key: 'ready', label: 'Ready', actionLabel: 'Mark Collected', nextStatus: 'collected' },
];

const CATEGORIES = [
  'All',
  'Hot Coffee',
  'Cold Coffee',
  'Sourdough & Toasties',
  'Artisan Shakes',
  'Bakery & Desserts',
  'Healthy Bowls',
  'Add-ons',
];

const KitchenOrderTimer = ({ createdAt, readyAt, status }) => {
  const isReady = status === 'ready';
  const referenceTime = isReady ? (readyAt || createdAt) : createdAt;

  const [elapsed, setElapsed] = useState(() => {
    return Math.max(0, Math.floor((Date.now() - new Date(referenceTime).getTime()) / 1000));
  });

  useEffect(() => {
    if (status === 'collected') return;

    const interval = setInterval(() => {
      setElapsed(Math.max(0, Math.floor((Date.now() - new Date(referenceTime).getTime()) / 1000)));
    }, 1000);

    return () => clearInterval(interval);
  }, [referenceTime, status]);

  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  if (isReady) {
    if (mins >= 10) {
      return (
        <div className="kitchen-order-timer timer-overdue" title={`Ready ${mins}m ago (Cold)`}>
          <span className="kitchen-timer-digits">⚠️ Ready {mins}m</span>
          <span className="kitchen-timer-badge">Cold</span>
        </div>
      );
    }
    return (
      <div className="kitchen-order-timer timer-ready-state" title={`Ready ${mins}m ago`}>
        <span className="kitchen-timer-digits">✓ Ready ({mins}m)</span>
        <span className="kitchen-timer-badge">Counter</span>
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
  // Tabs: 'orders' | 'menu_cms' | 'banners_cms' | 'sales_stats'
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [banners, setBanners] = useState([]);
  const [salesStats, setSalesStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshingStats, setRefreshingStats] = useState(false);

  // Menu Search & Category Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modals state
  const [isDishModalOpen, setIsDishModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState(null);
  const [dishFormData, setDishFormData] = useState({
    name: '',
    category: 'Hot Coffee',
    price: '',
    description: '',
    imageUrl: '',
    isAvailable: true,
  });
  const [dishModalUploading, setDishModalUploading] = useState(false);

  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [bannerFormData, setBannerFormData] = useState({
    title: '',
    subtitle: '',
    tag: '🔥 SPECIAL OFFER',
    imageUrl: '',
    isActive: true,
  });
  const [bannerModalUploading, setBannerModalUploading] = useState(false);

  const [uploadingId, setUploadingId] = useState(null);

  // Overcrowd Rush Mode State
  const [storeStatus, setStoreStatus] = useState({
    paused: false,
    reason: '',
    resumeAt: null,
  });
  const [isOvercrowdModalOpen, setIsOvercrowdModalOpen] = useState(false);
  const [pauseDuration, setPauseDuration] = useState(15);
  const [pauseReason, setPauseReason] = useState('Kitchen rush / High order volume');
  const [togglingStoreStatus, setTogglingStoreStatus] = useState(false);
  const [countdownText, setCountdownText] = useState('');

  // Fetch Store Status
  const fetchStoreStatus = async () => {
    try {
      const data = await getKitchenStoreStatus();
      if (data) setStoreStatus(data);
    } catch (err) {
      console.error('Failed to fetch kitchen store status', err);
    }
  };

  // Fetch Orders
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

  // Fetch Menu Items (all=true to show in-stock and out-of-stock)
  const fetchMenuItems = async () => {
    try {
      const response = await api.get('/menu?all=true');
      setMenuItems(response.data);
    } catch (err) {
      console.error('Failed to fetch menu', err);
    }
  };

  // Fetch Banners (all=true to show active and inactive)
  const fetchBanners = async () => {
    try {
      const response = await api.get('/cms/banners?all=true');
      setBanners(response.data);
    } catch (err) {
      console.error('Failed to fetch banners', err);
    }
  };

  // Fetch Sales Stats
  const fetchSalesStats = async () => {
    setRefreshingStats(true);
    try {
      const response = await api.get('/cms/stats');
      setSalesStats(response.data);
    } catch (err) {
      console.error('Failed to fetch sales telemetry', err);
    } finally {
      setRefreshingStats(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchMenuItems();
    fetchBanners();
    fetchSalesStats();
    fetchStoreStatus();

    // Live background polling for orders and store status
    const interval = setInterval(() => {
      fetchOrders();
      fetchStoreStatus();
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Live countdown timer for active timed rush pause
  useEffect(() => {
    if (!storeStatus.paused || !storeStatus.resumeAt) {
      setCountdownText('');
      return;
    }

    const updateCountdown = () => {
      const diff = Math.max(0, Math.floor((new Date(storeStatus.resumeAt).getTime() - Date.now()) / 1000));
      if (diff <= 0) {
        setCountdownText('');
        setStoreStatus((prev) => ({ ...prev, paused: false, resumeAt: null }));
      } else {
        const mins = Math.floor(diff / 60);
        const secs = diff % 60;
        setCountdownText(`${mins}:${secs < 10 ? '0' : ''}${secs}`);
      }
    };

    updateCountdown();
    const timerInterval = setInterval(updateCountdown, 1000);
    return () => clearInterval(timerInterval);
  }, [storeStatus.paused, storeStatus.resumeAt]);

  // 30-Second Ping Reminder: Alerts kitchen staff if any order is not yet shifted from "New" (paid) column
  useEffect(() => {
    const hasUnshiftedNewOrders = orders.some((o) => o.status === 'paid');
    if (!hasUnshiftedNewOrders) return;

    const pingInterval = setInterval(() => {
      const stillHasNew = orders.some((o) => o.status === 'paid');
      if (stillHasNew) {
        playReminderPingSound();
        try {
          if (navigator.vibrate) navigator.vibrate([150, 100, 150]);
        } catch (e) {}
      }
    }, 30000);

    return () => clearInterval(pingInterval);
  }, [orders]);

  // Real-time WebSocket: automatically play counter service bell sound + voice dictate on new orders & sync store status
  useSocket({
    onNewOrder: (newOrder) => {
      playOrderBellSound();
      speakOrderAnnouncement(newOrder);
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
      fetchSalesStats();
    },
    onOrderStatusUpdated: (updatedOrder) => {
      if (updatedOrder.status === 'collected') {
        setOrders((prev) => prev.filter((o) => o._id !== updatedOrder._id));
      } else {
        setOrders((prev) =>
          prev.map((o) => (o._id === updatedOrder._id ? updatedOrder : o))
        );
      }
      fetchSalesStats();
    },
    onStoreStatusChanged: (newStatus) => {
      if (newStatus) setStoreStatus(newStatus);
    },
  });

  // Toggle Pause Handlers
  const handlePauseOrders = async () => {
    setTogglingStoreStatus(true);
    try {
      const res = await toggleKitchenStoreOrders({
        paused: true,
        reason: pauseReason.trim() || 'Kitchen rush / High order volume',
        durationMinutes: pauseDuration,
      });
      setStoreStatus(res);
      setIsOvercrowdModalOpen(false);
    } catch (err) {
      console.error('Failed to pause orders', err);
      alert('Failed to update kitchen status. Please check network connection.');
    } finally {
      setTogglingStoreStatus(false);
    }
  };

  const handleResumeOrders = async () => {
    setTogglingStoreStatus(true);
    try {
      const res = await toggleKitchenStoreOrders({
        paused: false,
        reason: '',
        durationMinutes: 0,
      });
      setStoreStatus(res);
    } catch (err) {
      console.error('Failed to resume orders', err);
      alert('Failed to resume orders. Please check network connection.');
    } finally {
      setTogglingStoreStatus(false);
    }
  };

  // --- Order Kanban Status Action ---
  const handleStatusUpdate = async (orderId, nextStatus) => {
    const previousOrders = [...orders];

    // Optimistic UI update
    setOrders((prev) => {
      if (nextStatus === 'collected') {
        return prev.filter((o) => o._id !== orderId);
      }
      return prev.map((o) =>
        o._id === orderId ? { ...o, status: nextStatus } : o
      );
    });

    try {
      if (navigator.vibrate) navigator.vibrate(30);
    } catch (e) {}

    try {
      const updated = await updateOrderStatus(orderId, nextStatus);
      if (nextStatus !== 'collected' && updated) {
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, ...updated } : o))
        );
      }
      fetchSalesStats();
    } catch (err) {
      console.error('Failed to update status, rolling back', err);
      setOrders(previousOrders);
    }
  };

  // --- Stock Availability Toggle ---
  const handleStockToggle = async (itemId, currentAvailability) => {
    const nextAvailability = !currentAvailability;
    const previousMenuItems = [...menuItems];

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

  // --- In-House Row Image Upload ---
  const handleImageUpload = async (itemId, file) => {
    if (!file) return;
    setUploadingId(itemId);
    try {
      const result = await uploadImage(file, 'laroche_cafe/menu_items');
      await api.put(`/menu/${itemId}`, { imageUrl: result.url });

      setMenuItems((prev) =>
        prev.map((item) =>
          item._id === itemId ? { ...item, imageUrl: result.url } : item
        )
      );
    } catch (err) {
      console.error('Image upload failed:', err);
      alert('Could not upload image. Please try again.');
    } finally {
      setUploadingId(null);
    }
  };

  // --- Dish Modal Actions (Create / Edit) ---
  const openAddDishModal = () => {
    setEditingDish(null);
    setDishFormData({
      name: '',
      category: selectedCategory !== 'All' ? selectedCategory : 'Hot Coffee',
      price: '',
      description: '',
      imageUrl: '',
      isAvailable: true,
    });
    setIsDishModalOpen(true);
  };

  const openEditDishModal = (dish) => {
    setEditingDish(dish);
    setDishFormData({
      name: dish.name || '',
      category: dish.category || 'Hot Coffee',
      price: dish.price || '',
      description: dish.description || '',
      imageUrl: dish.imageUrl || '',
      isAvailable: dish.isAvailable !== false,
    });
    setIsDishModalOpen(true);
  };

  const handleDishModalFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setDishModalUploading(true);
    try {
      const result = await uploadImage(file, 'laroche_cafe/menu_items');
      setDishFormData((prev) => ({ ...prev, imageUrl: result.url }));
    } catch (err) {
      alert('Failed to upload photo: ' + (err.message || 'Unknown error'));
    } finally {
      setDishModalUploading(false);
    }
  };

  const handleSaveDish = async (e) => {
    e.preventDefault();
    if (!dishFormData.name.trim() || !dishFormData.category || !dishFormData.price) {
      alert('Please provide item name, category, and price.');
      return;
    }

    try {
      const payload = {
        name: dishFormData.name.trim(),
        category: dishFormData.category,
        price: Number(dishFormData.price),
        description: dishFormData.description.trim(),
        imageUrl: dishFormData.imageUrl.trim(),
        isAvailable: dishFormData.isAvailable,
      };

      if (editingDish) {
        // Update existing
        const res = await api.put(`/menu/${editingDish._id}`, payload);
        setMenuItems((prev) =>
          prev.map((i) => (i._id === editingDish._id ? res.data : i))
        );
      } else {
        // Create new
        const res = await api.post('/menu', payload);
        setMenuItems((prev) => [res.data, ...prev]);
      }
      setIsDishModalOpen(false);
    } catch (err) {
      console.error('Failed to save menu dish', err);
      alert('Error saving dish: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteDish = async (dishId, dishName) => {
    if (!window.confirm(`Are you sure you want to delete "${dishName}" permanently from the menu?`)) {
      return;
    }
    try {
      await api.delete(`/menu/${dishId}`);
      setMenuItems((prev) => prev.filter((i) => i._id !== dishId));
    } catch (err) {
      console.error('Failed to delete dish', err);
      alert('Could not delete dish. ' + (err.response?.data?.message || err.message));
    }
  };

  // --- Banner Modal Actions ---
  const handleBannerModalFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBannerModalUploading(true);
    try {
      const result = await uploadImage(file, 'laroche_cafe/banners');
      setBannerFormData((prev) => ({ ...prev, imageUrl: result.url }));
    } catch (err) {
      alert('Failed to upload banner graphic: ' + (err.message || 'Unknown error'));
    } finally {
      setBannerModalUploading(false);
    }
  };

  const handleSaveBanner = async (e) => {
    e.preventDefault();
    if (!bannerFormData.title.trim()) {
      alert('Banner title is required.');
      return;
    }
    try {
      const payload = {
        title: bannerFormData.title.trim(),
        subtitle: bannerFormData.subtitle.trim(),
        tag: bannerFormData.tag.trim() || '🔥 SPECIAL OFFER',
        imageUrl: bannerFormData.imageUrl.trim(),
        isActive: bannerFormData.isActive,
      };

      const res = await api.post('/cms/banners', payload);
      setBanners((prev) => [res.data, ...prev]);
      setIsBannerModalOpen(false);
      setBannerFormData({
        title: '',
        subtitle: '',
        tag: '🔥 SPECIAL OFFER',
        imageUrl: '',
        isActive: true,
      });
    } catch (err) {
      console.error('Failed to save banner', err);
      alert('Could not create banner: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleToggleBannerActive = async (banner) => {
    try {
      const res = await api.put(`/cms/banners/${banner._id}`, {
        isActive: !banner.isActive,
      });
      setBanners((prev) =>
        prev.map((b) => (b._id === banner._id ? res.data : b))
      );
    } catch (err) {
      console.error('Failed to toggle banner status', err);
    }
  };

  const handleDeleteBanner = async (bannerId, title) => {
    if (!window.confirm(`Delete banner "${title}"?`)) return;
    try {
      await api.delete(`/cms/banners/${bannerId}`);
      setBanners((prev) => prev.filter((b) => b._id !== bannerId));
    } catch (err) {
      console.error('Failed to delete banner', err);
      alert('Could not delete banner.');
    }
  };

  // Filtered Menu Items
  const filteredMenuItems = menuItems.filter((item) => {
    const matchesCategory =
      selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="dashboard-loading">
        <Loader2 className="animate-spin mr-2" size={24} />
        <span>Loading Kitchen Dashboard...</span>
      </div>
    );
  }

  return (
    <div className="kitchen-dashboard">
      {/* Top Navigation & Sound Bell Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap mb-7">
        <div className="dashboard-tabs !mb-0">
          <button
            className={`tab ${activeTab === 'orders' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            📋 Live Orders ({orders.length})
          </button>
          <button
            className={`tab ${activeTab === 'menu_cms' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('menu_cms')}
          >
            🍽️ Menu CMS ({menuItems.length})
          </button>
          <button
            className={`tab ${activeTab === 'banners_cms' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('banners_cms')}
          >
            🎨 Promo Banners ({banners.length})
          </button>
          <button
            className={`tab ${activeTab === 'sales_stats' ? 'tab-active' : ''}`}
            onClick={() => {
              setActiveTab('sales_stats');
              fetchSalesStats();
            }}
          >
            📊 Daily Sales Ledger
          </button>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Overcrowd Rush Mode Control Button */}
          {!storeStatus.paused ? (
            <button
              type="button"
              onClick={() => setIsOvercrowdModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 text-xs font-bold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 shadow-warm-sm hover:scale-105 active:scale-95 transition-all cursor-pointer"
              title="Click to pause new incoming orders during kitchen rush"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span>Orders Open</span>
              <span className="text-[10px] bg-emerald-200 dark:bg-emerald-800/60 text-emerald-900 dark:text-emerald-100 px-2 py-0.5 rounded-full font-bold uppercase">
                Pause Rush
              </span>
            </button>
          ) : (
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-rose-100 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-700 text-xs font-bold text-rose-800 dark:text-rose-200 shadow-warm-sm">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500 animate-ping"></span>
              <span>Orders Paused {countdownText && `(${countdownText})`}</span>
              <button
                type="button"
                onClick={handleResumeOrders}
                disabled={togglingStoreStatus}
                className="ml-1 px-3 py-1 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                {togglingStoreStatus ? 'Resuming...' : '▶ Reopen Orders'}
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              unlockAudio();
              playOrderBellSound();
              speakOrderAnnouncement({
                student: { name: 'Ranjeet' },
                items: [{ name: 'Peri-Peri Fries', quantity: 1 }],
              });
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-[#2B2421] border border-[#E5D7D0] dark:border-[#4A3B32] text-xs font-bold text-[#6B5B52] dark:text-[#E8D8CD] hover:text-[#231F20] dark:hover:text-white shadow-warm-sm hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title="Test counter bell chime and voice dictation"
          >
            <span>🔔</span>
            <span>Test Sound</span>
          </button>
        </div>
      </div>



      {/* ============================================================ */}
      {/* TAB 1: KANBAN LIVE ORDERS                                     */}
      {/* ============================================================ */}
      {activeTab === 'orders' && (
        <div className="kanban-board">
          {columns.map((col) => {
            const colOrders = orders.filter((o) => o.status === col.key);
            return (
              <div className="kanban-column" key={col.key}>
                <h3>
                  <span>{col.label}</span>
                  <span className="text-xs bg-[#4A3B32]/10 dark:bg-white/10 px-2.5 py-0.5 rounded-full font-extrabold">
                    {colOrders.length}
                  </span>
                </h3>
                {colOrders.length === 0 ? (
                  <p className="kanban-empty">No active orders</p>
                ) : (
                  colOrders.map((order) => (
                    <div className="order-card-kanban" key={order._id}>
                      <div className="order-card-kanban-top">
                        <span className="order-id">
                          Order #{order.orderNumber ? order.orderNumber : order._id.slice(-4).toUpperCase()}
                        </span>
                        <KitchenOrderTimer createdAt={order.createdAt} readyAt={order.readyAt || order.updatedAt} status={order.status} />
                      </div>
                      <div className="order-card-subinfo">
                        <span className="order-card-kanban-student">{order.student?.name || 'Guest'}</span>
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
                            <div className="font-semibold text-espresso dark:text-stone-100">
                              {item.name} <span className="text-[#8D5B4C] font-extrabold">× {item.quantity}</span>
                            </div>
                            {Array.isArray(item.addons) && item.addons.length > 0 && (
                              <div className="text-[11px] text-[#9F7A60] dark:text-[#E8D8CD] pl-2 font-medium">
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
      )}

      {/* ============================================================ */}
      {/* TAB 2: IN-HOUSE MENU CMS                                      */}
      {/* ============================================================ */}
      {activeTab === 'menu_cms' && (
        <div className="cms-menu-container space-y-5">
          {/* Action Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white dark:bg-[#2B2421] p-4 rounded-2xl border border-[#E5D7D0] dark:border-[#4A3B32] shadow-warm-sm">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-taupe dark:text-stone-400" />
              <input
                type="text"
                placeholder="Search dishes by name or ingredient..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 text-espresso dark:text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#8D5B4C]/40"
              />
            </div>

            <button
              type="button"
              onClick={openAddDishModal}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#8D5B4C] hover:bg-[#784C3E] text-white font-bold text-xs sm:text-sm shadow-warm-sm hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <Plus size={16} strokeWidth={2.5} />
              <span>Add New Dish</span>
            </button>
          </div>

          {/* Category Rail Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#4A3B32] text-white shadow-sm dark:bg-[#9F7A60]'
                    : 'bg-white dark:bg-[#2B2421] text-[#6B5B52] dark:text-[#C5B4A8] border border-[#E5D7D0] dark:border-[#4A3B32] hover:border-[#8D5B4C]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Dishes Table / Card Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMenuItems.map((item) => (
              <div
                key={item._id}
                className="group relative bg-white dark:bg-[#2B2421] rounded-2xl border border-[#E5D7D0] dark:border-[#4A3B32] p-4 shadow-warm-sm hover:shadow-warm-md transition-all flex flex-col justify-between"
              >
                <div className="flex items-start gap-3.5">
                  {/* Photo Thumbnail + Quick Upload Trigger */}
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex-shrink-0">
                    {item.imageUrl ? (
                      <img
                        src={resolveAssetUrl(item.imageUrl)}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          if (e.target.dataset.triedExt !== 'true') {
                            e.target.dataset.triedExt = 'true';
                            if (e.target.src.endsWith('.png')) {
                              e.target.src = e.target.src.replace('.png', '.jpg');
                              return;
                            }
                            if (e.target.src.endsWith('.jpg')) {
                              e.target.src = e.target.src.replace('.jpg', '.png');
                              return;
                            }
                          }
                          e.target.onerror = null;
                          e.target.src = '/placeholder-food.png';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-400">
                        <ImageIcon size={22} />
                      </div>
                    )}

                    <label
                      className={`stock-img-upload-btn ${uploadingId === item._id ? 'uploading' : ''}`}
                      title="Replace Dish Photo"
                    >
                      {uploadingId === item._id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Camera size={14} />
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

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-[#9F7A60] dark:text-[#C5B4A8]">
                      {item.category}
                    </span>
                    <h4 className="text-sm font-bold text-espresso dark:text-white truncate" title={item.name}>
                      {item.name}
                    </h4>
                    <p className="text-xs font-extrabold text-[#8D5B4C] dark:text-amber-300 mt-0.5">
                      ₹{item.price}
                    </p>
                    {item.description && (
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-1 mt-1">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer Controls: In Stock Toggle + Edit + Delete */}
                <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-stone-100 dark:border-stone-800">
                  <button
                    type="button"
                    onClick={() => handleStockToggle(item._id, item.isAvailable)}
                    className={`px-3 py-1 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
                      item.isAvailable
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                    }`}
                  >
                    {item.isAvailable ? '✓ In Stock' : '✕ Sold Out'}
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => openEditDishModal(item)}
                      className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-stone-100 dark:text-stone-400 dark:hover:text-white dark:hover:bg-stone-800 transition-colors"
                      title="Edit Dish Details"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteDish(item._id, item.name)}
                      className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Delete Dish"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3: PROMO BANNERS CMS                                      */}
      {/* ============================================================ */}
      {activeTab === 'banners_cms' && (
        <div className="cms-banners-container space-y-6">
          <div className="flex items-center justify-between gap-4 bg-white dark:bg-[#2B2421] p-4 rounded-2xl border border-[#E5D7D0] dark:border-[#4A3B32] shadow-warm-sm">
            <div>
              <h3 className="text-base font-serif font-bold text-espresso dark:text-white">
                Active Customer Hero Banners
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                These banners render dynamically at the top of the student ordering catalog.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsBannerModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#8D5B4C] hover:bg-[#784C3E] text-white font-bold text-xs sm:text-sm shadow-warm-sm hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <Plus size={16} strokeWidth={2.5} />
              <span>Create New Banner</span>
            </button>
          </div>

          {/* Banners Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {banners.map((b) => (
              <div
                key={b._id}
                className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-r from-stone-900 via-espresso to-stone-900 text-white shadow-warm-md border border-stone-800 flex flex-col justify-between"
              >
                {b.imageUrl && (
                  <div className="absolute inset-0 z-0">
                    <img
                      src={resolveAssetUrl(b.imageUrl)}
                      alt={b.title}
                      className="w-full h-full object-cover opacity-25 filter blur-[1px] scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-transparent" />
                  </div>
                )}

                <div className="relative z-10">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#8D5B4C] text-white shadow-sm">
                      <Sparkles className="w-3 h-3" />
                      <span>{b.tag}</span>
                    </span>

                    <button
                      type="button"
                      onClick={() => handleToggleBannerActive(b)}
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase cursor-pointer ${
                        b.isActive ? 'bg-emerald-500 text-white' : 'bg-stone-700 text-stone-300'
                      }`}
                    >
                      {b.isActive ? <Eye size={12} /> : <EyeOff size={12} />}
                      <span>{b.isActive ? 'Live' : 'Hidden'}</span>
                    </button>
                  </div>

                  <h3 className="text-xl font-serif font-bold text-white leading-snug">
                    {b.title}
                  </h3>
                  {b.subtitle && (
                    <p className="text-stone-300 text-xs mt-1.5 leading-relaxed line-clamp-2">
                      {b.subtitle}
                    </p>
                  )}
                </div>

                <div className="relative z-10 flex items-center justify-between pt-4 mt-4 border-t border-white/10">
                  <span className="text-[11px] text-stone-400 font-mono">
                    Created: {new Date(b.createdAt || Date.now()).toLocaleDateString('en-IN')}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteBanner(b._id, b.title)}
                    className="inline-flex items-center gap-1 text-xs text-rose-300 hover:text-rose-100 hover:underline cursor-pointer"
                  >
                    <Trash2 size={13} />
                    <span>Delete Banner</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 4: DAILY SALES LEDGER & TELEMETRY                        */}
      {/* ============================================================ */}
      {activeTab === 'sales_stats' && (
        <div className="cms-sales-container space-y-6">
          <div className="flex items-center justify-between gap-4 bg-white dark:bg-[#2B2421] p-4 rounded-2xl border border-[#E5D7D0] dark:border-[#4A3B32] shadow-warm-sm">
            <div>
              <h3 className="text-base font-serif font-bold text-espresso dark:text-white">
                Today's Daily Sales & Kitchen Telemetry
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Live automated financial ledger computed directly from kitchen ticket dispatch.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchSalesStats}
              disabled={refreshingStats}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-espresso dark:text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
            >
              <RefreshCw size={14} className={refreshingStats ? 'animate-spin' : ''} />
              <span>Refresh Ledger</span>
            </button>
          </div>

          {/* Metric Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-[#2B2421] p-5 rounded-2xl border border-[#E5D7D0] dark:border-[#4A3B32] shadow-warm-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                  Today's Revenue
                </span>
                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                  <DollarSign size={16} />
                </div>
              </div>
              <h3 className="text-2xl font-serif font-bold text-espresso dark:text-white mt-3">
                ₹{salesStats?.todayRevenue?.toLocaleString('en-IN') || 0}
              </h3>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                ✓ Settled & In-Process
              </span>
            </div>

            <div className="bg-white dark:bg-[#2B2421] p-5 rounded-2xl border border-[#E5D7D0] dark:border-[#4A3B32] shadow-warm-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                  Total Orders
                </span>
                <div className="w-8 h-8 rounded-full bg-[#8D5B4C]/15 text-[#8D5B4C] flex items-center justify-center">
                  <ShoppingBag size={16} />
                </div>
              </div>
              <h3 className="text-2xl font-serif font-bold text-espresso dark:text-white mt-3">
                {salesStats?.todayOrdersCount || 0}
              </h3>
              <span className="text-[10px] text-stone-500 dark:text-stone-400">
                Placed Since 00:00 AM
              </span>
            </div>

            <div className="bg-white dark:bg-[#2B2421] p-5 rounded-2xl border border-[#E5D7D0] dark:border-[#4A3B32] shadow-warm-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                  Active Queue
                </span>
                <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center">
                  <Clock size={16} />
                </div>
              </div>
              <h3 className="text-2xl font-serif font-bold text-espresso dark:text-white mt-3">
                {salesStats?.activeTokensCount || 0}
              </h3>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">
                In Prep / Ready for Pickup
              </span>
            </div>

            <div className="bg-white dark:bg-[#2B2421] p-5 rounded-2xl border border-[#E5D7D0] dark:border-[#4A3B32] shadow-warm-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                  Collected Orders
                </span>
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 flex items-center justify-center">
                  <Check size={16} />
                </div>
              </div>
              <h3 className="text-2xl font-serif font-bold text-espresso dark:text-white mt-3">
                {salesStats?.completedOrdersCount || 0}
              </h3>
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold">
                Fulfilled by Counter Staff
              </span>
            </div>
          </div>

          {/* Top 5 Best Sellers Leaderboard */}
          <div className="bg-white dark:bg-[#2B2421] p-6 rounded-2xl border border-[#E5D7D0] dark:border-[#4A3B32] shadow-warm-sm">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-[#8D5B4C]" />
              <h3 className="text-base font-serif font-bold text-espresso dark:text-white">
                Today's Top 5 Best-Selling Dishes
              </h3>
            </div>

            {salesStats?.topSelling && salesStats.topSelling.length > 0 ? (
              <div className="space-y-3">
                {salesStats.topSelling.map((item, index) => {
                  const maxQty = salesStats.topSelling[0].qty || 1;
                  const percent = Math.min(100, Math.round((item.qty / maxQty) * 100));
                  return (
                    <div key={index} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-espresso dark:text-stone-100">
                          #{index + 1} {item.name}
                        </span>
                        <span className="font-mono font-extrabold text-[#8D5B4C] dark:text-amber-300">
                          {item.qty} units sold
                        </span>
                      </div>
                      <div className="w-full bg-stone-100 dark:bg-stone-800 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-[#8D5B4C] h-full rounded-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-stone-400">No sales recorded yet for today.</p>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: ADD / EDIT DISH                                        */}
      {/* ============================================================ */}
      {isDishModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#2B2421] rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 dark:border-stone-700 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <h3 className="text-lg font-serif font-bold text-espresso dark:text-white">
                {editingDish ? 'Edit Dish Details' : 'Add New Menu Dish'}
              </h3>
              <button
                type="button"
                onClick={() => setIsDishModalOpen(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveDish} className="space-y-4 mt-4 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Dish Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Artisanal Cappuccino"
                  value={dishFormData.name}
                  onChange={(e) =>
                    setDishFormData({ ...dishFormData, name: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-espresso dark:text-white focus:outline-none focus:ring-2 focus:ring-[#8D5B4C]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={dishFormData.category}
                    onChange={(e) =>
                      setDishFormData({ ...dishFormData, category: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-espresso dark:text-white focus:outline-none focus:ring-2 focus:ring-[#8D5B4C]"
                  >
                    {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="180"
                    value={dishFormData.price}
                    onChange={(e) =>
                      setDishFormData({ ...dishFormData, price: e.target.value })
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-espresso dark:text-white focus:outline-none focus:ring-2 focus:ring-[#8D5B4C]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Description
                </label>
                <textarea
                  rows="2"
                  placeholder="Ingredients, preparation notes, allergens..."
                  value={dishFormData.description}
                  onChange={(e) =>
                    setDishFormData({ ...dishFormData, description: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-espresso dark:text-white focus:outline-none focus:ring-2 focus:ring-[#8D5B4C]"
                />
              </div>

              {/* Dish Photo In-House Upload */}
              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Dish Photo
                </label>
                <div className="flex items-center gap-3">
                  {dishFormData.imageUrl && (
                    <img
                      src={resolveAssetUrl(dishFormData.imageUrl)}
                      alt="Preview"
                      className="w-12 h-12 rounded-xl object-cover border border-stone-200 dark:border-stone-700"
                    />
                  )}
                  <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-dashed border-stone-300 dark:border-stone-600 bg-stone-50 dark:bg-stone-800/60 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer text-xs font-semibold text-stone-600 dark:text-stone-300">
                    {dishModalUploading ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <Camera size={15} />
                    )}
                    <span>{dishModalUploading ? 'Uploading...' : 'Choose Image File'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={dishModalUploading}
                      onChange={handleDishModalFileUpload}
                    />
                  </label>
                </div>
                <input
                  type="text"
                  placeholder="Or paste image URL (/menu-items/abc.jpg or https://...)"
                  value={dishFormData.imageUrl}
                  onChange={(e) =>
                    setDishFormData({ ...dishFormData, imageUrl: e.target.value })
                  }
                  className="mt-2 w-full px-3.5 py-1.5 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-espresso dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsDishModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-full bg-[#8D5B4C] hover:bg-[#784C3E] text-white font-bold shadow-sm"
                >
                  {editingDish ? 'Save Changes' : 'Create Dish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: CREATE PROMO BANNER                                    */}
      {/* ============================================================ */}
      {isBannerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#2B2421] rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 dark:border-stone-700 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <h3 className="text-lg font-serif font-bold text-espresso dark:text-white">
                Create Hero Promo Banner
              </h3>
              <button
                type="button"
                onClick={() => setIsBannerModalOpen(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveBanner} className="space-y-4 mt-4 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Tag / Promo Pill *
                </label>
                <input
                  type="text"
                  placeholder="e.g. 🔥 ARTISANAL COMBOS or ⚡ SKIP THE QUEUE"
                  value={bannerFormData.tag}
                  onChange={(e) =>
                    setBannerFormData({ ...bannerFormData, tag: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-espresso dark:text-white focus:outline-none focus:ring-2 focus:ring-[#8D5B4C]"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Banner Headline / Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Flat 20% Off on Sourdough Toasties"
                  value={bannerFormData.title}
                  onChange={(e) =>
                    setBannerFormData({ ...bannerFormData, title: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-espresso dark:text-white focus:outline-none focus:ring-2 focus:ring-[#8D5B4C]"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Subtitle / Promo Details
                </label>
                <textarea
                  rows="2"
                  placeholder="Pair our signature Paneer Tikka Toast with Belgian Chocolate Shake."
                  value={bannerFormData.subtitle}
                  onChange={(e) =>
                    setBannerFormData({ ...bannerFormData, subtitle: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-espresso dark:text-white focus:outline-none focus:ring-2 focus:ring-[#8D5B4C]"
                />
              </div>

              {/* Banner Backdrop Photo Upload */}
              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Backdrop Graphic
                </label>
                <div className="flex items-center gap-3">
                  {bannerFormData.imageUrl && (
                    <img
                      src={resolveAssetUrl(bannerFormData.imageUrl)}
                      alt="Banner Preview"
                      className="w-16 h-10 rounded-lg object-cover border border-stone-200 dark:border-stone-700"
                    />
                  )}
                  <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-dashed border-stone-300 dark:border-stone-600 bg-stone-50 dark:bg-stone-800/60 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer text-xs font-semibold text-stone-600 dark:text-stone-300">
                    {bannerModalUploading ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <Camera size={15} />
                    )}
                    <span>{bannerModalUploading ? 'Uploading...' : 'Choose Backdrop Image'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={bannerModalUploading}
                      onChange={handleBannerModalFileUpload}
                    />
                  </label>
                </div>
                <input
                  type="text"
                  placeholder="Or paste image URL"
                  value={bannerFormData.imageUrl}
                  onChange={(e) =>
                    setBannerFormData({ ...bannerFormData, imageUrl: e.target.value })
                  }
                  className="mt-2 w-full px-3.5 py-1.5 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-espresso dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsBannerModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-full bg-[#8D5B4C] hover:bg-[#784C3E] text-white font-bold shadow-sm"
                >
                  Publish Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: OVERCROWD RUSH PAUSE                                    */}
      {/* ============================================================ */}
      {isOvercrowdModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#2B2421] rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 dark:border-stone-700 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
                  ⚠️
                </div>
                <h3 className="text-lg font-serif font-bold text-espresso dark:text-white">
                  Pause Incoming Orders (Kitchen Rush)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOvercrowdModalOpen(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-taupe dark:text-stone-300 mt-3 leading-relaxed">
              Temporarily stops customers from placing new orders while your team clears the current preparation queue. Active orders in progress will not be affected.
            </p>

            <div className="mt-4 space-y-4 text-xs sm:text-sm">
              {/* Duration selection */}
              <div>
                <label className="block font-bold text-espresso dark:text-stone-200 mb-2">
                  Select Pause Duration
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { mins: 15, label: '15 Mins', desc: 'Short Rush' },
                    { mins: 30, label: '30 Mins', desc: 'Heavy Rush' },
                    { mins: 45, label: '45 Mins', desc: 'Peak Hour' },
                    { mins: 0, label: 'Indefinite', desc: 'Manual Open' },
                  ].map((option) => (
                    <button
                      key={option.mins}
                      type="button"
                      onClick={() => setPauseDuration(option.mins)}
                      className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
                        pauseDuration === option.mins
                          ? 'bg-[#8D5B4C] border-[#8D5B4C] text-white shadow-sm scale-[1.02]'
                          : 'bg-stone-50 dark:bg-stone-800/60 border-stone-200 dark:border-stone-700 text-espresso dark:text-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      <div className="font-bold text-xs">{option.label}</div>
                      <div className={`text-[10px] ${pauseDuration === option.mins ? 'text-stone-200' : 'text-stone-400'}`}>
                        {option.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Reason / Customer Notice */}
              <div>
                <label className="block font-bold text-espresso dark:text-stone-200 mb-1">
                  Customer Announcement Message
                </label>
                <input
                  type="text"
                  placeholder="e.g. Kitchen is experiencing high demand. Resuming soon!"
                  value={pauseReason}
                  onChange={(e) => setPauseReason(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-espresso dark:text-white focus:outline-none focus:ring-2 focus:ring-[#8D5B4C]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsOvercrowdModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handlePauseOrders}
                  disabled={togglingStoreStatus}
                  className="px-6 py-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  {togglingStoreStatus ? 'Pausing Orders...' : '🛑 Confirm & Pause Orders'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KitchenDashboard;

