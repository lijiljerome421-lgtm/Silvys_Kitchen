import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { HERITAGE_YEAR } from '../config/constants';

interface HeaderNavProps {
  cartCount: number;
  onOpenCart: () => void;
  onGoHome: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  cartCount,
  onOpenCart,
  onGoHome,
}) => {
  return (
    <header className="relative z-30 w-full max-w-md mx-auto font-body">
      {/* Curved Parchment Top Header Container */}
      <div className="bg-parchment-surface border-b border-border-warm/70 pt-2 pb-2 px-4 shadow-warm-xs relative overflow-hidden rounded-b-2xl">
        {/* Subtle Botanical Leaf Illustrative Accents */}
        <div className="absolute top-1 left-2 opacity-20 pointer-events-none text-olive-leaf select-none text-lg">
          🌿
        </div>
        <div className="absolute top-1 right-2 opacity-20 pointer-events-none text-olive-leaf select-none text-lg">
          🍃
        </div>

        {/* Top Controls Row */}
        <div className="flex items-center justify-between">
          {/* Official Silvy's Kitchen Logo & Brand Name */}
          <button
            onClick={onGoHome}
            className="flex items-center gap-2.5 group focus:outline-none"
          >
            <img
              src="assets/logo.jpg"
              alt="Silvy's Kitchen"
              className="h-9 w-auto object-contain rounded-xl border border-border-warm/60 bg-white p-0.5 shadow-warm-xs group-hover:scale-105 transition-transform"
            />
            <div className="flex flex-col items-start text-left">
              <span className="font-heading text-sm font-bold text-espresso leading-tight">
                Silvy's Kitchen
              </span>
              <span className="text-[9px] font-serif font-bold italic text-olive-deep tracking-wider opacity-90">
                {HERITAGE_YEAR}
              </span>
            </div>
          </button>

          {/* Top Right: Circular Organic Parchment Shopping Bag Icon */}
          <button
            onClick={onOpenCart}
            className="relative w-9 h-9 rounded-full bg-parchment border border-border-warm/80 shadow-warm-xs flex items-center justify-center text-espresso hover:bg-parchment-deep active:scale-95 transition-all focus:outline-none"
            aria-label={`Open Cart (${cartCount} items)`}
          >
            <ShoppingBag className="w-4 h-4 text-espresso" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-olive-deep text-white text-[9px] font-extrabold w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
