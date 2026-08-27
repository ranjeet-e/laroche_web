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
        <p>Your cart is craving food 🍽️</p>
        <button onClick={() => navigate('/menu')}>Browse Menu</button>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1>Your Cart</h1>

      <div className="cart-list">
        {cartItems.map((item) => (
          <CartItem key={`${item.menuItem}-${item.name}`} item={item} />
        ))}
      </div>

      {(() => {
  const packagingCharge = 10;
  const gst = Math.round(totalAmount * 0.05); // 5% GST
  const grandTotal = totalAmount + packagingCharge + gst;
  return (
    <div className="cart-summary">
      <div className="cart-summary-row"><span>Subtotal</span><span>₹{totalAmount}</span></div>
      <div className="cart-summary-row"><span>Packaging Charge</span><span>₹{packagingCharge}</span></div>
      <div className="cart-summary-row"><span>GST (5%)</span><span>₹{gst}</span></div>
      <div className="cart-summary-row cart-summary-grand"><span>Grand Total</span><span className="cart-total">₹{grandTotal}</span></div>
      <button className="checkout-btn" onClick={() => navigate('/checkout')}>
        Proceed to Checkout
      </button>
    </div>
  );
})()}
    </div>
  );
};

export default Cart;
