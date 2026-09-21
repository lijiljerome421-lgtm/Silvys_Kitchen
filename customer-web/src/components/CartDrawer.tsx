import React from 'react';
import { CartItem } from '../types';
import { WHATSAPP_PHONE, getImageUrl } from '../config/constants';
import { WhatsAppIcon } from './WhatsAppIcon';
import { ArrowLeft, Trash2, Minus, Plus } from 'lucide-react';

interface CartDrawerProps {
  cart: CartItem[];
  onBack: () => void;
  onUpdateQuantity: (cartItemId: string, delta: number) => void;
  onRemoveItem: (cartItemId: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  cart,
  onBack,
  onUpdateQuantity,
  onRemoveItem,
}) => {
  const cartTotal = cart.reduce((sum, item) => sum + item.selectedPrice * item.quantity, 0);

  const handleOrderWhatsApp = () => {
    if (cart.length === 0) return;

    let msg = `Hello Silvy's Kitchen! 👋\n\nI would like to order:\n\n`;

    cart.forEach((item, index) => {
      const unitStr = item.selectedUnit ? ` (${item.selectedUnit})` : '';
      msg += `${index + 1}. *${item.name}*${unitStr} × ${item.quantity}\n`;
      msg += `   ₹${item.selectedPrice * item.quantity}\n\n`;
    });

    msg += `*Total Amount:* ₹${cartTotal}\n\n`;
    msg += `Thank you! Please confirm item availability and delivery timing.`;

    const url = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-parchment text-espresso flex flex-col max-w-md mx-auto relative pb-20 shadow-2xl font-body">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-parchment/95 backdrop-blur-md px-4 py-3 flex items-center gap-3 border-b border-border-warm/40 shadow-xs">
        <button
          onClick={onBack}
          className="p-1.5 rounded-full hover:bg-parchment-deep text-espresso transition-colors"
          aria-label="Back"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="font-heading text-2xl font-bold text-espresso">
          Your Cart
        </h2>
      </header>

      {/* Cart List */}
      <div className="p-4 flex-grow space-y-4 overflow-y-auto">
        {cart.length === 0 ? (
          <div className="text-center py-20 text-espresso-muted flex flex-col items-center">
            <span className="text-5xl mb-3 opacity-30">🧺</span>
            <p className="font-heading text-lg font-bold text-espresso mb-1">
              Your cart is empty
            </p>
            <p className="text-xs">
              Explore our homemade pickles & traditional snacks to add items.
            </p>
          </div>
        ) : (
          cart.map((item) => (
            <div
              key={item.cartItemId}
              className="bg-parchment-card border border-border-warm/60 rounded-2xl p-3 flex gap-3 items-center shadow-xs"
            >
              {/* Product Thumbnail */}
              <img
                src={getImageUrl(item.imageUrl)}
                alt={item.name}
                className="w-16 h-16 object-cover rounded-xl border border-border-warm/40 shrink-0 bg-white"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'assets/logo.jpg';
                }}
              />

              {/* Product Details */}
              <div className="flex-grow min-w-0">
                <div className="flex items-start justify-between gap-1">
                  <h4 className="font-heading text-sm font-bold text-espresso truncate">
                    {item.name}
                  </h4>
                  <button
                    onClick={() => onRemoveItem(item.cartItemId)}
                    className="text-espresso-muted hover:text-red-700 p-0.5 transition-colors shrink-0"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-[11px] text-espresso-muted font-bold">
                  {item.selectedUnit}
                </div>

                <div className="text-xs font-semibold font-price text-espresso mt-0.5">
                  ₹{item.selectedPrice} × {item.quantity}
                </div>

                {/* Quantity adjusters */}
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-2 bg-parchment border border-border-warm/60 rounded-lg p-1">
                    <button
                      onClick={() => onUpdateQuantity(item.cartItemId, -1)}
                      className="w-5 h-5 rounded bg-white border border-border-warm flex items-center justify-center text-espresso text-xs font-bold"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-4 text-center font-bold font-price text-xs">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(item.cartItemId, 1)}
                      className="w-5 h-5 rounded bg-white border border-border-warm flex items-center justify-center text-espresso text-xs font-bold"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="font-price text-sm font-bold text-olive-deep ml-auto">
                    ₹{item.selectedPrice * item.quantity}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Cart Footer Checkout */}
      {cart.length > 0 && (
        <div className="p-4 bg-parchment border-t border-border-warm/60 space-y-3">
          <div className="flex justify-between items-center px-1">
            <span className="font-heading text-lg font-bold text-espresso">
              Total
            </span>
            <span className="font-price text-2xl font-bold text-olive-deep">
              ₹{cartTotal}
            </span>
          </div>

          {/* WhatsApp Order Button */}
          <button
            onClick={handleOrderWhatsApp}
            className="w-full bg-[#25D366] hover:bg-[#1EBE57] active:scale-95 text-white font-bold py-3.5 rounded-2xl shadow-warm-md flex items-center justify-center gap-2.5 transition-all text-sm"
          >
            <WhatsAppIcon className="w-5 h-5" />
            <span>Order on WhatsApp</span>
          </button>

          <p className="text-[11px] text-espresso-muted text-center">
            You will be redirected to WhatsApp with your order details.
          </p>
        </div>
      )}
    </div>
  );
};
