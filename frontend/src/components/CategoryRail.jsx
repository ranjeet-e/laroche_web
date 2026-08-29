import { useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Flame } from 'lucide-react';
import './CategoryRail.css';

// Friendly category emoji & icon mapping
const categoryMeta = {
  'Popular': { label: 'Popular', icon: '🔥', key: 'popular' },
  'Hot Beverages': { label: 'Hot Brews', icon: '☕' },
  'Cold Beverages': { label: 'Cold Shakes & Frappes', icon: '🧋' },
  'Sandwiches': { label: 'Artisan Toasties', icon: '🥪' },
  'Flatbread Pizza': { label: 'Flatbread Pizza', icon: '🍕' },
  'Pasta': { label: 'Artisanal Pasta', icon: '🍝' },
  'Maggie': { label: 'Maggi Lounge', icon: '🍜' },
  'Waffles': { label: 'Waffles & Treats', icon: '🧇' },
  'Quick Bites & Café Snacks': { label: 'Quick Bites', icon: '🍟' },
  'Chat Counter': { label: 'Chat Counter', icon: '🥗' },
  'Mocktails & Coolers': { label: 'Coolers & Juices', icon: '🍹' },
};

const CategoryRail = ({ categories = [], activeCategory = '', onSelectCategory }) => {
  const railRef = useRef(null);

  const allCategoryPills = [
    { key: 'popular', label: 'Popular Right Now', icon: '🔥' },
    ...categories.map((cat) => ({
      key: cat,
      label: categoryMeta[cat]?.label || cat,
      icon: categoryMeta[cat]?.icon || '🍽️',
    })),
  ];

  const handleScroll = (direction) => {
    if (railRef.current) {
      railRef.current.scrollBy({ left: direction * 280, behavior: 'smooth' });
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
    <div id="category-rail-section" className="sticky top-[72px] z-30 w-full py-3 bg-[#FAF7F2]/90 backdrop-blur-md border-b border-stone-200/60 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative flex items-center">
        
        {/* Left Scroll Arrow */}
        <button
          type="button"
          onClick={() => handleScroll(-1)}
          className="hidden md:flex items-center justify-center w-8 h-8 rounded-full bg-white border border-stone-200 shadow-warm-sm text-espresso hover:bg-stone-50 transition-all mr-2 flex-shrink-0"
          aria-label="Scroll categories left"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Horizontal Category Track */}
        <div
          ref={railRef}
          className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1 px-1 flex-1"
        >
          {allCategoryPills.map((pill) => {
            const isActive = activeCategory === pill.key;
            return (
              <button
                key={pill.key}
                type="button"
                data-category-pill={pill.key}
                onClick={() => onSelectCategory(pill.key)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold tracking-wide whitespace-nowrap transition-all duration-200 flex-shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-espresso text-white shadow-warm-md scale-[1.02]'
                    : 'bg-white text-taupe hover:text-espresso border border-stone-200/80 hover:border-stone-300 hover:bg-stone-50/80 shadow-warm-sm'
                }`}
              >
                <span className="text-sm">{pill.icon}</span>
                <span>{pill.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Scroll Arrow */}
        <button
          type="button"
          onClick={() => handleScroll(1)}
          className="hidden md:flex items-center justify-center w-8 h-8 rounded-full bg-white border border-stone-200 shadow-warm-sm text-espresso hover:bg-stone-50 transition-all ml-2 flex-shrink-0"
          aria-label="Scroll categories right"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

      </div>
    </div>
  );
};

export default CategoryRail;
