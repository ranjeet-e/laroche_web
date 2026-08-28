import { useState, useRef } from 'react';
import './IntroVideo.css';

const IntroVideo = ({ onFinish }) => {
  const [fading, setFading] = useState(false);
  const videoRef = useRef(null);

  const handleFinish = () => {
    setFading(true);
    setTimeout(onFinish, 500); // matches fade-out duration
  };

  const handleVideoError = () => {
    handleFinish();
  };

  return (
    <div className={`intro-video-overlay ${fading ? 'fade-out' : ''}`}>
      <video
  ref={videoRef}
  className="intro-video"
  src="/intro.mp4"
  autoPlay
  muted
  playsInline
  onEnded={handleFinish}
  onError={handleVideoError}
/>
      <div className="intro-video-content">
        <button className="intro-skip-btn" onClick={handleFinish}>
          Skip →
        </button>
      </div>
    </div>
  );
};

export default IntroVideo;
