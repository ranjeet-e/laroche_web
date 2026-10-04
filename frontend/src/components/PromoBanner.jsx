import { useState, useEffect } from 'react';
import { Sparkles, Zap, Flame, Coffee, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import api, { resolveAssetUrl } from '../services/api';
import './PromoBanner.css';

const DEFAULT_BANNERS = [
  {
    id: 1,
    tag: '⚡ SKIP THE QUEUE',
    title: 'Preorder Ahead & Grab Instantly',
    subtitle: 'Order during class, pickup hot & fresh at the counter without standing in lines.',
    bg: 'bg-[#2A2A22]',
    icon: <Zap className="w-10 h-10 sm:w-12 sm:h-12 text-honey-light" />,
    badgeColor: 'bg-terracotta text-white',
  },
  {
    id: 2,
    tag: '🔥 ARTISANAL COMBOS',
    title: 'Flat 20% Off on Sourdough Toasties & Shakes',
    subtitle: 'Pair our signature Paneer Tikka Toast with Belgian Chocolate Shake.',
    bg: 'bg-[#2E201B]',
    icon: <Flame className="w-10 h-10 sm:w-12 sm:h-12 text-amber-200" />,
    badgeColor: 'bg-white text-terracotta',
  },
  {
    id: 3,
    tag: '☕ SPECIALTY ROASTS',
    title: 'Freshly Pulled Espresso & Cold Frappes',
    subtitle: 'Crafted with premium Arabica beans, frothed milk, and signature syrups.',
    bg: 'bg-[#24211D]',
    icon: <Coffee className="w-10 h-10 sm:w-12 sm:h-12 text-honey" />,
    badgeColor: 'bg-[#F2EDE2] text-[#2A2A22]',
  },
];

const PromoBanner = () => {
  const [banners, setBanners] = useState(DEFAULT_BANNERS);
  const [active, setActive] = useState(0);

  // Fetch live banners from In-House CMS or Cloudinary
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        let resData = [];
        try {
          const cmsRes = await api.get('/cms/banners');
          if (Array.isArray(cmsRes.data) && cmsRes.data.length > 0) {
            resData = cmsRes.data;
          }
        } catch (cmsErr) {
          const fallbackRes = await api.get('/upload/banners');
          if (Array.isArray(fallbackRes.data) && fallbackRes.data.length > 0) {
            resData = fallbackRes.data;
          }
        }

        if (resData.length > 0) {
          const formattedBanners = resData.map((b, i) => ({
            id: b._id || `cld_${b.id || i}`,
            tag: b.tag || '🔥 PROMO SPECIAL',
            title: b.title || 'Artisanal Cafe Special',
            subtitle: b.subtitle || 'Freshly prepared and ready for counter pickup.',
            imageUrl: resolveAssetUrl(b.imageUrl),
            bg: 'bg-[#2A2A22]',
            icon: <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-honey" />,
            badgeColor: 'bg-terracotta text-white',
          }));
          setBanners([...formattedBanners, ...DEFAULT_BANNERS]);
        }
      } catch (err) {
        // Fallback gracefully to default banners
      }
    };

    fetchBanners();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % banners.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [banners.length]);

  const handlePrev = () => {
    setActive((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActive((prev) => (prev + 1) % banners.length);
  };

  const current = banners[active] || banners[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 my-6">
      <div
        className={`relative overflow-hidden rounded-3xl p-6 sm:p-8 md:p-10 ${current.bg} text-white shadow-warm-lg transition-all duration-500`}
      >
        {/* If banner has a Cloudinary image, display as artistic background backdrop */}
        {current.imageUrl && (
          <div className="absolute inset-0 z-0">
            <img
              src={current.imageUrl}
              alt={current.title}
              className="w-full h-full object-cover opacity-25 filter blur-[1px] scale-105"
            />
            <div className="absolute inset-0 bg-black/60" />
          </div>
        )}

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="max-w-xl">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider mb-3 shadow-sm ${current.badgeColor}`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{current.tag}</span>
            </span>
            <h3 className="text-xl sm:text-2xl md:text-3xl font-serif font-medium tracking-tight text-white leading-snug">
              {current.title}
            </h3>
            <p className="text-stone-300 text-xs sm:text-sm mt-2 leading-relaxed font-sans font-normal">
              {current.subtitle}
            </p>
          </div>

          <div className="hidden sm:flex items-center justify-center p-3 sm:p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 self-start md:self-auto shadow-inner overflow-hidden max-w-[120px] max-h-[120px]">
            {current.imageUrl ? (
              <img
                src={current.imageUrl}
                alt={current.title}
                className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl shadow-md"
              />
            ) : (
              current.icon
            )}
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
