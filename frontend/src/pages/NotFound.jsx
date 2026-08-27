import React from 'react';
import { Link } from 'react-router-dom';
import './NotFound.css';

export default function NotFound() {
  return (
    <div className="not-found-wrapper">
      <div className="error-container">
        <div className="scene-wrapper">
          <div className="title-404">404</div>

          {/* Background Scenery */}
          <svg className="scenery" viewBox="0 0 400 200" fill="none">
            <rect x="50" y="80" width="30" height="90" rx="15" fill="#E5E7EB" />
            <rect x="320" y="70" width="35" height="100" rx="17" fill="#E5E7EB" />
            <circle cx="85" cy="165" r="8" fill="#10B981" opacity="0.8" />
            <circle cx="95" cy="160" r="10" fill="#059669" />
            <circle cx="310" cy="162" r="10" fill="#059669" />
            <circle cx="322" cy="166" r="7" fill="#10B981" opacity="0.8" />
          </svg>

          <div className="ground-line"></div>

          {/* Animated Coil */}
          <svg className="coil" viewBox="0 0 120 120">
            <circle className="coil-track" cx="60" cy="60" r="45" />
            <circle className="coil-pulse" cx="60" cy="60" r="45" />
          </svg>

          {/* Lost Character */}
          <svg className="character-svg" viewBox="0 0 120 140" fill="none">
            <path d="M40 85 L80 85 L88 135 L32 135 Z" fill="#6B7280" />
            <path d="M42 90 L78 90 L85 135 L35 135 Z" fill="#9CA3AF" />
            <path d="M46 85 L44 115" stroke="#4B5563" strokeWidth="4" strokeLinecap="round" />
            <path d="M74 85 L76 115" stroke="#4B5563" strokeWidth="4" strokeLinecap="round" />
            <ellipse cx="60" cy="50" rx="26" ry="24" fill="#5A3825" />
            <path d="M38 52 C38 78 82 78 82 52 Z" fill="#5A3825" />
            <ellipse cx="60" cy="48" rx="17" ry="16" fill="#FCD34D" />
            <circle cx="54" cy="46" r="2.5" fill="#1F2937" />
            <circle cx="66" cy="46" r="2.5" fill="#1F2937" />
            <ellipse cx="60" cy="51" rx="2.5" ry="3" fill="#F59E0B" />
            <rect x="43" y="38" width="34" height="4" rx="2" fill="#DC2626" />
            <path d="M70 38 Q78 22 84 20 Q78 30 72 38" fill="#10B981" />
          </svg>
        </div>

        <h2 className="heading">Look like you're lost</h2>
        <p className="subtext">the page you are looking for not available!</p>
        <Link to="/menu" className="btn-home">Go to Home</Link>
      </div>
    </div>
  );
}
