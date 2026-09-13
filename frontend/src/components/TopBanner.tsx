'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Truck, ArrowRight } from 'lucide-react';

export const TopBanner: React.FC = () => {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin')) return null;

  return (
    <div className="bg-gradient-to-r from-pink-600 via-rose-500 to-pink-600 text-white text-xs py-2 px-4 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-3 font-medium">
        <span className="bg-white/20 px-2 py-0.5 rounded text-[11px] uppercase tracking-wider font-bold">FREESHIP</span>
        <span className="flex items-center gap-1.5">
          <Truck className="w-3.5 h-3.5" />
          Miễn phí vận chuyển cho tất cả đơn hàng từ 499K
        </span>
        <Link
          href="/products"
          className="ml-2 bg-white text-pink-600 hover:bg-pink-50 px-3 py-0.5 rounded-full text-[11px] font-semibold transition-all flex items-center gap-1 shadow-sm"
        >
          <span>Mua ngay</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
};
