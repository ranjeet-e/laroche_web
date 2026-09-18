import { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, Plus, Minus, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { triggerFlyToCart } from '../utils/flyToCart';
import CustomizeModal from './CustomizeModal';
import AddonsModal, { shouldShowAddons } from './AddonsModal';
import api, { resolveAssetUrl } from '../services/api';
import './FeaturedCarousel.css';

const FeaturedCarousel = ({ allItems = [] }) => {
  const trackRef = useRef(null);
  const imgRefs = useRef({});
  const [popularItems, setPopularItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeModalItem, setActiveModalItem] = useState(null);
  const [modalType, setModalType] = useState(null); // 'variant' | 'addons'
  const [addedItemIds, setAddedItemIds] = useState({});

  const { addToCart, decreaseQuantity, getItemQuantity } = useCart();

  const triggerAddedFeedback = (itemId) => {
    if (imgRefs.current[itemId]) {
      triggerFlyToCart(imgRefs.current[itemId]);
    }
    setAddedItemIds((prev) => ({ ...prev, [itemId]: true }));
    setTimeout(() => {
      setAddedItemIds((prev) => {
        const next = { ...prev };
        delete next[itemId];
        return next;
      });
    }, 1500);
  };

  useEffect(() => {
    const fetchPopular = async () => {
      try {
        const res = await api.get('/menu/popular');
        if (Array.isArray(res.data) && res.data.length > 0) {
          setPopularItems(res.data);
        } else if (allItems.length > 0) {
          // Fallback to top signature non-addon items
          setPopularItems(allItems.filter((i) => i.category !== 'Add-ons').slice(0, 8));
        }
      } catch (err) {
        console.error('Failed to fetch popular items', err);
        if (allItems.length > 0) {
          setPopularItems(allItems.filter((i) => i.category !== 'Add-ons').slice(0, 8));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPopular();
  }, [allItems]);

  const scroll = (direction) => {
    if (trackRef.current) {
      trackRef.current.scrollBy({ left: direction * 320, behavior: 'smooth' });
    }
  };

  const handleAdd = (item) => {
    const hasMultipleVariants = item.variants && item.variants.length > 1;
    const showAddons = !hasMultipleVariants && shouldShowAddons(item, allItems);

    if (hasMultipleVariants) {
      setActiveModalItem(item);
      setModalType('variant');
    } else if (showAddons) {
      setActiveModalItem(item);
      setModalType('addons');
    } else {
      const price = item.variants?.[0]?.price || item.price;
      const displayName = item.variants?.[0]
        ? `${item.name} - ${item.variants[0].label}`
        : item.name;
      addToCart({
        menuItem: item._id,
        name: displayName,
        price: price,
        imageUrl: item.imageUrl,
      });
      triggerAddedFeedback(item._id);
    }
  };

  if (!loading && popularItems.length === 0) return null;

  return (
    <section id="section-popular" className="py-8 px-4 sm:px-6 max-w-7xl mx-auto">
      {/* Header Row */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-terracotta/10 text-terracotta dark:bg-terracotta/20 dark:text-terracotta-light text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 fill-terracotta" />
            <span>Trending on Campus</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-espresso dark:text-white tracking-tight">
            Popular Right Now
          </h2>
          <p className="text-taupe dark:text-stone-400 text-xs sm:text-sm mt-1">
            Real-time signature favorites ranked from the last 30 kitchen orders.
          </p>
        </div>

        {/* Carousel Arrow Controls */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            type="button"
            onClick={() => scroll(-1)}
            className="w-9 h-9 rounded-full bg-white dark:bg-[#2B2421] border border-stone-200/80 dark:border-[#4A3B32] shadow-warm-sm text-espresso dark:text-stone-100 hover:bg-stone-50 dark:hover:bg-[#362E2A] hover:border-stone-300 dark:hover:border-stone-600 flex items-center justify-center transition-all duration-200"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => scroll(1)}
            className="w-9 h-9 rounded-full bg-white dark:bg-[#2B2421] border border-stone-200/80 dark:border-[#4A3B32] shadow-warm-sm text-espresso dark:text-stone-100 hover:bg-stone-50 dark:hover:bg-[#362E2A] hover:border-stone-300 dark:hover:border-stone-600 flex items-center justify-center transition-all duration-200"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Carousel Track */}
      <div
        ref={trackRef}
        className="flex items-stretch gap-5 overflow-x-auto no-scrollbar scroll-smooth pb-4 pt-1 px-1 -mx-1"
      >
        {popularItems.map((item, idx) => {
          const hasMultipleVariants = item.variants && item.variants.length > 1;
          const displayPrice = hasMultipleVariants
            ? Math.min(...item.variants.map((v) => v.price))
            : item.variants?.[0]?.price || item.price;
          const displayName = hasMultipleVariants
            ? null
            : item.variants?.[0]
            ? `${item.name} - ${item.variants[0].label}`
            : item.name;
          const qty = hasMultipleVariants ? 0 : getItemQuantity(item._id, displayName);

          return (
            <div
              key={item._id || idx}
              className="group flex-shrink-0 w-[240px] sm:w-[270px] bg-white dark:bg-[#2B2421] rounded-2xl border border-stone-200/70 dark:border-[#4A3B32] shadow-warm-sm hover:shadow-warm-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col justify-between"
            >
              {/* Card Image Wrap (Aspect 4/3) */}
              <div className="relative w-full aspect-[4/3] bg-stone-100 dark:bg-stone-800 overflow-hidden">
                <img
                  ref={(el) => {
                    if (el && item._id) imgRefs.current[item._id] = el;
                  }}
                  src={resolveAssetUrl(item.imageUrl) || '/placeholder-food.png'}
                  alt={item.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
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

                {/* Badges */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-espresso/80 dark:bg-black/80 backdrop-blur-md text-white shadow-sm">
                    #{idx + 1} Best
                  </span>
                </div>

                {/* Veg Indicator Mini Badge */}
                <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-md bg-white/90 dark:bg-stone-900/90 backdrop-blur-sm border border-emerald-500/40 flex items-center justify-center shadow-sm">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                </div>
              </div>

              {/* Card Details */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-taupe dark:text-stone-400 tracking-wide uppercase">
                    {item.category}
                  </span>
                  <h3 className="font-bold text-espresso dark:text-stone-100 text-base line-clamp-1 group-hover:text-terracotta transition-colors mt-0.5" title={item.name}>
                    {item.name}
                  </h3>
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-stone-100 dark:border-stone-800">
                  <div>
                    <span className="text-xs text-taupe dark:text-stone-400">Price</span>
                    <p className="font-extrabold text-espresso dark:text-stone-100 text-base">
                      {hasMultipleVariants ? `From ₹${displayPrice}` : `₹${displayPrice}`}
                    </p>
                  </div>

                  {/* Add CTA / Stepper */}
                  <div>
                    {addedItemIds[item._id] ? (
                      /* Active / Added State: Soft success green with spring animation */
                      <button
                        type="button"
                        disabled
                        className="animate-spring-pop inline-flex items-center justify-center gap-1 px-3.5 py-1.5 rounded-full bg-[#2E7D32] text-white text-xs font-extrabold shadow-sm transition-all uppercase tracking-wide cursor-default"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>ADDED</span>
                      </button>
                    ) : qty === 0 ? (
                      /* Default State: Pill with warm terracotta/brown background (#8D5B4C) */
                      <button
                        type="button"
                        onClick={() => handleAdd(item)}
                        className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full bg-[#8D5B4C] hover:bg-[#784C3E] text-white text-xs font-extrabold shadow-sm hover:shadow-warm-sm active:scale-95 transition-all duration-200 uppercase tracking-wide"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>ADD</span>
                      </button>
                    ) : (
                      /* Stepper State: Brown theme matching quantity adjuster */
                      <div className="inline-flex items-center bg-[#8D5B4C] text-white rounded-full p-1 shadow-sm transition-all duration-200">
                        <button
                          type="button"
                          onClick={() => decreaseQuantity(item._id, displayName)}
                          className="w-6 h-6 rounded-full hover:bg-black/20 flex items-center justify-center transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3 stroke-[2.5]" />
                        </button>
                        <span className="px-2 font-extrabold text-xs text-white">{qty}</span>
                        <button
                          type="button"
                          onClick={() => handleAdd(item)}
                          className="w-6 h-6 rounded-full hover:bg-black/20 flex items-center justify-center transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3 stroke-[2.5]" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal overlays */}
      {modalType === 'variant' && activeModalItem && (
        <CustomizeModal
          item={activeModalItem}
          onAdded={() => triggerAddedFeedback(activeModalItem._id)}
          onClose={() => {
            setActiveModalItem(null);
            setModalType(null);
          }}
        />
      )}
      {modalType === 'addons' && activeModalItem && (
        <AddonsModal
          baseItem={activeModalItem}
          allItems={allItems}
          onAdded={() => triggerAddedFeedback(activeModalItem._id)}
          onClose={() => {
            setActiveModalItem(null);
            setModalType(null);
          }}
        />
      )}
    </section>
  );
};

export default FeaturedCarousel;