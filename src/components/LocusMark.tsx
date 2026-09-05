import React from 'react';

interface LocusMarkProps {
  className?: string;
  size?: number;
}

/**
 * LocusMark: The bespoke architectural mark for Locus.
 * Represents a focal point of convergence (Latin: locus), presence, and quiet stillness.
 * Replaces generic AI sparkle tropes with a timeless concentric focal geometry.
 */
export const LocusMark: React.FC<LocusMarkProps> = ({ className = 'w-4 h-4', size }) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      width={size}
      height={size}
      aria-hidden="true"
    >
      {/* Outer quiet sanctum ring */}
      <circle
        cx="12"
        cy="12"
        r="8.75"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        className="opacity-90"
      />
      {/* Subtle cardinal guide ticks */}
      <line x1="12" y1="1.75" x2="12" y2="3.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="opacity-40" />
      <line x1="12" y1="20.75" x2="12" y2="22.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="opacity-40" />
      <line x1="1.75" y1="12" x2="3.25" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="opacity-40" />
      <line x1="20.75" y1="12" x2="22.25" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="opacity-40" />
      {/* Centered inner locus focal nucleus */}
      <circle
        cx="12"
        cy="12"
        r="3"
        fill="currentColor"
      />
    </svg>
  );
};
