import { useState, useEffect, useRef } from 'react';
import { Sparkles, Zap, Flame, Coffee, ChevronLeft, ChevronRight } from 'lucide-react';
import './PromoBanner.css';

const banners = [
  {
    id: 1,
    tag: '⚡ SKIP THE QUEUE',
    title: 'Preorder Ahead & Grab Instantly',
    subtitle: 'Order during class, pickup hot & fresh at the counter without standing in lines.',
    bg: 'bg-gradient-to-r from-espresso via-espresso-light to-stone-900',
    icon: <Zap className="w-10 h-10 sm:w-12 sm:h-12 text-honey-light" />,
    badgeColor: 'bg-terracotta text-white',
  },
  {
    id: 2,
    tag: '🔥 ARTISANAL COMBOS',
    title: 'Flat 20% Off on Sourdough Toasties & Shakes',
    subtitle: 'Pair our signature Paneer Tikka Toast with Belgian Chocolate Shake.',
    bg: 'bg-gradient-to-r from-terracotta via-amber-700 to-amber-900',
    icon: <Flame className="w-10 h-10 sm:w-12 sm:h-12 text-amber-200" />,
    badgeColor: 'bg-white text-terracotta',
  },
  {
    id: 3,
    tag: '☕ SPECIALTY ROASTS',
    title: 'Freshly Pulled Espresso & Cold Frappes',
    subtitle: 'Crafted with premium Arabica beans, frothed milk, and signature syrups.',
    bg: 'bg-gradient-to-r from-[#2A1E1C] via-[#3D2C2A] to-[#1A1615]',
    icon: <Coffee className="w-10 h-10 sm:w-12 sm:h-12 text-honey" />,
    badgeColor: 'bg-honey text-espresso',
  },
];

const PromoBanner = () => {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handlePrev = () => {
    setActive((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActive((prev) => (prev + 1) % banners.length);
  };

  const current = banners[active];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 my-6">
      <div
        className={`relative overflow-hidden rounded-3xl p-6 sm:p-8 md:p-10 ${current.bg} text-white shadow-warm-lg transition-all duration-500`}
      >
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="max-w-xl">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider mb-3 shadow-sm ${current.badgeColor}`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{current.tag}</span>
            </span>
            <h3 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold tracking-tight text-white leading-snug">
              {current.title}
            </h3>
            <p className="text-stone-300 text-xs sm:text-sm mt-2 leading-relaxed">
              {current.subtitle}
            </p>
          </div>

          <div className="hidden sm:flex items-center justify-center p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 self-start md:self-auto shadow-inner">
            {current.icon}
          </div>
        </div>

        {/* Carousel controls & dots */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10 relative z-10">
          <div className="flex items-center gap-2">
            {banners.map((_, i) => (
              <button
                key={i}
                type="button"
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === active ? 'w-6 bg-white' : 'w-2 bg-white/30 hover:bg-white/50'
                }`}
                onClick={() => setActive(i)}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrev}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              aria-label="Previous banner"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              aria-label="Next banner"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromoBanner;