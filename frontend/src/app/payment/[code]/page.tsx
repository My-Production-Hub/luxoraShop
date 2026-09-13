'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import {
  Building,
  Clock,
  Copy,
  CheckCircle,
  AlertTriangle,
  ShoppingBag,
  ArrowLeft,
  QrCode,
  ShieldCheck,
  Package
} from 'lucide-react';

import confetti from 'canvas-confetti';

import { Order } from '@/types';

// Bank config
const BANK_INFO = {
  bankName: 'MBBank',
  bankFullName: 'Ngân hàng Thương mại Cổ phần Quân đội',
  accountNumber: '999988887777',
  accountHolder: 'LUXORA PERFUME JSC',
  bankLogo: '🏦'
};

const TIMER_DURATION = 15 * 60; // 15 minutes in seconds

export default function PaymentPage() {
  const router = useRouter();
  const params = useParams();
  const orderCode = params.code as string;
  const { orders, updateOrderStatus, showToast } = useStore();

  const [localOrder, setLocalOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (orderCode && typeof window !== 'undefined') {
      try {
        const guestCodes = JSON.parse(localStorage.getItem('luxora_my_placed_order_codes_guest') || '[]');
        if (!guestCodes.includes(orderCode)) {
          localStorage.setItem('luxora_my_placed_order_codes_guest', JSON.stringify([...guestCodes, orderCode]));
        }
      } catch (e) {}
    }

    const foundInContext = orders.find(o => o.orderCode === orderCode || o._id === orderCode);
    if (foundInContext) {
      setLocalOrder(foundInContext);
    } else {
      fetch('http://localhost:5000/api/orders')
        .then(res => res.json())
        .then(dbOrders => {
          if (Array.isArray(dbOrders)) {
            const foundInDb = dbOrders.find((o: any) => o.orderCode === orderCode || o._id === orderCode);
            if (foundInDb) setLocalOrder(foundInDb);
          }
        })
        .catch(() => {});
    }
  }, [orders, orderCode]);

  const order = localOrder || orders.find(o => o.orderCode === orderCode || o._id === orderCode);

  // Timer state
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [isExpired, setIsExpired] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isPaidSuccess, setIsPaidSuccess] = useState(false);

  // Countdown timer
  useEffect(() => {
    if (isExpired) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isExpired]);

  // Format time as MM:SS
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Timer progress percentage
  const timerProgress = (timeLeft / TIMER_DURATION) * 100;

  // Timer color based on remaining time
  const getTimerColor = () => {
    if (timeLeft > 600) return 'text-emerald-600'; // > 10 min
    if (timeLeft > 300) return 'text-amber-500';   // > 5 min
    return 'text-red-500';                         // < 5 min
  };

  const getTimerBg = () => {
    if (timeLeft > 600) return 'from-emerald-500 to-emerald-600';
    if (timeLeft > 300) return 'from-amber-400 to-amber-500';
    return 'from-red-500 to-red-600';
  };

  // Copy to clipboard
  const handleCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      showToast('Đã sao chép thành công!', 'success');
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      showToast('Không thể sao chép, vui lòng copy thủ công', 'error');
    }
  };

  // Generate VietQR URL
  const qrUrl = `https://img.vietqr.io/image/${BANK_INFO.bankName}-${BANK_INFO.accountNumber}-compact2.png?amount=${order?.totalAmount || 0}&addInfo=${orderCode}&accountName=${encodeURIComponent(BANK_INFO.accountHolder)}`;

  // Handle confirm payment
  const handleConfirmPayment = () => {
    if (order && updateOrderStatus) {
      updateOrderStatus(order._id, 'Xác nhận');
    }

    // Save order code to localStorage for guest / user account order history tracking
    if (order && typeof window !== 'undefined') {
      try {
        const cleanEmail = (order.customerEmail || '').trim().toLowerCase();
        if (cleanEmail) {
          const userKey = `luxora_my_placed_order_codes_${cleanEmail}`;
          const existing = JSON.parse(localStorage.getItem(userKey) || '[]');
          localStorage.setItem(userKey, JSON.stringify(Array.from(new Set([...existing, order.orderCode, order._id]))));
        }
        const guestExisting = JSON.parse(localStorage.getItem('luxora_my_placed_order_codes_guest') || '[]');
        localStorage.setItem('luxora_my_placed_order_codes_guest', JSON.stringify(Array.from(new Set([...guestExisting, order.orderCode, order._id]))));
      } catch (e) {}
    }

    setIsPaidSuccess(true);
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err) {}
    showToast('Xác nhận thanh toán thành công! Đơn hàng đã được lưu vào "Đơn hàng của tôi".', 'success');
  };

  if (!order) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center space-y-4">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-zinc-900">Không tìm thấy đơn hàng</h2>
        <p className="text-xs text-zinc-500">Mã đơn hàng <strong>{orderCode}</strong> không tồn tại hoặc đã bị hủy.</p>
        <button
          onClick={() => router.push('/')}
          className="bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold px-6 py-3 rounded-full transition-all shadow-md"
        >
          Về trang chủ
        </button>
      </div>
    );
  }

  if (isPaidSuccess) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4">
        <div className="bg-white rounded-3xl border border-zinc-100 p-8 shadow-xl text-center space-y-6 animate-in zoom-in-95">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle className="w-12 h-12" />
          </div>

          <div>
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider">
              Thanh toán thành công
            </span>
            <h1 className="text-2xl font-bold text-zinc-900 mt-2">Cảm ơn bạn đã mua sắm tại Luxora!</h1>
            <p className="text-xs text-zinc-500 mt-1">
              Hệ thống đã nhận được xác nhận thanh toán cho đơn hàng <strong className="text-zinc-900">{orderCode}</strong>. Nhân viên CSKH sẽ kiểm tra và liên hệ giao hàng trong thời gian sớm nhất.
            </p>
          </div>

          <div className="bg-zinc-50 rounded-2xl p-4 text-xs text-zinc-600 space-y-2 text-left border border-zinc-100">
            <div className="flex justify-between">
              <span>Người nhận:</span>
              <span className="font-bold text-zinc-900">{order.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span>Số điện thoại:</span>
              <span className="font-bold text-zinc-900">{order.customerPhone}</span>
            </div>
            {order.shippingAddress && (
              <div className="flex justify-between gap-6">
                <span className="shrink-0">Địa chỉ nhận hàng:</span>
                <span className="font-bold text-zinc-900 text-right">{order.shippingAddress}</span>
              </div>
            )}
            {order.notes && (
              <div className="flex justify-between gap-6">
                <span className="shrink-0">Ghi chú:</span>
                <span className="font-bold text-zinc-900 text-right">{order.notes}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Phương thức thanh toán:</span>
              <span className="font-bold text-emerald-600">Chuyển khoản Ngân hàng (Đã thanh toán)</span>
            </div>
            <div className="flex justify-between">
              <span>Tổng thanh toán:</span>
              <span className="font-bold text-pink-600">{order.totalAmount.toLocaleString('vi-VN')}đ</span>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => router.push('/account')}
              className="flex-1 bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold py-3 rounded-full transition-colors shadow-md flex items-center justify-center gap-1.5"
            >
              <Package className="w-4 h-4" />
              <span>Xem đơn hàng của tôi</span>
            </button>
            <button
              onClick={() => router.push('/products')}
              className="flex-1 bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 text-xs font-bold py-3 rounded-full transition-all"
            >
              Tiếp tục mua sắm
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.push('/products')}
          className="p-2 text-zinc-400 hover:text-zinc-700 rounded-full hover:bg-zinc-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold font-serif-luxury text-zinc-900">Thanh toán chuyển khoản</h1>
          <p className="text-xs text-zinc-500 mt-0.5">Vui lòng chuyển khoản đúng nội dung để đơn hàng được xác nhận tự động</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* LEFT: QR Code + Bank Info (3 cols) */}
        <div className="lg:col-span-3 space-y-6">
          {/* QR Card */}
          <div className={`bg-white rounded-3xl border shadow-sm overflow-hidden ${isExpired ? 'border-red-200' : 'border-zinc-100'}`}>
            {/* Timer Bar */}
            <div className={`relative h-1.5 bg-zinc-100 overflow-hidden`}>
              <div
                className={`absolute inset-y-0 left-0 bg-gradient-to-r ${getTimerBg()} transition-all duration-1000 ease-linear`}
                style={{ width: `${timerProgress}%` }}
              />
            </div>

            <div className="p-6 md:p-8">
              {/* Timer Display */}
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${
                  isExpired
                    ? 'bg-red-50 border-red-200 text-red-600'
                    : timeLeft <= 300
                      ? 'bg-red-50 border-red-200 text-red-600 animate-pulse'
                      : 'bg-zinc-50 border-zinc-200 text-zinc-700'
                }`}>
                  <Clock className="w-4 h-4" />
                  <span className="text-xs font-medium">
                    {isExpired ? 'Đã hết thời gian thanh toán' : 'Thời gian còn lại:'}
                  </span>
                  {!isExpired && (
                    <span className={`text-lg font-bold font-mono ${getTimerColor()}`}>
                      {formatTime(timeLeft)}
                    </span>
                  )}
                </div>
              </div>

              {isExpired ? (
                /* Expired State */
                <div className="text-center space-y-4 py-8">
                  <div className="w-20 h-20 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto">
                    <AlertTriangle className="w-10 h-10" />
                  </div>
                  <h3 className="text-lg font-bold text-zinc-900">Mã QR đã hết hạn</h3>
                  <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                    Thời gian thanh toán 15 phút đã kết thúc. Vui lòng đặt lại đơn hàng để tiếp tục mua sắm.
                  </p>
                  <div className="flex gap-3 justify-center pt-2">
                    <button
                      onClick={() => router.push('/products')}
                      className="bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold px-6 py-3 rounded-full transition-all shadow-md"
                    >
                      Đặt hàng mới
                    </button>
                    <button
                      onClick={() => router.push('/account')}
                      className="bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 text-xs font-bold px-6 py-3 rounded-full transition-colors"
                    >
                      Lịch sử đơn hàng
                    </button>
                  </div>
                </div>
              ) : (
                /* Active QR State */
                <div className="space-y-6">
                  {/* QR Code */}
                  <div className="flex justify-center">
                    <div className="bg-white border-2 border-zinc-200 rounded-2xl p-3 shadow-lg shadow-zinc-100">
                      <img
                        src={qrUrl}
                        alt="QR Code thanh toán"
                        className="w-56 h-56 object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                      <div className="hidden w-56 h-56 flex items-center justify-center bg-zinc-50 rounded-xl">
                        <QrCode className="w-32 h-32 text-zinc-300" />
                      </div>
                    </div>
                  </div>

                  {/* Bank Details */}
                  <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50/60 border border-blue-100 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center gap-2 mb-3">
                      <Building className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">Thông tin chuyển khoản</span>
                    </div>

                    {/* Bank Name */}
                    <div className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-blue-100/60">
                      <div>
                        <p className="text-[10px] text-zinc-400 uppercase tracking-wider">Ngân hàng</p>
                        <p className="text-sm font-bold text-zinc-900">{BANK_INFO.bankName} - {BANK_INFO.bankFullName}</p>
                      </div>
                    </div>

                    {/* Account Number */}
                    <div className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-blue-100/60">
                      <div>
                        <p className="text-[10px] text-zinc-400 uppercase tracking-wider">Số tài khoản</p>
                        <p className="text-lg font-bold text-zinc-900 tracking-wider font-mono">{BANK_INFO.accountNumber}</p>
                      </div>
                      <button
                        onClick={() => handleCopy(BANK_INFO.accountNumber, 'account')}
                        className={`flex items-center gap-1 text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all ${
                          copiedField === 'account'
                            ? 'bg-emerald-100 text-emerald-600'
                            : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                        }`}
                      >
                        {copiedField === 'account' ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        {copiedField === 'account' ? 'Đã sao chép' : 'Sao chép'}
                      </button>
                    </div>

                    {/* Account Holder */}
                    <div className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-blue-100/60">
                      <div>
                        <p className="text-[10px] text-zinc-400 uppercase tracking-wider">Chủ tài khoản</p>
                        <p className="text-sm font-bold text-zinc-900">{BANK_INFO.accountHolder}</p>
                      </div>
                      <button
                        onClick={() => handleCopy(BANK_INFO.accountHolder, 'holder')}
                        className={`flex items-center gap-1 text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all ${
                          copiedField === 'holder'
                            ? 'bg-emerald-100 text-emerald-600'
                            : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                        }`}
                      >
                        {copiedField === 'holder' ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        {copiedField === 'holder' ? 'Đã sao chép' : 'Sao chép'}
                      </button>
                    </div>

                    {/* Transfer Content */}
                    <div className="flex items-center justify-between bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl px-4 py-3 border border-pink-200">
                      <div>
                        <p className="text-[10px] text-zinc-400 uppercase tracking-wider">Nội dung chuyển khoản</p>
                        <p className="text-lg font-bold text-pink-600 tracking-wider font-mono">{orderCode}</p>
                      </div>
                      <button
                        onClick={() => handleCopy(orderCode, 'content')}
                        className={`flex items-center gap-1 text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all ${
                          copiedField === 'content'
                            ? 'bg-emerald-100 text-emerald-600'
                            : 'bg-pink-100 text-pink-600 hover:bg-pink-200'
                        }`}
                      >
                        {copiedField === 'content' ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        {copiedField === 'content' ? 'Đã sao chép' : 'Sao chép'}
                      </button>
                    </div>

                    {/* Amount */}
                    <div className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-blue-100/60">
                      <div>
                        <p className="text-[10px] text-zinc-400 uppercase tracking-wider">Số tiền</p>
                        <p className="text-lg font-bold text-emerald-600">{order.totalAmount.toLocaleString('vi-VN')}đ</p>
                      </div>
                      <button
                        onClick={() => handleCopy(String(order.totalAmount), 'amount')}
                        className={`flex items-center gap-1 text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all ${
                          copiedField === 'amount'
                            ? 'bg-emerald-100 text-emerald-600'
                            : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                        }`}
                      >
                        {copiedField === 'amount' ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        {copiedField === 'amount' ? 'Đã sao chép' : 'Sao chép'}
                      </button>
                    </div>
                  </div>

                  {/* Warning Note */}
                  <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
                    <ShieldCheck className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <p className="text-[11px] text-amber-700 leading-relaxed">
                      <strong>Lưu ý:</strong> Vui lòng chuyển khoản đúng <strong>nội dung</strong> và <strong>số tiền</strong> để đơn hàng được xác nhận tự động. 
                      Mã QR sẽ hết hạn sau 15 phút kể từ khi đặt hàng.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: Order Summary (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Info Card */}
          <div className="bg-white rounded-3xl border border-zinc-100 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-pink-600" />
              <h2 className="text-sm font-bold text-zinc-900">Thông tin đơn hàng</h2>
            </div>

            {/* Order Code */}
            <div className="bg-pink-50/60 border border-pink-100 rounded-xl p-3 text-center">
              <p className="text-[10px] text-zinc-400 uppercase tracking-wider">Mã đơn hàng</p>
              <p className="text-lg font-bold text-pink-600 font-mono">{orderCode}</p>
            </div>

            {/* Customer Info */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-zinc-100">
                <span className="text-zinc-500">Người nhận</span>
                <span className="font-bold text-zinc-900">{order.customerName}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-zinc-100">
                <span className="text-zinc-500">Số điện thoại</span>
                <span className="font-bold text-zinc-900">{order.customerPhone}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-zinc-100">
                <span className="text-zinc-500">Email</span>
                <span className="font-bold text-zinc-900 text-[11px]">{order.customerEmail}</span>
              </div>
              <div className="py-1.5 border-b border-zinc-100">
                <span className="text-zinc-500 block mb-1">Địa chỉ giao hàng</span>
                <span className="font-bold text-zinc-900 text-[11px]">{order.shippingAddress}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-zinc-100">
                <span className="text-zinc-500">Thanh toán</span>
                <span className="font-bold text-blue-600">Chuyển khoản Ngân hàng</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-zinc-500">Trạng thái</span>
                <span className={`font-bold ${isExpired ? 'text-red-500' : 'text-amber-500'}`}>
                  {isExpired ? 'Hết hạn thanh toán' : 'Chờ thanh toán'}
                </span>
              </div>
            </div>
          </div>

          {/* Products List */}
          <div className="bg-white rounded-3xl border border-zinc-100 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-pink-600" />
              <h2 className="text-sm font-bold text-zinc-900">Sản phẩm ({order.items.length})</h2>
            </div>

            <div className="space-y-3 max-h-64 overflow-y-auto">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex gap-3 bg-zinc-50 rounded-xl p-3 border border-zinc-100">
                  <div className="w-14 h-14 bg-white rounded-lg flex-shrink-0 overflow-hidden border border-zinc-200">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-300">
                        <Package className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-zinc-900 truncate">{item.name}</p>
                    {item.volume && <p className="text-[10px] text-zinc-400">{item.volume}</p>}
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[10px] text-zinc-500">SL: {item.quantity}</span>
                      <span className="text-xs font-bold text-pink-600">
                        {((item.price || 0) * (item.quantity || 1)).toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Price Summary */}
          <div className="bg-white rounded-3xl border border-zinc-100 p-6 shadow-sm space-y-3">
            <div className="space-y-2 text-xs text-zinc-600">
              <div className="flex justify-between">
                <span>Tạm tính</span>
                <span className="font-bold text-zinc-900">{order.subtotal.toLocaleString('vi-VN')}đ</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-pink-600 font-medium">
                  <span>Giảm giá</span>
                  <span>-{order.discountAmount.toLocaleString('vi-VN')}đ</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Phí vận chuyển</span>
                <span className="font-bold text-zinc-900">
                  {order.shippingFee === 0 ? (
                    <span className="text-emerald-600 font-bold">MIỄN PHÍ</span>
                  ) : (
                    `${order.shippingFee.toLocaleString('vi-VN')}đ`
                  )}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold text-zinc-900 pt-2 border-t border-zinc-200">
                <span>Tổng thanh toán</span>
                <span className="text-pink-600 text-lg">{order.totalAmount.toLocaleString('vi-VN')}đ</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {!isExpired && (
              <button
                onClick={handleConfirmPayment}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold py-3.5 rounded-full transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 uppercase tracking-wider"
              >
                <CheckCircle className="w-4 h-4" />
                Xác nhận đã thanh toán
              </button>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => router.push('/account')}
                className="flex-1 bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 text-xs font-bold py-3 rounded-full transition-colors"
              >
                Lịch sử đơn hàng
              </button>
              <button
                onClick={() => router.push('/products')}
                className="flex-1 bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold py-3 rounded-full transition-all shadow-md"
              >
                Tiếp tục mua sắm
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
