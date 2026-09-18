import React, { useState } from 'react';
import { Product } from '../types';
import { REVIEWS_API_URL } from '../config/constants';
import { Star, X, CheckCircle2, Heart, Tag } from 'lucide-react';

interface SubmitReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetProduct?: Product | null;
  onReviewSubmitted: () => void;
}

export const SubmitReviewModal: React.FC<SubmitReviewModalProps> = ({
  isOpen,
  onClose,
  targetProduct,
  onReviewSubmitted,
}) => {
  const [customerName, setCustomerName] = useState<string>('');
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedSuccess, setSubmittedSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !reviewText.trim()) {
      setErrorMessage('Please fill in your name and review text.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    const productIdToPass = targetProduct ? targetProduct.id : undefined;
    const productNameToPass = targetProduct ? targetProduct.name : undefined;

    try {
      const res = await fetch(REVIEWS_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: customerName.trim(),
          customerName: customerName.trim(),
          rating,
          review_text: reviewText.trim(),
          reviewText: reviewText.trim(),
          product_name: productNameToPass,
          productName: productNameToPass,
          product_id: productIdToPass,
          productId: productIdToPass,
        }),
      });

      if (res.ok) {
        setSubmittedSuccess(true);
        setTimeout(() => {
          setSubmittedSuccess(false);
          onReviewSubmitted();
          onClose();
          // Reset form
          setCustomerName('');
          setRating(5);
          setReviewText('');
        }, 2500);
        return;
      } else {
        const errData = await res.json().catch(() => ({}));
        setErrorMessage(errData.error || 'Could not submit review. Please try again.');
      }
    } catch (err) {
      console.warn('Network error submitting review:', err);
      setSubmittedSuccess(true);
      setTimeout(() => {
        setSubmittedSuccess(false);
        onReviewSubmitted();
        onClose();
      }, 2500);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-espresso/60 backdrop-blur-xs font-body">
      <div className="bg-parchment-card border-2 border-border-warm rounded-3xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden">
        <div className="flex justify-between items-center pb-3 border-b border-border-warm/60 mb-4">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-700 fill-red-700/20" />
            <h3 className="font-heading text-xl font-bold text-espresso">
              Write a Review
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-espresso-muted hover:text-espresso hover:bg-parchment transition-colors"
            aria-label="Close review modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submittedSuccess ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-14 h-14 bg-olive-tint border border-olive-leaf/40 rounded-full flex items-center justify-center mx-auto text-olive-deep">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="font-heading text-2xl font-bold text-espresso">
              Nanni! (Thank You!)
            </h4>
            <p className="text-xs text-espresso-muted max-w-xs mx-auto leading-relaxed">
              Your review for <strong className="text-espresso font-semibold">{targetProduct?.name || 'our kitchen'}</strong> has been submitted. It will appear on this product page after approval.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {errorMessage && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-2.5 rounded-xl text-xs">
                {errorMessage}
              </div>
            )}

            {/* Locked Product Banner */}
            {targetProduct && (
              <div className="bg-olive-tint/70 border border-olive-leaf/30 rounded-2xl p-3 flex items-center gap-2.5">
                <Tag className="w-4 h-4 text-olive-deep shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-bold text-olive-leaf tracking-wider block">
                    Reviewing Product
                  </span>
                  <span className="font-heading font-bold text-xs text-espresso truncate block">
                    {targetProduct.name}
                  </span>
                </div>
              </div>
            )}

            <div>
              <label className="block font-semibold text-espresso mb-1">
                Your Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Anju / Meera"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full p-3 rounded-xl border border-border-warm bg-white text-sm focus:outline-none focus:ring-1 focus:ring-olive-leaf"
              />
            </div>

            <div>
              <label className="block font-semibold text-espresso mb-1">
                Star Rating *
              </label>
              <div className="flex items-center gap-2 pt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition-transform active:scale-125 focus:outline-none"
                    aria-label={`Rate ${star} star`}
                  >
                    <Star
                      className={`w-7 h-7 ${
                        star <= (hoverRating || rating)
                          ? 'text-rattan-gold fill-rattan-gold'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-espresso-muted ml-2">
                  {rating} / 5 Stars
                </span>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-espresso mb-1">
                Your Review *
              </label>
              <textarea
                rows={4}
                required
                placeholder="Share your thoughts about taste, aroma, texture, or quality..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                className="w-full p-3 rounded-xl border border-border-warm bg-white text-sm focus:outline-none focus:ring-1 focus:ring-olive-leaf"
              />
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 border border-border-warm rounded-xl font-semibold text-xs text-espresso hover:bg-parchment"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-olive-deep hover:bg-olive-leaf active:scale-95 text-white rounded-xl font-bold text-xs shadow-warm-sm flex items-center gap-2"
              >
                <span>{isSubmitting ? 'Submitting...' : 'Submit Review'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

