import React from 'react';
import { ArrowRight, Flame, Cookie } from 'lucide-react';
import { getImageUrl } from '../config/constants';

interface CategorySectionProps {
  onSelectPickles: () => void;
  onSelectSnacks: () => void;
  pickleImageUrl?: string;
  snackImageUrl?: string;
}

export const CategorySection: React.FC<CategorySectionProps> = ({
  onSelectPickles,
  onSelectSnacks,
  pickleImageUrl,
  snackImageUrl,
}) => {
  return (
    <section className="px-5 py-4 max-w-md mx-auto space-y-5 font-body">
      {/* Section Header with Small Botanical Accent */}
      <div className="text-center space-y-1">
        <div className="flex items-center justify-center gap-1.5 text-xs text-olive-leaf font-semibold uppercase tracking-widest">
          <span>🌿</span>
          <span>Shop by Category</span>
          <span>🌿</span>
        </div>
        <h3 className="font-heading text-2xl font-bold text-espresso">
          From our kitchen to yours
        </h3>
      </div>

      {/* TWO CATEGORY CARDS */}
      <div className="space-y-4">
        {/* CATEGORY 1: PICKLES */}
        <div
          onClick={onSelectPickles}
          className="cursor-pointer bg-parchment-card border border-border-warm rounded-3xl p-4 shadow-warm-md relative overflow-hidden group transition-all duration-300 hover:shadow-warm-lg flex items-center justify-between gap-4"
        >
          {/* Left Visual Brush/Botanical Container with Food Photography */}
          <div className="relative w-28 h-28 shrink-0 rounded-2xl overflow-hidden bg-olive-tint border border-olive-leaf/30 shadow-xs">
            <img
              src={getImageUrl(pickleImageUrl || 'assets/chicken_pickle.jpg')}
              alt="Pickles"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'assets/chicken_pickle.jpg';
              }}
            />
            <div className="absolute top-1.5 left-1.5 bg-olive-deep text-white p-1 rounded-lg shadow-xs">
              <Flame className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card Info */}
          <div className="flex-grow min-w-0 py-1">
            <h4 className="font-heading text-2xl font-bold text-espresso group-hover:text-olive-deep transition-colors">
              Pickles
            </h4>
            <p className="text-xs text-espresso-muted mt-1 leading-relaxed font-serif italic">
              Bold flavours, rooted in tradition.
            </p>
          </div>

          {/* Circular Arrow Button */}
          <div className="w-10 h-10 rounded-full bg-parchment-deep border border-border-warm/80 flex items-center justify-center text-espresso group-hover:bg-olive-deep group-hover:text-white transition-all shadow-xs shrink-0 mr-1">
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* CATEGORY 2: SNACKS */}
        <div
          onClick={onSelectSnacks}
          className="cursor-pointer bg-parchment-card border border-border-warm rounded-3xl p-4 shadow-warm-md relative overflow-hidden group transition-all duration-300 hover:shadow-warm-lg flex items-center justify-between gap-4"
        >
          {/* Left Visual Container with Food Photography */}
          <div className="relative w-28 h-28 shrink-0 rounded-2xl overflow-hidden bg-rattan-sand/40 border border-rattan-gold/30 shadow-xs">
            <img
              src={getImageUrl(snackImageUrl || 'assets/achappam.jpg')}
              alt="Snacks"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'assets/achappam.jpg';
              }}
            />
            <div className="absolute top-1.5 left-1.5 bg-rattan-amber text-white p-1 rounded-lg shadow-xs">
              <Cookie className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card Info */}
          <div className="flex-grow min-w-0 py-1">
            <h4 className="font-heading text-2xl font-bold text-espresso group-hover:text-rattan-amber transition-colors">
              Snacks
            </h4>
            <p className="text-xs text-espresso-muted mt-1 leading-relaxed font-serif italic">
              Crispy delights for every occasion.
            </p>
          </div>

          {/* Circular Arrow Button */}
          <div className="w-10 h-10 rounded-full bg-parchment-deep border border-border-warm/80 flex items-center justify-center text-espresso group-hover:bg-rattan-amber group-hover:text-white transition-all shadow-xs shrink-0 mr-1">
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>
    </section>
  );
};
