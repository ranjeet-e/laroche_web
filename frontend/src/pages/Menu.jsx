import { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Sparkles } from 'lucide-react';
import api from '../services/api';
import FoodCard from '../components/FoodCard';
import HeroSection from '../components/HeroSection';
import CategoryRail from '../components/CategoryRail';
import FeaturedCarousel from '../components/FeaturedCarousel';
import PromoBanner from '../components/PromoBanner';
import CafeScheduleBanner from '../components/CafeScheduleBanner';
import FloatingOrderBar from '../components/FloatingOrderBar';
import './Menu.css';

const Menu = () => {
  const [items, setItems] = useState([]);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const [activeCategory, setActiveCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const sectionRefs = useRef({});

  useEffect(() => {
    // 1. Instant Cache-First Display: Load cached menu from localStorage if available
    try {
      const cached = localStorage.getItem('laroche_menu_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setItems(parsed);
          setLoading(false);
        }
      }
    } catch {
      // Ignore cache parse error and fallback to network
    }

    // 2. Background Revalidation: Fetch fresh data from API
    const fetchMenu = async () => {
      try {
        const response = await api.get('/menu');
        if (Array.isArray(response.data)) {
          setItems(response.data);
          localStorage.setItem('laroche_menu_cache', JSON.stringify(response.data));
        } else {
          console.warn('API returned non-array menu data:', response.data);
          setItems((current) => {
            if (!current || current.length === 0) {
              setError('Unable to load dishes. Please ensure the backend server is active.');
            }
            return current;
          });
        }
      } catch (err) {
        // Only display error UI if there's no cached data already rendering
        setItems((current) => {
          if (!current || current.length === 0) {
            setError('Could not load the menu. Please check connection and retry.');
          }
          return current;
        });
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, []);

  const categories = useMemo(() => {
    if (!Array.isArray(items) || items.length === 0) return [];
    return [...new Set(items.map((item) => item.category))].filter((c) => c && c !== 'Add-ons');
  }, [items]);

  useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0]);
    }
  }, [categories, activeCategory]);

  const groupedItems = useMemo(() => {
    if (!Array.isArray(items) || items.length === 0) return {};
    const groups = {};
    categories.forEach((cat) => {
      groups[cat] = items.filter((item) => item.category === cat);
    });
    return groups;
  }, [items, categories]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase();
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        (item.category && item.category.toLowerCase().includes(q))
    );
  }, [items, searchQuery]);

  // Track category scrolling with IntersectionObserver
  useEffect(() => {
    if (categories.length === 0 || searchQuery) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveCategory(entry.target.dataset.category);
          }
        });
      },
      { rootMargin: '-100px 0px -65% 0px' }
    );

    Object.values(sectionRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [categories, searchQuery]);

  const handleSelectCategory = (catKey) => {
    setActiveCategory(catKey);
    if (sectionRefs.current[catKey]) {
      sectionRefs.current[catKey].scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleExploreClick = () => {
    const target = document.getElementById('category-rail-section');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-oat px-4">
        <div className="w-12 h-12 rounded-full border-3 border-terracotta/20 border-t-terracotta animate-spin mb-4" />
        <p className="text-sm font-bold text-taupe tracking-wide animate-pulse">
          Crafting fresh menu...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-oat px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-4 text-2xl font-bold">
          ⚠️
        </div>
        <h3 className="text-xl font-bold text-espresso mb-2">Unable to Load Menu</h3>
        <p className="text-sm text-taupe max-w-sm mb-6">{error}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="px-6 py-2.5 rounded-full bg-espresso text-white font-bold text-sm shadow-warm-md hover:bg-espresso-light transition-all"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-oat pb-24">
      {/* 1. Full-Bleed Cinematic Hero Section (hidden when user is searching) */}
      {!searchQuery && <HeroSection onExploreClick={handleExploreClick} />}

      {/* 2. Promotional Highlight Banner */}
      {!searchQuery && <PromoBanner />}

      {/* 3. Dynamic "Popular Right Now" Curated Spotlight Carousel */}
      {!searchQuery && <FeaturedCarousel allItems={items} />}

      {/* 4. Unified Sticky Category Rail (Circular icons like Fig 3) */}
      {!searchQuery && (
        <CategoryRail
          categories={categories}
          activeCategory={activeCategory}
          onSelectCategory={handleSelectCategory}
        />
      )}

      {/* 5. Main Menu Content */}
      <main id="menu-content" className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {searchQuery ? (
          /* Search Results View */
          <div className="pt-4">
            <div className="flex items-center gap-2 mb-6">
              <Search className="w-5 h-5 text-terracotta" />
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-espresso">
                {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{searchQuery}"
              </h2>
            </div>

            {searchResults.length === 0 ? (
              <div className="py-20 text-center bg-white rounded-3xl border border-stone-200/80 shadow-warm-sm p-8 max-w-lg mx-auto">
                <span className="text-4xl mb-3 block">🔍</span>
                <h3 className="text-lg font-bold text-espresso mb-1">No dishes found</h3>
                <p className="text-xs sm:text-sm text-taupe mb-6">
                  We couldn't find anything matching "{searchQuery}". Try searching for pizza, sandwich, coffee, or pasta.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
                {searchResults.map((item) => (
                  <FoodCard key={item._id} item={item} allItems={items} />
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Categorized Food Grids */
          <div className="space-y-12 sm:space-y-16 mt-6">
            {categories.map((cat) => {
              const catItems = groupedItems[cat] || [];
              if (catItems.length === 0) return null;

              return (
                <section
                  key={cat}
                  data-category={cat}
                  ref={(el) => (sectionRefs.current[cat] = el)}
                  className="scroll-mt-20 sm:scroll-mt-24"
                >
                  {/* Category Header */}
                  <div className="flex items-end justify-between pb-3 mb-6 border-b border-stone-200/70">
                    <div>
                      <h2 className="text-section-head font-serif font-medium text-espresso tracking-tight">
                        {cat}
                      </h2>
                      <span className="text-xs font-medium text-taupe font-sans">
                        {catItems.length} freshly crafted item{catItems.length > 1 ? 's' : ''}
                      </span>
                    </div>

                    <div className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-terracotta">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span></span>
                    </div>
                  </div>

                  {/* Food Cards Grid (2-Column Mobile like Fig 1) */}
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
                    {catItems.map((item) => (
                      <FoodCard key={item._id} item={item} allItems={items} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </main>

      {/* 6. Persistent Floating Order Bar (when items > 0) */}
      <FloatingOrderBar />
    </div>
  );
};

export default Menu;