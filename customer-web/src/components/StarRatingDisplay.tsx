import React from 'react';

interface StarRatingDisplayProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  showNumeric?: boolean;
}

export const StarRatingDisplay: React.FC<StarRatingDisplayProps> = ({
  rating,
  size = 'md',
  showNumeric = true,
}) => {
  const sizeMap = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const currentSize = sizeMap[size] || sizeMap.md;
  const numVal = Math.max(0, Math.min(5, Number(rating)));

  return (
    <div className="flex items-center gap-1.5 font-body">
      {/* 5 Star Positions */}
      <div className="flex items-center gap-0.5">
        {[0, 1, 2, 3, 4].map((index) => {
          const fillPercent = Math.max(0, Math.min(100, (numVal - index) * 100));
          const starId = `sk-star-grad-${numVal.toFixed(1)}-${index}`;

          return (
            <svg key={index} className={currentSize} viewBox="0 0 24 24">
              <defs>
                <linearGradient id={starId} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset={`${fillPercent}%`} stopColor="#D49A3E" />
                  <stop offset={`${fillPercent}%`} stopColor="#E2D7C5" />
                </linearGradient>
              </defs>
              <polygon
                points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                fill={`url(#${starId})`}
                stroke="#B87B28"
                strokeWidth="1"
                strokeLinejoin="round"
              />
            </svg>
          );
        })}
      </div>

      {showNumeric && (
        <span className="font-heading font-bold text-xs text-espresso leading-none pt-0.5">
          {numVal.toFixed(1)}
        </span>
      )}
    </div>
  );
};
