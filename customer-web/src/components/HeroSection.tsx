import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { Product } from '../types';
import { getImageUrl } from '../config/constants';

interface HeroSectionProps {
  products: Product[];
  onExploreNow: () => void;
  onSelectProduct?: (product: Product) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  products,
  onExploreNow,
  onSelectProduct,
}) => {
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);

  // Filter pickles for prominent jar display
  const heroItems: Product[] = products.length > 0
    ? products.slice(0, 3)
    : [
        {
          id: 1,
          name: 'Homemade Chicken Pickle',
          imageUrl: 'assets/chicken_pickle.jpg',
          category: 'Pickles',
          price: 280,
          unit: '400g',
          available: true,
          featured: true,
          description: 'Authentic Kerala spices & tender chicken in pure sesame oil.',
        },
        {
          id: 2,
          name: 'Traditional Kerala Beef Pickle',
          imageUrl: 'assets/beef_pickle.jpg',
          category: 'Pickles',
          price: 320,
          unit: '400g',
          available: true,
          featured: true,
          description: 'Slow-roasted beef infused with shallots and Kudampuli.',
        },
        {
          id: 3,
          name: 'Crispy Achappam',
          imageUrl: 'assets/achappam.jpg',
          category: 'Snacks',
          price: 180,
          unit: '250g',
          available: true,
          featured: true,
          description: 'Crunchy rose cookies with fresh coconut milk & cardamom.',
        },
      ];

  useEffect(() => {
    if (heroItems.length <= 1) return;
    const timer = setInterval(() => {
      setActiveSlideIndex((prev) => (prev + 1) % heroItems.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [heroItems.length]);

  const activeProduct = heroItems[activeSlideIndex] || heroItems[0];

  return (
    <section className="px-5 pt-3 pb-2 max-w-md mx-auto font-body">
      {/* Hero Card Container matching reference */}
      <div className="bg-espresso text-parchment rounded-3xl overflow-hidden shadow-warm-lg border border-border-warm/40 relative">
        {/* Top Parchment Sub-header Bar */}
        <div className="bg-parchment-deep/90 text-espresso px-5 py-3 border-b border-border-warm/60 flex items-center justify-between">
          <span className="text-xs uppercase tracking-widest text-olive-leaf font-bold bg-olive-tint px-3 py-1 rounded-full border border-olive-leaf/20">
            🌿 Silvy's Kitchen
          </span>
          <span className="font-script text-sm font-semibold text-rattan-amber italic">
            Homemade Specialties
          </span>
        </div>

        {/* Hero Image Container */}
        <div 
          onClick={() => onSelectProduct?.(activeProduct)}
          className="relative aspect-[16/10] w-full overflow-hidden bg-parchment-deep cursor-pointer"
        >
          <img
            src={getImageUrl(activeProduct.imageUrl)}
            alt={activeProduct.name}
            className="w-full h-full object-cover transition-opacity duration-700 hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'assets/chicken_pickle.jpg';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-espresso via-espresso/30 to-transparent flex items-end p-5">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-rattan-gold font-bold bg-espresso/80 px-2.5 py-0.5 rounded-md border border-rattan-gold/30">
                {activeProduct.category}
              </span>
              <h2 className="font-heading text-2xl font-bold text-white mt-1 leading-tight hover:text-rattan-gold transition-colors">
                {activeProduct.name}
              </h2>
            </div>
          </div>
        </div>

        {/* Hero Description & Call To Action */}
        <div className="p-5 space-y-4 bg-espresso">
          <p className="text-xs text-parchment/90 leading-relaxed max-w-xs font-serif italic">
            "Authentic Kerala flavours for your home and celebrations."
          </p>

          <div className="flex items-center justify-between pt-1">
            {/* Primary Dark Botanical Green CTA Button */}
            <button
              onClick={onExploreNow}
              className="bg-olive-deep hover:bg-olive-leaf active:scale-95 text-white px-6 py-3 rounded-2xl font-bold text-xs shadow-warm-md flex items-center gap-2 transition-all border border-white/10"
            >
              <span>EXPLORE NOW</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Subtle Pagination Dots */}
            <div className="flex items-center gap-1.5">
              {heroItems.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveSlideIndex(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    activeSlideIndex === idx
                      ? 'w-6 bg-olive-leaf'
                      : 'w-2 bg-parchment/30 hover:bg-parchment/60'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
