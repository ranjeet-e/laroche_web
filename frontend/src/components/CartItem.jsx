import { useCart } from '../context/CartContext';
import './CartItem.css';

// item: { menuItem, name, price, quantity }
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
    <div className="cart-item">
      <div className="cart-item-details">
        <h4 className="cart-item-name">{item.name}</h4>
        <p className="cart-item-price">₹{item.price} x {item.quantity} = ₹{item.price * item.quantity}</p>
      </div>

      <div className="cart-item-controls">
        <div className="stepper">
          <button onClick={handleDecrease}>−</button>
          <span>{item.quantity}</span>
          <button onClick={handleIncrease}>+</button>
        </div>
        <button className="remove-btn" onClick={handleRemove}>
          Remove
        </button>
      </div>
    </div>
  );
};

export default CartItem;
