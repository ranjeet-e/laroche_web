import { useState, useRef, useEffect } from 'react';
import { Plus, Minus, SlidersHorizontal, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { triggerFlyToCart } from '../utils/flyToCart';
import { resolveAssetUrl } from '../services/api';
import CustomizeModal from './CustomizeModal';
import AddonsModal, { shouldShowAddons } from './AddonsModal';
import './FoodCard.css';

const FoodCard = ({ item, allItems = [] }) => {
  const { addToCart, decreaseQuantity, getItemQuantity } = useCart();
  const [showModal, setShowModal] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const timerRef = useRef(null);
  const imgRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const triggerAddedFeedback = () => {
    if (imgRef.current) {
      triggerFlyToCart(imgRef.current);
    }
    setJustAdded(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setJustAdded(false);
    }, 1500);
  };

  const hasMultipleVariants = item.variants && item.variants.length > 1;
  const displayName = hasMultipleVariants
    ? null
    : item.variants?.[0]
    ? `${item.name} - ${item.variants[0].label}`
    : item.name;
  const displayPrice = hasMultipleVariants
    ? Math.min(...item.variants.map((v) => v.price))
    : item.variants?.[0]?.price || item.price;

  const quantity = hasMultipleVariants ? 0 : getItemQuantity(item._id, displayName);
  const showAddons = !hasMultipleVariants && shouldShowAddons(item, allItems);

  const handleAddClick = () => {
    if (hasMultipleVariants) {
      setShowModal('variant');
    } else if (showAddons) {
      setShowModal('addons');
    } else {
      addToCart({
        menuItem: item._id,
        name: displayName,
        price: displayPrice,
        imageUrl: item.imageUrl,
      });
      triggerAddedFeedback();
    }
  };

  const handleDecrease = () => {
    decreaseQuantity(item._id, displayName);
  };

  return (
    <>
      <div className="group bg-[#FFF9EC] dark:bg-[#2B2421] rounded-2xl border border-[#ECD5A5] dark:border-[#4A3B32] shadow-warm-sm hover:shadow-warm-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col justify-between">
        
        {/* Media Wrap (Uniform 4/3 Aspect Ratio) */}
        <div className="relative w-full aspect-[4/3] bg-[#F5E6CA] dark:bg-stone-800 overflow-hidden">
          <img
            ref={imgRef}
            src={resolveAssetUrl(item.imageUrl) || '/placeholder-food.png'}
            alt={item.name}
            loading="lazy"
            decoding="async"
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

          {/* Veg Dot Badge */}
          <div className="absolute top-2 left-2 w-4 h-4 sm:w-5 sm:h-5 rounded-md bg-[#FFF9EC]/95 dark:bg-stone-900/90 backdrop-blur-sm border border-emerald-500 flex items-center justify-center shadow-sm" title="Vegetarian">
            <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-600" />
          </div>

          {/* Customisable Indicator Pill */}
          {(hasMultipleVariants || showAddons) && (
            <div className="absolute top-2 right-2 inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-[10px] font-bold uppercase tracking-wider bg-[#FFF9EC]/95 dark:bg-stone-900/90 backdrop-blur-md text-espresso dark:text-stone-200 border border-[#ECD5A5] dark:border-stone-700 shadow-sm">
              <SlidersHorizontal className="w-2 h-2 text-terracotta" />
              <span className="hidden xs:inline">Custom</span>
            </div>
          )}
        </div>

        {/* Card Details */}
        <div className="p-2.5 sm:p-3 flex-1 flex flex-col justify-between font-sans">
          <div>
            <h3 className="font-serif font-medium text-espresso dark:text-stone-100 text-xs sm:text-sm md:text-[15px] leading-snug group-hover:text-terracotta transition-colors line-clamp-1" title={item.name}>
              {item.name}
            </h3>
            {item.description && (
              <p className="hidden md:block text-[11px] sm:text-xs font-normal text-taupe dark:text-stone-400 mt-0.5 line-clamp-1 leading-snug">
                {item.description}
              </p>
            )}
          </div>

          {/* Footer Price & Action */}
          <div className="flex items-center justify-between gap-1 mt-2 sm:mt-2.5 pt-2 sm:pt-2.5 border-t border-stone-100 dark:border-stone-800">
            <div>
              <p className="font-price font-medium text-espresso dark:text-stone-100 text-xs sm:text-sm md:text-base whitespace-nowrap">
                {hasMultipleVariants ? `₹${displayPrice}+` : `₹${displayPrice}`}
              </p>
            </div>

            {/* Dynamic CTA Pill with Animated Micro-interaction */}
            <div>
              {justAdded ? (
                /* Active / Added State */
                <button
                  type="button"
                  disabled
                  className="animate-spring-pop inline-flex items-center justify-center gap-1 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-[#2E7D32] text-white text-[11px] sm:text-xs font-bold shadow-sm uppercase tracking-wide cursor-default"
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>ADDED</span>
                </button>
              ) : quantity === 0 ? (
                /* Default State: Pill with Rust background (#A6472B) */
                <button
                  type="button"
                  onClick={handleAddClick}
                  className="inline-flex items-center justify-center gap-1 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-[#A6472B] hover:bg-[#7E351F] text-white text-[11px] sm:text-xs font-bold shadow-sm active:scale-95 transition-all uppercase tracking-wide cursor-pointer hover:shadow-warm-sm"
                >
                  <Plus className="w-3 h-3 stroke-[2.5]" />
                  <span>ADD</span>
                </button>
              ) : (
                /* Stepper State */
                <div className="inline-flex items-center bg-[#A6472B] text-white rounded-full p-0.5 sm:p-1 shadow-sm transition-all">
                  <button
                    type="button"
                    onClick={handleDecrease}
                    className="w-5 h-5 sm:w-6 sm:h-6 rounded-full hover:bg-black/20 flex items-center justify-center transition-colors"
                    aria-label="Decrease"
                  >
                    <Minus className="w-3 h-3 stroke-[2.5]" />
                  </button>
                  <span className="px-1.5 sm:px-2 font-bold text-[11px] sm:text-xs text-white">{quantity}</span>
                  <button
                    type="button"
                    onClick={handleAddClick}
                    className="w-5 h-5 sm:w-6 sm:h-6 rounded-full hover:bg-black/20 flex items-center justify-center transition-colors"
                    aria-label="Increase"
                  >
                    <Plus className="w-3 h-3 stroke-[2.5]" />
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {showModal === 'variant' && (
        <CustomizeModal
          item={item}
          onAdded={triggerAddedFeedback}
          onClose={() => setShowModal(false)}
        />
      )}
      {showModal === 'addons' && (
        <AddonsModal
          baseItem={item}
          allItems={allItems}
          onAdded={triggerAddedFeedback}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
};

export default FoodCard;
