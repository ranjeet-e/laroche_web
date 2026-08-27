import { useState } from 'react';
import { useCart } from '../context/CartContext';
import './AddonsModal.css';

const ADDON_TRIGGER_CATEGORIES = [
  'Sandwiches', 'Maggie', 'Pasta', 'Flatbread Pizza', 'Quick Bites & Café Snacks',
];

export const shouldShowAddons = (item, allItems) => {
  if (!ADDON_TRIGGER_CATEGORIES.includes(item.category)) return false;
  return allItems.some((i) => i.category === 'Add-ons');
};

const AddonsModal = ({ baseItem, allItems, onClose }) => {
  const { addToCart } = useCart();
  const [selected, setSelected] = useState([]);

  const addonOptions = allItems.filter((i) => i.category === 'Add-ons');

  const toggleAddon = (addon) => {
    setSelected((prev) =>
      prev.find((a) => a._id === addon._id)
        ? prev.filter((a) => a._id !== addon._id)
        : [...prev, addon]
    );
  };

  const basePrice = baseItem.variants?.[0]?.price || baseItem.price;
  const addonsTotal = selected.reduce((sum, a) => sum + a.price, 0);

  const handleConfirm = () => {
    addToCart({ menuItem: baseItem._id, name: baseItem.name, price: basePrice });
    selected.forEach((addon) => {
      addToCart({ menuItem: addon._id, name: `${addon.name} (Add-on)`, price: addon.price });
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{baseItem.name}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <p className="modal-subtitle">Add extras? (optional)</p>

        <div className="variant-list">
          {addonOptions.map((addon) => (
            <label key={addon._id} className="variant-row">
              <div className="variant-radio-group">
                <input
                  type="checkbox"
                  checked={!!selected.find((a) => a._id === addon._id)}
                  onChange={() => toggleAddon(addon)}
                />
                <span>{addon.name}</span>
              </div>
              <span className="variant-price">+₹{addon.price}</span>
            </label>
          ))}
        </div>

        <button className="modal-add-btn" onClick={handleConfirm}>
          Add — ₹{basePrice + addonsTotal}
        </button>
      </div>
    </div>
  );
};

export default AddonsModal;