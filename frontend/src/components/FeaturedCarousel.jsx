import './FeaturedCarousel.css';

const FeaturedCarousel = ({ items }) => {
  if (!items || items.length === 0) return null;

  const featured = items.slice(0, 6); // show up to 6 highlighted items

  return (
    <div className="carousel-section">
      <h2 className="carousel-heading">Popular Right Now</h2>
      <div className="carousel-track">
        {featured.map((item) => (
          <div className="carousel-card" key={item._id}>
            <div className="carousel-card-image-wrap">
              <img src={item.imageUrl || '/placeholder-food.png'} alt={item.name} />
              <span className="bestseller-badge">Bestseller</span>
            </div>
            <div className="carousel-card-info">
              <h4>{item.name}</h4>
              <p>₹{item.variants?.[0]?.price || item.price}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturedCarousel;