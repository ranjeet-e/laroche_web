import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import CartItem from '../components/CartItem';
import './Cart.css';

const Cart = () => {
  const { cartItems, totalAmount } = useCart();
  const navigate = useNavigate();

  if (cartItems.length === 0) {
    return (
      <div className="cart-empty">
        <div className="empty-cart-icon">🛒</div>
        <h2>Your cart is empty</h2>
        <p>Looks like you haven't added anything to your cart yet.</p>
        <button onClick={() => navigate('/menu')}>Explore Menu</button>
      </div>
    );
  }

  const packagingCharge = 10;
  const gst = Math.round(totalAmount * 0.05); // 5% GST
  const grandTotal = totalAmount + packagingCharge + gst;

  return (
    <div className="cart-page">
      <div className="cart-header">
        <h1>Your Order ({cartItems.reduce((s, i) => s + i.quantity, 0)} items)</h1>
        <p>Review your selected dishes before checkout</p>
      </div>

      <div className="cart-layout">
        <div className="cart-list">
          {cartItems.map((item) => (
            <CartItem key={`${item.menuItem}-${item.name}`} item={item} />
          ))}
        </div>

        <div className="cart-summary-card">
          <h3 className="summary-title">Bill Details</h3>
          <div className="cart-summary-row">
            <span>Item Total</span>
            <span>₹{totalAmount}</span>
          </div>
          <div className="cart-summary-row">
            <span>Packaging & Container</span>
            <span>₹{packagingCharge}</span>
          </div>
          <div className="cart-summary-row">
            <span>Govt Taxes (GST 5%)</span>
            <span>₹{gst}</span>
          </div>
          <div className="cart-summary-row cart-summary-grand">
            <span>To Pay</span>
            <span className="cart-total">₹{grandTotal}</span>
          </div>

          <button className="checkout-btn" onClick={() => navigate('/checkout')}>
            Proceed to Pay ₹{grandTotal} →
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
