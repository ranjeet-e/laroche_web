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
    // Explicitly enforce muted DOM property before playback to guarantee autoplay across iOS/Chrome
    if (videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
      videoRef.current.playsInline = true;
      videoRef.current.setAttribute('muted', '');
      videoRef.current.setAttribute('playsinline', '');
      videoRef.current.setAttribute('webkit-playsinline', 'true');

      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // If browser suspended autoplay, kickstart on first user gesture
          const handleFirstGesture = () => {
            if (videoRef.current) {
              videoRef.current.defaultMuted = true;
              videoRef.current.muted = true;
              videoRef.current.play().catch(() => {});
            }
          };
          window.addEventListener('touchstart', handleFirstGesture, { once: true, passive: true });
          window.addEventListener('click', handleFirstGesture, { once: true, passive: true });
        });
      }
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
        className="intro-video pointer-events-none select-none"
        src="/intro.mp4"
        preload="metadata"
        autoPlay
        muted
        loop
        playsInline
        webkit-playsinline="true"
        x5-playsinline="true"
        disablePictureInPicture
        disableRemotePlayback
        tabIndex={-1}
        controlsList="nodownload nofullscreen noremoteplayback"
      />

      {/* Cinematic Dark & Warm Vignette Overlay */}
      <div className="intro-backdrop-vignette" />

      {/* Centered Brand Logo (Replacing simple typography) */}
      <div className="intro-center-content">
        <img
          src="/logo.png"
          alt="La Roche Cafe"
          className="intro-brand-logo"
        />
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
