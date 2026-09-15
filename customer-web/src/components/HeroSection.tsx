import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { Product, Promotion } from '../types';
import { WHATSAPP_PHONE, getImageUrl } from '../config/constants';
import { WhatsAppIcon } from './WhatsAppIcon';

interface HeroSectionProps {
  promotions?: Promotion[];
  products: Product[];
  onExploreNow: () => void;
  onSelectProduct?: (product: Product) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  promotions,
  products,
  onExploreNow,
  onSelectProduct,
}) => {
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);

  // Filter active promotions
  const activePromos = (promotions || [])
    .filter((p) => p.active !== false)
    .sort((a, b) => Number(a.displayOrder ?? a.display_order ?? 0) - Number(b.displayOrder ?? b.display_order ?? 0));

  const hasPromotions = activePromos.length > 0;

  // Fallback product items if no active promotions exist
  const heroProducts: Product[] = products.length > 0
    ? products.slice(0, 3)
    : [
        {
          id: 1,
          name: 'Homemade Chicken Pickle',
          imageUrl: 'assets/chicken_pickle.jpg',
          category: 'Pickles',
          price: 280,
          unit: '500g Jar',
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
          unit: '500g Jar',
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
          unit: 'Pack of 20 Pcs',
          available: true,
          featured: true,
          description: 'Crunchy rose cookies with fresh coconut milk & cardamom.',
        },
      ];

  const slideCount = hasPromotions ? activePromos.length : heroProducts.length;

  useEffect(() => {
    if (slideCount <= 1) return;
    const timer = setInterval(() => {
      setActiveSlideIndex((prev) => (prev + 1) % slideCount);
    }, 4500);
    return () => clearInterval(timer);
  }, [slideCount]);

  // Handle promotion banner click
  const handlePromotionClick = (promo: Promotion) => {
    const linkType = (promo.linkType || promo.link_type || 'NONE').toUpperCase();
    const linkVal = promo.linkValue || promo.link_value;

    if (linkType === 'WEBSITE' && linkVal) {
      const targetUrl = linkVal.startsWith('http://') || linkVal.startsWith('https://') ? linkVal : `https://${linkVal}`;
      window.open(targetUrl, '_blank');
    } else if (linkType === 'WHATSAPP') {
      const msg = `Hello Silvy's Kitchen! 👋\n\nI am inquiring about your promotion: *${promo.title}*${linkVal ? ` (${linkVal})` : ''}.`;
      const url = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(msg)}`;
      window.open(url, '_blank');
    }
  };

  // RENDER 1: PROMOTIONS CAROUSEL (When active promotions exist)
  if (hasPromotions) {
    const activePromo = activePromos[activeSlideIndex] || activePromos[0];
    const linkType = (activePromo.linkType || activePromo.link_type || 'NONE').toUpperCase();
    const bannerImg = activePromo.imageUrl || activePromo.image_url;

    return (
      <section className="px-5 pt-3 pb-2 max-w-md mx-auto font-body">
        <div className="bg-espresso text-parchment rounded-3xl overflow-hidden shadow-warm-lg border border-border-warm/40 relative">
          {/* Top Header Bar */}
          <div className="bg-parchment-deep/90 text-espresso px-5 py-3 border-b border-border-warm/60 flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest text-olive-leaf font-bold bg-olive-tint px-3 py-1 rounded-full border border-olive-leaf/20">
              ✨ Special Announcement
            </span>
            <span className="font-script text-sm font-semibold text-rattan-amber italic">
              Silvy's Kitchen Offer
            </span>
          </div>

          {/* Promotion Banner Image */}
          <div
            onClick={() => handlePromotionClick(activePromo)}
            className={`relative aspect-[16/9] w-full overflow-hidden bg-parchment-deep ${linkType !== 'NONE' ? 'cursor-pointer' : ''}`}
          >
            <img
              src={getImageUrl(bannerImg)}
              alt={activePromo.title}
              className="w-full h-full object-cover transition-opacity duration-700"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'assets/chicken_pickle.jpg';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-espresso via-espresso/30 to-transparent flex items-end p-5">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-rattan-gold font-bold bg-espresso/80 px-2.5 py-0.5 rounded-md border border-rattan-gold/30">
                  PROMOTION
                </span>
                <h2 className="font-heading text-2xl font-bold text-white mt-1 leading-tight">
                  {activePromo.title}
                </h2>
              </div>
            </div>
          </div>

          {/* Subtitle & CTA Row */}
          <div className="p-5 space-y-4 bg-espresso">
            {activePromo.subtitle && (
              <p className="text-xs text-parchment/90 leading-relaxed max-w-xs font-serif italic">
                "{activePromo.subtitle}"
              </p>
            )}

            <div className="flex items-center justify-between pt-1">
              {linkType === 'WHATSAPP' ? (
                <button
                  onClick={() => handlePromotionClick(activePromo)}
                  className="bg-[#25D366] hover:bg-[#1EBE57] active:scale-95 text-white px-5 py-3 rounded-2xl font-bold text-xs shadow-warm-md flex items-center gap-2 transition-all"
                >
                  <WhatsAppIcon className="w-4 h-4 text-white" />
                  <span>CLAIM ON WHATSAPP</span>
                </button>
              ) : linkType === 'WEBSITE' ? (
                <button
                  onClick={() => handlePromotionClick(activePromo)}
                  className="bg-olive-deep hover:bg-olive-leaf active:scale-95 text-white px-5 py-3 rounded-2xl font-bold text-xs shadow-warm-md flex items-center gap-2 transition-all border border-white/10"
                >
                  <span>VIEW OFFER</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={onExploreNow}
                  className="bg-olive-deep hover:bg-olive-leaf active:scale-95 text-white px-5 py-3 rounded-2xl font-bold text-xs shadow-warm-md flex items-center gap-2 transition-all border border-white/10"
                >
                  <span>EXPLORE MENU</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              {/* Pagination Dots */}
              {activePromos.length > 1 && (
                <div className="flex items-center gap-1.5">
                  {activePromos.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveSlideIndex(idx)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        activeSlideIndex === idx
                          ? 'w-6 bg-olive-leaf'
                          : 'w-2 bg-parchment/30 hover:bg-parchment/60'
                      }`}
                      aria-label={`Go to promotion slide ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // RENDER 2: FALLBACK PRODUCT HERO (When zero active promotions exist)
  const activeProduct = heroProducts[activeSlideIndex] || heroProducts[0];

  return (
    <section className="px-5 pt-3 pb-2 max-w-md mx-auto font-body">
      <div className="bg-espresso text-parchment rounded-3xl overflow-hidden shadow-warm-lg border border-border-warm/40 relative">
        <div className="bg-parchment-deep/90 text-espresso px-5 py-3 border-b border-border-warm/60 flex items-center justify-between">
          <span className="text-xs uppercase tracking-widest text-olive-leaf font-bold bg-olive-tint px-3 py-1 rounded-full border border-olive-leaf/20">
            🌿 Silvy's Kitchen
          </span>
          <span className="font-script text-sm font-semibold text-rattan-amber italic">
            Homemade Specialties
          </span>
        </div>

        <div
          onClick={() => onSelectProduct?.(activeProduct)}
          className="relative aspect-[16/10] w-full overflow-hidden bg-parchment-deep cursor-pointer"
        >
          <img
            src={getImageUrl(activeProduct.imageUrl ?? activeProduct.image_url)}
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

        <div className="p-5 space-y-4 bg-espresso">
          <p className="text-xs text-parchment/90 leading-relaxed max-w-xs font-serif italic">
            "Authentic Kerala flavours for your home and celebrations."
          </p>

          <div className="flex items-center justify-between pt-1">
            <button
              onClick={onExploreNow}
              className="bg-olive-deep hover:bg-olive-leaf active:scale-95 text-white px-6 py-3 rounded-2xl font-bold text-xs shadow-warm-md flex items-center gap-2 transition-all border border-white/10"
            >
              <span>EXPLORE NOW</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {heroProducts.length > 1 && (
              <div className="flex items-center gap-1.5">
                {heroProducts.map((_, idx) => (
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
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
