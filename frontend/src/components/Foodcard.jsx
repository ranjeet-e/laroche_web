import { useState } from 'react';
import { useCart } from '../context/CartContext';
import CustomizeModal from './CustomizeModal';
import AddonsModal, { shouldShowAddons } from './AddonsModal';
import './FoodCard.css';

const FoodCard = ({ item, allItems = [] }) => {
  const { addToCart, decreaseQuantity, getItemQuantity } = useCart();
  const [showModal, setShowModal] = useState(false);

  const hasMultipleVariants = item.variants && item.variants.length > 1;
  const displayName = hasMultipleVariants ? null : (item.variants?.[0] ? `${item.name} - ${item.variants[0].label}` : item.name);
  const displayPrice = hasMultipleVariants ? null : (item.variants?.[0]?.price || item.price);

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
      <div className="food-card">
        <img src={item.imageUrl || '/placeholder-food.png'} alt={item.name} className="food-card-image" />
        <div className="food-card-details">
          <h3 className="food-card-title">{item.name}</h3>
          <p className="food-card-price">
            {hasMultipleVariants ? `From ₹${Math.min(...item.variants.map(v => v.price))}` : `₹${displayPrice}`}
          </p>
        </div>
        <div className="food-card-action">
          {quantity === 0 ? (
            <button className="add-btn" onClick={handleAddClick}>+ ADD</button>
          ) : (
            <div className="stepper">
              <button onClick={handleDecrease}>−</button>
              <span>{quantity}</span>
              <button onClick={handleAddClick}>+</button>
            </div>
          )}
        </div>
      </div>

      {showModal === 'variant' && <CustomizeModal item={item} onClose={() => setShowModal(false)} />}
      {showModal === 'addons' && <AddonsModal baseItem={item} allItems={allItems} onClose={() => setShowModal(false)} />}
    </>
  );
};

export default FoodCard;