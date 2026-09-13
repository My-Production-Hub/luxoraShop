'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { Ticket, Bookmark, CheckCircle2, Copy, ArrowLeft, Tag, Clock, Sparkles, Check, Award, Star, Gift, Zap } from 'lucide-react';

type TabKey = 'available' | 'saved' | 'used' | 'points';

export default function PromotionsPage() {
  const router = useRouter();
  const { vouchers, savedVouchers, usedVouchers, saveVoucher, applyVoucher, showToast, userPoints, usedPoints } = useStore();
  const [activeTab, setActiveTab] = useState<TabKey>('available');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const activeVouchers = vouchers.filter(v => v.status === 'active' && !savedVouchers.includes(v.code.toUpperCase()) && !usedVouchers.includes(v.code.toUpperCase()));
  const savedVoucherList = vouchers.filter(v => savedVouchers.includes(v.code.toUpperCase()) && !usedVouchers.includes(v.code.toUpperCase()));
  const usedVoucherList = vouchers.filter(v => usedVouchers.includes(v.code.toUpperCase()));

  const tabs: { key: TabKey; label: string; icon: React.ReactNode; count: number | string }[] = [
    { key: 'available', label: 'Voucher có sẵn', icon: <Ticket className="w-4 h-4" />, count: activeVouchers.length },
    { key: 'saved', label: 'Voucher đã lưu', icon: <Bookmark className="w-4 h-4" />, count: savedVoucherList.length },
    { key: 'used', label: 'Voucher đã sử dụng', icon: <CheckCircle2 className="w-4 h-4" />, count: usedVoucherList.length },
    { key: 'points', label: 'Voucher điểm', icon: <Award className="w-4 h-4 text-amber-500" />, count: `${userPoints}P` },
  ];

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    showToast(`Đã sao chép mã "${code}" thành công!`, 'success');
    setTimeout(() => {
      setCopiedCode(null);
    }, 2500);
  };

  const formatDiscount = (v: typeof vouchers[0]) => {
    if (v.discountType === 'percent') {
      return `Giảm ${v.discountValue}%${v.maxDiscount ? ` tối đa ${(v.maxDiscount / 1000).toLocaleString('vi-VN')}K` : ''}`;
    }
    return `Giảm ${(v.discountValue / 1000).toLocaleString('vi-VN')}K`;
  };

  const renderVoucherCard = (voucher: typeof vouchers[0], type: TabKey) => {
    const isExpired = new Date(voucher.endDate) < new Date();
    const isUsed = type === 'used';
    const isSaved = savedVouchers.includes(voucher.code.toUpperCase());
    const remaining = voucher.quantity - voucher.usedQuantity;
    const usagePercent = Math.round((voucher.usedQuantity / voucher.quantity) * 100);

    return (
      <div
        key={voucher._id}
        className={`relative bg-white rounded-3xl border overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 ${
          isUsed ? 'opacity-60 border-zinc-200' : 'border-zinc-100'
        }`}
      >
        {/* Left color accent */}
        <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
          isUsed ? 'bg-zinc-300' : voucher.discountType === 'percent' ? 'bg-purple-500' : 'bg-amber-500'
        }`} />

        <div className="flex flex-col sm:flex-row">
          {/* Left: Discount Badge */}
          <div className={`flex items-center justify-center p-6 sm:w-40 shrink-0 ${
            isUsed ? 'bg-zinc-50' : voucher.discountType === 'percent' ? 'bg-gradient-to-br from-purple-50 to-pink-50' : 'bg-gradient-to-br from-amber-50 to-orange-50'
          }`}>
            <div className="text-center">
              <div className={`text-3xl font-black ${
                isUsed ? 'text-zinc-400' : voucher.discountType === 'percent' ? 'text-purple-600' : 'text-amber-600'
              }`}>
                {voucher.discountType === 'percent' ? `${voucher.discountValue}%` : `${(voucher.discountValue / 1000)}K`}
              </div>
              <div className={`text-[10px] font-bold uppercase tracking-wider mt-1 ${
                isUsed ? 'text-zinc-400' : 'text-zinc-500'
              }`}>
                GIẢM GIÁ
              </div>
            </div>
          </div>

          {/* Dashed divider */}
          <div className="hidden sm:flex flex-col justify-center">
            <div className="border-l-2 border-dashed border-zinc-200 h-20" />
          </div>

          {/* Right: Details */}
          <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                  isUsed ? 'bg-zinc-200 text-zinc-500' : voucher.discountType === 'percent' ? 'bg-purple-100 text-purple-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {isUsed ? 'ĐÃ SỬ DỤNG' : isExpired ? 'HẾT HẠN' : 'LUXORA VOUCHER'}
                </span>
                {isSaved && type === 'available' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 uppercase">
                    Đã lưu ✓
                  </span>
                )}
              </div>
              <h3 className="text-sm font-bold text-zinc-900 mt-1">{voucher.name}</h3>
              <div className="flex items-center gap-3 mt-2 text-[11px] text-zinc-500">
                <span className="flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  Đơn tối thiểu {voucher.minOrderValue > 0 ? `${(voucher.minOrderValue / 1000).toLocaleString('vi-VN')}K` : '0đ'}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  HSD: {new Date(voucher.endDate).toLocaleDateString('vi-VN')}
                </span>
              </div>
            </div>

            {/* Usage progress bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-zinc-400">
                <span>Đã dùng {usagePercent}%</span>
                <span>Còn {remaining} mã</span>
              </div>
              <div className="w-full bg-zinc-100 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all ${
                    isUsed ? 'bg-zinc-300' : usagePercent > 80 ? 'bg-rose-500' : voucher.discountType === 'percent' ? 'bg-purple-500' : 'bg-amber-500'
                  }`}
                  style={{ width: `${usagePercent}%` }}
                />
              </div>
            </div>

            {/* Code + Action */}
            <div className="flex items-center gap-2 mt-1">
              <div className={`flex-1 border-2 border-dashed rounded-xl px-3 py-2 text-center ${
                isUsed ? 'border-zinc-200 bg-zinc-50' : 'border-amber-300 bg-amber-50/50'
              }`}>
                <span className={`font-mono font-bold text-sm tracking-widest ${
                  isUsed ? 'text-zinc-400 line-through' : 'text-amber-700'
                }`}>
                  {voucher.code}
                </span>
              </div>

              {type !== 'available' && (
                <button
                  onClick={() => copyToClipboard(voucher.code)}
                  className={`p-2.5 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-bold ${
                    copiedCode === voucher.code
                      ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/20'
                      : 'border-zinc-200 hover:bg-amber-50 hover:border-amber-300 text-zinc-600 hover:text-amber-700'
                  }`}
                  title="Sao chép mã"
                >
                  {copiedCode === voucher.code ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Đã sao chép</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Sao chép</span>
                    </>
                  )}
                </button>
              )}

              {type === 'available' && !isSaved && (
                <button
                  onClick={() => saveVoucher(voucher.code)}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-zinc-950 text-xs font-bold transition-colors whitespace-nowrap"
                >
                  Lưu
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const getDisplayList = () => {
    switch (activeTab) {
      case 'available': return activeVouchers;
      case 'saved': return savedVoucherList;
      case 'used': return usedVoucherList;
    }
  };

  const displayList = getDisplayList();

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="p-2 rounded-xl border border-zinc-200 hover:bg-zinc-50 text-zinc-600 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold font-serif-luxury text-zinc-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            Khuyến mãi & Voucher
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">Lưu voucher yêu thích và sử dụng khi thanh toán</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-zinc-100 rounded-2xl p-1.5">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab.key
                ? 'bg-white text-zinc-900 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-700'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
              activeTab === tab.key
                ? 'bg-pink-100 text-pink-600'
                : 'bg-zinc-200 text-zinc-500'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Points Tab 2-Column Content */}
      {activeTab === 'points' ? (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* 2 Column Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Cột 1: Điểm đang có */}
            <div className="bg-gradient-to-br from-amber-500 via-amber-400 to-yellow-500 rounded-3xl p-6 text-amber-950 shadow-lg shadow-amber-500/20 relative overflow-hidden flex flex-col justify-between">
              <div className="absolute -right-4 -bottom-4 opacity-10">
                <Award className="w-36 h-36" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider bg-amber-950/10 px-3 py-1 rounded-full text-amber-950">
                  Điểm đang có (Khả dụng)
                </span>
                <Sparkles className="w-5 h-5 text-amber-900" />
              </div>
              <div className="my-4">
                <div className="text-4xl sm:text-5xl font-black font-serif-luxury tracking-tight">
                  {userPoints} <span className="text-xl font-sans font-bold">điểm</span>
                </div>
                <p className="text-xs text-amber-900/80 mt-1 font-medium">
                  Tương đương giảm <strong className="font-extrabold text-amber-950">{(userPoints * 1000).toLocaleString('vi-VN')}đ</strong> khi mua sắm
                </p>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-semibold text-amber-900/90 pt-2 border-t border-amber-950/10">
                <Zap className="w-3.5 h-3.5 fill-current" />
                Đánh giá sản phẩm đã mua để tích thêm +5 điểm/lần
              </div>
            </div>

            {/* Cột 2: Điểm đã dùng */}
            <div className="bg-gradient-to-br from-zinc-900 via-zinc-800 to-black rounded-3xl p-6 text-white shadow-lg relative overflow-hidden flex flex-col justify-between border border-zinc-800">
              <div className="absolute -right-4 -bottom-4 opacity-10 text-zinc-500">
                <CheckCircle2 className="w-36 h-36" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider bg-zinc-800 px-3 py-1 rounded-full text-zinc-300">
                  Điểm đã dùng (Đã quy đổi)
                </span>
                <Clock className="w-5 h-5 text-zinc-400" />
              </div>
              <div className="my-4">
                <div className="text-4xl sm:text-5xl font-black font-serif-luxury tracking-tight text-zinc-100">
                  {usedPoints} <span className="text-xl font-sans font-bold text-zinc-400">điểm</span>
                </div>
                <p className="text-xs text-zinc-400 mt-1">
                  Đã tiết kiệm tổng cộng <strong className="text-emerald-400 font-bold">{(usedPoints * 1000).toLocaleString('vi-VN')}đ</strong> trên các đơn hàng vừa qua
                </p>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-zinc-400 pt-2 border-t border-zinc-800">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                Điểm thưởng tự động khấu trừ trực tiếp tại trang Thanh toán
              </div>
            </div>
          </div>

          {/* Reward Vouchers & Instructions */}
          <div className="bg-white rounded-3xl border border-zinc-100 p-6 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
              <Gift className="w-4 h-4 text-amber-500" />
              Hướng dẫn tích & sử dụng điểm thưởng Luxora
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100 space-y-1">
                <div className="font-bold text-amber-900 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-900 flex items-center justify-center text-[10px] font-black">1</span>
                  Mua sắm sản phẩm
                </div>
                <p className="text-zinc-600 text-[11px]">Đặt mua các dòng nước hoa ưa thích và nhận hàng thành công.</p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100 space-y-1">
                <div className="font-bold text-amber-900 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-900 flex items-center justify-center text-[10px] font-black">2</span>
                  Đánh giá sản phẩm
                </div>
                <p className="text-zinc-600 text-[11px]">Vào Lịch sử đơn hàng, bấm nút "Đánh giá" để nhận ngay <strong>+5 điểm</strong> giữa màn hình.</p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100 space-y-1">
                <div className="font-bold text-amber-900 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-900 flex items-center justify-center text-[10px] font-black">3</span>
                  Đổi điểm giảm tiền
                </div>
                <p className="text-zinc-600 text-[11px]">Tại trang Thanh toán, chọn quy đổi điểm để giảm trừ tiền đơn hàng trực tiếp!</p>
              </div>
            </div>
          </div>
        </div>
      ) : displayList && displayList.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {displayList.map(v => renderVoucherCard(v, activeTab))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
            {activeTab === 'saved' ? (
              <Bookmark className="w-7 h-7 text-zinc-400" />
            ) : activeTab === 'used' ? (
              <CheckCircle2 className="w-7 h-7 text-zinc-400" />
            ) : (
              <Ticket className="w-7 h-7 text-zinc-400" />
            )}
          </div>
          <h3 className="text-sm font-bold text-zinc-700 mb-1">
            {activeTab === 'saved' ? 'Chưa có voucher nào được lưu' : activeTab === 'used' ? 'Chưa sử dụng voucher nào' : 'Không có voucher nào'}
          </h3>
          <p className="text-xs text-zinc-500">
            {activeTab === 'saved'
              ? 'Bấm "Lưu" trên các voucher có sẵn để lưu lại tại đây'
              : activeTab === 'used'
              ? 'Các voucher bạn đã sử dụng sẽ hiện ở đây'
              : 'Hiện tại không có voucher nào khả dụng'}
          </p>
          {activeTab !== 'available' && (
            <button
              onClick={() => setActiveTab('available')}
              className="mt-4 text-xs font-bold text-pink-600 hover:text-pink-700 underline"
            >
              Xem voucher có sẵn →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
