import React, { useState, useEffect } from 'react';
import { Product, WeightOption, NutritionInfo, Review } from '../types';
import { WHATSAPP_PHONE, REVIEWS_API_URL, getImageUrl } from '../config/constants';
import { WhatsAppIcon } from './WhatsAppIcon';
import { ArrowLeft, ShoppingCart, Minus, Plus, Info, Star, HeartHandshake } from 'lucide-react';

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
  // Multi-image list
  const mainImage = product.imageUrl ?? product.image_url;
  const imagesList = product.images && product.images.length > 0
    ? product.images
    : [mainImage, product.imageUrl2 ?? product.image_url_2, product.imageUrl3 ?? product.image_url_3].filter(Boolean) as string[];

  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  // Weight options setup
  const woList: WeightOption[] = product.weightOptions ?? product.weight_options ?? [];
  const [selectedWeightOption, setSelectedWeightOption] = useState<WeightOption | null>(() => {
    return woList.length > 0 ? woList[0] : null;
  });

  const activeUnit = selectedWeightOption ? selectedWeightOption.unit : (product.unit || '500g');
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

  const handleOrderWhatsApp = () => {
    const msg = `Hello Silvy's Kitchen! 👋\n\nI would like to order:\n*${product.name}* (${activeUnit}) × ${quantity}\nTotal Price: ₹${activePrice * quantity}\n\nPlease confirm availability & delivery details. Thank you!`;
    const url = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  const handleCustomBulkEnquiryWhatsApp = () => {
    const msg = `Hello Silvy's Kitchen! 👋\n\nI have a custom quantity / bulk order enquiry for *${product.name}*.\nPlease let me know pricing and delivery details for custom weight options. Thank you!`;
    const url = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  // Nutrition info
  const nutInfo: NutritionInfo | null = product.nutritionInfo ?? product.nutrition_info ?? null;
  const hasNutritionInfo = nutInfo !== null && typeof nutInfo === 'object' && Object.keys(nutInfo).length > 0;

  // Standard ingredients fallback
  const defaultIngredients = product.category?.toLowerCase().includes('pickle')
    ? 'Tender meat/fish pieces, pure sesame oil, fried garlic, ginger, curry leaves, fenugreek, red chili, vinegar, salt.'
    : 'Rice flour, fresh coconut milk, sesame seeds, cumin, coconut oil, cardamom, salt.';

  return (
    <div className="min-h-screen bg-parchment text-espresso flex flex-col max-w-md mx-auto relative pb-20 shadow-2xl font-body">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-parchment/90 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-border-warm/40">
        <button
          onClick={onBack}
          className="p-1.5 rounded-full hover:bg-parchment-deep text-espresso transition-colors"
          aria-label="Back"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <button
          onClick={onOpenCart}
          className="relative p-1.5 text-espresso hover:text-olive-leaf transition-colors"
          aria-label="Open Cart"
        >
          <ShoppingCart className="w-6 h-6" />
          {cartCount > 0 && (
            <span className="absolute top-0 right-0 bg-olive-deep text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white">
              {cartCount}
            </span>
          )}
        </button>
      </header>

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
        {/* Title & Short Description */}
        <div>
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-heading text-2xl font-bold text-espresso leading-snug">
              {product.name}
            </h2>
            <span className="font-heading text-2xl font-bold text-olive-deep shrink-0">
              ₹{activePrice}
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

        {/* FLEXIBLE WEIGHT & QUANTITY OPTIONS SELECTOR */}
        {woList.length > 0 && (
          <div className="space-y-2">
            <label className="text-xs font-bold text-espresso uppercase tracking-wider block">
              Select Weight / Quantity Option
            </label>
            <div className="flex flex-wrap gap-2">
              {woList.map((opt, idx) => {
                const isSelected = selectedWeightOption?.unit === opt.unit;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedWeightOption(opt)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                      isSelected
                        ? 'bg-olive-deep text-white border-olive-deep shadow-xs'
                        : 'bg-parchment-card text-espresso border-border-warm/70 hover:bg-parchment-deep'
                    }`}
                  >
                    <span>{opt.unit}</span>
                    <span className="ml-1.5 opacity-90 font-heading">₹{opt.price}</span>
                  </button>
                );
              })}
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
            <div className="flex items-center gap-1.5 text-xs font-bold text-olive-deep uppercase tracking-wider">
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

        {/* Quantity Controls */}
        {isAvailable && (
          <div className="space-y-1 pt-1">
            <span className="text-xs font-bold text-espresso uppercase tracking-wider block">
              Quantity
            </span>
            <div className="flex items-center gap-4 bg-parchment-card border border-border-warm rounded-2xl p-2 max-w-[160px]">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 rounded-xl bg-white border border-border-warm flex items-center justify-center font-bold text-espresso hover:bg-parchment"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="flex-1 text-center font-bold text-base">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-8 h-8 rounded-xl bg-white border border-border-warm flex items-center justify-center font-bold text-espresso hover:bg-parchment"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          {/* Primary Add to Cart Button */}
          <button
            disabled={!isAvailable}
            onClick={() => onAddToCart(product, activeUnit, activePrice, quantity)}
            className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm shadow-warm-md flex items-center justify-center gap-2 transition-all ${
              isAvailable
                ? 'bg-olive-deep hover:bg-olive-leaf active:scale-95 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <ShoppingCart className="w-5 h-5" />
            <span>Add to Cart ({activeUnit} — ₹{activePrice * quantity})</span>
          </button>

          {/* Secondary Order on WhatsApp Button */}
          <button
            disabled={!isAvailable}
            onClick={handleOrderWhatsApp}
            className={`w-full py-3 px-6 rounded-2xl font-bold text-sm border flex items-center justify-center gap-2.5 transition-all ${
              isAvailable
                ? 'bg-white hover:bg-parchment-deep text-olive-deep border-olive-leaf/40 active:scale-95 shadow-xs'
                : 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed'
            }`}
          >
            <WhatsAppIcon className="text-[#25D366] w-5 h-5" />
            <span>Order on WhatsApp</span>
          </button>

          {/* CUSTOM / BULK QUANTITY WHATSAPP ENQUIRY ACTION */}
          <button
            onClick={handleCustomBulkEnquiryWhatsApp}
            className="w-full py-2.5 px-4 text-center text-xs font-semibold text-olive-leaf hover:text-olive-deep flex items-center justify-center gap-1.5 bg-parchment/40 hover:bg-parchment rounded-xl border border-border-warm/40"
          >
            <HeartHandshake className="w-4 h-4" />
            <span>Need custom weight or bulk order (e.g. 5kg, 10kg)? Enquire on WhatsApp</span>
          </button>
        </div>

        {/* PRODUCT-SPECIFIC REVIEWS SECTION */}
        {productReviews.length > 0 && (
          <div className="pt-4 border-t border-border-warm/60 space-y-3">
            <h4 className="text-xs font-bold text-espresso uppercase tracking-wider">
              Customer Reviews for {product.name} ({productReviews.length})
            </h4>
            <div className="space-y-2.5">
              {productReviews.map((rev) => (
                <div key={rev.id} className="bg-parchment-card p-3 rounded-2xl border border-border-warm/60 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-heading text-xs font-bold text-espresso">{rev.customerName || rev.customer_name}</span>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${i < rev.rating ? 'text-rattan-gold fill-rattan-gold' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-espresso italic font-serif leading-relaxed">
                    "{rev.reviewText || rev.review_text}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
