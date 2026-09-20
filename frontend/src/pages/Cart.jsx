import { useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import CartItem from '../components/CartItem';
import './Cart.css';

const Cart = () => {
  const { cartItems, totalAmount } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();


  if (cartItems.length === 0) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center bg-oat dark:bg-[#1A1718] px-4 text-center">
        <div className="w-20 h-20 rounded-full bg-white dark:bg-[#2B2421] border border-stone-200 dark:border-[#4A3B32] shadow-warm-md flex items-center justify-center mb-5 text-terracotta">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-espresso dark:text-white mb-2">
          Your Cart is Empty
        </h2>
        <p className="text-sm text-taupe dark:text-stone-400 max-w-sm mb-6">
          Looks like you haven't added any delicious dishes yet. Explore our fresh menu to get started.
        </p>
        <button
          type="button"
          onClick={() => navigate('/menu')}
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-terracotta hover:bg-terracotta-hover text-white font-bold text-sm shadow-glow-terracotta transition-all"
        >
          <span>Explore Fresh Menu</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  const packagingCharge = 10;
  const gst = Math.round(totalAmount * 0.05); // 5% GST
  const grandTotal = totalAmount + packagingCharge + gst;

  return (
    <div className="min-h-screen bg-oat dark:bg-[#1A1718] py-8 px-4 sm:px-6 pb-28 transition-colors">
      <div className="max-w-4xl mx-auto">
        
        {/* Back Link & Header */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => navigate('/menu')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-taupe dark:text-stone-400 hover:text-espresso dark:hover:text-white transition-colors mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Menu</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-serif font-medium text-espresso dark:text-white tracking-tight">
            Order Review ({cartItems.reduce((s, i) => s + i.quantity, 0)} items)
          </h1>
          <p className="text-xs sm:text-sm text-taupe dark:text-stone-400 mt-1 font-sans font-normal">
            Freshly prepared artisanal food ready for counter pickup.
          </p>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          
          {/* Cart Items List */}
          <div className="md:col-span-7 space-y-3">
            {cartItems.map((item) => (
              <CartItem key={item.key || `${item.menuItem}-${item.name}`} item={item} />
            ))}
          </div>

          {/* Bill Summary Receipt */}
          <div className="md:col-span-5 bg-white dark:bg-[#2B2421] rounded-3xl border border-stone-200/80 dark:border-[#4A3B32] shadow-warm-lg p-6 sticky top-28 font-sans">
            <h3 className="font-serif font-medium text-espresso dark:text-white text-lg pb-3 mb-4 border-b border-stone-100 dark:border-stone-800">
              Bill Summary
            </h3>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between text-taupe dark:text-stone-400">
                <span>Item Total</span>
                <span className="font-medium text-espresso dark:text-stone-100 font-price">₹{totalAmount}</span>
              </div>
              <div className="flex justify-between text-taupe dark:text-stone-400">
                <span>Eco Packaging Fee</span>
                <span className="font-medium text-espresso dark:text-stone-100 font-price">₹{packagingCharge}</span>
              </div>
              <div className="flex justify-between text-taupe dark:text-stone-400">
                <span>Govt Taxes (GST 5%)</span>
                <span className="font-medium text-espresso dark:text-stone-100 font-price">₹{gst}</span>
              </div>
              <div className="pt-3 border-t border-stone-200/80 dark:border-stone-800 flex justify-between items-center font-medium text-espresso dark:text-white text-base sm:text-lg">
                <span>Total to Pay</span>
                <span className="text-terracotta font-price text-xl">₹{grandTotal}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (!user) {
                  navigate('/login?redirect=/checkout');
                } else {
                  navigate('/checkout');
                }
              }}
              className="w-full mt-6 py-3.5 rounded-full bg-terracotta hover:bg-terracotta-hover text-white font-bold text-sm shadow-glow-terracotta flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              <span>Proceed to Pay ₹{grandTotal}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] font-medium text-taupe dark:text-stone-400 mt-4">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>100% Safe & Secure Online Payment</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Cart;
