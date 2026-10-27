import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowDown } from 'lucide-react';
import './HeroSection.css';

const HeroSection = ({ onExploreClick }) => {
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [craving, setCraving] = useState('');
  const videoRef = useRef(null);
  const navigate = useNavigate();

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

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (craving.trim()) {
      navigate(`/menu?q=${encodeURIComponent(craving.trim())}`);
      const target = document.getElementById('category-rail-section') || document.getElementById('menu-content');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      handleScrollDown();
    }
  };

  return (
    <section className="relative w-full h-[88vh] min-h-[560px] max-h-[820px] overflow-hidden bg-espresso dark:bg-[#14100E] flex items-center justify-center pt-16 sm:pt-20 border-b-2 border-[#ECD5A5] dark:border-[#3D312A] shadow-md">
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
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/55 pointer-events-none" />

      {/* Hero Content Overlay */}
      <div className="relative z-10 max-w-4xl mx-auto px-5 sm:px-6 text-center flex flex-col items-center">
        
        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-black text-white tracking-tight leading-[1.08] mb-4 sm:mb-5 drop-shadow-md">
          Order Ahead. <br className="hidden sm:inline" />
          <span className="text-[#F7D070] italic font-normal">Skip the Queue.</span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-xl text-stone-200 text-sm sm:text-base md:text-lg font-normal leading-relaxed mb-7 sm:mb-8 drop-shadow font-sans">
          Browse the menu, order in seconds, and pick up your food &amp; iced drinks right at the counter.
        </p>

        {/* Interactive Craving Search Pill matching La Roche Palette */}
        <form
          onSubmit={handleSearchSubmit}
          className="w-full max-w-xl bg-[#FFF9EC] dark:bg-[#23231C] rounded-full p-1.5 sm:p-2 pl-4 sm:pl-5 shadow-2xl flex items-center gap-2 sm:gap-3 border border-[#ECD5A5] dark:border-stone-700 transition-all focus-within:ring-2 focus-within:ring-[#A6472B]"
        >
          <Search className="w-5 h-5 text-[#8C827A] shrink-0" />
          <input
            type="text"
            value={craving}
            onChange={(e) => setCraving(e.target.value)}
            placeholder="Search toasties, cold coffee, waffles, maggi..."
            className="flex-1 bg-transparent text-espresso dark:text-white placeholder:text-stone-500 dark:placeholder:text-stone-400 text-xs sm:text-sm font-sans font-medium focus:outline-none min-w-0"
          />
          <button
            type="submit"
            className="px-5 sm:px-7 py-2.5 sm:py-3 rounded-full bg-[#A6472B] hover:bg-[#7E351F] text-white text-xs sm:text-sm font-bold tracking-wide transition-all shadow-glow-terracotta hover:scale-105 active:scale-95 cursor-pointer shrink-0"
          >
            Find Food
          </button>
        </form>

      </div>
    </section>
  );
};

export default HeroSection;
