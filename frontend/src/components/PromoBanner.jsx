import { useState, useEffect } from 'react';
import './PromoBanner.css';

const banners = [
  { title: 'Free Delivery on Campus', subtitle: 'Order now, skip the queue', color: '#E85D04' },
  { title: '20% Off Waffles', subtitle: 'This week only', color: '#4A2C2A' },
  { title: 'New: Jain Pasta', subtitle: 'Now on the menu', color: '#F4A261' },
];

const PromoBanner = () => {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % banners.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="promo-banner" style={{ backgroundColor: banners[active].color }}>
      <h3>{banners[active].title}</h3>
      <p>{banners[active].subtitle}</p>
      <div className="promo-dots">
        {banners.map((_, i) => (
          <span key={i} className={`dot ${i === active ? 'dot-active' : ''}`} />
        ))}
      </div>
    </div>
  );
};

export default PromoBanner;