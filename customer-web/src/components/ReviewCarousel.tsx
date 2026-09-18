import React from 'react';
import { Review } from '../types';
import { Sparkles } from 'lucide-react';
import { StarRatingDisplay } from './StarRatingDisplay';

interface ReviewCarouselProps {
  reviews: Review[];
}

export const ReviewCarousel: React.FC<ReviewCarouselProps> = ({
  reviews,
}) => {
  // Filter ONLY approved AND featured reviews
  const featuredReviews = reviews.filter(
    (r) => r.approved !== false && (r.isFeatured === true || r.is_featured === true)
  );

  // If zero featured reviews exist, hide the section gracefully
  if (featuredReviews.length === 0) {
    return null;
  }

  return (
    <section className="py-5 bg-parchment-deep/40 border-y border-border-warm/60 my-4 font-body">
      {/* Header Section */}
      <div className="px-5 mb-4">
        <div className="flex items-center gap-1.5 text-xs text-olive-leaf font-bold uppercase tracking-wider mb-1">
          <Sparkles className="w-3.5 h-3.5 text-rattan-gold fill-rattan-gold" />
          <span>Customer Feedback</span>
        </div>
        <h3 className="font-heading text-2xl font-bold text-espresso leading-snug">
          What Our Customers Say
        </h3>
        <p className="text-xs text-espresso-muted mt-0.5 font-serif italic">
          "Handcrafted recipes loved by our community."
        </p>
      </div>

      {/* Horizontal Swipe Carousel for Featured Reviews */}
      <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory px-5 pb-3 scrollbar-none select-none">
        {featuredReviews.map((rev) => {
          const author = rev.customerName || rev.customer_name;
          const text = rev.reviewText || rev.review_text;
          const prodName = rev.productName || rev.product_name;

          return (
            <div
              key={rev.id}
              className="snap-center shrink-0 w-[270px] sm:w-[300px] bg-parchment-card border border-border-warm rounded-2xl p-4 shadow-warm-sm relative flex flex-col justify-between hover:shadow-warm-md transition-shadow duration-300"
            >
              {/* Paper Note Card Top Bar */}
              <div className="flex justify-between items-center mb-2">
                {/* 5-Star Rating */}
                <StarRatingDisplay rating={rev.rating} size="sm" showNumeric={false} />
                <span className="text-red-700/60 text-xs select-none">♡</span>
              </div>

              {/* Review Text Note */}
              <p className="text-xs text-espresso italic font-serif leading-relaxed my-1">
                "{text}"
              </p>

              {/* Author & Optional Product Tag */}
              <div className="mt-3 pt-2 border-t border-border-warm/40 flex items-center justify-between">
                <span className="text-xs font-bold text-espresso font-heading">
                  — {author}
                </span>
                {prodName && (
                  <span className="text-[10px] text-olive-deep font-semibold bg-olive-tint px-2 py-0.5 rounded-full border border-olive-leaf/20 truncate max-w-[120px]">
                    {prodName}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

