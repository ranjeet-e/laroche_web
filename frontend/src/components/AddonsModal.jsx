import { useState } from 'react';
import { useCart } from '../context/CartContext';
import './AddonsModal.css';

// Intelligent add-on relevance mapping by category
const CATEGORY_ALLOWED_ADDONS = {
  'Sandwiches': ['Cheese', 'Mayonnaise', 'Paneer', 'Brown Bread', 'Schewan Sauce', 'Schezwan Sauce'],
  'Flatbread Pizza': ['Cheese', 'Paneer', 'Schewan Sauce', 'Schezwan Sauce'],
  'Pasta': ['Cheese', 'Paneer', 'Schewan Sauce', 'Schezwan Sauce'],
  'Maggie': ['Cheese', 'Paneer', 'Schewan Sauce', 'Schezwan Sauce'],
  'Quick Bites & Café Snacks': ['Cheese', 'Mayonnaise', 'Schewan Sauce', 'Schezwan Sauce'], // NO bread, NO paneer on fries/snacks
  'Chat Counter': ['Cheese', 'Schewan Sauce', 'Schezwan Sauce'],
};

export const getRelevantAddons = (item, allItems) => {
  if (!item || !item.category) return [];
  const allowedNames = CATEGORY_ALLOWED_ADDONS[item.category] || [];
  if (allowedNames.length === 0) return [];

  return allItems.filter((i) => {
    if (i.category !== 'Add-ons') return false;
    return allowedNames.some((allowed) =>
      i.name.toLowerCase().includes(allowed.toLowerCase())
    );
  });
};

export const shouldShowAddons = (item, allItems) => {
  return getRelevantAddons(item, allItems).length > 0;
};

const AddonsModal = ({ baseItem, allItems, onClose }) => {
  const { addToCart } = useCart();
  const [selected, setSelected] = useState([]);

  const addonOptions = getRelevantAddons(baseItem, allItems);

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