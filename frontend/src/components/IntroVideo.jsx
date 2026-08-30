import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import './IntroVideo.css';

const IntroVideo = ({ onFinish }) => {
  const [fading, setFading] = useState(false);
  const videoRef = useRef(null);

  const handleFinish = () => {
    if (fading) return;
    setFading(true);
    setTimeout(onFinish, 600); // smooth fade-out duration
  };

  useEffect(() => {
    // Attempt auto-play with safety fallback
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay may be handled silently by browser
      });
    }

    // Allow wheel scrolling or swipe up to enter
    const handleWheel = (e) => {
      if (e.deltaY > 25) {
        handleFinish();
      }
    };

    let touchStartY = 0;
    const handleTouchStart = (e) => {
      touchStartY = e.touches[0].clientY;
    };
    const handleTouchMove = (e) => {
      const touchEndY = e.touches[0].clientY;
      if (touchStartY - touchEndY > 35) {
        handleFinish();
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  return (
    <div
      className={`intro-video-overlay ${fading ? 'fade-out' : ''}`}
      onClick={handleFinish}
    >
      {/* Background B-Roll Video with pointer-events disabled to prevent native browser pause overlay */}
      <video
        ref={videoRef}
        className="intro-video"
        src="/intro.mp4"
        autoPlay
        muted
        loop
        playsInline
        webkit-playsinline="true"
        x5-playsinline="true"
        disablePictureInPicture
        controlsList="nodownload nofullscreen noremoteplayback"
      />

      {/* Cinematic Dark & Warm Vignette Overlay */}
      <div className="intro-backdrop-vignette" />

      {/* Centered Brand Title in Signature Typography */}
      <div className="intro-center-content">
        <h1 className="intro-brand-name">
          La Roche Cafe
        </h1>
      </div>

      {/* Creative Bottom Scroll Indicator */}
      <div className="intro-bottom-action">
        <button
          type="button"
          className="intro-scroll-btn"
          onClick={(e) => {
            e.stopPropagation();
            handleFinish();
          }}
          aria-label="Scroll down to explore menu"
        >
          <span className="intro-scroll-text">Scroll down</span>
          <div className="intro-scroll-icon-wrapper">
            <ChevronDown className="intro-scroll-icon" />
          </div>
        </button>
      </div>
    </div>
  );
};

export default IntroVideo;
