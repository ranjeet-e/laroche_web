import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import FoodCard from '../components/FoodCard.jsx';
import { useCart } from '../context/CartContext.jsx';
import FeaturedCarousel from '../components/FeaturedCarousel';
import PromoBanner from '../components/PromoBanner';
import './Menu.css';

const categoryIcons = {
  'Sandwiches': '/category-icons/sandwich.jpg',
  'Flatbread Pizza': '/category-icons/pizza.png',
  'Quick Bites & Café Snacks': '/category-icons/fries.png',
  'Chat Counter': '/category-icons/chat_corner.png',
  'Maggie': '/category-icons/maggi.png',
  'Pasta': '/category-icons/pasta.png',
  'Mocktails & Coolers': '/category-icons/mocktails.png',
  'Cold Beverages': '/category-icons/cold_beverages.webp',
  'Waffles': '/category-icons/waffles.jpg',
  'Hot Beverages': '/category-icons/hot_breverages.png',
};

const Menu = () => {
  const [items, setItems] = useState([]);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const [activeCategory, setActiveCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { totalItems, totalAmount } = useCart();
  const navigate = useNavigate();
  const sectionRefs = useRef({});
  const categoryScrollRef = useRef(null);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await api.get('/menu');
        setItems(response.data);
      } catch (err) {
        setError('Could not load the menu. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, []);

  const categories = useMemo(() => {
    return [...new Set(items.map((item) => item.category))].filter((c) => c !== 'Add-ons');
  }, [items]);

  const groupedItems = useMemo(() => {
    const groups = {};
    categories.forEach((cat) => {
      groups[cat] = items.filter((item) => item.category === cat);
    });
    return groups;
  }, [items, categories]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase();
    return items.filter((item) => item.name.toLowerCase().includes(q));
  }, [items, searchQuery]);

  useEffect(() => {
    if (categories.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveCategory(entry.target.dataset.category);
          }
        });
      },
      { rootMargin: '-120px 0px -70% 0px' }
    );

    Object.values(sectionRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [categories]);

  const scrollToCategory = (cat) => {
    sectionRefs.current[cat]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const scrollCategories = (direction) => {
    if (categoryScrollRef.current) {
      categoryScrollRef.current.scrollBy({ left: direction * 300, behavior: 'smooth' });
    }
  };

  if (loading) return <div className="menu-loading">Loading menu...</div>;

  if (error) {
    return (
      <div className="menu-error">
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="menu-empty">
        <p>Menu is currently being updated. Check back soon!</p>
      </div>
    );
  }

  return (
    <div className="menu-page">
      <div className="menu-hero-banner">
        <div className="hero-badge-pill">
          <span className="badge-sparkle">✨</span>
          <span>Freshly Prepared • Skip The Canteen Queue</span>
        </div>
        <div className="hero-greeting-wrap">
          <h1 className="hero-title">
            Hey there, <span className="hero-gradient-text">what are you craving?</span> 👋
          </h1>
          <p className="hero-subtitle">
            Order in advance, grab your meal hot & fresh at the counter.
          </p>
        </div>

        {/* Quick Filter Chips */}
        <div className="quick-chips-row">
          {['Sandwiches', 'Flatbread Pizza', 'Quick Bites & Café Snacks', 'Hot Beverages', 'Cold Beverages', 'Maggie'].map((tag) => (
            <button
              key={tag}
              type="button"
              className={`quick-chip ${activeCategory === tag ? 'chip-active' : ''}`}
              onClick={() => scrollToCategory(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {!searchQuery && <PromoBanner />}
      {!searchQuery && <FeaturedCarousel items={items} />}

      {searchQuery ? (
        <div className="search-results">
          <h2 className="section-title">
            {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{searchQuery}"
          </h2>
          {searchResults.length === 0 ? (
            <div className="search-empty-state">
              <span className="empty-icon">🔍</span>
              <h3>No dishes match "{searchQuery}"</h3>
              <p>Try searching for sandwich, coffee, pizza or maggie!</p>
            </div>
          ) : (
            <div className="food-grid">
              {searchResults.map((item) => (
                <FoodCard key={item._id} item={item} allItems={items} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="category-scroll-wrap">
            <button 
              type="button" 
              className="scroll-arrow scroll-arrow-left" 
              onClick={() => scrollCategories(-1)}
              aria-label="Scroll left"
            >
              ‹
            </button>
            <div className="category-circle-row" ref={categoryScrollRef}>
              {categories.map((cat) => (
                <div
                  key={cat}
                  className={`category-circle-item ${activeCategory === cat ? 'circle-active' : ''}`}
                  onClick={() => scrollToCategory(cat)}
                >
                  <img 
                    src={categoryIcons[cat] || '/placeholder-food.png'} 
                    alt={cat} 
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/placeholder-food.png';
                    }}
                  />
                  <span>{cat}</span>
                </div>
              ))}
            </div>
            <button 
              type="button" 
              className="scroll-arrow scroll-arrow-right" 
              onClick={() => scrollCategories(1)}
              aria-label="Scroll right"
            >
              ›
            </button>
          </div>

          {categories.map((cat) => (
            <div
              key={cat}
              className="menu-section"
              data-category={cat}
              ref={(el) => (sectionRefs.current[cat] = el)}
            >
              <h2 className="section-title">{cat}</h2>
              <div className="food-grid">
                {groupedItems[cat].map((item) => (
                  <FoodCard key={item._id} item={item} allItems={items} />
                ))}
              </div>
            </div>
          ))}
        </>
      )}

      {totalItems > 0 && (
        <div className="floating-cart-bar" onClick={() => navigate('/cart')}>
          <span>{totalItems} item{totalItems > 1 ? 's' : ''} | ₹{totalAmount}</span>
          <span className="cart-cta">Proceed to Pay →</span>
        </div>
      )}
    </div>
  );
};

export default Menu;
