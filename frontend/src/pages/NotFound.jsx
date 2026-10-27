import React from 'react';
import { Link } from 'react-router-dom';
import { Coffee, ArrowRight } from 'lucide-react';
import './NotFound.css';

export default function NotFound() {
  return (
    <div className="not-found-theme-wrapper">
      {/* Subtle Cafe Pattern Vignette */}
      <div className="not-found-ambient-glow" />

      <div className="not-found-content">
        {/* 4 [Coffee Cup] 4 matching the uploaded design */}
        <div className="display-404" aria-label="404 Error">
          <span className="digit-4">4</span>
          <div className="coffee-cup-container">
            <img
              src="/404-latte.png"
              alt="Freshly poured latte with rosetta art"
              className="coffee-cup-img"
              width="240"
              height="240"
            />
          </div>
          <span className="digit-4">4</span>
        </div>

        {/* Headline from design */}
        <h1 className="not-found-heading">
          The Page you&apos;re looking for <br />
          is on a coffee break.
        </h1>

        {/* Subtitle */}
        <p className="not-found-subtext">
          We couldn&apos;t brew up the link you requested. Let&apos;s get you back to the counter for fresh sourdough & hot brews.
        </p>

        {/* Pill Button from design */}
        <div className="not-found-action">
          <Link to="/menu" className="btn-coffee-break">
            <Coffee className="w-4 h-4 text-[#A6472B] inline-block shrink-0" />
            <span>I WANT SOME COFFEE TOO</span>
            <ArrowRight className="w-4 h-4 ml-0.5 inline-block shrink-0" />
          </Link>
        </div>
      </div>
    </div>
  );
}
