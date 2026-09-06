import { useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Flame } from 'lucide-react';
import './CategoryRail.css';

// Clean Category metadata with real image assets matching Inspiration style
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

  const allCategoryPills = categories.map((cat) => ({
    key: cat,
    label: categoryMeta[cat]?.label || cat,
    image: categoryMeta[cat]?.image || '/category-icons/pizza.png',
  }));

  const handleScroll = (direction) => {
    if (railRef.current) {
      railRef.current.scrollBy({ left: direction * 300, behavior: 'smooth' });
    }
  };

  // Center the active category in the rail on change
  useEffect(() => {
    if (railRef.current && activeCategory) {
      const activeEl = railRef.current.querySelector(`[data-category-pill="${activeCategory}"]`);
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [activeCategory]);

  return (
    <div id="category-rail-section" className="sticky top-[72px] z-30 w-full py-4 bg-[#F5EBE6]/95 dark:bg-[#1A1718]/95 backdrop-blur-md border-b border-[#E5D7D0] dark:border-[#4A3B32] shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative flex items-center">
        
        {/* Left Scroll Arrow */}
        <button
          type="button"
          onClick={() => handleScroll(-1)}
          className="hidden md:flex items-center justify-center w-9 h-9 rounded-full bg-white dark:bg-[#2B2421] border border-[#E5D7D0] dark:border-[#4A3B32] shadow-warm-sm text-espresso dark:text-[#F5EBE6] hover:bg-stone-50 dark:hover:bg-[#362E2A] transition-all mr-3 flex-shrink-0"
          aria-label="Scroll categories left"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Horizontal Circular Category Track (Large Zomato Inspiration Style) */}
        <div
          ref={railRef}
          className="flex items-start gap-4 sm:gap-6 md:gap-8 overflow-x-auto no-scrollbar scroll-smooth py-2 px-1 flex-1"
        >
          {allCategoryPills.map((pill) => {
            const isActive = activeCategory === pill.key;
            return (
              <button
                key={pill.key}
                type="button"
                data-category-pill={pill.key}
                onClick={() => onSelectCategory(pill.key)}
                className="group flex flex-col items-center flex-shrink-0 cursor-pointer focus:outline-none transition-transform duration-200 active:scale-95 w-20 sm:w-28 md:w-32"
              >
                {/* Large Circular Dish Image */}
                <div
                  className={`w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full overflow-hidden bg-white dark:bg-[#2B2421] shadow-warm-sm transition-all duration-200 p-0.5 ${
                    isActive
                      ? 'ring-3 sm:ring-4 ring-terracotta ring-offset-2 ring-offset-[#F5EBE6] dark:ring-offset-[#1A1718] scale-105 shadow-warm-md'
                      : 'border-2 border-stone-200/80 dark:border-stone-700/80 group-hover:border-terracotta/60 group-hover:scale-105'
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

                {/* Clear & Larger Category Label */}
                <span
                  className={`mt-2.5 text-sm sm:text-base font-bold tracking-tight text-center leading-snug transition-colors line-clamp-1 ${
                    isActive
                      ? 'text-terracotta font-extrabold'
                      : 'text-espresso dark:text-stone-200 group-hover:text-terracotta'
                  }`}
                >
                  {pill.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Scroll Arrow */}
        <button
          type="button"
          onClick={() => handleScroll(1)}
          className="hidden md:flex items-center justify-center w-9 h-9 rounded-full bg-white dark:bg-[#2B2421] border border-[#E5D7D0] dark:border-[#4A3B32] shadow-warm-sm text-espresso dark:text-[#F5EBE6] hover:bg-stone-50 dark:hover:bg-[#362E2A] transition-all ml-3 flex-shrink-0"
          aria-label="Scroll categories right"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

      </div>
    </div>
  );
};

export default CategoryRail;
