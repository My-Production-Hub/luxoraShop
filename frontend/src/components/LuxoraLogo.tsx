'use client';

import React from 'react';
import Link from 'next/link';

export const LuxoraLogo: React.FC<{ size?: 'sm' | 'md' | 'lg', variant?: 'dark' | 'light' }> = ({
  size = 'md',
  variant = 'light'
}) => {
  const isDark = variant === 'dark';

  return (
    <Link href="/" className="group flex items-center gap-3 select-none">
      {/* Monogram Icon matching Image 1 */}
      <div className={`relative flex items-center justify-center rounded-full border-2 border-amber-400/80 bg-gradient-to-b from-zinc-900 via-black to-zinc-950 shadow-lg shadow-amber-500/10 group-hover:border-amber-300 transition-all duration-300 ${
        size === 'sm' ? 'w-9 h-9' : size === 'md' ? 'w-11 h-11' : 'w-16 h-16'
      }`}>
        {/* Outer Ring */}
        <div className="absolute inset-0.5 rounded-full border border-amber-300/40 pointer-events-none"></div>
        {/* Perfume Bottle SVG Silhouette */}
        <svg viewBox="0 0 100 100" className="w-3/5 h-3/5 text-amber-300 fill-current drop-shadow-md">
          {/* Cap */}
          <rect x="42" y="10" width="16" height="10" rx="2" className="fill-amber-400" />
          <rect x="46" y="20" width="8" height="6" className="fill-amber-300" />
          {/* Main Bottle */}
          <path d="M 28,32 Q 28,26 34,26 L 66,26 Q 72,26 72,32 L 75,80 Q 75,88 67,88 L 33,88 Q 25,88 25,80 Z" className="fill-zinc-900 stroke-amber-400 stroke-[3]" />
          {/* Monogram 'L' */}
          <text x="50" y="66" textAnchor="middle" fontSize="32" fontFamily="serif" fontWeight="bold" className="fill-amber-300">L</text>
        </svg>
        {/* Sparkling Star */}
        <div className="absolute -bottom-0.5 right-1 w-2 h-2 bg-amber-300 rounded-full blur-[1px] animate-pulse"></div>
      </div>

      {/* Brand Text */}
      <div className="flex flex-col">
        <span className={`font-serif-luxury tracking-[0.22em] font-bold bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 bg-clip-text text-transparent group-hover:from-amber-100 group-hover:to-amber-300 transition-all ${
          size === 'sm' ? 'text-lg' : size === 'md' ? 'text-2xl' : 'text-3xl'
        }`}>
          LUXORA
        </span>
        <span className={`tracking-[0.18em] uppercase font-medium text-[9px] ${
          isDark ? 'text-zinc-400' : 'text-zinc-500'
        }`}>
          Shine Through Fragrance
        </span>
      </div>
    </Link>
  );
};
