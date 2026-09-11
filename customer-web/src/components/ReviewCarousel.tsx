import React from 'react';
import { Review } from '../types';
import { Star, Heart, MessageSquarePlus } from 'lucide-react';

interface ReviewCarouselProps {
  reviews: Review[];
  onOpenSubmitModal: () => void;
}

export const ReviewCarousel: React.FC<ReviewCarouselProps> = ({
  reviews,
  onOpenSubmitModal,
}) => {
  return (
    <section className="py-5 bg-parchment-deep/40 border-y border-border-warm/60 my-4 font-body">
      {/* Header Section */}
      <div className="px-5 mb-4 flex items-end justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-olive-leaf font-semibold uppercase tracking-wider mb-1">
            <Heart className="w-3.5 h-3.5 fill-olive-leaf text-olive-leaf" />
            <span>Community Notes</span>
          </div>
          <h3 className="font-heading text-2xl font-bold text-espresso leading-snug">
            A Little Love From Our Kitchen
          </h3>
          <p className="text-xs text-espresso-muted mt-0.5 font-serif italic">
            "Notes from homes that tasted Silvy's Kitchen."
          </p>
        </div>

        <button
          onClick={onOpenSubmitModal}
          className="shrink-0 text-xs font-bold text-olive-deep bg-white border border-olive-leaf/30 hover:bg-olive-tint px-3 py-1.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5"
        >
          <MessageSquarePlus className="w-3.5 h-3.5" />
          <span>Note Us</span>
        </button>
      </div>

      {/* Horizontal Swipe Carousel for Mobile */}
      {reviews.length === 0 ? (
        <div className="px-5 py-6 text-center bg-parchment-card mx-4 rounded-2xl border border-dashed border-border-warm/80">
          <p className="text-xs text-espresso-muted">
            Be the first to share a note from your kitchen table!
          </p>
          <button
            onClick={onOpenSubmitModal}
            className="mt-2 text-xs font-bold text-olive-deep underline"
          >
            Share Your Experience
          </button>
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory px-5 pb-3 scrollbar-none select-none">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="snap-center shrink-0 w-[270px] sm:w-[300px] bg-parchment-card border border-border-warm rounded-2xl p-4 shadow-warm-sm relative flex flex-col justify-between hover:shadow-warm-md transition-shadow duration-300"
            >
              {/* Paper Note Card Top Bar */}
              <div className="flex justify-between items-center mb-2">
                {/* 5-Star Rating */}
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < rev.rating
                          ? 'text-rattan-gold fill-rattan-gold'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                {/* Decorative Botanical Heart Detail */}
                <span className="text-red-700/60 text-xs select-none">♡</span>
              </div>

              {/* Review Text Note */}
              <p className="text-xs text-espresso italic font-serif leading-relaxed my-1">
                "{rev.reviewText}"
              </p>

              {/* Author & Optional Product Tag */}
              <div className="mt-3 pt-2 border-t border-border-warm/40 flex items-center justify-between">
                <span className="text-xs font-bold text-espresso font-heading">
                  — {rev.customerName}
                </span>
                {rev.productName && (
                  <span className="text-[10px] text-olive-deep font-semibold bg-olive-tint px-2 py-0.5 rounded-full border border-olive-leaf/20 truncate max-w-[120px]">
                    {rev.productName}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
