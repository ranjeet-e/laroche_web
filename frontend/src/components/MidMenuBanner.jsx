import React from 'react';
import { Flame } from 'lucide-react';

const MidMenuBanner = ({ customBanner }) => {
  if (customBanner && customBanner.imageUrl) {
    return (
      <div className="my-10 sm:my-14 w-full overflow-hidden rounded-2xl border border-[#ECD5A5] dark:border-[#3D312A] shadow-warm-xl group">
        <div className="relative aspect-[21/9] sm:aspect-[24/8] w-full bg-[#1F1916]">
          <img
            src={customBanner.imageUrl}
            alt={customBanner.title || 'Cafe Special Offer'}
            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700"
          />
          {customBanner.title && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 sm:p-10">
              <span className="text-xs font-black uppercase tracking-[0.2em] text-[#F7D070] mb-2">
                {customBanner.tag || 'FEATURED OFFER'}
              </span>
              <h3 className="text-2xl sm:text-4xl font-serif font-black text-white">
                {customBanner.title}
              </h3>
              {customBanner.subtitle && (
                <p className="text-xs sm:text-sm text-stone-200 mt-1 max-w-lg font-medium">
                  {customBanner.subtitle}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="my-10 sm:my-14 w-full">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#291711] via-[#4A2619] to-[#1E110C] border-2 border-[#A6472B]/60 shadow-warm-xl p-6 sm:p-10 text-white">
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-[#A6472B]/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#A6472B] text-white text-xs font-black uppercase tracking-[0.18em] shadow-sm mb-3">
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span>CHEF'S MID-DAY SPECIAL • SAVE 20%</span>
            </div>
            
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-serif font-black text-white tracking-tight leading-tight">
              Sourdough Melt + Cold Brew Combo
            </h3>

            <p className="text-xs sm:text-sm text-stone-300 mt-2 font-medium leading-relaxed font-sans">
              Handcrafted with slow-fermented artisan sourdough, melted aged cheddar, and house-brewed single origin Arabica coffee. Freshly prepared to order in under 8 minutes.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <a
              href="#category-rail-section"
              className="w-full sm:w-auto text-center px-6 py-3.5 rounded-full bg-[#A6472B] hover:bg-[#7E351F] text-white text-xs font-black uppercase tracking-[0.16em] transition-all shadow-md hover:scale-105 active:scale-95 cursor-pointer"
            >
              Order Combo (₹189)
            </a>
            <div className="text-center sm:text-left text-[11px] text-stone-300 font-bold uppercase tracking-wider">
              ⚡ Available all day at counter
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MidMenuBanner;
