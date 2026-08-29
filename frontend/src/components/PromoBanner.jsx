import { useState, useEffect, useRef } from 'react';
import './PromoBanner.css';

const banners = [
  {
    id: 1,
    tag: '🔥 20% OFF',
    title: 'Flat 20% Off on Waffles & Sandwiches',
    subtitle: 'Freshly toasted & artisanal. Use code at pickup!',
    gradient: 'linear-gradient(135deg, #E85D04 0%, #C43800 100%)',
    icon: '🧇🥪',
  },
  {
    id: 2,
    tag: '⚡ QUICK PICKUP',
    title: 'Skip the Long Lunch Queue',
    subtitle: 'Order ahead online, get notified when ready, grab & go!',
    gradient: 'linear-gradient(135deg, #3D2422 0%, #1A110F 100%)',
    icon: '☕⏱️',
  },
  {
    id: 3,
    tag: '✨ NEW ARRIVAL',
    title: 'Freshly Baked Flatbread Pizzas',
    subtitle: 'Crispy thin crust topped with premium veggies & melted mozzarella.',
    gradient: 'linear-gradient(135deg, #B45309 0%, #78350F 100%)',
    icon: '🍕🧀',
  },
  {
    id: 4,
    tag: '🥤 COMBO DEAL',
    title: 'Special Snack & Beverage Combos',
    subtitle: 'Pair any burger, maggie or pasta with iced cold coolers.',
    gradient: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)',
    icon: '🍟🧋',
  },
];

const PromoBanner = () => {
  const [active, setActive] = useState(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % banners.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [active]);

  const handlePrev = () => {
    setActive((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActive((prev) => (prev + 1) % banners.length);
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 50) {
      handleNext();
    } else if (diff < -50) {
      handlePrev();
    }
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  const current = banners[active];

  return (
    <div
      className="promo-slider-container"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="promo-banner" style={{ background: current.gradient }}>
        <div className="promo-content">
          <span className="promo-tag">{current.tag}</span>
          <h3>{current.title}</h3>
          <p>{current.subtitle}</p>
        </div>

        <div className="promo-graphic-icon" aria-hidden="true">
          {current.icon}
        </div>

        {/* Previous & Next Arrows */}
        <button
          type="button"
          className="promo-arrow promo-arrow-left"
          onClick={handlePrev}
          aria-label="Previous Slide"
        >
          ‹
        </button>
        <button
          type="button"
          className="promo-arrow promo-arrow-right"
          onClick={handleNext}
          aria-label="Next Slide"
        >
          ›
        </button>

        {/* Slide Indicator Dots */}
        <div className="promo-dots">
          {banners.map((_, i) => (
            <button
              key={i}
              type="button"
              className={`dot ${i === active ? 'dot-active' : ''}`}
              onClick={() => setActive(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PromoBanner;