import { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import CustomizeModal from './CustomizeModal';
import AddonsModal, { shouldShowAddons } from './AddonsModal';
import api from '../services/api';
import './FeaturedCarousel.css';

const FeaturedCarousel = ({ allItems = [] }) => {
  const trackRef = useRef(null);
  const [popularItems, setPopularItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeModalItem, setActiveModalItem] = useState(null);
  const [modalType, setModalType] = useState(null); // 'variant' | 'addons'

  const { addToCart, decreaseQuantity, getItemQuantity } = useCart();

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
      });
    }
  };

  if (!loading && popularItems.length === 0) return null;

  return (
    <section id="section-popular" className="py-8 px-4 sm:px-6 max-w-7xl mx-auto">
      {/* Header Row */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-terracotta/10 text-terracotta text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 fill-terracotta" />
            <span>Trending on Campus</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-espresso tracking-tight">
            Popular Right Now
          </h2>
          <p className="text-taupe text-xs sm:text-sm mt-1">
            Real-time signature favorites ranked from the last 30 kitchen orders.
          </p>
        </div>

        {/* Carousel Arrow Controls */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            type="button"
            onClick={() => scroll(-1)}
            className="w-9 h-9 rounded-full bg-white border border-stone-200/80 shadow-warm-sm text-espresso hover:bg-stone-50 hover:border-stone-300 flex items-center justify-center transition-all duration-200"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => scroll(1)}
            className="w-9 h-9 rounded-full bg-white border border-stone-200/80 shadow-warm-sm text-espresso hover:bg-stone-50 hover:border-stone-300 flex items-center justify-center transition-all duration-200"
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
              className="group flex-shrink-0 w-[240px] sm:w-[270px] bg-white rounded-2xl border border-stone-200/70 shadow-warm-sm hover:shadow-warm-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col justify-between"
            >
              {/* Card Image Wrap (Aspect 4/3) */}
              <div className="relative w-full aspect-[4/3] bg-stone-100 overflow-hidden">
                <img
                  src={item.imageUrl || '/placeholder-food.png'}
                  alt={item.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/placeholder-food.png';
                  }}
                />

                {/* Badges */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-espresso/80 backdrop-blur-md text-white shadow-sm">
                    #{idx + 1} Best
                  </span>
                </div>

                {/* Veg Indicator Mini Badge */}
                <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-md bg-white/90 backdrop-blur-sm border border-matcha/40 flex items-center justify-center shadow-sm">
                  <div className="w-2.5 h-2.5 rounded-full bg-matcha" />
                </div>
              </div>

              {/* Card Details */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-taupe tracking-wide uppercase">
                    {item.category}
                  </span>
                  <h3 className="font-bold text-espresso text-base line-clamp-1 group-hover:text-terracotta transition-colors mt-0.5" title={item.name}>
                    {item.name}
                  </h3>
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-stone-100">
                  <div>
                    <span className="text-xs text-taupe">Price</span>
                    <p className="font-extrabold text-espresso text-base">
                      {hasMultipleVariants ? `From ₹${displayPrice}` : `₹${displayPrice}`}
                    </p>
                  </div>

                  {/* Add CTA / Stepper */}
                  <div>
                    {qty === 0 ? (
                      <button
                        type="button"
                        onClick={() => handleAdd(item)}
                        className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full bg-terracotta hover:bg-terracotta-hover text-white text-xs font-bold shadow-sm hover:shadow-warm-md active:scale-95 transition-all duration-200"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>ADD</span>
                      </button>
                    ) : (
                      <div className="inline-flex items-center bg-espresso text-white rounded-full p-1 shadow-sm">
                        <button
                          type="button"
                          onClick={() => decreaseQuantity(item._id, displayName)}
                          className="w-6 h-6 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 font-bold text-xs">{qty}</span>
                        <button
                          type="button"
                          onClick={() => handleAdd(item)}
                          className="w-6 h-6 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
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