import React, { useState } from 'react';
import { Product } from '../types';
import { WHATSAPP_PHONE, getImageUrl } from '../config/constants';
import { WhatsAppIcon } from './WhatsAppIcon';
import { ArrowLeft, ShoppingCart, Minus, Plus } from 'lucide-react';

interface ProductDetailScreenProps {
  product: Product;
  onBack: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
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
  const [quantity, setQuantity] = useState<number>(1);
  const isAvailable = product.available !== false;

  const handleOrderWhatsApp = () => {
    const msg = `Hello Silvy's Kitchen! 👋\n\nI would like to order:\n*${product.name}* (${product.unit || '500g'}) × ${quantity}\nTotal Price: ₹${product.price * quantity}\n\nPlease confirm availability & delivery details. Thank you!`;
    const url = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  // Standard ingredients helper for authentic display
  const defaultIngredients = product.category?.toLowerCase().includes('pickle')
    ? 'Tender meat/fish pieces, pure sesame oil, fried garlic, ginger, curry leaves, fenugreek, red chili, vinegar, salt.'
    : 'Rice flour, fresh coconut milk, sesame seeds, cumin, coconut oil, cardamom, salt.';

  return (
    <div className="min-h-screen bg-parchment text-espresso flex flex-col max-w-md mx-auto relative pb-20 shadow-2xl">
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

      {/* Top Product Image */}
      <div className="w-full aspect-[4/3] bg-parchment-deep relative overflow-hidden border-b border-border-warm">
        <img
          src={getImageUrl(product.imageUrl)}
          alt={product.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'assets/logo.jpg';
          }}
        />
        {!isAvailable && (
          <div className="absolute inset-0 bg-espresso/60 flex items-center justify-center">
            <span className="bg-red-700 text-white text-xs font-bold px-4 py-2 rounded-xl uppercase tracking-wider shadow-md">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Product Content */}
      <div className="p-5 space-y-5 flex-grow">
        {/* Title & Short Description */}
        <div>
          <h2 className="font-heading text-2xl font-bold text-espresso leading-snug">
            {product.name}
          </h2>
          {product.malayalamName && (
            <div className="font-malayalam text-xs text-olive-leaf font-bold mt-0.5">
              {product.malayalamName}
            </div>
          )}
          <p className="text-xs text-espresso-muted leading-relaxed mt-2">
            {product.description}
          </p>
        </div>

        {/* Ingredients Section */}
        <div className="bg-parchment-card p-3.5 rounded-2xl border border-border-warm/60">
          <h4 className="text-xs font-bold text-espresso uppercase tracking-wider mb-1">
            Ingredients
          </h4>
          <p className="text-xs text-espresso-muted leading-relaxed">
            {defaultIngredients}
          </p>
        </div>

        {/* Weight & Price Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-parchment-deep p-3 rounded-2xl border border-border-warm/60">
            <span className="text-[11px] text-espresso-muted block">Weight</span>
            <span className="font-bold text-sm text-espresso">
              {product.unit || '500g'}
            </span>
          </div>
          <div className="bg-parchment-deep p-3 rounded-2xl border border-border-warm/60">
            <span className="text-[11px] text-espresso-muted block">Price</span>
            <span className="font-heading text-xl font-bold text-olive-deep">
              ₹{product.price}
            </span>
          </div>
        </div>

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
        <div className="space-y-3 pt-2">
          {/* Primary Add to Cart Button */}
          <button
            disabled={!isAvailable}
            onClick={() => onAddToCart(product, quantity)}
            className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm shadow-warm-md flex items-center justify-center gap-2 transition-all ${
              isAvailable
                ? 'bg-olive-deep hover:bg-olive-leaf active:scale-95 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <ShoppingCart className="w-5 h-5" />
            <span>Add to Cart</span>
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
        </div>
      </div>
    </div>
  );
};
