'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { X, Plus, Minus, Trash2, Tag, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const router = useRouter();
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateCartQuantity,
    removeFromCart,
    cartSubtotal,
    shippingFee,
    appliedVoucher,
    discountAmount,
    applyVoucher,
    removeVoucher,
    cartTotal
  } = useStore();

  const [voucherInput, setVoucherInput] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [showCheckoutSummary, setShowCheckoutSummary] = useState(false);

  if (!isCartOpen) return null;

  const handleApplyVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voucherInput.trim()) return;
    setIsApplying(true);
    await applyVoucher(voucherInput);
    setIsApplying(false);
  };

  const handleProceedToCheckout = () => {
    if (!showCheckoutSummary) {
      setShowCheckoutSummary(true);
    } else {
      setIsCartOpen(false);
      setShowCheckoutSummary(false);
      router.push('/checkout');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Dark backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      ></div>

      {/* Side Panel Drawer matching Image 2 */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-zinc-900 font-serif-luxury">Giỏ hàng</h2>
              <span className="bg-pink-100 text-pink-600 text-xs font-bold px-2 py-0.5 rounded-full">
                ({cart.reduce((sum, i) => sum + i.quantity, 0)})
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-pink-50 text-pink-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Tag className="w-8 h-8" />
                </div>
                <p className="text-sm font-semibold text-zinc-800">Giỏ hàng của bạn đang trống</p>
                <p className="text-xs text-zinc-400 mt-1">Hãy khám phá bộ sưu tập nước hoa Luxora ngay</p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-4 bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold px-5 py-2.5 rounded-full transition-all shadow-md shadow-pink-500/20"
                >
                  Khám phá ngay
                </button>
              </div>
            ) : (
              cart.map((item, idx) => (
                <div
                  key={`${item.product._id}-${item.selectedVolume}-${idx}`}
                  className="flex gap-3 pb-4 border-b border-zinc-100 last:border-0 relative group"
                >
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    onClick={() => {
                      setIsCartOpen(false);
                      router.push(`/product/${item.product._id}`);
                    }}
                    className="w-16 h-16 object-cover rounded-xl border border-zinc-100 cursor-pointer hover:scale-105 transition-transform shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h3
                        onClick={() => {
                          setIsCartOpen(false);
                          router.push(`/product/${item.product._id}`);
                        }}
                        className="text-xs font-bold text-zinc-900 hover:text-pink-600 transition-colors truncate pr-4 cursor-pointer"
                      >
                        {item.product.name}
                      </h3>
                      <button
                        onClick={() => removeFromCart(item.product._id, item.selectedVolume)}
                        className="text-zinc-400 hover:text-rose-600 transition-colors p-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                      <span className="inline-block text-[10px] text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded">
                        Dung tích: {item.selectedVolume}
                      </span>
                      {item.selectedScent && (
                        <span className="inline-block text-[10px] text-pink-700 bg-pink-50 border border-pink-100 px-2 py-0.5 rounded font-medium">
                          Mùi: {item.selectedScent}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      {/* Quantity selector */}
                      <div className="flex items-center border border-zinc-200 rounded-lg overflow-hidden bg-zinc-50">
                        <button
                          onClick={() => updateCartQuantity(item.product._id, item.selectedVolume, item.quantity - 1)}
                          className="px-2 py-1 text-zinc-600 hover:bg-zinc-200 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 text-xs font-bold text-zinc-800">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(item.product._id, item.selectedVolume, item.quantity + 1)}
                          className="px-2 py-1 text-zinc-600 hover:bg-zinc-200 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Item Price */}
                      <span className="text-xs font-bold text-pink-600">
                        {(item.product.price * item.quantity).toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Bottom Actions */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-6 border-t border-zinc-100 bg-zinc-50/50 space-y-4">
              <div className="flex justify-between items-center text-xs pb-1">
                <span className="text-zinc-500 font-medium">Tạm tính giỏ hàng</span>
                <span className="text-base font-bold text-pink-600">{cartSubtotal.toLocaleString('vi-VN')}đ</span>
              </div>

              {/* Direct Checkout Button */}
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  router.push('/checkout');
                }}
                className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white text-xs font-bold py-3.5 rounded-full transition-all shadow-lg shadow-pink-500/25 flex items-center justify-center gap-2 uppercase tracking-wider"
              >
                <span>Tiến hành thanh toán</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Affiliate Teaser Box matching Image 2 bottom */}
              <div className="bg-gradient-to-r from-pink-50 via-rose-50 to-amber-50 border border-pink-100 rounded-2xl p-3.5 flex items-center gap-3">
                <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center text-pink-600 shrink-0">
                  <Sparkles className="w-5 h-5 animate-spin" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-[11px] font-bold text-zinc-900">Kiếm tiền dễ dàng cùng Luxora Affiliate</h4>
                  <p className="text-[10px] text-zinc-500">Hoa hồng hấp dẫn lên đến 15%</p>
                </div>
                <Link
                  href="/affiliate"
                  onClick={() => setIsCartOpen(false)}
                  className="bg-pink-600 hover:bg-pink-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-full whitespace-nowrap"
                >
                  Tham gia ngay →
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
