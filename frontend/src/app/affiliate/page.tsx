'use client';

import React from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  Gift,
  DollarSign,
  Share2,
  Clock,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  HelpCircle,
  Users
} from 'lucide-react';

export default function AffiliateLandingPage() {
  const steps = [
    { num: 1, title: 'Đăng ký miễn phí', desc: 'Tham gia chương trình Affiliate của Luxora hoàn toàn miễn phí.' },
    { num: 2, title: 'Chia sẻ link', desc: 'Chia sẻ link affiliate của bạn đến bạn bè, khách hàng, mạng xã hội.' },
    { num: 3, title: 'Khách mua hàng', desc: 'Khách hàng mua hàng thành công qua link giới thiệu của bạn.' },
    { num: 4, title: 'Nhận hoa hồng', desc: 'Nhận hoa hồng hấp dẫn tự động chuyển vào tài khoản ngân hàng.' }
  ];

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section matching Image 3 top left */}
      <section className="max-w-7xl mx-auto px-4 pt-8">
        <div className="bg-gradient-to-r from-pink-50 via-rose-50 to-amber-50 border border-pink-100 rounded-3xl p-8 sm:p-14 flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm">
          <div className="max-w-xl space-y-4">
            <span className="bg-pink-600 text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
              CHƯƠNG TRÌNH AFFILIATE
            </span>
            <h1 className="text-3xl sm:text-5xl font-bold font-serif-luxury text-zinc-900 leading-tight">
              Kiếm tiền cùng <span className="text-pink-600">Luxora</span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
              Chia sẻ sản phẩm bạn yêu thích và nhận hoa hồng hấp dẫn mỗi khi có đơn hàng từ link giới thiệu của bạn.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
              <div className="flex items-center gap-2 text-zinc-800 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-pink-600" />
                <span>Hoa hồng lên đến 15%</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-800 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-pink-600" />
                <span>Thu nhập không giới hạn</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-800 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-pink-600" />
                <span>Cookie 30 ngày</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-800 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-pink-600" />
                <span>Thanh toán nhanh chóng</span>
              </div>
            </div>

            <div className="pt-4 flex items-center gap-4">
              <Link
                href="/affiliate/register"
                className="bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold px-7 py-3.5 rounded-full transition-all shadow-lg shadow-pink-500/25"
              >
                Đăng ký ngay
              </Link>
              <Link
                href="/affiliate/dashboard"
                className="bg-white border border-pink-200 text-pink-600 hover:bg-pink-50 text-xs font-bold px-6 py-3.5 rounded-full transition-colors"
              >
                Trang cá nhân Affiliate
              </Link>
            </div>
          </div>

          {/* Hero Illustration Graphic matching Image 3 top left */}
          <div className="relative w-full max-w-sm aspect-square bg-gradient-to-tr from-pink-200 to-amber-100 rounded-3xl p-6 flex items-center justify-center shadow-inner">
            <img
              src="https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600"
              alt="Luxora Affiliate"
              className="w-4/5 h-4/5 object-contain drop-shadow-2xl"
            />
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-lg border border-pink-100 text-center">
              <div className="text-[10px] text-zinc-400 font-semibold">Hoa hồng</div>
              <div className="text-sm font-bold text-pink-600">Lên đến 15%</div>
            </div>
          </div>
        </div>
      </section>

      {/* Cách hoạt động matching Image 3 top left */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="text-2xl font-bold font-serif-luxury text-zinc-900">Cách hoạt động</h2>
          <p className="text-xs text-zinc-500 mt-1">4 bước đơn giản để bắt đầu tạo thu nhập thụ động cùng Luxora</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {steps.map(step => (
            <div key={step.num} className="bg-white rounded-3xl border border-zinc-100 p-6 text-center space-y-3 shadow-xs relative">
              <div className="w-10 h-10 bg-pink-600 text-white font-bold rounded-full flex items-center justify-center mx-auto shadow-md">
                {step.num}
              </div>
              <h3 className="text-sm font-bold text-zinc-900">{step.title}</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
