import React from 'react';
import { Product } from '../types';
import { getImageUrl } from '../config/constants';

interface ProductCardProps {
  product: Product;
  onAddToCart: (e: React.MouseEvent, product: Product) => void;
  onOpenDetails: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onOpenDetails,
}) => {
  const isAvailable = product.available !== false;
  const mainImage = product.imageUrl ?? product.image_url;

  const imagesList = product.images && product.images.length > 0
    ? product.images
    : [mainImage, product.imageUrl2 ?? product.image_url_2, product.imageUrl3 ?? product.image_url_3].filter(Boolean) as string[];

  const woList = product.weightOptions ?? product.weight_options ?? [];
  const minPrice = woList.length > 0
    ? Math.min(...woList.map(o => Number(o.price)))
    : product.price;

  const unitDisplay = woList.length > 0
    ? `${woList.length} options`
    : (product.unit || '500g');

  return (
    <div
      onClick={() => onOpenDetails(product)}
      className="bg-parchment-card border border-border-warm/70 rounded-2xl p-3 flex gap-3 items-center shadow-warm-xs hover:shadow-warm-sm transition-all duration-300 cursor-pointer group"
    >
      {/* Product Image Thumbnail */}
      <div className="relative w-24 h-24 shrink-0 rounded-xl overflow-hidden bg-parchment-deep border border-border-warm/40">
        <img
          src={getImageUrl(mainImage)}
          alt={product.name}
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
            !isAvailable ? 'grayscale opacity-60' : ''
          }`}
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'assets/logo.jpg';
          }}
        />
        {imagesList.length > 1 && isAvailable && (
          <span className="absolute bottom-1 right-1 bg-espresso/80 text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded">
            📷 {imagesList.length}
          </span>
        )}
        {!isAvailable && (
          <span className="absolute inset-0 bg-espresso/60 flex items-center justify-center text-[9px] font-bold text-white uppercase text-center p-1">
            Out of Stock
          </span>
        )}
      </div>

      {/* Product Info & Action */}
      <div className="flex-grow min-w-0 flex flex-col justify-between h-full py-0.5">
        <div>
          <h4 className="font-heading text-base font-bold text-espresso leading-snug truncate">
            {product.name}
          </h4>
          {(product.malayalamName || product.malayalam_name) && (
            <span className="text-[11px] text-olive-leaf font-bold font-malayalam block truncate">
              {product.malayalamName || product.malayalam_name}
            </span>
          )}
          <p className="text-xs text-espresso-muted line-clamp-2 mt-0.5 leading-tight">
            {product.description}
          </p>
        </div>

        <div className="flex items-center justify-between mt-2 pt-2 border-t border-border-warm/40">
          <span className="text-xs font-bold text-espresso bg-parchment-deep px-2 py-0.5 rounded-md border border-border-warm/40">
            {unitDisplay} | <span className="text-olive-deep font-price font-bold text-sm">₹{minPrice}</span>
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              if (isAvailable) {
                if (woList.length > 0) {
                  onOpenDetails(product);
                } else {
                  onAddToCart(e, product);
                }
              }
            }}
            disabled={!isAvailable}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
              isAvailable
                ? 'bg-olive-deep hover:bg-olive-leaf active:scale-95 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {woList.length > 0 ? 'Select Options' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
};
