import React from 'react';
import { WHATSAPP_PHONE } from '../config/constants';

export const BulkOrderBanner: React.FC = () => {
  const handleBulkEnquiry = () => {
    const msg = `Hello Silvy's Kitchen! 👋\n\nI am interested in ordering traditional Kerala snacks for an upcoming event/celebration.\n\n*Items:* Achappam / Kuzhalappam / Jackfruit Chips\n*Estimated Quantity:*\n*Event Date:*\n*Location:*\n\nPlease share the bulk pricing and delivery options. Thank you!`;
    const url = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  return (
    <section className="py-6 px-4 max-w-4xl mx-auto w-full my-4">
      <div className="bg-gradient-to-br from-olive-deep via-olive-leaf to-olive-deep text-white rounded-3xl p-6 sm:p-8 shadow-warm-lg relative overflow-hidden">
        {/* Subtle decorative background watermark */}
        <div className="absolute -right-10 -bottom-10 opacity-10 text-9xl pointer-events-none select-none">
          ✨
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-center sm:text-left max-w-xl">
            <span className="inline-block bg-rattan-gold/20 text-rattan-sand text-xs font-semibold px-3.5 py-1 rounded-full border border-rattan-gold/30 mb-3">
              🎉 Event & Function Catering
            </span>
            <h3 className="font-heading text-2xl sm:text-3xl font-bold text-white mb-2">
              Planning a Celebration?
            </h3>
            <p className="text-sm text-parchment/90 leading-relaxed">
              Let us prepare fresh, handmade traditional Kerala snacks for your <span className="font-semibold text-rattan-sand">Weddings</span>, <span className="font-semibold text-rattan-sand">House Functions</span>, <span className="font-semibold text-rattan-sand">Festivals</span> & special family events.
            </p>
          </div>

          <button
            onClick={handleBulkEnquiry}
            className="w-full sm:w-auto shrink-0 bg-[#25D366] hover:bg-[#1EBE57] active:scale-95 text-white font-bold px-6 py-3.5 rounded-2xl shadow-warm-md flex items-center justify-center gap-2.5 transition-all text-sm sm:text-base border border-white/20"
          >
            <span className="text-lg">💬</span>
            <span>Enquire on WhatsApp</span>
          </button>
        </div>
      </div>
    </section>
  );
};
