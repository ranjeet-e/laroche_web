import { useState, useEffect, useMemo } from 'react';
import {
  UtensilsCrossed,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Image as ImageIcon,
  Sparkles,
  Layers,
  Upload,
  RefreshCw,
  SlidersHorizontal,
  DollarSign,
  AlertTriangle,
  X,
  Check,
  Megaphone,
  Clock,
  Settings,
  ChevronRight,
  Eye,
  EyeOff,
  ShoppingBag
} from 'lucide-react';
import {
  getStats,
  getMenuItems,
  createMenuItem,
  updateMenuItem,
  toggleMenuItemAvailability,
  deleteMenuItem,
  getBanners,
  createBanner,
  updateBanner,
  toggleBanner,
  deleteBanner,
  getSettings,
  updateSetting,
  uploadImage,
} from '../../services/cmsService';
import { useAuth } from '../../context/AuthContext';
import './CmsDashboard.css';

const DEFAULT_CATEGORIES = [
  'Sandwiches',
  'Flatbread Pizza',
  'Quick Bites & Café Snacks',
  'Chat Counter',
  'Maggie',
  'Pasta',
  'Mocktails & Coolers',
  'Waffles',
  'Hot Beverages',
  'Cold Beverages',
  'Add-ons',
];

const CmsDashboard = () => {
  const { user } = useAuth();

  // Active Tab: 'menu' | 'banners' | 'settings'
  const [activeTab, setActiveTab] = useState('menu');

  // Stats
  const [stats, setStats] = useState({
    totalItems: 0,
    availableItems: 0,
    outOfStockItems: 0,
    totalCategories: 0,
    categories: [],
    totalOrders: 0,
  });

  // Menu items state
  const [menuItems, setMenuItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // null for new, item object for edit
  const [itemFormData, setItemFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Sandwiches',
    customCategory: '',
    variants: [],
    imageUrl: '',
    isAvailable: true,
  });

  const [deleteConfirmItem, setDeleteConfirmItem] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Banners state
  const [banners, setBanners] = useState([]);
  const [loadingBanners, setLoadingBanners] = useState(false);
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [bannerFormData, setBannerFormData] = useState({
    title: '',
    subtitle: '',
    tag: '🔥 SPECIAL OFFER',
    imageUrl: '',
    badgeColor: 'bg-terracotta text-white',
    bg: 'bg-gradient-to-r from-espresso via-espresso-light to-stone-900',
    order: 0,
    isActive: true,
  });

  // Settings state
  const [cafeSettings, setCafeSettings] = useState({
    announcement: '',
    openTime: '08:30',
    closeTime: '21:00',
    scheduleNotice: '',
  });
  const [loadingSettings, setLoadingSettings] = useState(false);

  const showToast = (message, type = 'success') => {
    setToastMessage({ text: message, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Load stats and menu items
  const loadData = async () => {
    try {
      setLoadingItems(true);
      const [statsData, itemsData] = await Promise.all([
        getStats().catch(() => null),
        getMenuItems(),
      ]);

      if (statsData) {
        setStats(statsData);
      }
      setMenuItems(itemsData || []);
    } catch (err) {
      showToast('Failed to load menu data', 'error');
    } finally {
      setLoadingItems(false);
    }
  };

  // Load banners
  const loadBanners = async () => {
    try {
      setLoadingBanners(true);
      const bannersData = await getBanners();
      setBanners(bannersData || []);
    } catch (err) {
      showToast('Failed to load banners', 'error');
    } finally {
      setLoadingBanners(false);
    }
  };

  // Load settings
  const loadSettingsData = async () => {
    try {
      setLoadingSettings(true);
      const settingsData = await getSettings();
      if (settingsData) {
        setCafeSettings((prev) => ({
          ...prev,
          ...settingsData,
        }));
      }
    } catch (err) {
      showToast('Failed to load settings', 'error');
    } finally {
      setLoadingSettings(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (activeTab === 'banners') {
      loadBanners();
    } else if (activeTab === 'settings') {
      loadSettingsData();
    }
  }, [activeTab]);

  // Combined category list
  const allCategories = useMemo(() => {
    const set = new Set([...DEFAULT_CATEGORIES, ...(stats.categories || [])]);
    return Array.from(set);
  }, [stats.categories]);

  // Filtered menu items
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      // Category filter
      if (selectedCategory !== 'All' && item.category !== selectedCategory) {
        return false;
      }
      // Availability filter
      if (availabilityFilter === 'available' && !item.isAvailable) return false;
      if (availabilityFilter === 'out_of_stock' && item.isAvailable) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = item.name?.toLowerCase().includes(q);
        const matchDesc = item.description?.toLowerCase().includes(q);
        const matchCat = item.category?.toLowerCase().includes(q);
        return matchName || matchDesc || matchCat;
      }

      return true;
    });
  }, [menuItems, selectedCategory, availabilityFilter, searchQuery]);

  // Open Create Item Modal
  const handleOpenCreateModal = () => {
    setEditingItem(null);
    setItemFormData({
      name: '',
      description: '',
      price: '',
      category: selectedCategory !== 'All' ? selectedCategory : 'Sandwiches',
      customCategory: '',
      variants: [],
      imageUrl: '',
      isAvailable: true,
    });
    setShowItemModal(true);
  };

  // Open Edit Item Modal
  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    const isCustomCat = !DEFAULT_CATEGORIES.includes(item.category);
    setItemFormData({
      name: item.name || '',
      description: item.description || '',
      price: item.price || '',
      category: isCustomCat ? '__custom__' : item.category,
      customCategory: isCustomCat ? item.category : '',
      variants: item.variants ? [...item.variants] : [],
      imageUrl: item.imageUrl || '',
      isAvailable: item.isAvailable !== undefined ? item.isAvailable : true,
    });
    setShowItemModal(true);
  };

  // Add a variant row in modal
  const handleAddVariant = () => {
    setItemFormData((prev) => ({
      ...prev,
      variants: [...prev.variants, { label: '', price: prev.price || '' }],
    }));
  };

  // Update a variant
  const handleUpdateVariant = (index, field, value) => {
    setItemFormData((prev) => {
      const updated = [...prev.variants];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, variants: updated };
    });
  };

  // Remove a variant
  const handleRemoveVariant = (index) => {
    setItemFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  };

  // Handle image upload via Cloudinary
  const handleImageUpload = async (e, target = 'item') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file', 'error');
      return;
    }

    try {
      setUploadingImage(true);
      const folder = target === 'item' ? 'laroche_cafe/menu_items' : 'laroche_cafe/banners';
      const result = await uploadImage(file, folder);

      if (target === 'item') {
        setItemFormData((prev) => ({ ...prev, imageUrl: result.url }));
      } else {
        setBannerFormData((prev) => ({ ...prev, imageUrl: result.url }));
      }
      showToast('Image uploaded successfully!');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to upload image', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  // Save Item (Create or Update)
  const handleSaveItem = async (e) => {
    e.preventDefault();
    if (!itemFormData.name.trim()) {
      showToast('Item name is required', 'error');
      return;
    }

    const finalCategory =
      itemFormData.category === '__custom__'
        ? itemFormData.customCategory.trim()
        : itemFormData.category;

    if (!finalCategory) {
      showToast('Please specify a category', 'error');
      return;
    }

    const basePrice = Number(itemFormData.price);
    if (isNaN(basePrice) || basePrice < 0) {
      showToast('Please enter a valid price', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: itemFormData.name.trim(),
        description: itemFormData.description.trim(),
        price: basePrice,
        category: finalCategory,
        variants: itemFormData.variants
          .filter((v) => v.label && v.label.trim())
          .map((v) => ({
            label: v.label.trim(),
            price: Number(v.price) >= 0 ? Number(v.price) : basePrice,
          })),
        imageUrl: itemFormData.imageUrl.trim(),
        isAvailable: itemFormData.isAvailable,
      };

      if (editingItem) {
        const updated = await updateMenuItem(editingItem._id, payload);
        setMenuItems((prev) => prev.map((item) => (item._id === updated._id ? updated : item)));
        showToast(`"${updated.name}" updated successfully!`);
      } else {
        const created = await createMenuItem(payload);
        setMenuItems((prev) => [created, ...prev]);
        showToast(`"${created.name}" created successfully!`);
      }

      setShowItemModal(false);
      // Refresh stats
      getStats().then(setStats).catch(() => {});
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save menu item', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick toggle stock availability
  const handleToggleStock = async (item) => {
    // Optimistic UI update
    const previousState = item.isAvailable;
    setMenuItems((prev) =>
      prev.map((i) => (i._id === item._id ? { ...i, isAvailable: !previousState } : i))
    );

    try {
      const result = await toggleMenuItemAvailability(item._id);
      showToast(`${item.name} is now ${result.item?.isAvailable ? 'In Stock' : 'Out of Stock'}`);
      getStats().then(setStats).catch(() => {});
    } catch (err) {
      // Revert on error
      setMenuItems((prev) =>
        prev.map((i) => (i._id === item._id ? { ...i, isAvailable: previousState } : i))
      );
      showToast('Failed to toggle stock status', 'error');
    }
  };

  // Confirm delete item
  const handleDeleteItem = async () => {
    if (!deleteConfirmItem) return;

    setIsSubmitting(true);
    try {
      await deleteMenuItem(deleteConfirmItem._id);
      setMenuItems((prev) => prev.filter((i) => i._id !== deleteConfirmItem._id));
      showToast(`"${deleteConfirmItem.name}" deleted`);
      setDeleteConfirmItem(null);
      getStats().then(setStats).catch(() => {});
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete item', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==========================================
  // BANNERS HANDLERS
  // ==========================================
  const handleOpenCreateBanner = () => {
    setEditingBanner(null);
    setBannerFormData({
      title: '',
      subtitle: '',
      tag: '🔥 SPECIAL OFFER',
      imageUrl: '',
      badgeColor: 'bg-terracotta text-white',
      bg: 'bg-gradient-to-r from-espresso via-espresso-light to-stone-900',
      order: banners.length,
      isActive: true,
    });
    setShowBannerModal(true);
  };

  const handleOpenEditBanner = (b) => {
    setEditingBanner(b);
    setBannerFormData({
      title: b.title || '',
      subtitle: b.subtitle || '',
      tag: b.tag || '🔥 SPECIAL OFFER',
      imageUrl: b.imageUrl || '',
      badgeColor: b.badgeColor || 'bg-terracotta text-white',
      bg: b.bg || 'bg-gradient-to-r from-espresso via-espresso-light to-stone-900',
      order: b.order || 0,
      isActive: b.isActive !== undefined ? b.isActive : true,
    });
    setShowBannerModal(true);
  };

  const handleSaveBanner = async (e) => {
    e.preventDefault();
    if (!bannerFormData.title.trim()) {
      showToast('Banner title is required', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingBanner) {
        const updated = await updateBanner(editingBanner._id, bannerFormData);
        setBanners((prev) => prev.map((b) => (b._id === updated._id ? updated : b)));
        showToast('Banner updated successfully!');
      } else {
        const created = await createBanner(bannerFormData);
        setBanners((prev) => [created, ...prev]);
        showToast('Banner created successfully!');
      }
      setShowBannerModal(false);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save banner', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleBanner = async (banner) => {
    try {
      const updated = await toggleBanner(banner._id);
      setBanners((prev) => prev.map((b) => (b._id === updated._id ? updated : b)));
      showToast(`Banner ${updated.isActive ? 'activated' : 'deactivated'}`);
    } catch (err) {
      showToast('Failed to toggle banner', 'error');
    }
  };

  const handleDeleteBanner = async (id) => {
    if (!window.confirm('Are you sure you want to delete this promo banner?')) return;
    try {
      await deleteBanner(id);
      setBanners((prev) => prev.filter((b) => b._id !== id));
      showToast('Banner deleted');
    } catch (err) {
      showToast('Failed to delete banner', 'error');
    }
  };

  // Save Cafe Settings
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await Promise.all([
        updateSetting('announcement', cafeSettings.announcement),
        updateSetting('openTime', cafeSettings.openTime),
        updateSetting('closeTime', cafeSettings.closeTime),
        updateSetting('scheduleNotice', cafeSettings.scheduleNotice),
      ]);
      showToast('Cafe settings updated successfully!');
    } catch (err) {
      showToast('Failed to save settings', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] dark:bg-[#1A100C] text-[#3D1417] dark:text-[#FAF0E6] pb-24 transition-colors duration-300">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`fixed top-20 right-6 z-50 px-5 py-3 rounded-2xl shadow-warm-xl flex items-center gap-3 text-sm font-bold animate-bounce border ${
            toastMessage.type === 'error'
              ? 'bg-red-600 text-white border-red-700'
              : 'bg-espresso text-white border-honey/30'
          }`}
        >
          {toastMessage.type === 'error' ? <AlertTriangle className="w-5 h-5 text-amber-300" /> : <CheckCircle2 className="w-5 h-5 text-honey" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Top Header */}
      <header className="bg-white/90 dark:bg-[#27140E]/90 backdrop-blur-md border-b border-stone-200 dark:border-[#422217] sticky top-[72px] z-30 px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-espresso to-stone-800 text-honey-light flex items-center justify-center shadow-warm-sm border border-honey/20">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-serif font-bold text-espresso dark:text-stone-100 tracking-tight">
                  La Roche CMS Portal
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-[10px] font-extrabold uppercase tracking-wide">
                  Live Management
                </span>
              </div>
              <p className="text-xs text-taupe dark:text-stone-400">
                Logged in as <strong>{user?.name || user?.email || 'CMS Administrator'}</strong>
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => setActiveTab('menu')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'menu'
                  ? 'bg-espresso text-white shadow-warm-md'
                  : 'bg-stone-100 dark:bg-[#381B13] text-taupe dark:text-stone-300 hover:bg-stone-200'
              }`}
            >
              <UtensilsCrossed className="w-4 h-4" />
              <span>Menu Items</span>
              <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[11px]">
                {stats.totalItems || menuItems.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('banners')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'banners'
                  ? 'bg-espresso text-white shadow-warm-md'
                  : 'bg-stone-100 dark:bg-[#381B13] text-taupe dark:text-stone-300 hover:bg-stone-200'
              }`}
            >
              <Megaphone className="w-4 h-4" />
              <span>Promo Banners</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'settings'
                  ? 'bg-espresso text-white shadow-warm-md'
                  : 'bg-stone-100 dark:bg-[#381B13] text-taupe dark:text-stone-300 hover:bg-stone-200'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Cafe Schedule</span>
            </button>

            <button
              type="button"
              onClick={loadData}
              className="p-2 rounded-full bg-stone-100 dark:bg-[#381B13] text-taupe dark:text-stone-300 hover:text-espresso transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        
        {/* KPI Overview Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="bg-white dark:bg-[#27140E] p-4 rounded-3xl border border-stone-200/80 dark:border-[#422217] shadow-warm-sm">
            <div className="text-xs font-bold text-taupe dark:text-stone-400">Total Items</div>
            <div className="text-2xl font-black text-espresso dark:text-stone-100 mt-1">
              {stats.totalItems || menuItems.length}
            </div>
          </div>

          <div className="bg-white dark:bg-[#27140E] p-4 rounded-3xl border border-stone-200/80 dark:border-[#422217] shadow-warm-sm">
            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>In Stock</span>
            </div>
            <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-1">
              {stats.availableItems}
            </div>
          </div>

          <div className="bg-white dark:bg-[#27140E] p-4 rounded-3xl border border-stone-200/80 dark:border-[#422217] shadow-warm-sm">
            <div className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <XCircle className="w-3.5 h-3.5" />
              <span>Out of Stock</span>
            </div>
            <div className="text-2xl font-black text-amber-700 dark:text-amber-300 mt-1">
              {stats.outOfStockItems}
            </div>
          </div>

          <div className="bg-white dark:bg-[#27140E] p-4 rounded-3xl border border-stone-200/80 dark:border-[#422217] shadow-warm-sm">
            <div className="text-xs font-bold text-taupe dark:text-stone-400">Categories</div>
            <div className="text-2xl font-black text-espresso dark:text-stone-100 mt-1">
              {stats.totalCategories || allCategories.length}
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* TAB 1: MENU ITEMS MANAGER                                 */}
        {/* ========================================================= */}
        {activeTab === 'menu' && (
          <div>
            {/* Filter & Action Bar */}
            <div className="bg-white dark:bg-[#27140E] rounded-3xl border border-stone-200/80 dark:border-[#422217] p-4 sm:p-5 shadow-warm-sm mb-6 space-y-4">
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-taupe absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    className="w-full h-10 pl-10 pr-4 rounded-full border border-stone-200 dark:border-[#422217] bg-stone-50 dark:bg-[#1E0F0A] text-xs sm:text-sm font-medium focus:outline-none focus:border-terracotta transition-all"
                    placeholder="Search menu items..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-taupe hover:text-espresso"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2.5">
                  {/* Availability Dropdown */}
                  <select
                    className="h-10 px-3.5 rounded-full border border-stone-200 dark:border-[#422217] bg-stone-50 dark:bg-[#1E0F0A] text-xs font-bold focus:outline-none focus:border-terracotta"
                    value={availabilityFilter}
                    onChange={(e) => setAvailabilityFilter(e.target.value)}
                  >
                    <option value="all">All Availability</option>
                    <option value="available">In Stock Only</option>
                    <option value="out_of_stock">Out of Stock Only</option>
                  </select>

                  {/* Add New Item Button */}
                  <button
                    type="button"
                    onClick={handleOpenCreateModal}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-terracotta hover:bg-terracotta-hover text-white text-xs sm:text-sm font-bold shadow-glow-terracotta transition-all flex-shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Item</span>
                  </button>
                </div>
              </div>

              {/* Category Pills Slider */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar">
                <button
                  type="button"
                  onClick={() => setSelectedCategory('All')}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex-shrink-0 ${
                    selectedCategory === 'All'
                      ? 'bg-espresso text-white'
                      : 'bg-stone-100 dark:bg-[#381B13] text-taupe dark:text-stone-300 hover:bg-stone-200'
                  }`}
                >
                  All Categories ({menuItems.length})
                </button>
                {allCategories.map((cat) => {
                  const count = menuItems.filter((i) => i.category === cat).length;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex-shrink-0 ${
                        selectedCategory === cat
                          ? 'bg-espresso text-white'
                          : 'bg-stone-100 dark:bg-[#381B13] text-taupe dark:text-stone-300 hover:bg-stone-200'
                      }`}
                    >
                      {cat} ({count})
                    </button>
                  );
                })}
              </div>

            </div>

            {/* Menu Items Table / Grid */}
            {loadingItems ? (
              <div className="py-16 text-center text-taupe dark:text-stone-400">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-terracotta" />
                <p className="text-sm font-bold">Loading Menu Items...</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="bg-white dark:bg-[#27140E] rounded-3xl border border-stone-200/80 dark:border-[#422217] p-12 text-center shadow-warm-sm">
                <UtensilsCrossed className="w-12 h-12 text-taupe/40 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-espresso dark:text-stone-200">No items found</h3>
                <p className="text-xs text-taupe dark:text-stone-400 mt-1 max-w-sm mx-auto">
                  Try adjusting your search query or category filter, or add a new menu item.
                </p>
                <button
                  type="button"
                  onClick={handleOpenCreateModal}
                  className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-terracotta text-white text-xs font-bold"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add First Item</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredItems.map((item) => (
                  <div
                    key={item._id}
                    className={`bg-white dark:bg-[#27140E] rounded-3xl border ${
                      item.isAvailable
                        ? 'border-stone-200/80 dark:border-[#422217]'
                        : 'border-amber-300/60 dark:border-amber-900/60 bg-amber-50/20 dark:bg-amber-950/10'
                    } shadow-warm-sm p-4 flex flex-col justify-between transition-all hover:shadow-warm-md relative group`}
                  >
                    <div>
                      {/* Top row: Category Badge & Stock Switch */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="px-2.5 py-0.5 rounded-full bg-stone-100 dark:bg-[#381B13] text-[10px] font-extrabold text-taupe dark:text-stone-300">
                          {item.category}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleToggleStock(item)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold transition-all ${
                            item.isAvailable
                              ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200'
                              : 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 hover:bg-amber-200'
                          }`}
                          title="Click to toggle availability"
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              item.isAvailable ? 'bg-emerald-500' : 'bg-amber-500'
                            }`}
                          />
                          <span>{item.isAvailable ? 'In Stock' : 'Out of Stock'}</span>
                        </button>
                      </div>

                      {/* Item Content: Image + Name & Description */}
                      <div className="flex items-start gap-3">
                        <div className="w-16 h-16 rounded-2xl bg-stone-100 dark:bg-[#1E0F0A] overflow-hidden flex-shrink-0 border border-stone-200/60 dark:border-[#422217] flex items-center justify-center">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          ) : (
                            <UtensilsCrossed className="w-6 h-6 text-taupe/40" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="font-serif font-bold text-base text-espresso dark:text-stone-100 truncate">
                            {item.name}
                          </h4>
                          <p className="text-xs text-taupe dark:text-stone-400 line-clamp-2 mt-0.5">
                            {item.description || 'No description provided.'}
                          </p>
                          <div className="text-sm font-black text-terracotta dark:text-amber-400 mt-1">
                            ₹{item.price}
                          </div>
                        </div>
                      </div>

                      {/* Variants list if any */}
                      {item.variants && item.variants.length > 0 && (
                        <div className="mt-3 pt-2.5 border-t border-stone-100 dark:border-[#381B13] flex flex-wrap gap-1.5">
                          {item.variants.map((v, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-lg bg-stone-50 dark:bg-[#1E0F0A] border border-stone-200/60 dark:border-[#422217] text-[10px] text-taupe dark:text-stone-300"
                            >
                              {v.label}: <strong>₹{v.price}</strong>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Bottom Action Buttons */}
                    <div className="mt-4 pt-3 border-t border-stone-100 dark:border-[#381B13] flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleStock(item)}
                        className="text-xs font-bold text-taupe dark:text-stone-400 hover:text-espresso inline-flex items-center gap-1"
                      >
                        {item.isAvailable ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        <span>{item.isAvailable ? 'Mark Out of Stock' : 'Mark In Stock'}</span>
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(item)}
                          className="p-2 rounded-xl bg-stone-100 dark:bg-[#381B13] text-taupe dark:text-stone-300 hover:text-espresso hover:bg-stone-200 transition-colors"
                          title="Edit Item"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmItem(item)}
                          className="p-2 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 transition-colors"
                          title="Delete Item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: PROMO BANNERS MANAGER                              */}
        {/* ========================================================= */}
        {activeTab === 'banners' && (
          <div>
            <div className="bg-white dark:bg-[#27140E] rounded-3xl border border-stone-200/80 dark:border-[#422217] p-5 shadow-warm-sm mb-6 flex items-center justify-between gap-4">
              <div>
                <h3 className="font-serif font-bold text-lg text-espresso dark:text-stone-100">
                  Customer Promo Banners
                </h3>
                <p className="text-xs text-taupe dark:text-stone-400 mt-0.5">
                  These banners are displayed in the rotating carousel on the customer menu screen.
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenCreateBanner}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-terracotta hover:bg-terracotta-hover text-white text-xs sm:text-sm font-bold shadow-glow-terracotta transition-all flex-shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Create Banner</span>
              </button>
            </div>

            {loadingBanners ? (
              <div className="py-16 text-center text-taupe">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-terracotta" />
                <p className="text-sm font-bold">Loading Banners...</p>
              </div>
            ) : banners.length === 0 ? (
              <div className="bg-white dark:bg-[#27140E] rounded-3xl border border-stone-200/80 dark:border-[#422217] p-12 text-center shadow-warm-sm">
                <Megaphone className="w-12 h-12 text-taupe/40 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-espresso dark:text-stone-200">No promo banners configured</h3>
                <p className="text-xs text-taupe dark:text-stone-400 mt-1 max-w-sm mx-auto">
                  Default fallbacks are currently displayed to users. Create a banner to customize promotions.
                </p>
                <button
                  type="button"
                  onClick={handleOpenCreateBanner}
                  className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-terracotta text-white text-xs font-bold"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create First Banner</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {banners.map((b) => (
                  <div
                    key={b._id}
                    className="bg-white dark:bg-[#27140E] rounded-3xl border border-stone-200/80 dark:border-[#422217] shadow-warm-sm p-5 relative overflow-hidden"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <span className="px-2.5 py-0.5 rounded-full bg-terracotta text-white text-[10px] font-extrabold uppercase">
                        {b.tag || '🔥 PROMO'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggleBanner(b)}
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                          b.isActive
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-stone-400'
                        }`}
                      >
                        {b.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </div>

                    <div className="flex items-start gap-4">
                      {b.imageUrl && (
                        <img
                          src={b.imageUrl}
                          alt={b.title}
                          className="w-20 h-20 rounded-2xl object-cover border border-stone-200 flex-shrink-0"
                        />
                      )}
                      <div>
                        <h4 className="font-serif font-bold text-lg text-espresso dark:text-stone-100">
                          {b.title}
                        </h4>
                        <p className="text-xs text-taupe dark:text-stone-400 mt-1">
                          {b.subtitle || 'No subtitle'}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-stone-100 dark:border-[#381B13] flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEditBanner(b)}
                        className="p-2 rounded-xl bg-stone-100 dark:bg-[#381B13] text-taupe hover:text-espresso"
                        title="Edit Banner"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteBanner(b._id)}
                        className="p-2 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 hover:bg-red-100"
                        title="Delete Banner"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: CAFE SETTINGS & SCHEDULE                           */}
        {/* ========================================================= */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl bg-white dark:bg-[#27140E] rounded-3xl border border-stone-200/80 dark:border-[#422217] p-6 sm:p-8 shadow-warm-sm">
            <h3 className="font-serif font-bold text-xl text-espresso dark:text-stone-100 mb-2">
              Cafe Operating Hours & Announcements
            </h3>
            <p className="text-xs sm:text-sm text-taupe dark:text-stone-400 mb-6">
              Configure cafe operating timings and live announcements shown on top of the menu screen.
            </p>

            <form onSubmit={handleSaveSettings} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-taupe dark:text-stone-300 mb-1.5">
                    Cafe Opening Time
                  </label>
                  <input
                    type="time"
                    className="w-full h-11 px-4 rounded-2xl border border-stone-200 dark:border-[#422217] bg-stone-50 dark:bg-[#1E0F0A] text-sm font-bold focus:outline-none focus:border-terracotta"
                    value={cafeSettings.openTime}
                    onChange={(e) =>
                      setCafeSettings({ ...cafeSettings, openTime: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-taupe dark:text-stone-300 mb-1.5">
                    Cafe Closing Time
                  </label>
                  <input
                    type="time"
                    className="w-full h-11 px-4 rounded-2xl border border-stone-200 dark:border-[#422217] bg-stone-50 dark:bg-[#1E0F0A] text-sm font-bold focus:outline-none focus:border-terracotta"
                    value={cafeSettings.closeTime}
                    onChange={(e) =>
                      setCafeSettings({ ...cafeSettings, closeTime: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-taupe dark:text-stone-300 mb-1.5">
                  Live Cafe Announcement Banner (Optional)
                </label>
                <textarea
                  rows={3}
                  className="w-full p-3.5 rounded-2xl border border-stone-200 dark:border-[#422217] bg-stone-50 dark:bg-[#1E0F0A] text-xs sm:text-sm font-medium focus:outline-none focus:border-terracotta resize-none"
                  placeholder="e.g. Special Holiday Notice: We will close early at 6:00 PM today for maintenance."
                  value={cafeSettings.announcement}
                  onChange={(e) =>
                    setCafeSettings({ ...cafeSettings, announcement: e.target.value })
                  }
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="py-3 px-8 rounded-full bg-espresso hover:bg-espresso-light text-white font-bold text-sm shadow-warm-md transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Saving Settings...' : 'Save Settings'}
              </button>
            </form>
          </div>
        )}

      </main>

      {/* ========================================================= */}
      {/* MODAL: ADD / EDIT MENU ITEM                               */}
      {/* ========================================================= */}
      {showItemModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm transition-all overflow-y-auto"
          onClick={() => setShowItemModal(false)}
        >
          <div
            className="bg-white dark:bg-[#27140E] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-warm-xl border border-stone-200/80 dark:border-[#422217] my-8 animate-scaleUp max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-100 dark:border-[#381B13]">
              <h3 className="text-xl font-serif font-bold text-espresso dark:text-stone-100">
                {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
              </h3>
              <button
                type="button"
                onClick={() => setShowItemModal(false)}
                className="p-1.5 rounded-full text-taupe hover:text-espresso"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4">
              
              {/* Item Name */}
              <div>
                <label className="block text-xs font-bold text-taupe dark:text-stone-300 mb-1">
                  Item Name *
                </label>
                <input
                  type="text"
                  required
                  className="w-full h-11 px-4 rounded-2xl border border-stone-200 dark:border-[#422217] bg-stone-50 dark:bg-[#1E0F0A] text-xs sm:text-sm font-medium focus:outline-none focus:border-terracotta"
                  placeholder="e.g. Sourdough Paneer Tikka Toast"
                  value={itemFormData.name}
                  onChange={(e) => setItemFormData({ ...itemFormData, name: e.target.value })}
                />
              </div>

              {/* Category & Custom Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-taupe dark:text-stone-300 mb-1">
                    Category *
                  </label>
                  <select
                    className="w-full h-11 px-3.5 rounded-2xl border border-stone-200 dark:border-[#422217] bg-stone-50 dark:bg-[#1E0F0A] text-xs font-bold focus:outline-none focus:border-terracotta"
                    value={itemFormData.category}
                    onChange={(e) =>
                      setItemFormData({ ...itemFormData, category: e.target.value })
                    }
                  >
                    {allCategories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                    <option value="__custom__">+ Add Custom Category</option>
                  </select>
                </div>

                {itemFormData.category === '__custom__' && (
                  <div>
                    <label className="block text-xs font-bold text-taupe dark:text-stone-300 mb-1">
                      New Category Name *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full h-11 px-4 rounded-2xl border border-stone-200 dark:border-[#422217] bg-stone-50 dark:bg-[#1E0F0A] text-xs sm:text-sm font-medium focus:outline-none focus:border-terracotta"
                      placeholder="e.g. Desserts"
                      value={itemFormData.customCategory}
                      onChange={(e) =>
                        setItemFormData({ ...itemFormData, customCategory: e.target.value })
                      }
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-taupe dark:text-stone-300 mb-1">
                    Base Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="1"
                    className="w-full h-11 px-4 rounded-2xl border border-stone-200 dark:border-[#422217] bg-stone-50 dark:bg-[#1E0F0A] text-xs sm:text-sm font-bold focus:outline-none focus:border-terracotta"
                    placeholder="e.g. 120"
                    value={itemFormData.price}
                    onChange={(e) =>
                      setItemFormData({ ...itemFormData, price: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-taupe dark:text-stone-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  className="w-full p-3.5 rounded-2xl border border-stone-200 dark:border-[#422217] bg-stone-50 dark:bg-[#1E0F0A] text-xs font-medium focus:outline-none focus:border-terracotta resize-none"
                  placeholder="Describe ingredients, preparation, allergens..."
                  value={itemFormData.description}
                  onChange={(e) =>
                    setItemFormData({ ...itemFormData, description: e.target.value })
                  }
                />
              </div>

              {/* Image Upload & URL */}
              <div>
                <label className="block text-xs font-bold text-taupe dark:text-stone-300 mb-1">
                  Item Image (Upload or URL)
                </label>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    className="flex-1 h-10 px-3.5 rounded-2xl border border-stone-200 dark:border-[#422217] bg-stone-50 dark:bg-[#1E0F0A] text-xs font-medium focus:outline-none focus:border-terracotta"
                    placeholder="https://... or upload below"
                    value={itemFormData.imageUrl}
                    onChange={(e) =>
                      setItemFormData({ ...itemFormData, imageUrl: e.target.value })
                    }
                  />
                  <label className="cursor-pointer h-10 px-4 rounded-2xl bg-stone-100 dark:bg-[#381B13] text-espresso dark:text-stone-200 hover:bg-stone-200 text-xs font-bold inline-flex items-center gap-1.5 transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingImage ? 'Uploading...' : 'Upload'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e, 'item')}
                      disabled={uploadingImage}
                    />
                  </label>
                </div>
                {itemFormData.imageUrl && (
                  <div className="w-20 h-20 rounded-2xl overflow-hidden border border-stone-200 mt-2">
                    <img
                      src={itemFormData.imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Variants Builder */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-taupe dark:text-stone-300">
                    Variants (Optional, e.g. Plain / Toast / Grill)
                  </label>
                  <button
                    type="button"
                    onClick={handleAddVariant}
                    className="text-xs font-bold text-terracotta hover:underline"
                  >
                    + Add Variant
                  </button>
                </div>
                {itemFormData.variants.map((v, idx) => (
                  <div key={idx} className="flex items-center gap-2 mb-2">
                    <input
                      type="text"
                      className="flex-1 h-9 px-3 rounded-xl border border-stone-200 dark:border-[#422217] bg-stone-50 dark:bg-[#1E0F0A] text-xs font-medium"
                      placeholder="Variant (e.g. Grill)"
                      value={v.label}
                      onChange={(e) => handleUpdateVariant(idx, 'label', e.target.value)}
                    />
                    <input
                      type="number"
                      min="0"
                      className="w-24 h-9 px-3 rounded-xl border border-stone-200 dark:border-[#422217] bg-stone-50 dark:bg-[#1E0F0A] text-xs font-bold"
                      placeholder="Price (₹)"
                      value={v.price}
                      onChange={(e) => handleUpdateVariant(idx, 'price', e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveVariant(idx)}
                      className="p-1.5 text-taupe hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* In-Stock Toggle */}
              <div className="flex items-center justify-between py-2 border-t border-stone-100 dark:border-[#381B13]">
                <span className="text-xs font-bold text-taupe dark:text-stone-300">
                  Initial Availability
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={itemFormData.isAvailable}
                    onChange={(e) =>
                      setItemFormData({ ...itemFormData, isAvailable: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center gap-3 pt-3 border-t border-stone-100 dark:border-[#381B13]">
                <button
                  type="button"
                  onClick={() => setShowItemModal(false)}
                  className="flex-1 py-3 rounded-full border border-stone-200 dark:border-[#422217] text-taupe font-bold text-xs hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 rounded-full bg-terracotta hover:bg-terracotta-hover text-white font-bold text-xs shadow-glow-terracotta transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving Item...' : editingItem ? 'Update Item' : 'Create Item'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: CREATE / EDIT PROMO BANNER                         */}
      {/* ========================================================= */}
      {showBannerModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm transition-all"
          onClick={() => setShowBannerModal(false)}
        >
          <div
            className="bg-white dark:bg-[#27140E] rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-warm-xl border border-stone-200/80 dark:border-[#422217] animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-100 dark:border-[#381B13]">
              <h3 className="text-xl font-serif font-bold text-espresso dark:text-stone-100">
                {editingBanner ? 'Edit Promo Banner' : 'Create Promo Banner'}
              </h3>
              <button
                type="button"
                onClick={() => setShowBannerModal(false)}
                className="p-1.5 rounded-full text-taupe hover:text-espresso"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBanner} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-taupe dark:text-stone-300 mb-1">
                  Tag / Badge *
                </label>
                <input
                  type="text"
                  required
                  className="w-full h-11 px-4 rounded-2xl border border-stone-200 dark:border-[#422217] bg-stone-50 dark:bg-[#1E0F0A] text-xs font-medium"
                  placeholder="e.g. 🔥 CHEF'S SPECIAL"
                  value={bannerFormData.tag}
                  onChange={(e) => setBannerFormData({ ...bannerFormData, tag: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-taupe dark:text-stone-300 mb-1">
                  Banner Title *
                </label>
                <input
                  type="text"
                  required
                  className="w-full h-11 px-4 rounded-2xl border border-stone-200 dark:border-[#422217] bg-stone-50 dark:bg-[#1E0F0A] text-xs font-bold"
                  placeholder="e.g. Flat 20% Off on Gourmet Toasties"
                  value={bannerFormData.title}
                  onChange={(e) =>
                    setBannerFormData({ ...bannerFormData, title: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-taupe dark:text-stone-300 mb-1">
                  Subtitle
                </label>
                <textarea
                  rows={2}
                  className="w-full p-3 rounded-2xl border border-stone-200 dark:border-[#422217] bg-stone-50 dark:bg-[#1E0F0A] text-xs font-medium resize-none"
                  placeholder="e.g. Handcrafted fresh with artisan sourdough."
                  value={bannerFormData.subtitle}
                  onChange={(e) =>
                    setBannerFormData({ ...bannerFormData, subtitle: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-taupe dark:text-stone-300 mb-1">
                  Banner Image URL or Upload
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    className="flex-1 h-10 px-3 rounded-2xl border border-stone-200 dark:border-[#422217] bg-stone-50 dark:bg-[#1E0F0A] text-xs font-medium"
                    placeholder="https://..."
                    value={bannerFormData.imageUrl}
                    onChange={(e) =>
                      setBannerFormData({ ...bannerFormData, imageUrl: e.target.value })
                    }
                  />
                  <label className="cursor-pointer h-10 px-3 rounded-2xl bg-stone-100 dark:bg-[#381B13] text-xs font-bold inline-flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e, 'banner')}
                    />
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-stone-100 dark:border-[#381B13]">
                <button
                  type="button"
                  onClick={() => setShowBannerModal(false)}
                  className="flex-1 py-3 rounded-full border border-stone-200 text-taupe font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 rounded-full bg-terracotta text-white font-bold text-xs shadow-glow-terracotta"
                >
                  {isSubmitting ? 'Saving...' : editingBanner ? 'Update Banner' : 'Create Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: DELETE CONFIRMATION                                */}
      {/* ========================================================= */}
      {deleteConfirmItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm transition-all"
          onClick={() => setDeleteConfirmItem(null)}
        >
          <div
            className="bg-white dark:bg-[#27140E] rounded-3xl max-w-sm w-full p-6 text-center shadow-warm-xl border border-stone-200/80 dark:border-[#422217] animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-espresso dark:text-stone-100 mb-1">
              Delete Menu Item?
            </h3>
            <p className="text-xs text-taupe dark:text-stone-400 mb-6">
              Are you sure you want to permanently remove <strong>{deleteConfirmItem.name}</strong>?
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmItem(null)}
                className="flex-1 py-2.5 rounded-full border border-stone-200 text-taupe text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleDeleteItem}
                className="flex-1 py-2.5 rounded-full bg-red-600 text-white text-xs font-bold shadow-md hover:bg-red-700"
              >
                {isSubmitting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CmsDashboard;
