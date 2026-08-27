import { useState } from 'react';
import { useCart } from '../context/CartContext';
import './CustomizeModal.css';

const CustomizeModal = ({ item, onClose }) => {
  const { addToCart } = useCart();
  const [selectedVariant, setSelectedVariant] = useState(item.variants[0]);

  const handleAdd = () => {
    addToCart({
      menuItem: item._id,
      name: `${item.name} - ${selectedVariant.label}`,
      price: selectedVariant.price,
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{item.name}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <p className="modal-subtitle">Choose an option</p>

        <div className="variant-list">
          {item.variants.map((v) => (
            <label key={v.label} className="variant-row">
              <div className="variant-radio-group">
                <input
                  type="radio"
                  name="variant"
                  checked={selectedVariant.label === v.label}
                  onChange={() => setSelectedVariant(v)}
                />
                <span>{v.label}</span>
              </div>
              <span className="variant-price">₹{v.price}</span>
            </label>
          ))}
        </div>

        <button className="modal-add-btn" onClick={handleAdd}>
          Add — ₹{selectedVariant.price}
        </button>
      </div>
    </div>
  );
};

export default CustomizeModal;