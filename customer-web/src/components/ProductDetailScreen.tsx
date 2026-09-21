import React, { useState, useEffect, useRef } from 'react';
import { Product, WeightOption, NutritionInfo, Review } from '../types';
import { WHATSAPP_PHONE, REVIEWS_API_URL, getImageUrl } from '../config/constants';
import { WhatsAppIcon } from './WhatsAppIcon';
import { SubmitReviewModal } from './SubmitReviewModal';
import { StarRatingDisplay } from './StarRatingDisplay';
import { ArrowLeft, ShoppingCart, Minus, Plus, Info, Star, Share2, ArrowUp, MessageSquare, Check } from 'lucide-react';

interface ProductDetailScreenProps {
  product: Product;
  onBack: () => void;
  onAddToCart: (product: Product, selectedUnit: string, selectedPrice: number, quantity: number) => void;
  cartCount: number;
  onOpenCart: () => void;
}

export const ProductDetailScreen: React.FC<ProductDetailScreenProps> = ({
  product,
  onBack,
  onAddToCart,
  cartCount,
  onOpenCart,
}) => {
  const topRef = useRef<HTMLDivElement>(null);
  const reviewsRef = useRef<HTMLDivElement>(null);

  // Sticky navigation visibility on scroll
  const [showStickyNav, setShowStickyNav] = useState<boolean>(false);
  const [showCopiedToast, setShowCopiedToast] = useState<boolean>(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      setShowStickyNav(scrollY > 220);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToReviews = () => {
    if (reviewsRef.current) {
      reviewsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Multi-image list
  const mainImage = product.imageUrl ?? product.image_url;
  const imagesList = product.images && product.images.length > 0
    ? product.images
    : [mainImage, product.imageUrl2 ?? product.image_url_2, product.imageUrl3 ?? product.image_url_3].filter(Boolean) as string[];

  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  // Weight options setup
  const woList: WeightOption[] = product.weightOptions ?? product.weight_options ?? [];
  
  // Custom enquiry mode & category unit detection
  const isPickle = product.category?.toLowerCase().includes('pickle') ?? false;
  const customUnit = isPickle ? 'kg' : 'packs';
  
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [customQuantityStr, setCustomQuantityStr] = useState<string>(isPickle ? '1.5' : '50');

  const [selectedWeightOption, setSelectedWeightOption] = useState<WeightOption | null>(() => {
    return woList.length > 0 ? woList[0] : null;
  });

  const activeUnit = isCustomMode 
    ? `Custom (${customQuantityStr} ${customUnit})` 
    : (selectedWeightOption ? selectedWeightOption.unit : (product.unit || '500g'));
    
  const activePrice = selectedWeightOption ? Number(selectedWeightOption.price) : Number(product.price);

  const [quantity, setQuantity] = useState<number>(1);
  const isAvailable = product.available !== false;

  // Product-specific reviews state
  const [productReviews, setProductReviews] = useState<Review[]>([]);

  useEffect(() => {
    fetchProductSpecificReviews();
  }, [product.id]);

  const fetchProductSpecificReviews = async () => {
    try {
      const res = await fetch(`${REVIEWS_API_URL}?product_id=${product.id}`);
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data && data.success && Array.isArray(data.data) ? data.data : null);
        if (list) {
          setProductReviews(list);
        }
      }
    } catch (err) {
      console.warn('Product specific reviews offline:', err);
    }
  };

  // Calculate overall rating if approved reviews exist
  const averageRating = productReviews.length > 0
    ? (productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length)
    : null;

  // Share functionality
  const handleShareProduct = async () => {
    const productUrl = `${window.location.origin}${window.location.pathname}?product=${product.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Silvy's Kitchen - ${product.name}`,
          text: `Check out ${product.name} from Silvy's Kitchen!`,
          url: productUrl,
        });
        return;
      } catch (err) {
        // Fallback to clipboard if share was canceled or failed
      }
    }

    try {
      await navigator.clipboard.writeText(productUrl);
      setShowCopiedToast(true);
      setTimeout(() => setShowCopiedToast(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleOrderWhatsApp = () => {
    const msg = `Hello Silvy's Kitchen! 👋\n\nI would like to order:\n• *${product.name}* (${activeUnit}) × ${quantity}\nTotal Price: ₹${activePrice * quantity}\n\nPlease confirm availability & delivery details. Thank you!`;
    const url = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  const handleCustomBulkEnquiryWhatsApp = () => {
    const rawVal = customQuantityStr.trim();
    const parsedVal = parseFloat(rawVal);
    const displayQty = !isNaN(parsedVal) && parsedVal > 0 ? rawVal : (isPickle ? '1.5' : '50');

    const msg = `Hello Silvy's Kitchen!\n\nI'm interested in ordering:\n\n• *${product.name}*\n• Quantity: ${displayQty} ${customUnit}\n\nPlease let me know the price and availability.`;
    const url = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  // Nutrition info
  const nutInfo: NutritionInfo | null = product.nutritionInfo ?? product.nutrition_info ?? null;
  const hasNutritionInfo = nutInfo !== null && typeof nutInfo === 'object' && Object.keys(nutInfo).length > 0;

  // Standard ingredients fallback
  const defaultIngredients = isPickle
    ? 'Tender meat/fish pieces, pure sesame oil, fried garlic, ginger, curry leaves, fenugreek, red chili, vinegar, salt.'
    : 'Rice flour, fresh coconut milk, sesame seeds, cumin, coconut oil, cardamom, salt.';

  return (
    <div ref={topRef} className="min-h-screen bg-parchment text-espresso flex flex-col max-w-md mx-auto relative pb-20 shadow-2xl border-x border-border-warm/40 font-body">
      {/* STICKY PRODUCT PAGE NAVIGATION BAR (Contains ONLY: [ Reviews ] [ ↑ Back to Top ]) */}
      {showStickyNav && (
        <div className="fixed top-0 left-0 right-0 z-40 max-w-md mx-auto px-4 pt-2 transition-all duration-300 pointer-events-none">
          <nav className="pointer-events-auto bg-parchment-surface/95 backdrop-blur-md border border-border-warm/80 rounded-2xl shadow-warm-lg px-4 py-2 flex items-center justify-between">
            <button
              onClick={scrollToReviews}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-olive-tint text-olive-deep font-bold text-xs hover:bg-olive-deep hover:text-white transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Reviews</span>
            </button>

            <button
              onClick={scrollToTop}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-parchment text-espresso font-bold text-xs border border-border-warm/70 hover:bg-parchment-deep transition-colors"
            >
              <ArrowUp className="w-3.5 h-3.5" />
              <span>Back to Top</span>
            </button>
          </nav>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-30 bg-parchment/90 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-border-warm/40">
        <button
          onClick={onBack}
          className="p-1.5 rounded-full hover:bg-parchment-deep text-espresso transition-colors"
          aria-label="Back"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-2">
          {/* Product Share Button */}
          <button
            onClick={handleShareProduct}
            className="p-1.5 rounded-full hover:bg-parchment-deep text-espresso transition-colors relative"
            title="Share product link"
            aria-label="Share product"
          >
            <Share2 className="w-5 h-5 text-espresso" />
          </button>

          {/* Cart Icon */}
          <button
            onClick={onOpenCart}
            className="relative p-1.5 text-espresso hover:text-olive-leaf transition-colors"
            aria-label="Open Cart"
          >
            <ShoppingCart className="w-6 h-6" />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 bg-emerald-900 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Copied Toast Alert */}
      {showCopiedToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-espresso text-white text-xs font-bold px-4 py-2 rounded-xl shadow-warm-md flex items-center gap-1.5 border border-white/20 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Link copied</span>
        </div>
      )}

      {/* MULTI-IMAGE GALLERY (1 to 3 Images) */}
      <div className="w-full aspect-[4/3] bg-parchment-deep relative overflow-hidden border-b border-border-warm">
        {imagesList.length <= 1 ? (
          <img
            src={getImageUrl(imagesList[0] || mainImage)}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'assets/logo.jpg';
            }}
          />
        ) : (
          <div className="w-full h-full flex overflow-x-auto snap-x snap-mandatory scrollbar-none">
            {imagesList.map((imgSrc, idx) => (
              <div key={idx} className="w-full h-full shrink-0 snap-center">
                <img
                  src={getImageUrl(imgSrc)}
                  alt={`${product.name} ${idx + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'assets/logo.jpg';
                  }}
                />
              </div>
            ))}
          </div>
        )}

        {!isAvailable && (
          <div className="absolute inset-0 bg-espresso/60 flex items-center justify-center">
            <span className="bg-red-700 text-white text-xs font-bold px-4 py-2 rounded-xl uppercase tracking-wider shadow-md">
              Out of Stock
            </span>
          </div>
        )}

        {/* Gallery Indicator Dots */}
        {imagesList.length > 1 && (
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
            {imagesList.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`h-2 rounded-full transition-all ${
                  activeImageIndex === idx ? 'w-5 bg-white' : 'w-2 bg-white/50'
                }`}
                aria-label={`Image ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Product Content */}
      <div className="p-5 space-y-5 flex-grow">
        {/* Title & Price */}
        <div>
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-heading text-2xl font-bold text-espresso leading-snug">
              {product.name}
            </h2>
            <span className="font-price text-2xl font-bold text-emerald-900 shrink-0">
              {isCustomMode ? 'Custom Quote' : `₹${activePrice}`}
            </span>
          </div>

          {(product.malayalamName || product.malayalam_name) && (
            <div className="font-malayalam text-xs text-olive-leaf font-bold mt-0.5">
              {product.malayalamName || product.malayalam_name}
            </div>
          )}
          <p className="text-xs text-espresso-muted leading-relaxed mt-2">
            {product.description}
          </p>
        </div>

        {/* HORIZONTAL WEIGHT OPTIONS LAYOUT */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-espresso uppercase tracking-wider block">
              SELECT WEIGHT
            </span>
            {isCustomMode && (
              <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                Bulk Enquiry Mode
              </span>
            )}
          </div>

          <div className="flex flex-row overflow-x-auto gap-3 pb-2 pt-1 scrollbar-none snap-x">
            {/* Configured Admin Weight Options */}
            {woList.length > 0 ? (
              woList.map((opt, idx) => {
                const isSelected = !isCustomMode && selectedWeightOption?.unit === opt.unit;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setIsCustomMode(false);
                      setSelectedWeightOption(opt);
                    }}
                    className={`shrink-0 snap-start px-4 py-3 rounded-2xl text-center border transition-all cursor-pointer min-w-[96px] ${
                      isSelected
                        ? 'bg-emerald-900 text-amber-50 border-emerald-900 shadow-md ring-2 ring-emerald-900/20'
                        : 'bg-parchment-card text-espresso border-border-warm/70 hover:bg-parchment-deep hover:border-border-warm'
                    }`}
                  >
                    <span className="block text-xs font-bold font-sans tracking-wide">
                      {opt.unit}
                    </span>
                    <span className="block text-sm font-bold font-price mt-1 opacity-90">
                      ₹{opt.price}
                    </span>
                  </button>
                );
              })
            ) : (
              /* Fallback single weight option when woList is empty */
              <button
                type="button"
                onClick={() => setIsCustomMode(false)}
                className={`shrink-0 snap-start px-4 py-3 rounded-2xl text-center border transition-all cursor-pointer min-w-[96px] ${
                  !isCustomMode
                    ? 'bg-emerald-900 text-amber-50 border-emerald-900 shadow-md ring-2 ring-emerald-900/20'
                    : 'bg-parchment-card text-espresso border-border-warm/70 hover:bg-parchment-deep'
                }`}
              >
                <span className="block text-xs font-bold font-sans tracking-wide">
                  {product.unit || '500g'}
                </span>
                <span className="block text-sm font-bold font-price mt-1 opacity-90">
                  ₹{product.price}
                </span>
              </button>
            )}

            {/* Custom / Bulk Option Card */}
            <button
              type="button"
              onClick={() => setIsCustomMode(true)}
              className={`shrink-0 snap-start px-4 py-3 rounded-2xl text-center border transition-all cursor-pointer min-w-[96px] ${
                isCustomMode
                  ? 'bg-emerald-900 text-amber-50 border-emerald-900 shadow-md ring-2 ring-emerald-900/20'
                  : 'bg-parchment-card text-espresso border-border-warm/70 hover:bg-parchment-deep'
              }`}
            >
              <span className="block text-xs font-bold font-sans tracking-wide">
                Custom / Bulk
              </span>
              <span className="block text-xs font-semibold font-heading mt-1 opacity-90">
                Enquire
              </span>
            </button>
          </div>
        </div>

        {/* CUSTOM QUANTITY INPUT (When in Custom Mode) */}
        {isCustomMode && (
          <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200/80 space-y-2">
            <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider block">
              CUSTOM / BULK ORDER
            </span>
            <span className="text-xs font-bold text-espresso block">
              Quantity
            </span>

            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-[200px]">
                <input
                  type="number"
                  step={isPickle ? "0.25" : "1"}
                  min={isPickle ? "0.25" : "1"}
                  max="100"
                  value={customQuantityStr}
                  onChange={(e) => setCustomQuantityStr(e.target.value)}
                  placeholder={isPickle ? "1.5" : "50"}
                  className="w-full bg-white border border-border-warm rounded-2xl px-4 py-2.5 text-base font-bold font-heading text-espresso focus:outline-none focus:ring-2 focus:ring-emerald-900/30 shadow-inner"
                />
                <span className="absolute right-4 top-3 text-xs font-bold text-espresso-muted pointer-events-none uppercase">
                  {customUnit}
                </span>
              </div>

              {/* Steppers */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    const cur = parseFloat(customQuantityStr) || (isPickle ? 1.5 : 10);
                    const step = isPickle ? 0.5 : 5;
                    const nextVal = Math.max(isPickle ? 0.25 : 1, Math.round((cur - step) * 100) / 100);
                    setCustomQuantityStr(String(nextVal));
                  }}
                  className="w-9 h-9 rounded-xl bg-white border border-border-warm flex items-center justify-center font-bold text-espresso hover:bg-parchment active:scale-95 shadow-xs"
                  aria-label="Decrease custom quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const cur = parseFloat(customQuantityStr) || 0;
                    const step = isPickle ? 0.5 : 5;
                    const nextVal = Math.round((cur + step) * 100) / 100;
                    setCustomQuantityStr(String(nextVal));
                  }}
                  className="w-9 h-9 rounded-xl bg-white border border-border-warm flex items-center justify-center font-bold text-espresso hover:bg-parchment active:scale-95 shadow-xs"
                  aria-label="Increase custom quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* HORIZONTAL QUANTITY SELECTOR (For Standard Fixed Price Mode) */}
        {!isCustomMode && isAvailable && (
          <div className="space-y-1.5 pt-1">
            <span className="text-xs font-bold text-espresso uppercase tracking-wider block">
              Quantity
            </span>
            <div className="flex items-center justify-between bg-parchment-card border border-border-warm/80 rounded-2xl p-2 w-36 shadow-xs">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 rounded-xl bg-white border border-border-warm flex items-center justify-center font-bold text-espresso hover:bg-parchment transition-colors active:scale-95"
                aria-label="Decrease quantity"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="flex-1 text-center font-bold text-base font-price text-espresso">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="w-8 h-8 rounded-xl bg-white border border-border-warm flex items-center justify-center font-bold text-espresso hover:bg-parchment transition-colors active:scale-95"
                aria-label="Increase quantity"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Ingredients Section */}
        <div className="bg-parchment-card p-3.5 rounded-2xl border border-border-warm/60">
          <h4 className="text-xs font-bold text-espresso uppercase tracking-wider mb-1">
            Ingredients
          </h4>
          <p className="text-xs text-espresso-muted leading-relaxed">
            {defaultIngredients}
          </p>
        </div>

        {/* VERIFIED OPTIONAL NUTRITION PANEL */}
        {hasNutritionInfo && nutInfo && (
          <div className="bg-white p-3.5 rounded-2xl border border-border-warm/70 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 uppercase tracking-wider">
              <Info className="w-4 h-4 text-olive-leaf" />
              <span>Verified Nutrition Information</span>
            </div>

            {(nutInfo.serving_size || nutInfo.servingSize) && (
              <span className="text-[11px] text-espresso-muted block italic">
                Per serving size: {nutInfo.serving_size || nutInfo.servingSize}
              </span>
            )}

            <div className="grid grid-cols-3 gap-2 pt-1">
              {(nutInfo.energy_kcal ?? nutInfo.energyKcal) !== undefined && (
                <div className="bg-parchment/60 p-2 rounded-xl text-center border border-border-warm/40">
                  <span className="text-[10px] text-espresso-muted block">Energy</span>
                  <span className="font-bold text-xs text-espresso">{nutInfo.energy_kcal ?? nutInfo.energyKcal} kcal</span>
                </div>
              )}
              {(nutInfo.protein_g ?? nutInfo.proteinG) !== undefined && (
                <div className="bg-parchment/60 p-2 rounded-xl text-center border border-border-warm/40">
                  <span className="text-[10px] text-espresso-muted block">Protein</span>
                  <span className="font-bold text-xs text-espresso">{nutInfo.protein_g ?? nutInfo.proteinG} g</span>
                </div>
              )}
              {(nutInfo.carbohydrate_g ?? nutInfo.carbohydrateG) !== undefined && (
                <div className="bg-parchment/60 p-2 rounded-xl text-center border border-border-warm/40">
                  <span className="text-[10px] text-espresso-muted block">Carbs</span>
                  <span className="font-bold text-xs text-espresso">{nutInfo.carbohydrate_g ?? nutInfo.carbohydrateG} g</span>
                </div>
              )}
              {(nutInfo.total_fat_g ?? nutInfo.totalFatG) !== undefined && (
                <div className="bg-parchment/60 p-2 rounded-xl text-center border border-border-warm/40">
                  <span className="text-[10px] text-espresso-muted block">Total Fat</span>
                  <span className="font-bold text-xs text-espresso">{nutInfo.total_fat_g ?? nutInfo.totalFatG} g</span>
                </div>
              )}
              {(nutInfo.total_sugar_g ?? nutInfo.totalSugarG) !== undefined && (
                <div className="bg-parchment/60 p-2 rounded-xl text-center border border-border-warm/40">
                  <span className="text-[10px] text-espresso-muted block">Sugar</span>
                  <span className="font-bold text-xs text-espresso">{nutInfo.total_sugar_g ?? nutInfo.totalSugarG} g</span>
                </div>
              )}
              {(nutInfo.sodium_mg ?? nutInfo.sodiumMg) !== undefined && (
                <div className="bg-parchment/60 p-2 rounded-xl text-center border border-border-warm/40">
                  <span className="text-[10px] text-espresso-muted block">Sodium</span>
                  <span className="font-bold text-xs text-espresso">{nutInfo.sodium_mg ?? nutInfo.sodiumMg} mg</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ACTION BUTTONS & CTAs */}
        <div className="space-y-2.5 pt-2">
          {!isCustomMode ? (
            <>
              {/* Primary Add to Cart Button */}
              <button
                disabled={!isAvailable}
                onClick={() => onAddToCart(product, activeUnit, activePrice, quantity)}
                className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm shadow-warm-md flex items-center justify-center gap-2 transition-all ${
                  isAvailable
                    ? 'bg-emerald-900 hover:bg-emerald-800 active:scale-95 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <ShoppingCart className="w-5 h-5" />
                <span>Add to Cart ({activeUnit} — <span className="font-price">₹{activePrice * quantity}</span>)</span>
              </button>

              {/* Secondary Order on WhatsApp Button */}
              <button
                disabled={!isAvailable}
                onClick={handleOrderWhatsApp}
                className={`w-full py-3 px-6 rounded-2xl font-bold text-sm border flex items-center justify-center gap-2.5 transition-all ${
                  isAvailable
                    ? 'bg-white hover:bg-parchment-deep text-emerald-900 border-emerald-900/30 active:scale-95 shadow-xs'
                    : 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed'
                }`}
              >
                <WhatsAppIcon className="text-[#25D366] w-5 h-5" />
                <span>Order on WhatsApp</span>
              </button>
            </>
          ) : (
            /* Custom Quantity / Bulk WhatsApp Enquiry CTA */
            <button
              onClick={handleCustomBulkEnquiryWhatsApp}
              className="w-full py-3.5 px-6 rounded-2xl font-bold text-sm bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-warm-md flex items-center justify-center gap-2.5 transition-all active:scale-95"
            >
              <WhatsAppIcon className="text-white w-5 h-5" />
              <span>Enquire on WhatsApp</span>
            </button>
          )}
        </div>

        {/* PRODUCT-SPECIFIC REVIEWS SECTION */}
        <div ref={reviewsRef} className="pt-6 border-t border-border-warm/60 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="font-heading text-lg font-bold text-espresso mb-1">
                Customer Reviews
              </h3>
              {averageRating !== null ? (
                <StarRatingDisplay rating={averageRating} size="md" showNumeric={true} />
              ) : (
                <span className="text-xs text-espresso-muted italic block mt-0.5 font-serif">
                  No reviews yet for this product. Be the first!
                </span>
              )}
            </div>

            {/* WRITE A REVIEW BUTTON (Product pre-attached) */}
            <button
              onClick={() => setIsReviewModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-olive-deep hover:bg-olive-leaf active:scale-95 text-white font-bold text-xs shadow-warm-sm flex items-center gap-1.5 transition-all"
            >
              <Star className="w-3.5 h-3.5 text-rattan-gold fill-rattan-gold" />
              <span>Write a Review</span>
            </button>
          </div>

          {/* List of Approved Product Reviews */}
          {productReviews.length > 0 && (
            <div className="space-y-3 pt-1">
              {productReviews.map((rev) => (
                <div key={rev.id} className="bg-parchment-card p-4 rounded-2xl border border-border-warm/70 space-y-2 shadow-warm-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-heading text-xs font-bold text-espresso">
                      {rev.customerName || rev.customer_name}
                    </span>
                    <StarRatingDisplay rating={rev.rating} size="sm" showNumeric={false} />
                  </div>
                  <p className="text-xs text-espresso italic font-serif leading-relaxed">
                    "{rev.reviewText || rev.review_text}"
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Product Specific Review Submission Modal */}
      <SubmitReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        targetProduct={product}
        onReviewSubmitted={fetchProductSpecificReviews}
      />
    </div>
  );
};
