import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Phone, Mail } from 'lucide-react';

const InstagramIcon = () => (
  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const Footer = () => {
  const location = useLocation();

  // Hide footer on kitchen dashboard and full-screen staff CMS views
  const isStaffRoute =
    location.pathname.startsWith('/kitchen/dashboard') ||
    location.pathname.startsWith('/cms/dashboard');

  if (isStaffRoute) {
    return null;
  }

  return (
    <footer
      id="footer-section"
      className="relative w-full text-white border-t border-[#3D281E] pt-14 pb-28 md:pb-14 px-5 sm:px-8 lg:px-12 mt-auto overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(rgba(14, 9, 7, 0.93), rgba(14, 9, 7, 0.97)), url('/footer-doodle-bg.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'repeat',
      }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-14 mb-14 font-sans">
          
          {/* COLUMN 1: POLICIES */}
          <div>
            <h3 className="text-xs sm:text-sm font-black uppercase tracking-[0.2em] text-[#F7D070] dark:text-[#F7D070] mb-5">
              POLICIES
            </h3>
            <ul className="space-y-3 text-xs sm:text-sm text-stone-300 font-medium">
              <li>
                <Link to="/privacy-policy" className="hover:text-[#F7D070] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-and-conditions" className="hover:text-[#F7D070] transition-colors">
                  Terms &amp; Conditions
                </Link>
              </li>
              <li>
                <Link to="/terms-and-conditions" className="hover:text-[#F7D070] transition-colors">
                  Shipping &amp; Counter Pickup
                </Link>
              </li>
              <li>
                <Link to="/terms-and-conditions" className="hover:text-[#F7D070] transition-colors">
                  Return &amp; Cancellation
                </Link>
              </li>
            </ul>
          </div>

          {/* COLUMN 2: FIND US */}
          <div>
            <h3 className="text-xs sm:text-sm font-black uppercase tracking-[0.2em] text-[#F7D070] dark:text-[#F7D070] mb-5">
              FIND US
            </h3>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed mb-6 font-medium">
              Shah &amp; Anchor Kutchhi Engineering College, Mahavir Education Trust Chowk, W.T. Patil Marg, Chembur, Mumbai, Maharashtra – 400088
            </p>

            {/* Social Circle Buttons - Instagram Only */}
            <div className="flex items-center gap-2.5">
              <a
                href="https://www.instagram.com/la.rochecafe/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-stone-900/90 hover:bg-[#A6472B] hover:text-white border border-stone-700/60 flex items-center justify-center text-white transition-all shadow-sm"
                aria-label="Instagram"
              >
                <InstagramIcon />
              </a>
            </div>
          </div>

          {/* COLUMN 3: CUSTOMER SUPPORT */}
          <div>
            <h3 className="text-xs sm:text-sm font-black uppercase tracking-[0.2em] text-[#F7D070] dark:text-[#F7D070] mb-5">
              CUSTOMER SUPPORT
            </h3>
            <div className="space-y-3.5 text-xs sm:text-sm text-stone-300 font-medium">
              <div>
                <p className="text-[11px] text-stone-400 font-bold uppercase tracking-wider mb-1">
                  Operational Hours for Call:
                </p>
                <p className="text-white font-bold">8:30 AM – 6:00 PM (Mon – Sat)</p>
              </div>

              <div className="pt-2 flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#E8A856] flex-shrink-0" />
                <a
                  href="mailto:larochecafe26@gmail.com"
                  className="hover:text-[#F7D070] text-stone-200 transition-colors"
                >
                  larochecafe26@gmail.com
                </a>
              </div>

              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#E8A856] flex-shrink-0" />
                <a
                  href="tel:+919876543210"
                  className="hover:text-[#F7D070] text-stone-200 font-bold transition-colors"
                >
                  +91 98765 43210
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Rights Bar */}
        <div className="pt-8 border-t border-stone-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400 font-sans">
          <p>© {new Date().getFullYear()} La Roche Cafe. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link to="/privacy-policy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link to="/terms-and-conditions" className="hover:text-white transition-colors">
              Terms &amp; Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;