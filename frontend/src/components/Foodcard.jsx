import { useState } from 'react';
import { useCart } from '../context/CartContext';
import CustomizeModal from './CustomizeModal';
import AddonsModal, { shouldShowAddons } from './AddonsModal';
import './FoodCard.css';

const FoodCard = ({ item, allItems = [] }) => {
  const { addToCart, decreaseQuantity, getItemQuantity } = useCart();
  const [showModal, setShowModal] = useState(false);

  const hasMultipleVariants = item.variants && item.variants.length > 1;
  const displayName = hasMultipleVariants
    ? null
    : item.variants?.[0]
    ? `${item.name} - ${item.variants[0].label}`
    : item.name;
  const displayPrice = hasMultipleVariants
    ? null
    : item.variants?.[0]?.price || item.price;

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
        <div className="food-card-media-wrap">
          <img
            src={item.imageUrl || '/placeholder-food.png'}
            alt={item.name}
            className="food-card-image"
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/placeholder-food.png';
            }}
          />
          <div className="veg-badge" title="Vegetarian">
            <div className="veg-dot"></div>
          </div>
          {(hasMultipleVariants || showAddons) && (
            <span className="customisable-tag">Customisable</span>
          )}
        </div>

        <div className="food-card-details">
          <h3 className="food-card-title">{item.name}</h3>
          <div className="food-card-footer">
            <p className="food-card-price">
              {hasMultipleVariants
                ? `₹${Math.min(...item.variants.map((v) => v.price))}`
                : `₹${displayPrice}`}
            </p>
            <div className="food-card-action">
              {quantity === 0 ? (
                <button type="button" className="add-btn" onClick={handleAddClick}>
                  + ADD
                </button>
              ) : (
                <div className="stepper">
                  <button type="button" onClick={handleDecrease} aria-label="Decrease">
                    −
                  </button>
                  <span>{quantity}</span>
                  <button type="button" onClick={handleAddClick} aria-label="Increase">
                    +
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showModal === 'variant' && (
        <CustomizeModal item={item} onClose={() => setShowModal(false)} />
      )}
      {showModal === 'addons' && (
        <AddonsModal baseItem={item} allItems={allItems} onClose={() => setShowModal(false)} />
      )}
    </>
  );
};

export default FoodCard;
