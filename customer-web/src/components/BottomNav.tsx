import React from 'react';
import { Home, ShoppingBag, Flame, Cookie } from 'lucide-react';

interface BottomNavProps {
  currentScreen: 'home' | 'pickles' | 'snacks' | 'cart' | 'product-detail';
  onNavigate: (screen: 'home' | 'pickles' | 'snacks' | 'cart') => void;
  cartCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentScreen,
  onNavigate,
  cartCount,
}) => {
  return (
    <div className="fixed bottom-3 left-0 right-0 z-40 max-w-sm sm:max-w-md mx-auto px-4 pointer-events-none font-body">
      <nav className="pointer-events-auto bg-parchment-surface/95 backdrop-blur-md border border-border-warm/80 rounded-full shadow-warm-lg px-4 py-2.5 flex items-center justify-around">
        <button
          onClick={() => onNavigate('home')}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-full transition-all active:scale-95 ${
            currentScreen === 'home'
              ? 'text-olive-deep font-bold'
              : 'text-espresso-muted hover:text-espresso'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Home</span>
        </button>

        <button
          onClick={() => onNavigate('pickles')}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-full transition-all active:scale-95 ${
            currentScreen === 'pickles'
              ? 'text-olive-deep font-bold'
              : 'text-espresso-muted hover:text-espresso'
          }`}
        >
          <Flame className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Pickles</span>
        </button>

        <button
          onClick={() => onNavigate('snacks')}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-full transition-all active:scale-95 ${
            currentScreen === 'snacks'
              ? 'text-olive-deep font-bold'
              : 'text-espresso-muted hover:text-espresso'
          }`}
        >
          <Cookie className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Snacks</span>
        </button>

        <button
          onClick={() => onNavigate('cart')}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-full transition-all relative active:scale-95 ${
            currentScreen === 'cart'
              ? 'text-olive-deep font-bold'
              : 'text-espresso-muted hover:text-espresso'
          }`}
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-olive-deep text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border border-white">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight">Cart</span>
        </button>
      </nav>
    </div>
  );
};
