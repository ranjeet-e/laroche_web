import { useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './FloatingOrderBar.css';

const FloatingOrderBar = () => {
  const { cartItems, totalItems, totalAmount } = useCart();
  const navigate = useNavigate();

  if (!cartItems || cartItems.length === 0 || totalItems === 0) return null;

  // Extract distinct items with images for left thumbnail stack
  const distinctItems = Array.from(
    new Map(
      cartItems.map((item) => [item.menuItem || item.name, item])
    ).values()
  );

  const visibleThumbnails = distinctItems.slice(0, 3);
  const remainingCount = distinctItems.length - 3;

  return (
    <aside aria-label="Cart Overview" className="fixed bottom-4 sm:bottom-6 left-0 right-0 z-40 px-4 sm:px-6 pointer-events-none flex justify-center animate-cart-float-in">
      <div
        role="button"
        tabIndex={0}
        onClick={() => navigate('/cart')}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            navigate('/cart');
          }
        }}
        className="group pointer-events-auto w-full max-w-sm sm:max-w-md bg-[#221C19] dark:bg-[#1E1715] text-white rounded-full pl-3 pr-2.5 sm:pl-3.5 sm:pr-3 py-2 sm:py-2.5 shadow-cart-pill shadow-2xl border border-white/15 dark:border-[#4A3B32] flex items-center justify-between cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 backdrop-blur-md"
      >
        {/* Left: Tiny stacked/overlapping circular thumbnails */}
        <div className="flex items-center -space-x-2.5 overflow-hidden flex-shrink-0 pl-0.5">
          {visibleThumbnails.length > 0 ? (
            visibleThumbnails.map((item, idx) => (
              <div
                key={item.key || item.menuItem || idx}
                className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden border-2 border-[#221C19] dark:border-[#1E1715] bg-stone-800 shadow-sm"
              >
                <img
                  src={item.imageUrl || '/placeholder-food.png'}
                  alt={item.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/placeholder-food.png';
                  }}
                />
              </div>
            ))
          ) : (
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#8D5B4C] flex items-center justify-center text-white border-2 border-[#221C19] shadow-sm">
              <ShoppingBag className="w-4 h-4" />
            </div>
          )}

          {remainingCount > 0 && (
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#3D332E] text-stone-200 border-2 border-[#221C19] dark:border-[#1E1715] flex items-center justify-center text-[10px] font-extrabold shadow-sm">
              +{remainingCount}
            </div>
          )}
        </div>

        {/* Center: 'View Cart • {count} items' + total price */}
        <div className="flex-1 px-3 sm:px-4 text-left">
          <div className="text-[11px] sm:text-xs text-stone-300 font-medium leading-tight">
            View Cart • <span className="text-white font-bold">{totalItems} {totalItems === 1 ? 'item' : 'items'}</span>
          </div>
          <div className="text-sm sm:text-base font-black text-white tracking-tight leading-none mt-0.5">
            ₹{totalAmount}
          </div>
        </div>

        {/* Right: White circular arrow button (→) */}
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white text-[#221C19] flex items-center justify-center shadow-md flex-shrink-0 group-hover:translate-x-0.5 transition-transform duration-200">
          <ArrowRight className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.5]" />
        </div>
      </div>
    </aside>
  );
};

export default FloatingOrderBar;
