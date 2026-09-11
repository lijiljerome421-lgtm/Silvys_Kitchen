import React from 'react';
import { ShoppingBag, Menu } from 'lucide-react';

interface HeaderNavProps {
  cartCount: number;
  onOpenCart: () => void;
  onGoHome: () => void;
  onOpenMenu?: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  cartCount,
  onOpenCart,
  onGoHome,
  onOpenMenu,
}) => {
  return (
    <header className="relative z-30 w-full max-w-md mx-auto font-body">
      {/* Curved Parchment Top Header Container */}
      <div className="bg-parchment-surface border-b border-border-warm/70 pt-3 pb-5 px-5 shadow-warm-xs relative overflow-hidden rounded-b-[2rem]">
        {/* Subtle Botanical Leaf Illustrative Accents */}
        <div className="absolute top-1 left-2 opacity-20 pointer-events-none text-olive-leaf select-none text-xl">
          🌿
        </div>
        <div className="absolute top-1 right-2 opacity-20 pointer-events-none text-olive-leaf select-none text-xl">
          🍃
        </div>

        {/* Top Controls Row */}
        <div className="flex items-center justify-between">
          {/* Top Left: Circular Organic Parchment Menu Icon */}
          <button
            onClick={onOpenMenu || onGoHome}
            className="w-11 h-11 rounded-full bg-parchment border border-border-warm/80 shadow-warm-xs flex items-center justify-center text-espresso hover:bg-parchment-deep active:scale-95 transition-all focus:outline-none"
            aria-label="Menu"
          >
            <Menu className="w-5 h-5 text-espresso" />
          </button>

          {/* Official Silvy's Kitchen Logo (Prominent Center/Top) */}
          <button
            onClick={onGoHome}
            className="flex flex-col items-center group focus:outline-none"
          >
            <img
              src="assets/logo.jpg"
              alt="Silvy's Kitchen"
              className="h-14 w-auto object-contain rounded-2xl border border-border-warm/60 bg-white p-1 shadow-warm-xs group-hover:scale-105 transition-transform"
            />
          </button>

          {/* Top Right: Circular Organic Parchment Shopping Bag Icon */}
          <button
            onClick={onOpenCart}
            className="relative w-11 h-11 rounded-full bg-parchment border border-border-warm/80 shadow-warm-xs flex items-center justify-center text-espresso hover:bg-parchment-deep active:scale-95 transition-all focus:outline-none"
            aria-label={`Open Cart (${cartCount} items)`}
          >
            <ShoppingBag className="w-5 h-5 text-espresso" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-olive-deep text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
