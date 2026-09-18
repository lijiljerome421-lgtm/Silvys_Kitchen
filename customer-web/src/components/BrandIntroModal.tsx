import React from 'react';
import { OFFICIAL_TAGLINE, MALAYALAM_TAGLINE, HERITAGE_YEAR } from '../config/constants';
import { ArrowRight } from 'lucide-react';

interface BrandIntroModalProps {
  onEnter: () => void;
}

export const BrandIntroModal: React.FC<BrandIntroModalProps> = ({ onEnter }) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between p-6 bg-parchment paper-texture transition-opacity duration-700 ease-out overflow-y-auto max-w-md mx-auto shadow-2xl">
      {/* Top Decorative Leaves */}
      <div className="pt-6 text-center">
        <span className="text-[11px] uppercase tracking-widest text-olive-leaf font-semibold bg-olive-tint/80 px-4 py-1.5 rounded-full border border-olive-leaf/20 shadow-xs">
          🌿 Traditional Homemade Kerala
        </span>
      </div>

      {/* Main Centered Content */}
      <div className="my-auto flex flex-col items-center text-center w-full max-w-xs py-6">
        {/* Exact Official Logo */}
        <div className="relative mb-3 transition-transform duration-500 hover:scale-105 flex flex-col items-center">
          <img
            src="assets/logo.jpg"
            alt="Silvy's Kitchen Official Logo"
            className="w-44 sm:w-48 h-auto object-contain rounded-xl drop-shadow-md border border-border-warm/40 bg-white/40 p-1"
          />
          <span className="text-[10px] font-serif font-bold italic text-olive-deep tracking-widest mt-1 opacity-90">
            {HERITAGE_YEAR}
          </span>
        </div>

        {/* Brand Taglines */}
        <p className="font-heading text-xl text-espresso font-medium mb-1">
          {OFFICIAL_TAGLINE}
        </p>

        <p className="font-malayalam text-base text-olive-leaf font-bold mb-8">
          “{MALAYALAM_TAGLINE}”
        </p>

        {/* Primary Green Pill Button */}
        <button
          onClick={onEnter}
          className="w-full bg-olive-deep hover:bg-olive-leaf active:scale-95 text-white font-heading text-base font-bold py-3.5 px-6 rounded-full shadow-warm-md transition-all duration-300 flex items-center justify-center gap-2 group"
        >
          <span>ENTER KITCHEN</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Bottom Botanical Leaves & Spices Graphic Decoration */}
      <div className="pb-6 w-full flex justify-center opacity-80 pointer-events-none select-none">
        <div className="flex items-center gap-2 text-olive-leaf text-xs font-semibold">
          <span>🍃</span>
          <span>Pickles & Traditional Snacks</span>
          <span>🌶️</span>
        </div>
      </div>
    </div>
  );
};
