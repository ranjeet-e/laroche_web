import { useRef } from 'react';
import { useCart } from '../context/CartContext';
import './FeaturedCarousel.css';

const FeaturedCarousel = ({ items = [] }) => {
  const trackRef = useRef(null);
  const { addToCart, decreaseQuantity, getItemQuantity } = useCart();

  if (!items || items.length === 0) return null;

  const featured = items.slice(0, 8); // show top 8 highlighted items

  const scroll = (direction) => {
    if (trackRef.current) {
      trackRef.current.scrollBy({ left: direction * 240, behavior: 'smooth' });
    }
  };

  return (
    <div className="carousel-section">
      <div className="carousel-header-row">
        <h2 className="carousel-heading">
          <span>🔥 Popular Right Now</span>
        </h2>
        <div className="carousel-controls">
          <button
            type="button"
            className="carousel-arrow-btn"
            onClick={() => scroll(-1)}
            aria-label="Previous items"
          >
            ‹
          </button>
          <button
            type="button"
            className="carousel-arrow-btn"
            onClick={() => scroll(1)}
            aria-label="Next items"
          >
            ›
          </button>
        </div>
      </div>

      <div className="carousel-track" ref={trackRef}>
        {featured.map((item) => {
          const price = item.variants?.[0]?.price || item.price;
          const displayName = item.variants?.[0]
            ? `${item.name} - ${item.variants[0].label}`
            : item.name;
          const qty = getItemQuantity(item._id, displayName);

          return (
            <div className="carousel-card" key={item._id}>
              <div className="carousel-card-image-wrap">
                <img
                  src={item.imageUrl || '/placeholder-food.png'}
                  alt={item.name}
                  loading="lazy"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/placeholder-food.png';
                  }}
                />
                <span className="bestseller-badge">Bestseller</span>
                <div className="veg-badge-mini">
                  <div className="veg-dot-mini" />
                </div>
              </div>
              <div className="carousel-card-info">
                <h4 title={item.name}>{item.name}</h4>
                <div className="carousel-card-bottom-row">
                  <p className="carousel-price">₹{price}</p>
                  {qty === 0 ? (
                    <button
                      type="button"
                      className="carousel-add-btn"
                      onClick={() =>
                        addToCart({
                          menuItem: item._id,
                          name: displayName,
                          price: price,
                        })
                      }
                    >
                      + ADD
                    </button>
                  ) : (
                    <div className="carousel-stepper">
                      <button
                        type="button"
                        onClick={() => decreaseQuantity(item._id, displayName)}
                      >
                        −
                      </button>
                      <span>{qty}</span>
                      <button
                        type="button"
                        onClick={() =>
                          addToCart({
                            menuItem: item._id,
                            name: displayName,
                            price: price,
                          })
                        }
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FeaturedCarousel;