import { useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './FloatingOrderBar.css';

const FloatingOrderBar = () => {
  const { totalItems, totalAmount } = useCart();
  const navigate = useNavigate();

  if (totalItems === 0) return null;

  return (
    <div className="fixed bottom-5 left-0 right-0 z-40 px-4 sm:px-6 pointer-events-none flex justify-center animate-slide-up">
      <div
        onClick={() => navigate('/cart')}
        className="pointer-events-auto w-full max-w-xl bg-espresso dark:bg-[#1E1815] text-white rounded-full px-5 py-3.5 shadow-warm-xl border border-white/20 dark:border-[#4A3B32] flex items-center justify-between cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all duration-200"
      >
        {/* Left item & price summary */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-terracotta flex items-center justify-center text-white shadow-sm flex-shrink-0">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-stone-300 font-medium block">Your Order</span>
            <p className="text-sm sm:text-base font-extrabold text-white">
              {totalItems} {totalItems === 1 ? 'Item' : 'Items'} <span className="mx-1 text-stone-500">•</span> ₹{totalAmount}
            </p>
          </div>
        </div>

        {/* Right CTA button */}
        <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white dark:bg-stone-100 text-espresso font-bold text-xs sm:text-sm hover:bg-honey-light dark:hover:bg-white transition-colors shadow-sm">
          <span>View Cart</span>
          <ArrowRight className="w-4 h-4 text-terracotta" />
        </div>
      </div>
    </div>
  );
};

export default FloatingOrderBar;
