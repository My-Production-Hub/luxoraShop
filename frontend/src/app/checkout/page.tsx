'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import {
  Truck,
  ShieldCheck,
  CheckCircle,
  ArrowLeft,
  ShoppingBag,
  Building,
  Tag,
  CheckCircle2,
  Sparkles,
  Bookmark,
  Coins,
  Ticket,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

export function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlVoucher = searchParams.get('voucher') || '';
  const {
    cart,
    directBuyItem,
    setDirectBuyItem,
    cartSubtotal,
    shippingFee,
    discountAmount,
    cartTotal,
    appliedVoucher,
    applyVoucher,
    removeVoucher,
    clearCart,
    addPurchasedProducts,
    addOrder,
    orders,
    user,
    showToast,
    refCode,
    savedVouchers,
    usedVouchers,
    vouchers,
    saveVoucher,
    markVoucherUsed,
    customers,
    userPoints,
    useRewardPoints
  } = useStore();

  const customerDetail = customers.find(c => c.email.toLowerCase() === (user?.email || '').toLowerCase());

  const checkoutItems = directBuyItem ? [directBuyItem] : cart;
  const checkoutSubtotal = checkoutItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const checkoutShippingFee = 30000;

  const [voucherInput, setVoucherInput] = useState(urlVoucher);

  useEffect(() => {
    if (urlVoucher) {
      setVoucherInput(urlVoucher);
    }
  }, [urlVoucher]);
  const [isApplying, setIsApplying] = useState(false);
  const [showVoucherDropdown, setShowVoucherDropdown] = useState(false);

  // Points redemption
  const POINT_VALUE = 1000; // 1 point = 1,000 VND
  const [usePoints, setUsePoints] = useState(false);
  const [pointsInput, setPointsInput] = useState('');

  const pointsDiscount = usePoints && pointsInput ? Math.min(parseInt(pointsInput) || 0, userPoints) * POINT_VALUE : 0;
  const checkoutTotal = Math.max(0, checkoutSubtotal + checkoutShippingFee - discountAmount - pointsDiscount);

  const [ctvInput, setCtvInput] = useState(refCode || '');
  const [appliedCtvCode, setAppliedCtvCode] = useState(refCode || '');
  const [voucherError, setVoucherError] = useState<string>('');

  const processVoucherApply = async (codeToApply: string) => {
    if (!codeToApply.trim()) return;
    setShowVoucherDropdown(false);
    setIsApplying(true);
    setVoucherError('');

    const clean = codeToApply.trim().toUpperCase();
    const targetV = vouchers.find(v => v.code.toUpperCase() === clean && v.status === 'active');

    if (targetV && checkoutSubtotal < targetV.minOrderValue) {
      const needed = targetV.minOrderValue - checkoutSubtotal;
      setVoucherError(`Bạn cần mua thêm ${needed.toLocaleString('vi-VN')}đ sản phẩm nữa để được nhận ưu đãi`);
      showToast(`Đơn hàng chưa đạt tối thiểu! Bạn cần mua thêm ${needed.toLocaleString('vi-VN')}đ sản phẩm nữa để áp dụng mã này.`, 'error');
      setIsApplying(false);
      return;
    }

    const success = await applyVoucher(codeToApply, checkoutSubtotal);
    if (!success) {
      if (targetV && checkoutSubtotal < targetV.minOrderValue) {
        const needed = targetV.minOrderValue - checkoutSubtotal;
        setVoucherError(`Bạn cần mua thêm ${needed.toLocaleString('vi-VN')}đ sản phẩm nữa để được nhận ưu đãi`);
      } else {
        setVoucherError('Mã giảm giá không hợp lệ hoặc đã hết hạn');
      }
    } else {
      setVoucherError('');
    }
    setIsApplying(false);
  };

  const handleApplyVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    processVoucherApply(voucherInput);
  };

  // Location API State (provinces, districts)
  const [provinces, setProvinces] = useState<{ code: number; name: string }[]>([]);
  const [districts, setDistricts] = useState<{ code: number; name: string }[]>([]);

  const [selectedProvinceCode, setSelectedProvinceCode] = useState<string>('');
  const [selectedProvinceName, setSelectedProvinceName] = useState<string>('');
  const [selectedDistrictCode, setSelectedDistrictCode] = useState<string>('');
  const [selectedDistrictName, setSelectedDistrictName] = useState<string>('');

  const [formData, setFormData] = useState({
    name: user?.name || customerDetail?.name || '',
    email: user?.email || customerDetail?.email || '',
    phone: user?.phone || customerDetail?.phone || '',
    street: customerDetail?.detailAddress || (user as any)?.detailAddress || (user as any)?.street || '',
    notes: ''
  });

  const [phoneError, setPhoneError] = useState<string>('');
  const [emailError, setEmailError] = useState<string>('');

  const validatePhone = (val: string) => {
    const cleanPhone = val.trim().replace(/[\s\-\.]/g, '');
    if (!cleanPhone) {
      return 'Vui lòng nhập số điện thoại nhận hàng!';
    }
    const vnPhoneRegex = /^(0|\+?84)(3|5|7|8|9)[0-9]{8}$/;
    if (!vnPhoneRegex.test(cleanPhone)) {
      return 'Số điện thoại không đúng định dạng';
    }
    return '';
  };

  const validateEmail = (val: string) => {
    const cleanEmail = val.trim();
    if (!cleanEmail) {
      return 'Vui lòng nhập Email nhận thông báo!';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return 'Định dạng Email không hợp lệ (VD: name@example.com)';
    }
    return '';
  };

  const hasInitializedCheckoutRef = useRef(false);

  // Auto-fill user profile info from account profile / customers data ONLY ONCE on initial load
  useEffect(() => {
    if ((user || customerDetail) && !hasInitializedCheckoutRef.current && provinces.length > 0) {
      hasInitializedCheckoutRef.current = true;
      const userProv = customerDetail?.province || (user as any)?.province || '';
      const userDist = customerDetail?.district || (user as any)?.district || '';
      const userStreet = customerDetail?.detailAddress || (user as any)?.detailAddress || (user as any)?.street || '';
      const userPhone = user?.phone || customerDetail?.phone || '';
      const userName = user?.name || customerDetail?.name || '';
      const userEmail = user?.email || customerDetail?.email || '';

      setFormData(prev => ({
        ...prev,
        name: prev.name || userName,
        email: prev.email || userEmail,
        phone: prev.phone || userPhone,
        street: prev.street || userStreet
      }));

      if (userProv && provinces.length > 0) {
        const targetP = userProv.toLowerCase().trim();
        const foundP = provinces.find(p => {
          const pName = p.name.toLowerCase().trim();
          return pName === targetP || pName.includes(targetP) || targetP.includes(pName);
        });

        if (foundP) {
          const pCodeStr = String(foundP.code);
          setSelectedProvinceCode(pCodeStr);
          setSelectedProvinceName(foundP.name);

          fetch(`https://provinces.open-api.vn/api/v2/w/?province=${pCodeStr}`)
            .then(res => res.json())
            .then(data => {
              const list = Array.isArray(data) && data.length > 0 ? data : [];
              setDistricts(list);
              if (userDist) {
                const targetD = userDist.toLowerCase().trim();
                const foundD = list.find((d: any) => {
                  const dName = d.name.toLowerCase().trim();
                  return dName === targetD || dName.includes(targetD) || targetD.includes(dName);
                });

                if (foundD) {
                  setSelectedDistrictCode(String(foundD.code));
                  setSelectedDistrictName(foundD.name);
                } else {
                  setSelectedDistrictName(userDist);
                }
              }
            })
            .catch(() => {
              if (userDist) setSelectedDistrictName(userDist);
            });
        } else {
          setSelectedProvinceName(userProv);
          if (userDist) {
            setSelectedDistrictName(userDist);
          }
        }
      }
    }
  }, [user, customerDetail, provinces]);

  // Fetch Provinces on Mount
  useEffect(() => {
    fetch('https://provinces.open-api.vn/api/v2/p/')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setProvinces(data);
        } else {
          return fetch('https://provinces.open-api.vn/api/p/').then(r => r.json()).then(d => setProvinces(d));
        }
      })
      .catch(() => {
        setProvinces([
          { code: 1, name: 'Thành phố Hà Nội' },
          { code: 79, name: 'Thành phố Hồ Chí Minh' },
          { code: 48, name: 'Thành phố Đà Nẵng' },
          { code: 31, name: 'Thành phố Hải Phòng' },
          { code: 92, name: 'Thành phố Cần Thơ' }
        ]);
      });
  }, []);

  const fetchWardsForProvinceCode = (code: string) => {
    if (!code) return;
    fetch(`https://provinces.open-api.vn/api/v2/w/?province=${code}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setDistricts(data);
        } else {
          return fetch(`https://provinces.open-api.vn/api/v2/p/${code}?depth=2`)
            .then(r => r.json())
            .then(d => {
              const list = d?.districts || d?.wards || [];
              if (Array.isArray(list)) setDistricts(list);
            });
        }
      })
      .catch(() => {});
  };

  // Fetch Districts when Province changes
  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    setSelectedProvinceCode(code);
    const found = provinces.find(p => String(p.code) === code);
    setSelectedProvinceName(found ? found.name : '');
    setSelectedDistrictCode('');
    setSelectedDistrictName('');
    setDistricts([]);

    if (code) {
      fetchWardsForProvinceCode(code);
    }
  };

  // Handle District selection
  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    setSelectedDistrictCode(code);
    const found = districts.find((d: any) => String(d.code) === code);
    setSelectedDistrictName(found ? found.name : '');
  };

  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'BankTransfer'>('COD');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccessCode, setOrderSuccessCode] = useState<string | null>(null);
  const [placedOrderDetails, setPlacedOrderDetails] = useState<{
    code: string;
    items: any[];
    subtotal: number;
    shippingFee: number;
    discountAmount: number;
    totalAmount: number;
  } | null>(null);

  if (checkoutItems.length === 0 && !orderSuccessCode) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center space-y-4">
        <div className="w-16 h-16 bg-pink-50 text-pink-500 rounded-full flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-zinc-900 font-serif-luxury">Giỏ hàng của bạn đang trống</h2>
        <p className="text-xs text-zinc-500">Vui lòng chọn sản phẩm vào giỏ hàng trước khi thanh toán.</p>
        <button
          onClick={() => router.push('/products')}
          className="bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold px-6 py-3 rounded-full transition-all shadow-md"
        >
          Khám phá sản phẩm
        </button>
      </div>
    );
  }

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      showToast('Vui lòng nhập Họ và tên người nhận!', 'error');
      return;
    }

    const pErr = validatePhone(formData.phone);
    if (pErr) {
      setPhoneError(pErr);
      showToast(pErr, 'error');
      return;
    }
    setPhoneError('');

    const eErr = validateEmail(formData.email);
    if (eErr) {
      setEmailError(eErr);
      showToast(eErr, 'error');
      return;
    }
    setEmailError('');
    if (!selectedProvinceName) {
      showToast('Vui lòng chọn Tỉnh / Thành phố!', 'error');
      return;
    }
    if (!selectedDistrictName) {
      showToast('Vui lòng chọn Quận / Huyện!', 'error');
      return;
    }
    if (!formData.street.trim()) {
      showToast('Vui lòng nhập Số nhà, tên đường chi tiết!', 'error');
      return;
    }

    setIsSubmitting(true);

    const fullAddress = `${formData.street.trim()}, ${selectedDistrictName}, ${selectedProvinceName}`;

    setTimeout(() => {
      const generatedCode = 'LUX' + Math.floor(100000 + Math.random() * 900000);
      setIsSubmitting(false);

      const purchasedItemsSnapshot = checkoutItems.map(item => ({
        product: item.product._id || item.product.slug || item.product.name,
        name: item.product.name,
        image: item.product.image,
        volume: item.selectedVolume,
        scent: item.selectedScent || '',
        price: item.product.price,
        quantity: item.quantity
      }));

      setPlacedOrderDetails({
        code: generatedCode,
        items: purchasedItemsSnapshot,
        subtotal: checkoutSubtotal,
        shippingFee: checkoutShippingFee,
        discountAmount: discountAmount,
        totalAmount: checkoutTotal
      });

      // Record order in StoreContext
      addOrder({
        orderCode: generatedCode,
        customerName: formData.name,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        shippingAddress: fullAddress,
        items: purchasedItemsSnapshot,
        subtotal: checkoutSubtotal,
        shippingFee: checkoutShippingFee,
        discountAmount: discountAmount,
        totalAmount: checkoutTotal,
        paymentMethod: paymentMethod,
        notes: formData.notes ? formData.notes.trim() : undefined,
        paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Pending',
        orderStatus: 'Chờ xác nhận',
        createdAt: (() => {
          const now = new Date();
          const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
          return `${timeStr} - ${now.toLocaleDateString('vi-VN')}`;
        })()
      });

      if (typeof window !== 'undefined') {
        try {
          const cleanEmail = (formData.email || '').trim().toLowerCase();
          if (cleanEmail) {
            const userKey = `luxora_my_placed_order_codes_${cleanEmail}`;
            const existing = JSON.parse(localStorage.getItem(userKey) || '[]');
            localStorage.setItem(userKey, JSON.stringify(Array.from(new Set([...existing, generatedCode]))));
          }
          const guestExisting = JSON.parse(localStorage.getItem('luxora_my_placed_order_codes_guest') || '[]');
          localStorage.setItem('luxora_my_placed_order_codes_guest', JSON.stringify(Array.from(new Set([...guestExisting, generatedCode]))));
        } catch (e) {}
      }

      // Reviews will be enabled automatically when admin marks order as 'Hoàn thành'

      // Deduct used reward points
      if (usePoints && pointsInput) {
        const pUsed = Math.min(parseInt(pointsInput) || 0, userPoints);
        if (pUsed > 0) {
          useRewardPoints(pUsed);
        }
      }

      if (appliedVoucher) {
        markVoucherUsed(appliedVoucher.code);
      }

      if (directBuyItem) {
        setDirectBuyItem(null);
      } else {
        clearCart();
      }

      if (paymentMethod === 'BankTransfer') {
        // Redirect to payment page for bank transfer
        router.push(`/payment/${generatedCode}`);
      } else {
        // COD: show success on this page
        setOrderSuccessCode(generatedCode);
        try {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch (err) {}
        showToast(`Đặt hàng thành công! Mã đơn: ${generatedCode}`, 'success');
      }
    }, 1200);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {orderSuccessCode ? (
        /* Order Success Confirmation Screen */
        <div className="max-w-xl mx-auto bg-white rounded-3xl border border-zinc-100 p-8 shadow-xl text-center space-y-6 animate-in zoom-in-95">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle className="w-12 h-12" />
          </div>

          <div>
            <span className="text-[11px] font-bold text-pink-600 bg-pink-50 px-3 py-1 rounded-full uppercase tracking-wider">
              Đặt hàng thành công
            </span>
            <h1 className="text-2xl font-bold text-zinc-900 mt-2">Cảm ơn bạn đã mua sắm tại Luxora!</h1>
            <p className="text-xs text-zinc-500 mt-1">
              Mã đơn hàng của bạn là <strong className="text-zinc-900">{orderSuccessCode}</strong>. Nhân viên CSKH sẽ liên hệ với bạn trong thời gian sớm nhất.
            </p>
          </div>

          {/* Box 1: Thông tin sản phẩm đơn hàng */}
          <div className="bg-zinc-50 rounded-2xl p-4 text-xs text-zinc-600 space-y-3 text-left border border-zinc-100">
            <div className="flex items-center justify-between border-b border-zinc-200/80 pb-2">
              <h3 className="font-bold text-zinc-900 flex items-center gap-1.5 text-xs">
                <ShoppingBag className="w-4 h-4 text-pink-600" />
                Thông tin sản phẩm đã đặt ({(placedOrderDetails?.items || orders.find(o => o.orderCode === orderSuccessCode)?.items || []).length})
              </h3>
              <span className="text-[10px] font-mono text-zinc-500 bg-white px-2 py-0.5 rounded-full border border-zinc-200">
                #{orderSuccessCode}
              </span>
            </div>

            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {(placedOrderDetails?.items || orders.find(o => o.orderCode === orderSuccessCode)?.items || []).map((item: any, idx: number) => (
                <div key={idx} className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-zinc-100 shadow-2xs">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-lg shrink-0 border border-zinc-100" />
                  ) : (
                    <div className="w-12 h-12 bg-zinc-100 rounded-lg shrink-0 flex items-center justify-center text-zinc-400">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-zinc-900 text-xs truncate">{item.name}</p>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-zinc-500 mt-0.5">
                      {item.volume && <span>Dung tích: <strong className="text-zinc-700">{item.volume}</strong></span>}
                      {item.scent && (
                        <>
                          <span>•</span>
                          <span>Mùi hương: <strong className="text-pink-600">{item.scent}</strong></span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-1 text-[11px]">
                      <span className="text-zinc-500">Số lượng: <strong className="text-zinc-800">{item.quantity}</strong></span>
                      <span className="font-bold text-pink-600">
                        {((item.price || 0) * (item.quantity || 1)).toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-zinc-200/80 pt-2 space-y-1 text-xs">
              <div className="flex justify-between text-zinc-500">
                <span>Tạm tính:</span>
                <span className="font-semibold text-zinc-800">{(placedOrderDetails?.subtotal || orders.find(o => o.orderCode === orderSuccessCode)?.subtotal || 0).toLocaleString('vi-VN')}đ</span>
              </div>
              {(placedOrderDetails?.discountAmount || orders.find(o => o.orderCode === orderSuccessCode)?.discountAmount || 0) > 0 && (
                <div className="flex justify-between text-pink-600">
                  <span>Giảm giá:</span>
                  <span className="font-semibold">-{(placedOrderDetails?.discountAmount || orders.find(o => o.orderCode === orderSuccessCode)?.discountAmount || 0).toLocaleString('vi-VN')}đ</span>
                </div>
              )}
              <div className="flex justify-between text-zinc-500">
                <span>Phí vận chuyển:</span>
                <span className="font-semibold text-zinc-800">
                  {(placedOrderDetails?.shippingFee ?? orders.find(o => o.orderCode === orderSuccessCode)?.shippingFee) === 0 ? (
                    <span className="text-emerald-600 font-bold">MIỄN PHÍ</span>
                  ) : (
                    `${(placedOrderDetails?.shippingFee ?? orders.find(o => o.orderCode === orderSuccessCode)?.shippingFee ?? 0).toLocaleString('vi-VN')}đ`
                  )}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold text-zinc-900 pt-1.5 border-t border-dashed border-zinc-200">
                <span>Tổng thanh toán:</span>
                <span className="text-pink-600 text-base">{(placedOrderDetails?.totalAmount || orders.find(o => o.orderCode === orderSuccessCode)?.totalAmount || 0).toLocaleString('vi-VN')}đ</span>
              </div>
            </div>
          </div>

          {/* Box 2: Thông tin nhận hàng */}
          <div className="bg-zinc-50 rounded-2xl p-4 text-xs text-zinc-600 space-y-2 text-left border border-zinc-100">
            <div className="flex justify-between">
              <span>Người nhận:</span>
              <span className="font-bold text-zinc-900">{formData.name}</span>
            </div>
            <div className="flex justify-between">
              <span>Số điện thoại:</span>
              <span className="font-bold text-zinc-900">{formData.phone}</span>
            </div>
            <div className="flex justify-between gap-6">
              <span className="shrink-0">Địa chỉ nhận hàng:</span>
              <span className="font-bold text-zinc-900 text-right">{formData.street}{selectedDistrictName ? `, ${selectedDistrictName}` : ''}{selectedProvinceName ? `, ${selectedProvinceName}` : ''}</span>
            </div>
            {formData.notes && (
              <div className="flex justify-between gap-6">
                <span className="shrink-0">Ghi chú:</span>
                <span className="font-bold text-zinc-900 text-right">{formData.notes}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Phương thức thanh toán:</span>
              <span className="font-bold text-pink-600">{paymentMethod}</span>
            </div>
            {refCode && (
              <div className="flex justify-between text-purple-600">
                <span>Mã giới thiệu Affiliate:</span>
                <span className="font-bold">{refCode}</span>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => router.push('/account')}
              className="flex-1 bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 text-xs font-bold py-3 rounded-full transition-colors"
            >
              Xem lịch sử đơn hàng
            </button>
            <button
              onClick={() => router.push('/products')}
              className="flex-1 bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold py-3 rounded-full transition-all shadow-md"
            >
              Tiếp tục mua sắm
            </button>
          </div>
        </div>
      ) : (
        /* Checkout Form & Order Summary */
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 text-zinc-400 hover:text-zinc-700 rounded-full hover:bg-zinc-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold font-serif-luxury text-zinc-900">Thanh toán đơn hàng</h1>
          </div>

          <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left 2 Cols: Shipping Info & Payment Methods */}
            <div className="lg:col-span-2 space-y-6">
              {/* Shipping Address Box */}
              <div className="bg-white rounded-3xl border border-zinc-100 p-6 space-y-4 shadow-sm">
                <h2 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-pink-600" />
                  Thông tin giao hàng
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="font-semibold text-zinc-700 block mb-1">Họ và tên *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-pink-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-zinc-700 block mb-1">Số điện thoại *</label>
                    <input
                      type="tel"
                      required
                      placeholder="VD: 0912345678"
                      value={formData.phone}
                      onChange={e => {
                        const val = e.target.value;
                        setFormData({ ...formData, phone: val });
                        if (phoneError) setPhoneError(validatePhone(val));
                      }}
                      onBlur={e => {
                        if (e.target.value.trim()) setPhoneError(validatePhone(e.target.value));
                      }}
                      className={`w-full border rounded-xl px-3.5 py-2.5 font-medium text-xs transition-colors ${
                        phoneError
                          ? 'border-rose-500 bg-rose-50/40 text-rose-900 focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-500'
                          : 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:outline-none focus:border-pink-500 focus:bg-white'
                      }`}
                    />
                    {phoneError && (
                      <div className="flex items-center gap-1.5 mt-1.5 text-[11px] font-bold text-rose-600 animate-in fade-in duration-200">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{phoneError}</span>
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="font-semibold text-zinc-700 block mb-1">Email nhận thông báo *</label>
                    <input
                      type="email"
                      required
                      placeholder="VD: name@example.com"
                      readOnly={!!user?.email}
                      value={formData.email}
                      onChange={e => {
                        const val = e.target.value;
                        setFormData({ ...formData, email: val });
                        if (emailError) setEmailError(validateEmail(val));
                      }}
                      onBlur={e => {
                        if (e.target.value.trim() && !user?.email) setEmailError(validateEmail(e.target.value));
                      }}
                      className={`w-full border rounded-xl px-3.5 py-2.5 font-medium text-xs transition-colors ${
                        emailError
                          ? 'border-rose-500 bg-rose-50/40 text-rose-900 focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-500'
                          : user?.email
                          ? 'bg-zinc-100 border-zinc-200 text-zinc-500 cursor-not-allowed'
                          : 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:outline-none focus:border-pink-500 focus:bg-white'
                      }`}
                    />
                    {emailError && (
                      <div className="flex items-center gap-1.5 mt-1.5 text-[11px] font-bold text-rose-600 animate-in fade-in duration-200">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{emailError}</span>
                      </div>
                    )}
                  </div>

                  {/* Tỉnh / Thành phố */}
                  <div>
                    <label className="font-semibold text-zinc-700 block mb-1">Tỉnh / Thành phố *</label>
                    <select
                      required
                      value={selectedProvinceCode}
                      onChange={handleProvinceChange}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-pink-500 focus:bg-white text-xs"
                    >
                      <option value="">-- Chọn Tỉnh / Thành phố --</option>
                      {provinces.map(p => (
                        <option key={p.code} value={p.code}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Quận / Huyện */}
                  <div>
                    <label className="font-semibold text-zinc-700 block mb-1">Quận / Huyện *</label>
                    <select
                      required
                      disabled={!selectedProvinceCode}
                      value={selectedDistrictCode}
                      onChange={handleDistrictChange}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-pink-500 focus:bg-white text-xs disabled:opacity-50"
                    >
                      <option value="">-- Chọn Quận / Huyện --</option>
                      {districts.map(d => (
                        <option key={d.code} value={d.code}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>



                  {/* Số nhà, tên đường chi tiết */}
                  <div>
                    <label className="font-semibold text-zinc-700 block mb-1">Số nhà, tên đường chi tiết *</label>
                    <input
                      type="text"
                      required
                      placeholder="VD: 123 Nguyễn Huệ"
                      value={formData.street}
                      onChange={e => setFormData({ ...formData, street: e.target.value })}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-pink-500 focus:bg-white text-xs"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="font-semibold text-zinc-700 block mb-1">Ghi chú đơn hàng (Tùy chọn)</label>
                    <textarea
                      rows={2}
                      placeholder="VD: Giao giờ hành chính, gọi trước khi giao..."
                      value={formData.notes}
                      onChange={e => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-pink-500 focus:bg-white text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Methods Selection matching SRS FR11 */}
              <div className="bg-white rounded-3xl border border-zinc-100 p-6 space-y-4 shadow-sm">
                <h2 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                  <Building className="w-4 h-4 text-pink-600" />
                  Phương thức thanh toán
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label
                    onClick={() => setPaymentMethod('COD')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 ${
                      paymentMethod === 'COD' ? 'border-pink-600 bg-pink-50/60 ring-2 ring-pink-200' : 'border-zinc-200 hover:border-zinc-300'
                    }`}
                  >
                    <Truck className="w-5 h-5 text-pink-600" />
                    <div>
                      <div className="text-xs font-bold text-zinc-900">Thanh toán COD</div>
                      <div className="text-[10px] text-zinc-400">Thanh toán khi nhận hàng</div>
                    </div>
                  </label>

                  <label
                    onClick={() => setPaymentMethod('BankTransfer')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 ${
                      paymentMethod === 'BankTransfer' ? 'border-pink-600 bg-pink-50/60 ring-2 ring-pink-200' : 'border-zinc-200 hover:border-zinc-300'
                    }`}
                  >
                    <Building className="w-5 h-5 text-emerald-600" />
                    <div>
                      <div className="text-xs font-bold text-zinc-900">Chuyển khoản Ngân hàng</div>
                      <div className="text-[10px] text-zinc-400">Chuyển khoản VietQR</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary */}
            <div className="bg-white rounded-3xl border border-zinc-100 p-6 space-y-4 shadow-sm h-fit">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-zinc-900">Tóm tắt đơn hàng ({checkoutItems.length})</h2>
                {directBuyItem && (
                  <span className="bg-pink-50 text-pink-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-pink-100">
                    Mua ngay
                  </span>
                )}
              </div>

              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {checkoutItems.map((item, idx) => (
                  <div key={idx} className="flex gap-3 text-xs border-b border-zinc-100 pb-3">
                    <img src={item.product.image} alt="" className="w-12 h-12 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-zinc-800 truncate">{item.product.name}</h4>
                      <p className="text-[10px] text-zinc-400 font-medium flex items-center gap-1.5 flex-wrap">
                        <span>SL: {item.quantity} x {item.selectedVolume}</span>
                        {item.selectedScent && (
                          <>
                            <span className="text-zinc-300">•</span>
                            <span className="text-pink-600 font-semibold bg-pink-50 px-1.5 py-0.5 rounded border border-pink-100">
                              Mùi: {item.selectedScent}
                            </span>
                          </>
                        )}
                      </p>
                      <p className="font-bold text-pink-600 mt-0.5">
                        {(item.product.price * item.quantity).toLocaleString('vi-VN')}đ
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Mã CTV & Mã Giảm Giá Boxes directly under product list */}
              <div className="space-y-3 pt-3 border-t border-zinc-100">
                {/* 1. Mã Cộng Tác Viên (CTV) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-pink-600" />
                    Mã Cộng Tác Viên (CTV)
                  </label>
                  {appliedCtvCode ? (
                    <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 text-xs">
                      <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Mã CTV: {appliedCtvCode}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setAppliedCtvCode('');
                          setCtvInput('');
                          showToast('Đã hủy áp dụng mã CTV', 'info');
                        }}
                        className="text-xs text-rose-600 hover:underline font-medium"
                      >
                        Bỏ chọn
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Nhập mã CTV (VD: AFF12345)"
                        value={ctvInput}
                        onChange={e => setCtvInput(e.target.value)}
                        className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-pink-500 focus:bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (ctvInput.trim()) {
                            setAppliedCtvCode(ctvInput.trim().toUpperCase());
                            showToast(`Đã áp dụng mã giới thiệu CTV: ${ctvInput.trim().toUpperCase()}`, 'success');
                          }
                        }}
                        className="bg-zinc-800 hover:bg-zinc-900 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors shadow-sm whitespace-nowrap"
                      >
                        Áp dụng
                      </button>
                    </div>
                  )}
                </div>

                {/* 2. Mã Giảm Giá (Voucher) */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-xs font-semibold text-zinc-700 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-pink-600" />
                    Bạn có mã giảm giá?
                  </label>
                  {appliedVoucher ? (
                    <div className="flex items-center justify-between bg-pink-50 border border-pink-200 rounded-xl px-3 py-2 text-xs">
                      <div className="flex items-center gap-1.5 text-pink-700 font-bold">
                        <CheckCircle2 className="w-4 h-4 text-pink-600" />
                        <span>{appliedVoucher.code}</span>
                        <span className="font-normal text-pink-600">(-{discountAmount.toLocaleString('vi-VN')}đ)</span>
                      </div>
                      <button
                        type="button"
                        onClick={removeVoucher}
                        className="text-xs text-rose-600 hover:underline font-medium"
                      >
                        Bỏ chọn
                      </button>
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Nhập mã voucher (VD: LUXORA100K)"
                          value={voucherInput}
                          onChange={e => {
                            setVoucherInput(e.target.value);
                            if (voucherError) setVoucherError('');
                          }}
                          onFocus={() => setShowVoucherDropdown(true)}
                          className={`flex-1 border rounded-xl px-3 py-2 text-xs transition-colors ${
                            voucherError
                              ? 'border-rose-500 bg-rose-50/40 text-rose-900 focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-500'
                              : 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:outline-none focus:border-pink-500 focus:bg-white'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={handleApplyVoucher}
                          disabled={isApplying}
                          className="bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors shadow-sm whitespace-nowrap"
                        >
                          {isApplying ? '...' : 'Áp dụng'}
                        </button>
                      </div>

                      {voucherError && (
                        <div className="flex items-center gap-1.5 mt-1.5 text-[11px] font-bold text-rose-600 animate-in fade-in duration-200">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{voucherError}</span>
                        </div>
                      )}

                      {/* Dropdown: Voucher đã lưu + tất cả voucher */}
                      {showVoucherDropdown && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setShowVoucherDropdown(false)} />
                          <div className="absolute left-0 right-0 top-full mt-1 z-20 bg-white border border-zinc-200 rounded-2xl shadow-xl max-h-[280px] overflow-y-auto">
                            {/* Saved vouchers */}
                            {savedVouchers.filter(code => !usedVouchers.includes(code.toUpperCase())).length > 0 && (
                              <div className="p-2 border-b border-zinc-100">
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-2 py-1 flex items-center gap-1">
                                  <Bookmark className="w-3 h-3" />
                                  Voucher đã lưu của bạn
                                </p>
                                {savedVouchers
                                  .filter(code => !usedVouchers.includes(code.toUpperCase()))
                                  .filter(code => !voucherInput || code.toLowerCase().includes(voucherInput.toLowerCase()))
                                  .map(code => {
                                    const v = vouchers.find(v => v.code.toUpperCase() === code);
                                    const isFreeship = v?.discountType === 'freeship' || v?.discountType === 'shipping' || code.includes('FREESHIP');
                                    return (
                                      <button
                                        key={code}
                                        type="button"
                                        onClick={() => {
                                          setVoucherInput(code);
                                          processVoucherApply(code);
                                        }}
                                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-pink-50 transition-colors text-left group"
                                      >
                                        <div className="flex items-center gap-2">
                                          <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                                            <Tag className="w-3.5 h-3.5 text-amber-600" />
                                          </div>
                                          <div>
                                            <p className="text-xs font-bold text-zinc-900">{code}</p>
                                            <p className="text-[10px] text-zinc-500">
                                              {v?.name || 'Mã giảm giá'}
                                              {v?.minOrderValue ? ` • Đơn từ ${(v.minOrderValue / 1000).toLocaleString('vi-VN')}K` : ''}
                                            </p>
                                          </div>
                                        </div>
                                        <span className="text-xs font-bold text-pink-600 group-hover:text-pink-700">
                                          {isFreeship ? 'FreeShip -30K' : v ? (v.discountType === 'percent' ? `-${v.discountValue}%` : `-${(v.discountValue / 1000)}K`) : ''}
                                        </span>
                                      </button>
                                    );
                                  })}
                              </div>
                            )}

                            {/* All available vouchers */}
                            <div className="p-2">
                              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-2 py-1 flex items-center gap-1">
                                <Ticket className="w-3 h-3" />
                                Tất cả voucher có sẵn
                              </p>
                              {vouchers
                                .filter(v => v.status === 'active')
                                .filter(v => !usedVouchers.includes(v.code.toUpperCase()))
                                .filter(v => !voucherInput || v.code.toLowerCase().includes(voucherInput.toLowerCase()) || v.name.toLowerCase().includes(voucherInput.toLowerCase()))
                                .filter(v => !savedVouchers.includes(v.code.toUpperCase()))
                                .map(v => {
                                  const isFreeship = v.discountType === 'freeship' || v.discountType === 'shipping' || v.code.includes('FREESHIP');
                                  return (
                                    <div
                                      key={v._id}
                                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-zinc-50 transition-colors text-left"
                                    >
                                      <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0">
                                          <Tag className="w-3.5 h-3.5 text-zinc-500" />
                                        </div>
                                        <div>
                                          <p className="text-xs font-bold text-zinc-900">{v.code}</p>
                                          <p className="text-[10px] text-zinc-500">
                                            {v.name}
                                            {v.minOrderValue ? ` • Đơn từ ${(v.minOrderValue / 1000).toLocaleString('vi-VN')}K` : ''}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-zinc-500">
                                          {isFreeship ? 'FreeShip -30K' : v.discountType === 'percent' ? `-${v.discountValue}%` : `-${(v.discountValue / 1000)}K`}
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            saveVoucher(v.code);
                                            setVoucherInput(v.code);
                                            processVoucherApply(v.code);
                                          }}
                                          className="text-[10px] font-bold text-pink-600 border border-pink-300 bg-pink-50 hover:bg-pink-100 px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap"
                                        >
                                          Áp dụng
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* 3. Đổi điểm tích lũy */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-zinc-700 flex items-center gap-1.5">
                      <Coins className="w-3.5 h-3.5 text-amber-500" />
                      Đổi điểm tích lũy
                      <span className="text-[10px] font-normal text-zinc-400 ml-1">
                        (Bạn có <span className="font-bold text-amber-600">{userPoints.toLocaleString('vi-VN')}</span> điểm)
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setUsePoints(!usePoints);
                        if (usePoints) setPointsInput('');
                      }}
                      className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${
                        usePoints ? 'bg-amber-500' : 'bg-zinc-300'
                      }`}
                    >
                      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                        usePoints ? 'translate-x-5' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>

                  {usePoints && (
                    <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-3 space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min="0"
                          max={userPoints}
                          placeholder={`Nhập số điểm (tối đa ${userPoints.toLocaleString('vi-VN')})`}
                          value={pointsInput}
                          onChange={e => {
                            const val = parseInt(e.target.value) || 0;
                            if (val > userPoints) {
                              setPointsInput(String(userPoints));
                              showToast(`Bạn chỉ có ${userPoints.toLocaleString('vi-VN')} điểm!`, 'error');
                            } else {
                              setPointsInput(e.target.value);
                            }
                          }}
                          className="flex-1 bg-white border border-amber-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-400"
                        />
                        <button
                          type="button"
                          onClick={() => setPointsInput(String(userPoints))}
                          className="text-[10px] font-bold text-amber-600 hover:text-amber-700 border border-amber-300 bg-white rounded-xl px-3 py-2 whitespace-nowrap hover:bg-amber-50 transition-colors"
                        >
                          Dùng hết
                        </button>
                      </div>
                      {pointsInput && parseInt(pointsInput) > 0 && (
                        <p className="text-[11px] text-amber-700">
                          Đổi <span className="font-bold">{parseInt(pointsInput).toLocaleString('vi-VN')}</span> điểm = Giảm <span className="font-bold text-pink-600">-{((parseInt(pointsInput) || 0) * POINT_VALUE).toLocaleString('vi-VN')}đ</span>
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Price Rows */}
              <div className="space-y-2 text-xs text-zinc-600 pt-2 border-t border-zinc-200/60">
                <div className="flex justify-between">
                  <span>Tạm tính</span>
                  <span className="font-bold text-zinc-900">{checkoutSubtotal.toLocaleString('vi-VN')}đ</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-pink-600 font-medium">
                    <span>Giảm giá ({appliedVoucher?.code})</span>
                    <span>-{discountAmount.toLocaleString('vi-VN')}đ</span>
                  </div>
                )}
                {pointsDiscount > 0 && (
                  <div className="flex justify-between text-amber-600 font-medium">
                    <span>Đổi điểm (-{parseInt(pointsInput).toLocaleString('vi-VN')} điểm)</span>
                    <span>-{pointsDiscount.toLocaleString('vi-VN')}đ</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Phí vận chuyển</span>
                  <span className="font-bold text-zinc-900">
                    {appliedVoucher && (appliedVoucher.discountType === 'freeship' || appliedVoucher.discountType === 'shipping' || appliedVoucher.code.includes('FREESHIP')) ? (
                      <span className="text-emerald-600 font-bold">MIỄN PHÍ</span>
                    ) : (
                      `${checkoutShippingFee.toLocaleString('vi-VN')}đ`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-zinc-900 pt-2 border-t border-zinc-200">
                  <span>Tổng tiền thanh toán</span>
                  <span className="text-pink-600 text-base">{checkoutTotal.toLocaleString('vi-VN')}đ</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white text-xs font-bold py-3.5 rounded-full transition-all shadow-lg shadow-pink-500/25 flex items-center justify-center gap-2 uppercase tracking-wider"
              >
                {isSubmitting ? 'Đang xử lý đơn hàng...' : 'Xác nhận đặt hàng'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-xs text-zinc-400">Đang tải trang thanh toán...</div>}>
      <CheckoutContent />
    </React.Suspense>
  );
}
