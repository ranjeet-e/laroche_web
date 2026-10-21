import { Plus, Minus, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './CartItem.css';

const CartItem = ({ item }) => {
  const { addToCart, decreaseQuantity, removeFromCart } = useCart();

  const handleIncrease = () => {
    addToCart(item);
  };

  const handleDecrease = () => {
    decreaseQuantity(item);
  };

  const handleRemove = () => {
    removeFromCart(item);
  };

  const hasAddons = Array.isArray(item.addons) && item.addons.length > 0;

  return (
    <div className="flex items-center justify-between p-4 sm:p-5 bg-[#FFF9EC] dark:bg-[#2B2421] rounded-2xl border border-[#ECD5A5] dark:border-[#4A3B32] shadow-warm-sm hover:shadow-warm-md transition-all duration-200">
      <div className="flex-1 pr-3 font-sans">
        <h4 className="font-serif font-medium text-espresso dark:text-stone-100 text-sm sm:text-base leading-snug">
          {item.name}
        </h4>

        {/* Attached Add-ons list / sub-tag */}
        {hasAddons && (
          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
            {item.addons.map((addon, i) => (
              <span
                key={addon._id || i}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#F9EAC7] dark:bg-[#2F2F26] text-[#A6472B] dark:text-[#E9E0CC] border border-[#ECD5A5] dark:border-[#3D3D30]"
              >
                <span>+ {addon.name}</span>
                {addon.price > 0 && <span className="opacity-75 font-price">(₹{addon.price})</span>}
              </span>
            ))}
          </div>
        )}

        <p className="text-xs text-taupe dark:text-stone-400 mt-1.5 font-sans">
          <span className="font-price">₹{item.price}</span> × {item.quantity} = <strong className="text-espresso dark:text-stone-100 font-price font-medium">₹{item.price * item.quantity}</strong>
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Stepper */}
        <div className="inline-flex items-center bg-[#F9EAC7]/70 dark:bg-[#362E2A] rounded-full p-1 border border-[#ECD5A5] dark:border-[#4A3B32]">
          <button
            type="button"
            onClick={handleDecrease}
            className="w-7 h-7 rounded-full bg-[#FFF9EC] dark:bg-[#2B2421] hover:bg-[#F9EAC7] dark:hover:bg-[#4A3B32] text-espresso dark:text-stone-100 flex items-center justify-center shadow-xs transition-colors"
            aria-label="Decrease"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="px-2.5 font-bold text-xs sm:text-sm text-espresso dark:text-stone-100">{item.quantity}</span>
          <button
            type="button"
            onClick={handleIncrease}
            className="w-7 h-7 rounded-full bg-[#FFF9EC] dark:bg-[#2B2421] hover:bg-[#F9EAC7] dark:hover:bg-[#4A3B32] text-espresso dark:text-stone-100 flex items-center justify-center shadow-xs transition-colors"
            aria-label="Increase"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Remove Button */}
        <button
          type="button"
          onClick={handleRemove}
          className="p-2 rounded-full text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
          title="Remove from cart"
          aria-label="Remove item"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default CartItem;
