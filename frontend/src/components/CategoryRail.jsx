import { useRef, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './CategoryRail.css';

// Clean Category metadata with real image assets
const categoryMeta = {
  'Sandwiches': {
    label: 'Sandwiches',
    image: '/menu-items/2_3_veg_sandwich_grill.png',
  },
  'Flatbread Pizza': {
    label: 'Woodfired Pizza',
    image: '/category-icons/pizza.png',
  },
  'Pasta': {
    label: 'Artisanal Pasta',
    image: '/category-icons/pasta.png',
  },
  'Maggie': {
    label: 'Maggi Bowls',
    image: '/category-icons/maggi.png',
  },
  'Quick Bites & Café Snacks': {
    label: 'Quick Bites',
    image: '/category-icons/fries.png',
  },
  'Chat Counter': {
    label: 'Chaat Corner',
    image: '/category-icons/chat_corner.png',
  },
  'Cold Beverages': {
    label: 'Cold Shakes',
    image: '/category-icons/cold_beverages.webp',
  },
  'Hot Beverages': {
    label: 'Hot Brews',
    image: '/category-icons/hot_breverages.png',
  },
  'Waffles': {
    label: 'Belgian Waffles',
    image: 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=400&auto=format&fit=crop&q=80',
  },
  'Mocktails & Coolers': {
    label: 'Coolers & Mocktails',
    image: '/category-icons/mocktails.png',
  },
};

const CategoryRail = ({ categories = [], activeCategory = '', onSelectCategory }) => {
  const railRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const allCategoryPills = categories.map((cat) => ({
    key: cat,
    label: categoryMeta[cat]?.label || cat,
    image: categoryMeta[cat]?.image || '/category-icons/pizza.png',
  }));

  const checkScrollability = () => {
    if (railRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = railRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const handleScroll = (direction) => {
    if (railRef.current) {
      railRef.current.scrollBy({ left: direction * 220, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    checkScrollability();
    const rail = railRef.current;
    if (rail) {
      rail.addEventListener('scroll', checkScrollability, { passive: true });
      window.addEventListener('resize', checkScrollability);
      return () => {
        rail.removeEventListener('scroll', checkScrollability);
        window.removeEventListener('resize', checkScrollability);
      };
    }
  }, [categories]);

  // Center the active category in the rail horizontally as the user scrolls
  useEffect(() => {
    if (railRef.current && activeCategory) {
      const container = railRef.current;
      const activeEl = container.querySelector(`[data-category-pill="${activeCategory}"]`);
      if (activeEl) {
        const targetLeft =
          activeEl.offsetLeft - container.clientWidth / 2 + activeEl.clientWidth / 2;
        container.scrollTo({ left: Math.max(0, targetLeft), behavior: 'smooth' });
      }
      setTimeout(checkScrollability, 300);
    }
  }, [activeCategory]);

  return (
    <div
      id="category-rail-section"
      className="sticky top-[62px] sm:top-[72px] z-30 w-full bg-[#F2EDE2]/95 dark:bg-[#1A1A14]/95 backdrop-blur-md border-b border-[#DDD4C0] dark:border-[#3D3D30] py-2.5 sm:py-3 shadow-warm-sm transition-all"
    >
      <div className="max-w-7xl mx-auto px-2 sm:px-6 relative flex items-center">
        {/* Floating Left Scroll Arrow */}
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => handleScroll(-1)}
            className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 z-20 hidden sm:flex items-center justify-center w-8 h-8 rounded-full bg-white/95 dark:bg-[#2B2421]/95 border border-stone-200 dark:border-stone-700 shadow-warm-md text-espresso dark:text-white hover:scale-105 active:scale-95 transition-all cursor-pointer"
            aria-label="Scroll categories left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}

        {/* Horizontal Category Ribbon Track */}
        <div
          ref={railRef}
          className="flex items-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar scroll-smooth px-2 py-0.5 flex-1"
        >
          {allCategoryPills.map((pill) => {
            const isActive = activeCategory === pill.key;
            return (
              <button
                key={pill.key}
                type="button"
                data-category-pill={pill.key}
                onClick={() => onSelectCategory(pill.key)}
                className={`group flex items-center gap-2 sm:gap-2.5 px-3.5 py-2 rounded-2xl flex-shrink-0 cursor-pointer focus:outline-none transition-all duration-200 border ${
                  isActive
                    ? 'bg-[#A6472B] text-white border-[#A6472B] shadow-warm-md scale-[1.02]'
                    : 'bg-white dark:bg-[#23231C] text-[#2A2A22] dark:text-[#E8D8CD] border-[#DDD4C0] dark:border-[#3D3D30] hover:border-[#A6472B]/50 hover:bg-[#FAF7F2] dark:hover:bg-[#2F2F26]'
                }`}
              >
                {/* Category Thumbnail Image */}
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl overflow-hidden bg-[#E9E0CC] dark:bg-[#3D3D30] flex-shrink-0 shadow-inner">
                  <img
                    src={pill.image}
                    alt={pill.label}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/category-icons/pizza.png';
                    }}
                  />
                </div>

                {/* Category Label */}
                <span className="text-xs sm:text-sm font-bold whitespace-nowrap font-sans">
                  {pill.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Floating Right Scroll Arrow */}
        {canScrollRight && (
          <button
            type="button"
            onClick={() => handleScroll(1)}
            className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 z-20 hidden sm:flex items-center justify-center w-8 h-8 rounded-full bg-white/95 dark:bg-[#2B2421]/95 border border-stone-200 dark:border-stone-700 shadow-warm-md text-espresso dark:text-white hover:scale-105 active:scale-95 transition-all cursor-pointer"
            aria-label="Scroll categories right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default CategoryRail;
