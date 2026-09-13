'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LuxoraLogo } from './LuxoraLogo';
import { ShieldCheck, Truck, RefreshCw, Headphones, Award, Phone, Mail, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin')) return null;
  return (
    <footer className="bg-zinc-950 text-zinc-300 pt-12 pb-8 border-t border-zinc-800">
      {/* Commitment Guarantee Bar matching Image 2 bottom */}
      <div className="max-w-7xl mx-auto px-4 pb-10 border-b border-zinc-800/80">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800">
            <ShieldCheck className="w-8 h-8 text-amber-400 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-white">100% Chính hãng</h4>
              <p className="text-[10px] text-zinc-400">Hoàn tiền 200% nếu phát hiện hàng giả</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800">
            <Truck className="w-8 h-8 text-pink-500 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-white">Giao hàng nhanh</h4>
              <p className="text-[10px] text-zinc-400">Miễn phí vận chuyển từ 499K</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800">
            <RefreshCw className="w-8 h-8 text-amber-400 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-white">Đổi trả dễ dàng</h4>
              <p className="text-[10px] text-zinc-400">Đổi sản phẩm trong 7 ngày</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800">
            <Headphones className="w-8 h-8 text-pink-500 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-white">Hỗ trợ 24/7</h4>
              <p className="text-[10px] text-zinc-400">Đội ngũ tư vấn tận tâm chuyên nghiệp</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand column */}
        <div className="space-y-4">
          <LuxoraLogo size="md" variant="dark" />
          <p className="text-xs text-zinc-400 leading-relaxed">
            Luxora - Chuỗi cửa hàng phân phối nước hoa và mỹ phẩm làm đẹp chính hãng cao cấp hàng đầu Việt Nam. Tỏa sáng nét riêng qua từng hương thơm huyền bí.
          </p>
          <div className="flex items-center gap-3 text-xs text-zinc-400">
            <Phone className="w-4 h-4 text-pink-500" />
            <span>Hotline: 1900 6868 (8:00 - 22:00)</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-zinc-400">
            <Mail className="w-4 h-4 text-pink-500" />
            <span>Email: cskh@luxora.vn</span>
          </div>
        </div>

        {/* Links column 1 */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Danh mục nổi bật</h4>
          <ul className="space-y-2.5 text-xs text-zinc-400">
            <li><Link href="/products?category=Nước hoa nam&gender=Nam" className="hover:text-pink-400">Nước hoa Nam chính hãng</Link></li>
            <li><Link href="/products?category=Nước hoa nữ&gender=Nữ" className="hover:text-pink-400">Nước hoa Nữ cao cấp</Link></li>
            <li><Link href="/products?category=Body+Mist" className="hover:text-pink-400">Body Mist thơm dịu nhẹ</Link></li>
            <li><Link href="/products?category=Gift+Set" className="hover:text-pink-400">Bộ quà tặng Gift Set</Link></li>
            <li><Link href="/products?category=S%C3%A1p+th%C6%A1m" className="hover:text-pink-400">Sáp thơm phòng & ô tô</Link></li>
          </ul>
        </div>

        {/* Links column 2 */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Chương trình Affiliate</h4>
          <ul className="space-y-2.5 text-xs text-zinc-400">
            <li><Link href="/affiliate" className="hover:text-pink-400 font-semibold text-pink-400">Giới thiệu chương trình</Link></li>
            <li><Link href="/affiliate/register" className="hover:text-pink-400">Đăng ký trở thành Affiliate</Link></li>
            <li><Link href="/affiliate/dashboard" className="hover:text-pink-400">Dashboard theo dõi hoa hồng</Link></li>
            <li><Link href="/affiliate#policy" className="hover:text-pink-400">Chính sách & điều khoản rút tiền</Link></li>
          </ul>
        </div>

        {/* Newsletter & Social */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Đăng ký nhận ưu đãi</h4>
          <p className="text-xs text-zinc-400 mb-3">Nhận thông tin Voucher giảm đến 50% & sự kiện ra mắt nước hoa mới.</p>
          <div className="flex gap-2 mb-4">
            <input
              type="email"
              placeholder="Email của bạn..."
              className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-pink-500 flex-1"
            />
            <button className="bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors">
              Gửi
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pt-6 border-t border-zinc-900 text-center text-xs text-zinc-500">
        © 2026 Luxora Perfume Shop. All rights reserved. Shine Through Fragrance.
      </div>
    </footer>
  );
};
