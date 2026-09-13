'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { ProductCard } from '@/components/ProductCard';
import {
  Sparkles,
  ShieldCheck,
  Truck,
  RefreshCw,
  Headphones,
  Award,
  ChevronRight,
  TrendingUp,
  Gift,
  Zap,
  ArrowRight,
  UserCheck,
  Wind,
  Shield,
  Flame,
  Layers,
  Users,
  DollarSign,
  HelpCircle,
  BarChart3,
  UserPlus
} from 'lucide-react';
import * as Icons from 'lucide-react';

export default function HomePage() {
  const { products, applyVoucher, vouchers, categories, brands, saveVoucher } = useStore();
  const router = useRouter();

  // Flash Sale Dynamic State
  const flashSaleProducts = products.filter(p => p.isFlashSale && p.flashSaleEndTime);
  const flashSaleProduct = flashSaleProducts[0];
  const flashSaleProduct2 = flashSaleProducts[1] || { ...products[1], isFlashSale: true, flashSaleEndTime: flashSaleProduct?.flashSaleEndTime };
  const flashSaleProduct3 = flashSaleProducts[2] || { ...products[2], isFlashSale: true, flashSaleEndTime: flashSaleProduct?.flashSaleEndTime };
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isFlashSaleActive, setIsFlashSaleActive] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (!flashSaleProduct?.flashSaleEndTime) return;

    const targetTime = new Date(flashSaleProduct.flashSaleEndTime).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = targetTime - now;

      if (distance <= 0) {
        setIsFlashSaleActive(false);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        setIsFlashSaleActive(true);
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);

    return () => clearInterval(timer);
  }, [flashSaleProduct]);





  const topAffiliates = [
    { rank: 1, name: 'Nguyễn Minh Tuấn', handle: '@tuanreview', comm: '12.450.000đ', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100' },
    { rank: 2, name: 'Trần Quỳnh Anh', handle: '@quynhanh.98', comm: '9.870.000đ', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100' },
    { rank: 3, name: 'Phạm Hoàng Nam', handle: '@namperfume', comm: '7.230.000đ', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' }
  ];

  return (
    <div className="space-y-8 pb-16">
      {/* 1. HERO SECTION WITH BANNER & AFFILIATE WIDGET matching Image 2 */}
      <section className="max-w-7xl mx-auto px-4 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Hero Slider Banner */}
          <div className="lg:col-span-3 relative rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-50 via-pink-100 to-pink-200 p-8 sm:p-12 flex items-center justify-between border border-pink-100 shadow-xl min-h-[380px]">
            <div className="max-w-md space-y-4 z-10">
              <span className="inline-block bg-white/80 text-pink-600 text-xs font-bold px-3.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                Bộ sưu tập Thu Đông 2026
              </span>
              <h1 className="text-3xl sm:text-5xl font-bold font-serif-luxury text-zinc-900 leading-tight">
                HƯƠNG THƠM <br />
                <span className="bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                  NÂNG TẦM CẢM XÚC
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-zinc-600">
                Khám phá bộ sưu tập nước hoa chính hãng cao cấp. Ưu đãi lên đến 50% cùng dịch vụ gói quà nghệ thuật.
              </p>
              <div className="pt-2">
                <Link
                  href="/products"
                  className="bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold px-6 py-3.5 rounded-full transition-all shadow-lg shadow-pink-500/30 inline-flex items-center gap-2"
                >
                  <span>Mua ngay</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Perfume Bottle Image floating in Banner */}
            <div className="hidden sm:block absolute right-6 bottom-4 w-72 h-80 drop-shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600"
                alt="Miss Dior Perfume"
                className="w-full h-full object-contain hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>

          {/* Quick Affiliate Widget Column matching Image 2 top right */}
          <div className="bg-white rounded-3xl p-5 border border-pink-100 shadow-md flex flex-col justify-between space-y-3">
            <div className="border-b border-zinc-100 pb-3 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-pink-600" />
              <div>
                <h3 className="text-xs font-bold text-zinc-900">Affiliate Luxora</h3>
                <p className="text-[10px] text-zinc-400">Kiếm thêm thu nhập thụ động</p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <Link
                href="/affiliate/register"
                className="flex items-center justify-between p-2.5 rounded-2xl bg-pink-50/70 hover:bg-pink-100/70 text-zinc-800 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-pink-600" />
                  <span className="font-semibold text-xs">Trở thành Affiliate</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
              </Link>

              <Link
                href="/affiliate#how-it-works"
                className="flex items-center justify-between p-2.5 rounded-2xl bg-zinc-50 hover:bg-zinc-100 text-zinc-800 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-zinc-500" />
                  <span className="font-semibold text-xs">Hướng dẫn Affiliate</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
              </Link>

              <Link
                href="/affiliate#commission"
                className="flex items-center justify-between p-2.5 rounded-2xl bg-zinc-50 hover:bg-zinc-100 text-zinc-800 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-amber-500" />
                  <span className="font-semibold text-xs">Hoa hồng & Chính sách</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
              </Link>

              <Link
                href="/affiliate/dashboard"
                className="flex items-center justify-between p-2.5 rounded-2xl bg-zinc-50 hover:bg-zinc-100 text-zinc-800 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-500" />
                  <span className="font-semibold text-xs">Bảng điều khiển</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
              </Link>
            </div>

            <Link
              href="/affiliate/register"
              className="w-full bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold py-2.5 rounded-xl transition-all text-center block shadow-md shadow-pink-500/20"
            >
              Đăng ký ngay
            </Link>
          </div>
        </div>
      </section>

      {/* 2. VALUE PROPOSITION GUARANTEES BAR matching Image 2 */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-2xl border border-zinc-100 p-4 shadow-sm grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
          <div className="flex flex-col items-center gap-1.5 p-2">
            <ShieldCheck className="w-6 h-6 text-pink-600" />
            <h4 className="text-xs font-bold text-zinc-900">100% Hàng chính hãng</h4>
          </div>
          <div className="flex flex-col items-center gap-1.5 p-2 border-l border-zinc-100">
            <Truck className="w-6 h-6 text-pink-600" />
            <h4 className="text-xs font-bold text-zinc-900">Freeship Đơn từ 499K</h4>
          </div>
          <div className="flex flex-col items-center gap-1.5 p-2 border-l border-zinc-100">
            <RefreshCw className="w-6 h-6 text-pink-600" />
            <h4 className="text-xs font-bold text-zinc-900">Đổi trả dễ dàng 7 ngày</h4>
          </div>
          <div className="flex flex-col items-center gap-1.5 p-2 border-l border-zinc-100">
            <Headphones className="w-6 h-6 text-pink-600" />
            <h4 className="text-xs font-bold text-zinc-900">Tư vấn tận tâm 24/7</h4>
          </div>
          <div className="flex flex-col items-center gap-1.5 p-2 border-l border-zinc-100">
            <Award className="w-6 h-6 text-amber-500" />
            <h4 className="text-xs font-bold text-zinc-900">Tích điểm đổi quà VIP</h4>
          </div>
        </div>
      </section>

      {/* 3. FEATURED CATEGORIES SECTION matching Image 2 */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-zinc-900 font-serif-luxury">Danh mục nổi bật</h2>
        </div>

        <div className="overflow-hidden relative w-full flex">
          <div className="flex w-max animate-marquee pause-on-hover gap-3 pb-4">
            {categories.concat(categories).map((cat, i) => {
              const Icon = (Icons as any)[cat.icon] || Icons.Circle;
              const href = `/products?category=${encodeURIComponent(cat.name)}`;

              return (
                <Link
                  key={`${cat._id}-${i}`}
                  href={href}
                  className="group shrink-0 w-28 sm:w-32 rounded-2xl p-4 text-center border transition-all duration-300 flex flex-col items-center justify-center gap-2.5 relative bg-white border-zinc-100 text-zinc-800 hover:border-pink-300 hover:shadow-md"
                >
                  <div className="w-12 h-12 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 bg-pink-50 text-pink-600">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold leading-tight">{cat.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. PROMOTION TRIPLE BANNERS (Flash Sale, Voucher, Affiliate Promo) matching Image 2 */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Flash Sale with Countdown Timer matching Image 2 */}
          <div className="bg-gradient-to-r from-pink-50 to-rose-100 border border-pink-200 rounded-3xl p-5 relative overflow-hidden flex flex-col justify-between shadow-sm">
            <div>
              <span className="bg-pink-600 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded uppercase">
                FLASH SALE
              </span>
              <h3 className="text-lg font-bold text-zinc-900 mt-2 line-clamp-1">
                {flashSaleProduct ? flashSaleProduct.name : 'Giảm đến 50%'}
              </h3>
              <p className="text-xs text-zinc-500 line-clamp-1">
                {flashSaleProduct ? flashSaleProduct.brand : 'Cho một số sản phẩm chọn lọc'}
              </p>
            </div>

            {/* Countdown timer */}
            <div className="my-4 flex items-center gap-2">
              {isClient && isFlashSaleActive ? (
                <>
                  {timeLeft.days > 0 && (
                    <>
                      <div className="bg-pink-600 text-white font-bold text-xs px-2.5 py-1 rounded-lg shadow-sm">
                        {String(timeLeft.days).padStart(2, '0')}d
                      </div>
                      <span className="font-bold text-pink-600">:</span>
                    </>
                  )}
                  <div className="bg-pink-600 text-white font-bold text-xs px-2.5 py-1 rounded-lg shadow-sm">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </div>
                  <span className="font-bold text-pink-600">:</span>
                  <div className="bg-pink-600 text-white font-bold text-xs px-2.5 py-1 rounded-lg shadow-sm">
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </div>
                  <span className="font-bold text-pink-600">:</span>
                  <div className="bg-pink-600 text-white font-bold text-xs px-2.5 py-1 rounded-lg shadow-sm">
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </div>
                </>
              ) : isClient ? (
                <div className="text-zinc-500 font-bold text-sm bg-zinc-200 px-3 py-1 rounded-lg">Đã kết thúc</div>
              ) : null}
            </div>

            {isClient && isFlashSaleActive && flashSaleProduct ? (
              <Link
                href={`/product/${flashSaleProduct._id}`}
                className="bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold px-4 py-2 rounded-xl text-center inline-block transition-colors"
              >
                Mua ngay →
              </Link>
            ) : (
              <div className="h-[32px]"></div> // Placeholder for layout stability
            )}
          </div>

          {/* Card 2: Voucher Box matching Image 2 */}
          <div className="bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200 rounded-3xl p-5 relative overflow-hidden flex flex-col justify-between shadow-sm">
            <div>
              <span className="bg-amber-500 text-zinc-950 text-[10px] font-extrabold px-2.5 py-0.5 rounded uppercase">
                VOUCHER DÀNH CHO BẠN
              </span>
              <h3 className="text-lg font-bold text-zinc-900 mt-2">Giảm ngay 100K</h3>
              <p className="text-xs text-zinc-600">Áp dụng cho đơn từ 699K</p>
            </div>

            <div className="my-4 inline-block bg-white border border-dashed border-amber-400 rounded-2xl px-4 py-2 text-center">
              <span className="font-serif-luxury font-bold text-lg text-amber-600 tracking-wider">
                100K VOUCHER
              </span>
            </div>

            <button
              onClick={() => applyVoucher('LUXORA100K')}
              className="bg-amber-500 hover:bg-amber-600 text-zinc-950 text-xs font-bold px-4 py-2 rounded-xl transition-colors text-center"
            >
              Lấy voucher →
            </button>
          </div>

          {/* Card 3: Affiliate Teaser Banner matching Image 2 */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-100 border border-purple-200 rounded-3xl p-5 relative overflow-hidden flex flex-col justify-between shadow-sm">
            <div>
              <span className="bg-purple-600 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded uppercase">
                TRỞ THÀNH AFFILIATE
              </span>
              <h3 className="text-lg font-bold text-zinc-900 mt-2">Kiếm tiền cùng Luxora</h3>
              <p className="text-xs text-purple-700 font-semibold">Hoa hồng lên đến 15%</p>
            </div>

            <div className="my-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-200 rounded-full flex items-center justify-center text-purple-700">
                <Gift className="w-5 h-5" />
              </div>
              <p className="text-[11px] text-zinc-600">Chia sẻ sản phẩm yêu thích và nhận tiền ngay mỗi tuần.</p>
            </div>

            <Link
              href="/affiliate"
              className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors text-center"
            >
              Xem ngay →
            </Link>
          </div>
        </div>

        {/* Second Row of Banners */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {/* Card 4: Flash Sale Product 2 */}
          <div className="bg-gradient-to-r from-pink-50 to-rose-100 border border-pink-200 rounded-3xl p-5 relative overflow-hidden flex flex-col justify-between shadow-sm">
            <div>
              <span className="bg-pink-600 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded uppercase">
                FLASH SALE
              </span>
              <h3 className="text-lg font-bold text-zinc-900 mt-2 line-clamp-1">
                {flashSaleProduct2 ? flashSaleProduct2.name : 'Giảm đến 50%'}
              </h3>
              <p className="text-xs text-zinc-500 line-clamp-1">
                {flashSaleProduct2 ? flashSaleProduct2.brand : 'Cho một số sản phẩm chọn lọc'}
              </p>
            </div>

            <div className="my-4 flex items-center gap-2">
              {isClient && isFlashSaleActive ? (
                <>
                  {timeLeft.days > 0 && (
                    <>
                      <div className="bg-pink-600 text-white font-bold text-xs px-2.5 py-1 rounded-lg shadow-sm">
                        {String(timeLeft.days).padStart(2, '0')}d
                      </div>
                      <span className="font-bold text-pink-600">:</span>
                    </>
                  )}
                  <div className="bg-pink-600 text-white font-bold text-xs px-2.5 py-1 rounded-lg shadow-sm">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </div>
                  <span className="font-bold text-pink-600">:</span>
                  <div className="bg-pink-600 text-white font-bold text-xs px-2.5 py-1 rounded-lg shadow-sm">
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </div>
                  <span className="font-bold text-pink-600">:</span>
                  <div className="bg-pink-600 text-white font-bold text-xs px-2.5 py-1 rounded-lg shadow-sm">
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </div>
                </>
              ) : isClient ? (
                <div className="text-zinc-500 font-bold text-sm bg-zinc-200 px-3 py-1 rounded-lg">Đã kết thúc</div>
              ) : null}
            </div>

            {isClient && isFlashSaleActive && flashSaleProduct2 ? (
              <Link
                href={`/product/${flashSaleProduct2._id}`}
                className="bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold px-4 py-2 rounded-xl text-center inline-block transition-colors"
              >
                Mua ngay →
              </Link>
            ) : (
              <div className="h-[32px]"></div>
            )}
          </div>

          {/* Card 5: Flash Sale Product 3 */}
          <div className="bg-gradient-to-r from-pink-50 to-rose-100 border border-pink-200 rounded-3xl p-5 relative overflow-hidden flex flex-col justify-between shadow-sm">
            <div>
              <span className="bg-pink-600 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded uppercase">
                FLASH SALE
              </span>
              <h3 className="text-lg font-bold text-zinc-900 mt-2 line-clamp-1">
                {flashSaleProduct3 ? flashSaleProduct3.name : 'Giảm đến 50%'}
              </h3>
              <p className="text-xs text-zinc-500 line-clamp-1">
                {flashSaleProduct3 ? flashSaleProduct3.brand : 'Cho một số sản phẩm chọn lọc'}
              </p>
            </div>

            <div className="my-4 flex items-center gap-2">
              {isClient && isFlashSaleActive ? (
                <>
                  {timeLeft.days > 0 && (
                    <>
                      <div className="bg-pink-600 text-white font-bold text-xs px-2.5 py-1 rounded-lg shadow-sm">
                        {String(timeLeft.days).padStart(2, '0')}d
                      </div>
                      <span className="font-bold text-pink-600">:</span>
                    </>
                  )}
                  <div className="bg-pink-600 text-white font-bold text-xs px-2.5 py-1 rounded-lg shadow-sm">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </div>
                  <span className="font-bold text-pink-600">:</span>
                  <div className="bg-pink-600 text-white font-bold text-xs px-2.5 py-1 rounded-lg shadow-sm">
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </div>
                  <span className="font-bold text-pink-600">:</span>
                  <div className="bg-pink-600 text-white font-bold text-xs px-2.5 py-1 rounded-lg shadow-sm">
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </div>
                </>
              ) : isClient ? (
                <div className="text-zinc-500 font-bold text-sm bg-zinc-200 px-3 py-1 rounded-lg">Đã kết thúc</div>
              ) : null}
            </div>

            {isClient && isFlashSaleActive && flashSaleProduct3 ? (
              <Link
                href={`/product/${flashSaleProduct3._id}`}
                className="bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold px-4 py-2 rounded-xl text-center inline-block transition-colors"
              >
                Mua ngay →
              </Link>
            ) : (
              <div className="h-[32px]"></div>
            )}
          </div>

          {/* Card 6: Voucher 2 Box */}
          <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200 rounded-3xl p-5 relative overflow-hidden flex flex-col justify-between shadow-sm">
            <div>
              <span className="bg-emerald-500 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded uppercase">
                VOUCHER DÀNH CHO BẠN
              </span>
              <h3 className="text-lg font-bold text-zinc-900 mt-2">Giảm ngay 50K</h3>
              <p className="text-xs text-zinc-600">Áp dụng cho đơn từ 399K</p>
            </div>

            <div className="my-4 inline-block bg-white border border-dashed border-emerald-400 rounded-2xl px-4 py-2 text-center">
              <span className="font-serif-luxury font-bold text-lg text-emerald-600 tracking-wider">
                50K VOUCHER
              </span>
            </div>

            <button
              onClick={() => applyVoucher('LUXORA50K')}
              className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors text-center"
            >
              Lấy voucher →
            </button>
          </div>
        </div>
      </section>

      {/* 4.5 SUGGESTED PRODUCTS HORIZONTAL SCROLL */}
      <section className="max-w-7xl mx-auto px-4 pt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-zinc-900 font-serif-luxury">Sản phẩm đề xuất</h2>
          <Link href="/products" className="text-xs text-pink-600 hover:underline font-semibold flex items-center gap-1">
            Xem chi tiết <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Horizontal scroll container */}
        <div 
          className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {products.map(product => (
            <div key={product._id} className="w-[180px] sm:w-[220px] md:w-[240px] snap-start shrink-0">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </section>

      {/* 4.7 GIFTSET PRODUCTS GRID */}
      <section className="max-w-7xl mx-auto px-4 pt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-zinc-900 font-serif-luxury">Bộ quà tặng (Giftset)</h2>
          <Link href="/products?category=Giftset" className="text-xs text-pink-600 hover:underline font-semibold flex items-center gap-1">
            Xem tất cả <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {products.filter(p => (p.category || '').toLowerCase().includes('gift')).map(product => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>

      {/* 5. BEST SELLERS PRODUCTS GRID matching Image 2 */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-zinc-900 font-serif-luxury">Sản phẩm bán chạy</h2>
          <Link href="/products" className="text-xs text-pink-600 hover:underline font-semibold flex items-center gap-1">
            Xem tất cả <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {products.map(product => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>

      {/* VOUCHER SECTION */}
      <section className="max-w-7xl mx-auto px-4 pt-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-zinc-900 font-serif-luxury">Voucher dành cho bạn</h2>
        </div>
        
        <div className="overflow-hidden relative w-full">
          <div className="flex w-max animate-marquee pause-on-hover gap-4 pb-4">
            {vouchers.concat(vouchers).map((voucher, idx) => (
              <div key={`${voucher._id}-${idx}`} className="w-[260px] sm:w-[300px] shrink-0">
                <div className="bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200 rounded-3xl p-4 flex flex-col justify-between shadow-sm h-full">
                  <div>
                    <span className="bg-amber-500 text-zinc-950 text-[10px] font-extrabold px-2 py-0.5 rounded uppercase">
                      LUXORA VOUCHER
                    </span>
                    <h3 className="text-base font-bold text-zinc-900 mt-2 line-clamp-1">{voucher.name}</h3>
                    <p className="text-xs text-zinc-600 mb-2">Đơn tối thiểu {voucher.minOrderValue / 1000}K</p>
                    <div className="inline-block bg-white border border-dashed border-amber-400 rounded-xl px-3 py-1.5 text-center mb-3">
                      <span className="font-serif-luxury font-bold text-sm text-amber-600 tracking-wider">
                        {voucher.code}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      saveVoucher(voucher.code);
                      router.push('/promotions');
                    }}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-zinc-950 text-xs font-bold px-3 py-2 rounded-xl transition-colors text-center"
                  >
                    Lưu voucher
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SẢN PHẨM GỢI Ý (SUGGESTED PRODUCTS 2) */}
      <section className="max-w-7xl mx-auto px-4 pt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-zinc-900 font-serif-luxury">Sản phẩm gợi ý</h2>
          <Link href="/products" className="text-xs text-pink-600 hover:underline font-semibold flex items-center gap-1">
            Xem tất cả <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {products.slice().reverse().map(product => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>

      {/* 6. TOP BRANDS GRID matching Image 2 */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-zinc-900 font-serif-luxury">Thương hiệu nổi bật</h2>
        </div>

        <div className="overflow-hidden relative w-full flex bg-white rounded-3xl border border-zinc-100 p-6 shadow-sm">
          <div className="flex w-max animate-marquee pause-on-hover gap-8">
            {brands.concat(brands).map((brand, idx) => (
              <Link
                key={idx}
                href={`/products?brand=${encodeURIComponent(brand)}`}
                className="flex shrink-0 items-center justify-center px-6 py-3 rounded-2xl hover:bg-pink-50/50 hover:scale-105 transition-all"
              >
                <span className="font-serif-luxury font-bold text-xl tracking-widest text-zinc-800 uppercase whitespace-nowrap">
                  {brand}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 7. BLOGS / KNOWLEDGE SECTION */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-zinc-900 font-serif-luxury">Nước hoa & Những điều cần biết</h2>
          <Link href="/blogs" className="text-xs text-pink-600 hover:underline font-semibold flex items-center gap-1">
            Xem tất cả <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Blog 1 */}
          <div className="bg-white rounded-3xl overflow-hidden border border-zinc-100 shadow-sm hover:shadow-md transition-shadow flex flex-col">
            <div className="relative h-48 overflow-hidden">
              <img src="https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=600" alt="Cách bảo quản nước hoa" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="p-5 flex flex-col flex-1 justify-between">
              <div>
                <div className="text-[10px] text-pink-600 font-bold mb-2 uppercase tracking-wider">Mẹo hữu ích</div>
                <h3 className="text-sm font-bold text-zinc-900 mb-2 line-clamp-2">Bí quyết bảo quản nước hoa luôn thơm lâu và giữ nguyên mùi hương</h3>
                <p className="text-xs text-zinc-500 line-clamp-2 mb-4">Bạn có biết ánh sáng mặt trời và nhiệt độ cao là kẻ thù số 1 của nước hoa? Khám phá cách bảo quản đúng chuẩn ngay.</p>
              </div>
              <div className="flex items-center justify-between mt-4 border-t border-zinc-100 pt-3">
                <span className="text-[10px] text-zinc-400">12 Tháng 8, 2026</span>
                <Link href="#" className="text-xs font-bold text-zinc-900 hover:text-pink-600 transition-colors">Đọc tiếp →</Link>
              </div>
            </div>
          </div>

          {/* Blog 2 */}
          <div className="bg-white rounded-3xl overflow-hidden border border-zinc-100 shadow-sm hover:shadow-md transition-shadow flex flex-col">
            <div className="relative h-48 overflow-hidden">
              <img src="https://images.unsplash.com/photo-1594035910387-fea47794261f?w=600" alt="Chọn nước hoa theo mùa" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="p-5 flex flex-col flex-1 justify-between">
              <div>
                <div className="text-[10px] text-pink-600 font-bold mb-2 uppercase tracking-wider">Góc chuyên gia</div>
                <h3 className="text-sm font-bold text-zinc-900 mb-2 line-clamp-2">Cách chọn nước hoa phù hợp theo từng mùa trong năm</h3>
                <p className="text-xs text-zinc-500 line-clamp-2 mb-4">Mùa hè cần sự tươi mát của Citrus, mùa đông cần sự ấm áp của Gỗ và Vani. Cùng chuyên gia Luxora tìm hiểu nhé.</p>
              </div>
              <div className="flex items-center justify-between mt-4 border-t border-zinc-100 pt-3">
                <span className="text-[10px] text-zinc-400">05 Tháng 8, 2026</span>
                <Link href="#" className="text-xs font-bold text-zinc-900 hover:text-pink-600 transition-colors">Đọc tiếp →</Link>
              </div>
            </div>
          </div>

          {/* Blog 3 */}
          <div className="bg-white rounded-3xl overflow-hidden border border-zinc-100 shadow-sm hover:shadow-md transition-shadow flex flex-col">
            <div className="relative h-48 overflow-hidden">
              <img src="https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=600" alt="Phân biệt thật giả" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="p-5 flex flex-col flex-1 justify-between">
              <div>
                <div className="text-[10px] text-pink-600 font-bold mb-2 uppercase tracking-wider">Tin tức</div>
                <h3 className="text-sm font-bold text-zinc-900 mb-2 line-clamp-2">Cẩm nang phân biệt nước hoa thật và giả (Fake) chi tiết nhất</h3>
                <p className="text-xs text-zinc-500 line-clamp-2 mb-4">Bỏ túi những dấu hiệu nhận biết hàng Authentic chuẩn xác nhất để luôn là người tiêu dùng thông thái.</p>
              </div>
              <div className="flex items-center justify-between mt-4 border-t border-zinc-100 pt-3">
                <span className="text-[10px] text-zinc-400">28 Tháng 7, 2026</span>
                <Link href="#" className="text-xs font-bold text-zinc-900 hover:text-pink-600 transition-colors">Đọc tiếp →</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
