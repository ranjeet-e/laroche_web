import { Plus, Minus, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './CartItem.css';

const CartItem = ({ item }) => {
  const { addToCart, decreaseQuantity, removeFromCart } = useCart();

  const handleIncrease = () => {
    addToCart({ menuItem: item.menuItem, name: item.name, price: item.price });
  };

  const handleDecrease = () => {
    decreaseQuantity(item.menuItem, item.name);
  };

  const handleRemove = () => {
    removeFromCart(item.menuItem, item.name);
  };

  return (
    <div className="flex items-center justify-between p-4 sm:p-5 bg-white rounded-2xl border border-stone-200/80 shadow-warm-sm hover:shadow-warm-md transition-all duration-200">
      <div className="flex-1 pr-3">
        <h4 className="font-bold text-espresso text-sm sm:text-base leading-snug">
          {item.name}
        </h4>
        <p className="text-xs text-taupe mt-1">
          ₹{item.price} × {item.quantity} = <strong className="text-espresso">₹{item.price * item.quantity}</strong>
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Stepper */}
        <div className="inline-flex items-center bg-stone-100 rounded-full p-1 border border-stone-200/80">
          <button
            type="button"
            onClick={handleDecrease}
            className="w-7 h-7 rounded-full bg-white hover:bg-stone-200 text-espresso flex items-center justify-center shadow-xs transition-colors"
            aria-label="Decrease"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="px-2.5 font-bold text-xs sm:text-sm text-espresso">{item.quantity}</span>
          <button
            type="button"
            onClick={handleIncrease}
            className="w-7 h-7 rounded-full bg-white hover:bg-stone-200 text-espresso flex items-center justify-center shadow-xs transition-colors"
            aria-label="Increase"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Remove Button */}
        <button
          type="button"
          onClick={handleRemove}
          className="p-2 rounded-full text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors"
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
