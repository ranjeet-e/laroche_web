import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ShoppingBag, ArrowRight, ArrowLeft, ShieldCheck, Lock, Clock } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { getCafeScheduleStatus } from '../utils/cafeSchedule';
import CartItem from '../components/CartItem';
import './Cart.css';

const Cart = () => {
  const { cartItems, totalAmount } = useCart();
  const navigate = useNavigate();
  const [scheduleStatus, setScheduleStatus] = useState(() => getCafeScheduleStatus());

  useEffect(() => {
    const interval = setInterval(() => {
      setScheduleStatus(getCafeScheduleStatus());
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center bg-oat px-4 text-center">
        <div className="w-20 h-20 rounded-full bg-white border border-stone-200 shadow-warm-md flex items-center justify-center mb-5 text-terracotta">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-espresso mb-2">
          Your Cart is Empty
        </h2>
        <p className="text-sm text-taupe max-w-sm mb-6">
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
    <div className="min-h-screen bg-oat py-8 px-4 sm:px-6 pb-28">
      <div className="max-w-4xl mx-auto">
        
        {/* Back Link & Header */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => navigate('/menu')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-taupe hover:text-espresso transition-colors mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Menu</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-espresso tracking-tight">
            Order Review ({cartItems.reduce((s, i) => s + i.quantity, 0)} items)
          </h1>
          <p className="text-xs sm:text-sm text-taupe mt-1">
            Freshly prepared artisanal food ready for counter pickup.
          </p>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          
          {/* Cart Items List */}
          <div className="md:col-span-7 space-y-3">
            {cartItems.map((item) => (
              <CartItem key={`${item.menuItem}-${item.name}`} item={item} />
            ))}
          </div>

          {/* Bill Summary Receipt */}
          <div className="md:col-span-5 bg-white rounded-3xl border border-stone-200/80 shadow-warm-lg p-6 sticky top-28">
            <h3 className="font-serif font-bold text-espresso text-lg pb-3 mb-4 border-b border-stone-100">
              Bill Summary
            </h3>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between text-taupe">
                <span>Item Total</span>
                <span className="font-semibold text-espresso">₹{totalAmount}</span>
              </div>
              <div className="flex justify-between text-taupe">
                <span>Eco Packaging Fee</span>
                <span className="font-semibold text-espresso">₹{packagingCharge}</span>
              </div>
              <div className="flex justify-between text-taupe">
                <span>Govt Taxes (GST 5%)</span>
                <span className="font-semibold text-espresso">₹{gst}</span>
              </div>
              <div className="pt-3 border-t border-stone-200/80 flex justify-between items-center font-extrabold text-espresso text-base sm:text-lg">
                <span>Total to Pay</span>
                <span className="text-terracotta">₹{grandTotal}</span>
              </div>
            </div>

            {!scheduleStatus.isOpenForOrdering ? (
              <div className="mt-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-center">
                <div className="flex items-center justify-center gap-1.5 text-amber-800 font-bold text-xs mb-1">
                  <Clock className="w-4 h-4" />
                  <span>{scheduleStatus.message}</span>
                </div>
                <p className="text-[11px] text-amber-700">
                  Pre-orders open daily at {scheduleStatus.formattedPreorderTime} (30 mins before counter pickup).
                </p>
                <button
                  type="button"
                  disabled
                  className="w-full mt-3 py-3 rounded-full bg-stone-300 text-stone-500 font-bold text-xs cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Ordering Currently Closed</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => navigate('/checkout')}
                className="w-full mt-6 py-3.5 rounded-full bg-terracotta hover:bg-terracotta-hover text-white font-bold text-sm shadow-glow-terracotta flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                <span>Proceed to Pay ₹{grandTotal}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            <div className="flex items-center justify-center gap-1.5 text-[11px] font-medium text-taupe mt-4">
              <ShieldCheck className="w-3.5 h-3.5 text-matcha" />
              <span>100% Safe & Secure Online Payment</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Cart;
