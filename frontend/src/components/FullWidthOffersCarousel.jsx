import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Tag, ArrowRight, Maximize2, X, Download } from 'lucide-react';
import api, { resolveAssetUrl } from '../services/api';

const DEFAULT_OFFER_SLIDES = [
  {
    id: 'slide-menu-board',
    tag: 'OFFICIAL CAMPUS MENU',
    title: 'LA ROCHE ALL-DAY MENU',
    subtitle: 'From Bombay toasties & 8-inch flatbread pizzas to waffles, pasta, coolers & cold coffee. Booting up with caffeine; processing snacks at maximum capacity.',
    ctaText: 'ORDER ONLINE',
    ctaLink: '#category-rail-section',
    bgGradient: 'from-[#140D09] via-[#24150E] to-[#120B07]',
    textColor: 'text-white',
    badgeBg: 'bg-[#A6472B] text-white',
    accentColor: '#A6472B',
    imageUrl: '/laroche-menu-board.jpg',
    isMenuBoard: true,
  },
  {
    id: 'slide-1',
    tag: 'LIMITED TIME CAMPUS OFFER',
    title: 'GIFTS, FOR YOU!',
    subtitle: 'Brewtifully crafted with love, filled with indulgence. Pair any artisanal sourdough toastie with a signature brew.',
    ctaText: 'EXPLORE THE COLLECTION',
    ctaLink: '#category-rail-section',
    bgGradient: 'from-[#1A120B] via-[#2E1A11] to-[#120B07]',
    textColor: 'text-white',
    badgeBg: 'bg-[#A6472B] text-white',
    accentColor: '#A6472B',
    // High-res cafe composition
    imageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1600&q=80',
  },
  {
    id: 'slide-2',
    tag: 'SPECIALTY COFFEE ROASTS',
    title: 'OUR PASSION IS IN OUR COFFEE',
    subtitle: 'Single-origin Arabica beans, frothed velvety milk, and freshly ground handcrafted espresso.',
    ctaText: 'VIEW OUR MENU',
    ctaLink: '#category-rail-section',
    bgGradient: 'from-[#241711] via-[#3B2216] to-[#170E0A]',
    textColor: 'text-white',
    badgeBg: 'bg-[#E07A5F] text-white',
    accentColor: '#E07A5F',
    imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1600&q=80',
  },
  {
    id: 'slide-3',
    tag: 'COMBO SAVINGS • 25% OFF',
    title: 'THE CHEMBUR CRUNCH DEAL',
    subtitle: 'Get 25% off when you pair any Paneer Tikka or Cheese Melt Toast with Belgian Chocolate Shake.',
    ctaText: 'ORDER COMBO NOW',
    ctaLink: '#category-rail-section',
    bgGradient: 'from-[#1D1A16] via-[#2F2920] to-[#14120E]',
    textColor: 'text-white',
    badgeBg: 'bg-[#A6472B] text-white',
    accentColor: '#A6472B',
    imageUrl: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=1600&q=80',
  },
];

