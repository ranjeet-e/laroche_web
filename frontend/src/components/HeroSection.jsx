import { useRef } from 'react';
import { ArrowDown, Sparkles, Clock } from 'lucide-react';
import './HeroSection.css';

const HeroSection = ({ onExploreClick }) => {
  const videoRef = useRef(null);

  const handleScrollDown = () => {
    if (onExploreClick) {
      onExploreClick();
    } else {
      const target = document.getElementById('category-rail-section') || document.getElementById('menu-content');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <section className="relative w-full h-[88vh] min-h-[580px] max-h-[820px] overflow-hidden bg-espresso flex items-center justify-center">
      {/* Background B-Roll Video */}
      <video
        ref={videoRef}
        src="/intro.mp4"
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-60 hero-video-mask scale-105"
      />

      {/* Dark Ambient & Warm Vignette Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-oat via-transparent to-espresso/50 pointer-events-none" />

      {/* Hero Content Overlay */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center flex flex-col items-center pt-8">
        
        {/* Fresh Brewed Glass Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-pill shadow-warm-md text-espresso text-xs md:text-sm font-semibold tracking-wide mb-6 border border-white/60 animate-pulse-subtle">
          <Sparkles className="w-4 h-4 text-terracotta fill-terracotta" />
          <span>Freshly Brewed & Prepared • Skip the Lunch Rush</span>
        </div>

        {/* Cinematic Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-white tracking-tight leading-[1.12] mb-6 drop-shadow-md">
          Crafted for the Hustle. <br />
          <span className="italic font-normal text-honey-light">Brewed for the Break.</span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-2xl text-stone-200 text-sm sm:text-base md:text-lg font-light leading-relaxed mb-8 drop-shadow">
          Artisanal sourdough toasties, specialty single-origin coffees, stone-baked flatbreads & Belgian waffles — preordered in seconds, ready for counter pickup.
        </p>

        {/* Interactive Action Row */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            type="button"
            onClick={handleScrollDown}
            className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-terracotta hover:bg-terracotta-hover text-white font-bold text-sm sm:text-base shadow-glow-terracotta hover:shadow-warm-xl transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
          >
            <span>Explore Menu</span>
            <ArrowDown className="w-4 h-4 group-hover:translate-y-1 transition-transform duration-300" />
          </button>

          <div className="inline-flex items-center gap-2 px-5 py-3.5 rounded-full glass-dark text-stone-100 text-xs sm:text-sm font-medium border border-white/20">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <Clock className="w-3.5 h-3.5 text-stone-300 ml-0.5" />
            <span>Live Counter: <strong>~8 min prep</strong></span>
          </div>
        </div>

      </div>

      {/* Floating Bottom Smooth Gradient Transition into Oat Cream Base */}
      <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-oat via-oat/70 to-transparent pointer-events-none" />
    </section>
  );
};

export default HeroSection;
