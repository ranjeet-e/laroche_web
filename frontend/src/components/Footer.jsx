import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Footer = () => {
  const location = useLocation();
  const { isDark } = useTheme();

  // Hide footer on kitchen dashboard and full-screen staff CMS views
  const isStaffRoute =
    location.pathname.startsWith('/kitchen/dashboard') ||
    location.pathname.startsWith('/cms/dashboard');

  if (isStaffRoute) {
    return null;
  }

  return (
    <footer className="w-full bg-[#1F1916] text-[#E8D8CD] border-t border-[#3D312A] pt-12 pb-24 md:pb-12 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* 1. Brand & About */}
          <div className="space-y-4">
            <Link to="/" className="inline-block">
              <img
                src="/logo.png"
                alt="La Roche Cafe"
                className="h-12 w-auto object-contain brightness-110"
              />
            </Link>
            <p className="text-xs sm:text-sm text-[#B8A79B] leading-relaxed font-sans">
              Artisanal campus preorder & express counter pickup. Enjoy freshly prepared sourdough toasties, gourmet brews, and artisanal bites.
            </p>
          </div>

          {/* 2. Quick Links */}
          <div>
            <h3 className="text-sm font-serif font-bold text-white uppercase tracking-wider mb-4">
              Explore & Order
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link to="/menu" className="text-[#B8A79B] hover:text-white transition-colors">
                  Full Menu & Specials
                </Link>
              </li>
              <li>
                <Link to="/orders" className="text-[#B8A79B] hover:text-white transition-colors">
                  Live Order Tracker
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-[#B8A79B] hover:text-white transition-colors">
                  My Cart
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="text-[#B8A79B] hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-and-conditions" className="text-[#B8A79B] hover:text-white transition-colors">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* 3. Cafe Support & Contact Information */}
          <div>
            <h3 className="text-sm font-serif font-bold text-white uppercase tracking-wider mb-4">
              Cafe Support
            </h3>
            <ul className="space-y-3 text-xs sm:text-sm text-[#B8A79B]">
              <li className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-[#A6472B] flex-shrink-0 mt-0.5" />
                <div>
                  <span className="block text-white font-semibold">Direct Cafe Hotline:</span>
                  <a
                    href="tel:+919876543210"
                    className="hover:text-[#E07A5F] transition-colors font-mono font-bold text-stone-200"
                  >
                    +91 98765 43210
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-[#A6472B] flex-shrink-0 mt-0.5" />
                <div>
                  <span className="block text-white font-semibold">Inquiries & Feedback:</span>
                  <a
                    href="mailto:contact@larochecafe.com"
                    className="hover:text-[#E07A5F] transition-colors text-stone-200"
                  >
                    contact@larochecafe.com
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#A6472B] flex-shrink-0 mt-0.5" />
                <div>
                  <span className="block text-white font-semibold">Counter Pickup:</span>
                  <span>Campus Food Court, Ground Floor, La Roche Cafe Counter</span>
                </div>
              </li>
            </ul>
          </div>

          {/* 4. Service Hours */}
          <div>
            <h3 className="text-sm font-serif font-bold text-white uppercase tracking-wider mb-4">
              Service Hours
            </h3>
            <div className="space-y-3 text-xs sm:text-sm text-[#B8A79B]">
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-[#A6472B] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-semibold">Counter Timings:</p>
                  <p className="mt-0.5">Mon – Sat: 8:30 AM – 9:30 PM</p>
                  <p>Sun: 9:00 AM – 8:00 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#3D312A] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8F7E75]">
          <p>© {new Date().getFullYear()} La Roche Cafe. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link to="/privacy-policy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link to="/terms-and-conditions" className="hover:text-white transition-colors">
              Terms & Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
