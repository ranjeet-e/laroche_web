import { useState } from 'react';
import { Plus, Minus, SlidersHorizontal } from 'lucide-react';
import { useCart } from '../context/CartContext';
import CustomizeModal from './CustomizeModal';
import AddonsModal, { shouldShowAddons } from './AddonsModal';
import './FoodCard.css';

const FoodCard = ({ item, allItems = [] }) => {
  const { addToCart, decreaseQuantity, getItemQuantity } = useCart();
  const [showModal, setShowModal] = useState(false);

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
      addToCart({ menuItem: item._id, name: displayName, price: displayPrice });
    }
  };

  const handleDecrease = () => {
    decreaseQuantity(item._id, displayName);
  };

  return (
    <>
      <div className="group bg-white rounded-2xl border border-stone-200/80 shadow-warm-sm hover:shadow-warm-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col justify-between">
        
        {/* Media Wrap (Uniform 4/3 Aspect Ratio) */}
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

          {/* Veg Dot Badge */}
          <div className="absolute top-3 left-3 w-5 h-5 rounded-md bg-white/90 backdrop-blur-sm border border-matcha/50 flex items-center justify-center shadow-sm" title="Vegetarian">
            <div className="w-2.5 h-2.5 rounded-full bg-matcha" />
          </div>

          {/* Customisable Indicator Pill */}
          {(hasMultipleVariants || showAddons) && (
            <div className="absolute top-3 right-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/90 backdrop-blur-md text-espresso border border-stone-200/60 shadow-sm">
              <SlidersHorizontal className="w-2.5 h-2.5 text-terracotta" />
              <span>Customisable</span>
            </div>
          )}
        </div>

        {/* Card Details */}
        <div className="p-4 flex-1 flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-semibold text-taupe uppercase tracking-wider">
              {item.category}
            </span>
            <h3 className="font-bold text-espresso text-base sm:text-lg leading-snug group-hover:text-terracotta transition-colors mt-0.5" title={item.name}>
              {item.name}
            </h3>
            {item.description && (
              <p className="text-xs text-taupe-light mt-1 line-clamp-2 leading-relaxed">
                {item.description}
              </p>
            )}
          </div>

          {/* Footer Price & Action */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-stone-100">
            <div>
              <span className="text-[11px] text-taupe block">Price</span>
              <p className="font-extrabold text-espresso text-base sm:text-lg">
                {hasMultipleVariants ? `From ₹${displayPrice}` : `₹${displayPrice}`}
              </p>
            </div>

            {/* Dynamic CTA Pill */}
            <div>
              {quantity === 0 ? (
                <button
                  type="button"
                  onClick={handleAddClick}
                  className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-terracotta hover:bg-terracotta-hover text-white text-xs sm:text-sm font-bold shadow-sm hover:shadow-warm-md active:scale-95 transition-all duration-200"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>ADD</span>
                </button>
              ) : (
                <div className="inline-flex items-center bg-espresso text-white rounded-full p-1 shadow-sm">
                  <button
                    type="button"
                    onClick={handleDecrease}
                    className="w-7 h-7 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
                    aria-label="Decrease"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-2.5 font-bold text-xs sm:text-sm">{quantity}</span>
                  <button
                    type="button"
                    onClick={handleAddClick}
                    className="w-7 h-7 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
                    aria-label="Increase"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {showModal === 'variant' && (
        <CustomizeModal item={item} onClose={() => setShowModal(false)} />
      )}
      {showModal === 'addons' && (
        <AddonsModal baseItem={item} allItems={allItems} onClose={() => setShowModal(false)} />
      )}
    </>
  );
};

export default FoodCard;