const FullWidthOffersCarousel = ({ onExploreClick }) => {
  const [slides, setSlides] = useState(DEFAULT_OFFER_SLIDES);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const touchStartX = useRef(null);

  // Fetch dynamic banners uploaded by cafe staff from CMS
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await api.get('/cms/banners');
        if (Array.isArray(res.data) && res.data.length > 0) {
          const cmsSlides = res.data
            .filter((b) => b.isActive !== false)
            .map((b, i) => ({
              id: b._id || `cms_${i}`,
              tag: b.tag || 'SPECIAL CAFE OFFER',
              title: b.title || 'Artisanal Cafe Special',
              subtitle: b.subtitle || 'Freshly prepared and ready for express counter pickup.',
              ctaText: 'EXPLORE MENU',
              ctaLink: '#category-rail-section',
              imageUrl: resolveAssetUrl(b.imageUrl) || DEFAULT_OFFER_SLIDES[i % DEFAULT_OFFER_SLIDES.length].imageUrl,
              bgGradient: 'from-[#1A120B] via-[#2E1A11] to-[#120B07]',
              textColor: 'text-white',
              badgeBg: 'bg-[#A6472B] text-white',
            }));

          setSlides([...cmsSlides, ...DEFAULT_OFFER_SLIDES]);
        }
      } catch (err) {
        // Fallback to default high-res slides
      }
    };

    fetchBanners();
  }, []);

  // Auto-advance timer (5.5s)
  useEffect(() => {
    if (isHovered || slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [slides.length, isHovered]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 50) handleNext();
    if (diff < -50) handlePrev();
    touchStartX.current = null;
  };

  const scrollToMenu = () => {
    if (onExploreClick) {
      onExploreClick();
    } else {
      const target = document.getElementById('category-rail-section') || document.getElementById('menu-content');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const currentSlide = slides[currentIndex] || slides[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 my-6">
      <section
        className="relative w-full h-[320px] sm:h-[400px] md:h-[450px] rounded-3xl overflow-hidden select-none bg-[#120B07] shadow-warm-xl border border-[#ECD5A5]/60 dark:border-[#3D312A]"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        aria-label="Cafe Offers and Promotions Carousel"
      >
        {/* Slides Track */}
      {slides.map((slide, index) => {
        const isActive = index === currentIndex;
        return (
          <div
            key={slide.id || index}
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
              isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            {/* Background Image / Split Backdrop */}
            <div className="absolute inset-0 w-full h-full">
              <img
                src={slide.imageUrl}
                alt={slide.title}
                className="w-full h-full object-cover object-center scale-105 transition-transform duration-10000"
              />
              {/* Gradient Vignette for perfect text readability (matching Image 3) */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/30 md:from-black/80 md:via-black/40 md:to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
            </div>

            {/* Slide Text Content */}
            <div className="relative z-20 h-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-14 flex flex-col justify-center items-start">
              <div className="max-w-2xl text-left">
                {/* Offer Eyebrow Tag */}
                <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-[0.18em] shadow-md mb-4 sm:mb-6 animate-pulse-subtle ${slide.badgeBg || 'bg-[#A6472B] text-white'}`}>
                  <Tag className="w-3.5 h-3.5 fill-current" />
                  <span>{slide.tag}</span>
                </div>

                {/* Main Headline (like Image 3 typography) */}
                <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-black text-white tracking-tight leading-[1.08] mb-4 sm:mb-6 drop-shadow-lg">
                  {slide.title}
                </h1>

                {/* Subtitle */}
                <p className="text-sm sm:text-base md:text-lg text-stone-200 font-medium leading-relaxed max-w-xl mb-6 sm:mb-8 drop-shadow font-sans">
                  {slide.subtitle}
                </p>

                {/* Action CTA Buttons */}
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={scrollToMenu}
                    className="inline-flex items-center gap-2.5 px-6 sm:px-8 py-3.5 sm:py-4 rounded-full bg-[#A6472B] hover:bg-[#7E351F] text-white text-xs sm:text-sm font-black uppercase tracking-[0.16em] shadow-warm-xl transition-all hover:scale-105 active:scale-95 group cursor-pointer border border-white/20"
                  >
                    <span>{slide.ctaText || 'EXPLORE MENU'}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>

                  {slide.isMenuBoard && (
                    <button
                      type="button"
                      onClick={() => setShowMenuModal(true)}
                      className="inline-flex items-center gap-2 px-5 sm:px-6 py-3.5 sm:py-4 rounded-full bg-white/20 hover:bg-white/35 backdrop-blur-md text-white text-xs sm:text-sm font-bold uppercase tracking-wider border border-white/30 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-lg"
                    >
                      <Maximize2 className="w-4 h-4" />
                      <span>View Full Board</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Left Navigation Arrow (Matching Image 3 circular button) */}
      <button
        type="button"
        onClick={handlePrev}
        className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-stone-900/40 hover:bg-stone-900/80 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-90 shadow-xl cursor-pointer"
        aria-label="Previous Offer Slide"
      >
        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
      </button>

      {/* Right Navigation Arrow (Matching Image 3 circular button) */}
      <button
        type="button"
        onClick={handleNext}
        className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-stone-900/40 hover:bg-stone-900/80 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-90 shadow-xl cursor-pointer"
        aria-label="Next Offer Slide"
      >
        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
      </button>

      {/* Slide Indicators / Dots (Matching Image 3 bottom indicator pill & dots) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
        {slides.map((_, dotIdx) => (
          <button
            key={dotIdx}
            type="button"
            onClick={() => setCurrentIndex(dotIdx)}
            className={`transition-all duration-300 rounded-full cursor-pointer ${
              dotIdx === currentIndex
                ? 'w-6 h-2.5 bg-[#A6472B]'
                : 'w-2.5 h-2.5 bg-white/50 hover:bg-white/80'
            }`}
            aria-label={`Go to slide ${dotIdx + 1}`}
          />
        ))}
      </div>
    </section>

    {/* High-Resolution Full-Screen Menu Board Lightbox */}
    {showMenuModal && (
      <div 
        className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-3 sm:p-6"
        onClick={() => setShowMenuModal(false)}
      >
        <div 
          className="relative max-w-5xl w-full bg-[#1A120B] rounded-2xl border border-stone-700 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="p-4 sm:p-5 border-b border-stone-800 flex items-center justify-between bg-black/40">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-[#A6472B]" />
              <h3 className="font-serif font-bold text-base sm:text-lg text-white">
                La Roche Cafe — Official Menu Board
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <a
                href="/laroche-menu-board.jpg"
                download="LaRoche-Menu-Board.jpg"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full hover:bg-white/10 text-stone-300 hover:text-white transition-colors"
                title="Download / Open Full-Res Image"
              >
                <Download className="w-5 h-5" />
              </a>
              <button
                type="button"
                onClick={() => setShowMenuModal(false)}
                className="p-2 rounded-full hover:bg-white/10 text-stone-300 hover:text-white transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Scrollable / Zoomable High-Res Image Container */}
          <div className="overflow-auto p-2 sm:p-4 flex items-center justify-center bg-black/60">
            <img
              src="/laroche-menu-board.jpg"
              alt="La Roche Cafe Official Menu Board"
              className="max-w-full h-auto rounded-lg shadow-2xl object-contain cursor-zoom-in"
            />
          </div>

          {/* Modal Footer */}
          <div className="p-3 sm:p-4 border-t border-stone-800 bg-black/40 flex items-center justify-between text-xs text-stone-400">
            <span>Campus Cafe Wing • SAKEC Campus</span>
            <button
              type="button"
              onClick={() => {
                setShowMenuModal(false);
                scrollToMenu();
              }}
              className="px-5 py-2 rounded-full bg-[#A6472B] hover:bg-[#7E351F] text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
            >
              Order Items Online
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
  );
};

export default FullWidthOffersCarousel;
