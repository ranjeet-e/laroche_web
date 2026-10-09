import { useState, useRef, useEffect } from 'react';
import { ArrowDown, Sparkles, Clock } from 'lucide-react';
import './HeroSection.css';

const HeroSection = ({ onExploreClick }) => {
  const [isVideoReady, setIsVideoReady] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
      videoRef.current.playsInline = true;
      videoRef.current.setAttribute('muted', '');
      videoRef.current.setAttribute('playsinline', '');
      videoRef.current.setAttribute('webkit-playsinline', 'true');

      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsVideoReady(true);
          })
          .catch(() => {
            const handleFirstGesture = () => {
              if (videoRef.current) {
                videoRef.current.defaultMuted = true;
                videoRef.current.muted = true;
                videoRef.current.play().then(() => setIsVideoReady(true)).catch(() => {});
              }
            };
            window.addEventListener('touchstart', handleFirstGesture, { once: true, passive: true });
            window.addEventListener('click', handleFirstGesture, { once: true, passive: true });
          });
      }
    }
  }, []);

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
    <section className="relative w-full h-[88vh] min-h-[580px] max-h-[820px] overflow-hidden bg-espresso dark:bg-[#14100E] flex items-center justify-center">
      {/* Background B-Roll Video with smooth fade-in */}
      <video
        ref={videoRef}
        src="/intro.mp4"
        preload="auto"
        autoPlay
        loop
        muted
        playsInline
        onPlaying={() => setIsVideoReady(true)}
        onCanPlay={() => setIsVideoReady(true)}
        webkit-playsinline="true"
        x5-playsinline="true"
        disablePictureInPicture
        disableRemotePlayback
        tabIndex={-1}
        controls={false}
        controlsList="nodownload nofullscreen noremoteplayback"
        className={`absolute inset-0 w-full h-full object-cover hero-video-mask scale-105 pointer-events-none select-none transition-opacity duration-1000 ${
          isVideoReady ? 'opacity-60' : 'opacity-0'
        }`}
      />


      {/* Dark Ambient & Warm Vignette Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40 pointer-events-none" />

      {/* Hero Content Overlay */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center flex flex-col items-center pt-8">
        
        {/* Fresh Brewed Glass Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 dark:bg-stone-900/90 backdrop-blur-md shadow-warm-md text-espresso dark:text-stone-100 text-xs md:text-sm font-semibold tracking-wide mb-6 border border-white/70 dark:border-stone-700/80 animate-pulse-subtle">
          <Sparkles className="w-4 h-4 text-terracotta fill-terracotta" />
          <span>Freshly Brewed & Prepared • Skip the Lunch Rush</span>
        </div>

        {/* Cinematic Headline */}
        <h1 className="text-hero font-serif font-medium text-white tracking-tight leading-[1.12] mb-6 drop-shadow-md">
          Crafted for the Hustle. <br />
          <span className="font-serif italic font-normal text-honey-light">Brewed for the Break.</span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-2xl text-stone-200 text-sm sm:text-base md:text-lg font-normal leading-relaxed mb-8 drop-shadow font-sans">
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

          <div className="inline-flex items-center gap-2 px-5 py-3.5 rounded-full bg-black/50 dark:bg-black/70 backdrop-blur-md text-stone-100 text-xs sm:text-sm font-medium border border-white/20">
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
      <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-oat dark:from-[#1A1718] via-oat/70 dark:via-[#1A1718]/70 to-transparent pointer-events-none" />
    </section>
  );
};

export default HeroSection;
