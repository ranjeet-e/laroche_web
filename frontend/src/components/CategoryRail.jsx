import { useRef, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './CategoryRail.css';

// Category metadata with authentic dish image assets
const categoryMeta = {
  'Sandwiches': {
    label: 'Sandwiches',
    image: '/menu-items/2_3_veg_sandwich_grill.png',
  },
  'Flatbread Pizza': {
    label: 'Pizza',
    image: '/category-icons/pizza.png',
  },
  'Pasta': {
    label: 'Pasta',
    image: '/category-icons/pasta.png',
  },
  'Maggie': {
    label: 'Maggi',
    image: '/category-icons/maggi.png',
  },
  'Quick Bites & Café Snacks': {
    label: 'Quick Bites',
    image: '/category-icons/fries.png',
  },
  'Chat Counter': {
    label: 'Chat Counter',
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
    label: 'Waffles',
    image: 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=400&auto=format&fit=crop&q=80',
  },
  'Mocktails & Coolers': {
    label: 'Coolers',
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
      setCanScrollLeft(scrollLeft > 15);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 15);
    }
  };

  const handleScroll = (direction) => {
    if (railRef.current) {
      railRef.current.scrollBy({ left: direction * 240, behavior: 'smooth' });
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

  // Center active category in the rail horizontally as user scrolls the screen
  useEffect(() => {
    if (railRef.current && activeCategory) {
      const container = railRef.current;
      const activeEl = container.querySelector(`[data-category-pill="${activeCategory}"]`);
      if (activeEl) {
        const targetLeft =
          activeEl.offsetLeft - container.clientWidth / 2 + activeEl.clientWidth / 2;
        container.scrollTo({ left: Math.max(0, targetLeft), behavior: 'smooth' });
      }
      setTimeout(checkScrollability, 350);
    }
  }, [activeCategory]);

  return (
    <div
      id="category-rail-section"
      className="sticky top-[calc(62px+max(env(safe-area-inset-top,0px),10px))] sm:top-[72px] z-30 w-full bg-[#F2EDE2]/95 dark:bg-[#1A1A14]/95 backdrop-blur-md border-b border-[#DDD4C0] dark:border-[#3D3D30] py-2 sm:py-3 shadow-warm-sm transition-all"
    >
      <div className="max-w-7xl mx-auto px-2 sm:px-6 relative flex items-center">
        {/* Floating Left Scroll Arrow */}
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => handleScroll(-1)}
            className="absolute left-1 sm:left-3 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/95 dark:bg-[#2B2421]/95 backdrop-blur-md border border-stone-200/90 dark:border-stone-700 shadow-warm-md text-espresso dark:text-[#F5EBE6] hover:bg-white hover:scale-110 active:scale-95 transition-all cursor-pointer"
            aria-label="Scroll categories left"
          >
            <ChevronLeft className="w-4 h-4 text-espresso dark:text-stone-100" />
          </button>
        )}

        {/* Horizontal Circular Category Track */}
        <div
          ref={railRef}
          className="flex items-start gap-2.5 sm:gap-5 md:gap-6 overflow-x-auto no-scrollbar scroll-smooth py-1 px-2 sm:px-3 flex-1"
        >
          {allCategoryPills.map((pill) => {
            const isActive = activeCategory === pill.key;
            return (
              <button
                key={pill.key}
                type="button"
                data-category-pill={pill.key}
                onClick={() => onSelectCategory(pill.key)}
                className="group flex flex-col items-center flex-shrink-0 cursor-pointer focus:outline-none transition-transform duration-200 active:scale-95 w-16 sm:w-20 md:w-24"
              >
                {/* Circular Dish Image */}
                <div
                  className={`w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full overflow-hidden bg-white dark:bg-[#2B2421] shadow-warm-sm transition-all duration-200 p-0.5 ${
                    isActive
                      ? 'ring-2.5 sm:ring-3 ring-[#A6472B] ring-offset-2 ring-offset-[#F2EDE2] dark:ring-offset-[#1A1A14] scale-105 shadow-warm-md'
                      : 'border-2 border-stone-200/80 dark:border-stone-700/80 group-hover:border-[#A6472B]/60 group-hover:scale-105'
                  }`}
                >
                  <img
                    src={pill.image}
                    alt={pill.label}
                    className="w-full h-full object-cover rounded-full transition-transform duration-300 group-hover:scale-110"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/category-icons/pizza.png';
                    }}
                  />
                </div>

                {/* Category Label */}
                <span
                  className={`mt-1.5 text-[11px] sm:text-xs md:text-sm font-bold tracking-tight text-center leading-tight transition-colors line-clamp-1 ${
                    isActive
                      ? 'text-[#A6472B] font-extrabold'
                      : 'text-[#2A2A22] dark:text-stone-200 group-hover:text-[#A6472B]'
                  }`}
                >
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
            className="absolute right-1 sm:right-3 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/95 dark:bg-[#2B2421]/95 backdrop-blur-md border border-stone-200/90 dark:border-stone-700 shadow-warm-md text-espresso dark:text-[#F5EBE6] hover:bg-white hover:scale-110 active:scale-95 transition-all cursor-pointer"
            aria-label="Scroll categories right"
          >
            <ChevronRight className="w-4 h-4 text-espresso dark:text-stone-100" />
          </button>
        )}
      </div>
    </div>
  );
};

export default CategoryRail;
