'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { CheckCircle2, ShieldCheck, TrendingUp, Building, User, Mail, Phone, Lock } from 'lucide-react';

export default function AffiliateRegisterPage() {
  const router = useRouter();
  const { user, showToast, registerAffiliate } = useStore();

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || 'nguyenvanan@gmail.com',
    phone: user?.phone || '0123456789',
    displayName: 'nguyenvanan',
    paymentMethod: 'BankTransfer',
    bankName: 'MBBank',
    bankNumber: '999988887777',
    accountName: 'NGUYEN VAN AN',
    agreeTerms: true
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.agreeTerms) {
      showToast('Vui lòng đồng ý với Điều khoản & Chính sách', 'error');
      return;
    }

    const refCode = 'LUX' + form.displayName.toUpperCase().slice(0, 4) + Math.floor(100 + Math.random() * 900);
    registerAffiliate({
      user: {
        _id: user?._id || 'u_' + Date.now(),
        name: form.name,
        email: form.email,
        phone: form.phone,
        role: 'affiliate'
      },
      referralCode: refCode,
      referralLink: `https://luxora.vn/?ref=${refCode}`,
      bankInfo: {
        bankName: form.bankName,
        bankNumber: form.bankNumber,
        accountName: form.accountName
      }
    });

    setIsSubmitted(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="bg-white rounded-3xl border border-zinc-100 shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Left Column: Promo Info matching Image 3 top right */}
        <div className="bg-gradient-to-br from-pink-50 via-rose-100 to-amber-50 p-8 sm:p-10 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <span className="bg-pink-600 text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase">
              THAM GIA NGAY
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif-luxury text-zinc-900 leading-tight">
              Tham gia chương trình Affiliate cùng Luxora ngay hôm nay!
            </h1>
            <div className="space-y-3 text-xs font-semibold text-zinc-700 pt-2">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-pink-600 shrink-0" />
                <span>Miễn phí tham gia 100%</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-pink-600 shrink-0" />
                <span>Không cần bỏ vốn hay nhập hàng</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-pink-600 shrink-0" />
                <span>Kiếm tiền linh hoạt mọi lúc, mọi nơi</span>
              </div>
            </div>
          </div>

          <div className="relative aspect-square max-w-xs mx-auto">
            <img
              src="https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=500"
              alt="Affiliate Gift"
              className="w-full h-full object-contain drop-shadow-xl"
            />
          </div>
        </div>

        {/* Right Column: Form matching Image 3 top right */}
        <div className="p-8 sm:p-10 flex flex-col justify-center space-y-5">
          <div>
            <h2 className="text-xl font-bold font-serif-luxury text-zinc-900">Đăng ký Affiliate</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Vui lòng điền thông tin xác thực bên dưới</p>
          </div>

          {isSubmitted ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h3 className="text-sm font-bold text-emerald-900">Đăng ký thành công!</h3>
              <p className="text-xs text-emerald-700">Tài khoản Affiliate của bạn đã được khởi tạo thành công.</p>
              <button
                onClick={() => router.push('/affiliate/dashboard')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-6 py-2.5 rounded-full transition-all"
              >
                Vào Dashboard ngay
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-zinc-700 block mb-1">Họ và tên</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-pink-500"
                />
              </div>

              <div>
                <label className="font-semibold text-zinc-700 block mb-1">Email liên hệ</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-pink-500"
                />
              </div>

              <div>
                <label className="font-semibold text-zinc-700 block mb-1">Số điện thoại</label>
                <input
                  type="text"
                  required
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-pink-500"
                />
              </div>

              <div>
                <label className="font-semibold text-zinc-700 block mb-1">Tên tài khoản (hiển thị)</label>
                <input
                  type="text"
                  required
                  value={form.displayName}
                  onChange={e => setForm({ ...form, displayName: e.target.value })}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-pink-500"
                />
              </div>

              <div>
                <label className="font-semibold text-zinc-700 block mb-1">Tên ngân hàng & Số tài khoản nhận tiền</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Tên ngân hàng (MBBank)"
                    required
                    value={form.bankName}
                    onChange={e => setForm({ ...form, bankName: e.target.value })}
                    className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 focus:outline-none focus:border-pink-500"
                  />
                  <input
                    type="text"
                    placeholder="Số tài khoản"
                    required
                    value={form.bankNumber}
                    onChange={e => setForm({ ...form, bankNumber: e.target.value })}
                    className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="terms"
                  checked={form.agreeTerms}
                  onChange={e => setForm({ ...form, agreeTerms: e.target.checked })}
                  className="rounded border-zinc-300 text-pink-600 focus:ring-pink-500"
                />
                <label htmlFor="terms" className="text-[11px] text-zinc-600 cursor-pointer">
                  Tôi đồng ý với <span className="text-pink-600 underline font-semibold">Điều khoản & Chính sách</span> của chương trình Affiliate
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold py-3 rounded-full transition-all shadow-md shadow-pink-500/20 uppercase tracking-wider"
              >
                Đăng ký tham gia
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
