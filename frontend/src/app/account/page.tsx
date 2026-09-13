'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore, sortOrdersNewestFirst } from '@/context/StoreContext';
import { User, Mail, Phone, MapPin, Building, Home, ShoppingBag, RefreshCw, ArrowRight, PackageOpen, Camera, Check, Upload, Calendar, Star, Zap, CheckCircle2, RotateCcw, X, Clock, XCircle, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150'
];

export default function AccountPage() {
  const router = useRouter();
  const { user, showToast, addToCart, products, orders, updateOrderStatus, customers, addCustomer, setSelectedProductModal, addPurchasedProducts, hasUserReviewedProduct } = useStore();
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'orders'>('orders');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCode, setFilterCode] = useState('');
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubTabChange = (tab: 'profile' | 'orders') => {
    setActiveSubTab(tab);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('luxora_account_subtab', tab);
        const url = new URL(window.location.href);
        url.searchParams.set('tab', tab);
        window.history.replaceState(null, '', url.toString());
      } catch (e) {}
    }
  };

  const handleFilterStatusChange = (status: string) => {
    setFilterStatus(status);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('luxora_account_filter_status', status);
        const url = new URL(window.location.href);
        if (status) url.searchParams.set('status', status);
        else url.searchParams.delete('status');
        window.history.replaceState(null, '', url.toString());
      } catch (e) {}
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const params = new URLSearchParams(window.location.search);
        const tab = params.get('tab') || localStorage.getItem('luxora_account_subtab');
        if (tab === 'profile' || tab === 'orders') {
          setActiveSubTab(tab);
        }
        const status = params.get('status') || localStorage.getItem('luxora_account_filter_status');
        if (status) {
          setFilterStatus(status);
        }
      } catch (e) {}
    }
  }, []);

  const toggleOrderExpand = (orderId: string) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  const toggleSection = (key: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Handle local image file upload from user computer
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('Kích thước ảnh quá lớn! Vui lòng chọn ảnh nhỏ hơn 5MB.', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        if (base64) {
          setSelectedAvatar(base64);
          showToast('Tải ảnh đại diện từ máy tính thành công!', 'success');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Filter actual orders placed by this specific logged in user or in guest session
  const [myOrderCodes, setMyOrderCodes] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const allCodes: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('luxora_my_placed_order_codes')) {
            const arr = JSON.parse(localStorage.getItem(key) || '[]');
            if (Array.isArray(arr)) {
              allCodes.push(...arr);
            }
          }
        }
        setMyOrderCodes(Array.from(new Set(allCodes.filter(Boolean))));
      } catch (e) {}
    }
  }, [orders, user?.email]);

  const userOrders = sortOrdersNewestFirst(orders.filter(o => {
    if (!o) return false;
    const cleanOrdCode = (o.orderCode || '').toString().trim().toLowerCase().replace(/^#/, '');
    const cleanOrdId = (o._id || '').toString().trim().toLowerCase().replace(/^#/, '');

    const isCodeMatched = myOrderCodes.some(c => {
      const cleanC = (c || '').toString().trim().toLowerCase().replace(/^#/, '');
      return (cleanC && (cleanC === cleanOrdCode || cleanC === cleanOrdId));
    });

    if (!user || !user.email) {
      return isCodeMatched;
    }

    const cleanUserEmail = (user.email || '').trim().toLowerCase();
    const cleanCustEmail = (o.customerEmail || '').trim().toLowerCase();
    const cleanUserPhone = (user.phone || '').replace(/\D/g, '');
    const cleanCustPhone = (o.customerPhone || '').replace(/\D/g, '');

    return (
      (cleanUserEmail && cleanCustEmail === cleanUserEmail) ||
      (cleanUserPhone && cleanUserPhone !== '' && cleanCustPhone === cleanUserPhone) ||
      isCodeMatched
    );
  }));



  const getUserStatus = (status: string) => {
    if (status === 'Hủy' || status === 'Hủy đơn') return 'Hủy đơn';
    return status || 'Chờ xác nhận';
  };

  const filteredOrders = userOrders.filter(o => {
    const rawStatus = o.orderStatus || 'Chờ xác nhận';
    if (filterStatus === 'Chưa hoàn thành') {
      const isUnfinished = ['Chờ xác nhận', 'Xác nhận', 'Đóng gói', 'Đang giao'].includes(rawStatus);
      if (!isUnfinished) return false;
    } else if (filterStatus === 'Hoàn thành' || filterStatus === 'Đã hoàn thành') {
      if (rawStatus !== 'Hoàn thành') return false;
    } else if (filterStatus === 'Hủy đơn') {
      const isCanceled = rawStatus === 'Hủy' || rawStatus === 'Hủy đơn';
      if (!isCanceled) return false;
    } else if (filterStatus && getUserStatus(rawStatus) !== filterStatus) {
      return false;
    }

    if (filterCode && !o.orderCode.toLowerCase().includes(filterCode.toLowerCase())) return false;
    return true;
  });

  // Find customer record from customers list to display address/phone
  const customerDetail = customers.find(c => c.email.toLowerCase() === (user?.email || '').toLowerCase());

  // Profile Form States
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    province: '',
    district: '',
    detailAddress: ''
  });
  const [selectedAvatar, setSelectedAvatar] = useState<string>('');

  const [provinces, setProvinces] = useState<{ code: number; name: string }[]>([]);
  const [districts, setDistricts] = useState<{ code: number; name: string }[]>([]);
  const [selectedProvinceCode, setSelectedProvinceCode] = useState<string>('');

  // Fetch Vietnam Provinces list on mount from Open API v2 (2025)
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
          { code: 92, name: 'Thành phố Cần Thơ' },
          { code: 22, name: 'Tỉnh Quảng Ninh' },
          { code: 24, name: 'Tỉnh Bắc Giang' },
          { code: 27, name: 'Tỉnh Bắc Ninh' },
          { code: 30, name: 'Tỉnh Hải Dương' },
          { code: 33, name: 'Tỉnh Hưng Yên' },
          { code: 35, name: 'Tỉnh Hà Nam' },
          { code: 36, name: 'Tỉnh Nam Định' },
          { code: 37, name: 'Tỉnh Ninh Bình' },
          { code: 38, name: 'Tỉnh Thanh Hóa' },
          { code: 40, name: 'Tỉnh Nghệ An' },
          { code: 42, name: 'Tỉnh Hà Tĩnh' },
          { code: 44, name: 'Tỉnh Quảng Bình' },
          { code: 45, name: 'Tỉnh Quảng Trị' },
          { code: 46, name: 'Tỉnh Thừa Thiên Huế' },
          { code: 49, name: 'Tỉnh Quảng Nam' },
          { code: 51, name: 'Tỉnh Quảng Ngãi' },
          { code: 52, name: 'Tỉnh Bình Định' },
          { code: 54, name: 'Tỉnh Phú Yên' },
          { code: 56, name: 'Tỉnh Khánh Hòa' },
          { code: 58, name: 'Tỉnh Ninh Thuận' },
          { code: 60, name: 'Tỉnh Bình Thuận' },
          { code: 62, name: 'Tỉnh Kon Tum' },
          { code: 64, name: 'Tỉnh Gia Lai' },
          { code: 66, name: 'Tỉnh Đắk Lắk' },
          { code: 67, name: 'Tỉnh Đắk Nông' },
          { code: 68, name: 'Tỉnh Lâm Đồng' },
          { code: 70, name: 'Tỉnh Bình Phước' },
          { code: 72, name: 'Tỉnh Tây Ninh' },
          { code: 74, name: 'Tỉnh Bình Dương' },
          { code: 75, name: 'Tỉnh Đồng Nai' },
          { code: 77, name: 'Tỉnh Bà Rịa - Vũng Tàu' },
          { code: 80, name: 'Tỉnh Long An' },
          { code: 82, name: 'Tỉnh Tiền Giang' },
          { code: 83, name: 'Tỉnh Bến Tre' },
          { code: 84, name: 'Tỉnh Trà Vinh' },
          { code: 86, name: 'Tỉnh Vĩnh Long' },
          { code: 87, name: 'Tỉnh Đồng Tháp' },
          { code: 89, name: 'Tỉnh An Giang' },
          { code: 91, name: 'Tỉnh Kiên Giang' },
          { code: 93, name: 'Tỉnh Hậu Giang' },
          { code: 94, name: 'Tỉnh Sóc Trăng' },
          { code: 95, name: 'Tỉnh Bạc Liêu' },
          { code: 96, name: 'Tỉnh Cà Mau' },
          { code: 2, name: 'Tỉnh Hà Giang' },
          { code: 4, name: 'Tỉnh Cao Bằng' },
          { code: 6, name: 'Tỉnh Bắc Kạn' },
          { code: 8, name: 'Tỉnh Tuyên Quang' },
          { code: 10, name: 'Tỉnh Lào Cai' },
          { code: 11, name: 'Tỉnh Điện Biên' },
          { code: 12, name: 'Tỉnh Lai Châu' },
          { code: 14, name: 'Tỉnh Sơn La' },
          { code: 15, name: 'Tỉnh Yên Bái' },
          { code: 17, name: 'Tỉnh Hòa Bình' },
          { code: 19, name: 'Tỉnh Thái Nguyên' },
          { code: 20, name: 'Tỉnh Lạng Sơn' },
          { code: 25, name: 'Tỉnh Phú Thọ' },
          { code: 26, name: 'Tỉnh Vĩnh Phúc' }
        ]);
      });
  }, []);

  const isFormInitializedRef = useRef(false);

  // Sync profileForm state with current user & customer detail on initial load
  useEffect(() => {
    if ((user || customerDetail) && !isFormInitializedRef.current) {
      isFormInitializedRef.current = true;
      setProfileForm({
        name: user?.name || customerDetail?.name || '',
        phone: user?.phone || customerDetail?.phone || '',
        province: (user as any)?.province || customerDetail?.province || '',
        district: (user as any)?.district || customerDetail?.district || '',
        detailAddress: (user as any)?.detailAddress || customerDetail?.detailAddress || ''
      });
      setSelectedAvatar(user?.avatar || customerDetail?.avatar || PRESET_AVATARS[0]);
    }
  }, [user, customerDetail]);

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

  // Auto-match province code & fetch districts/wards when profileForm.province or provinces changes
  useEffect(() => {
    if (profileForm.province && provinces.length > 0) {
      const targetP = profileForm.province.toLowerCase().trim();
      const foundP = provinces.find(p => {
        const pName = p.name.toLowerCase().trim();
        return pName === targetP || pName.includes(targetP) || targetP.includes(pName);
      });
      if (foundP) {
        const codeStr = String(foundP.code);
        setSelectedProvinceCode(codeStr);
        fetchWardsForProvinceCode(codeStr);
      }
    }
  }, [profileForm.province, provinces]);

  // Handle Province Selection and fetch corresponding Districts/Wards
  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    setSelectedProvinceCode(code);
    const foundP = provinces.find(p => String(p.code) === code);
    const provinceName = foundP ? foundP.name : '';

    setProfileForm(prev => ({
      ...prev,
      province: provinceName,
      district: ''
    }));
    setDistricts([]);

    if (code) {
      fetchWardsForProvinceCode(code);
    }
  };

  const [isSavedSuccess, setIsSavedSuccess] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.email) {
      showToast('Không tìm thấy Email người dùng!', 'error');
      return;
    }

    const cleanPhone = profileForm.phone.trim().replace(/[\s\-\.]/g, '');
    const vnPhoneRegex = /^(0|\+?84)(3|5|7|8|9)[0-9]{8}$/;
    if (cleanPhone && !vnPhoneRegex.test(cleanPhone)) {
      showToast('Số điện thoại không hợp lệ! Vui lòng nhập số điện thoại Việt Nam hợp lệ 10 chữ số (ví dụ: 0912345678)', 'error');
      return;
    }

    addCustomer({
      name: profileForm.name.trim(),
      email: user.email,
      phone: cleanPhone,
      province: profileForm.province,
      district: profileForm.district,
      detailAddress: profileForm.detailAddress,
      avatar: selectedAvatar
    });

    setIsSavedSuccess(true);
    setTimeout(() => setIsSavedSuccess(false), 2000);

    showToast('Thay đổi thông tin thành công!', 'success');
  };

  const handleReorder = (productName: string) => {
    const prod = products.find(p => p.name.toLowerCase().includes(productName.toLowerCase().slice(0, 10))) || products[0];
    addToCart(prod);
    showToast(`Đã thêm lại "${prod.name}" vào giỏ hàng!`, 'success');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6 relative">
      {/* Floating Badge Notification at Top Right */}
      {isSavedSuccess && (
        <div className="fixed top-24 right-6 z-[99999] bg-emerald-600/95 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-emerald-400/50 flex flex-col gap-2.5 animate-badge-pop-float backdrop-blur-md ring-2 ring-emerald-400/30 overflow-hidden min-w-[260px]">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0 animate-pulse">
                <CheckCircle2 className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-xs text-white">Thay đổi thông tin thành công!</span>
            </div>
            <button
              type="button"
              onClick={() => setIsSavedSuccess(false)}
              className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors shrink-0"
              title="Đóng thông báo"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Dedicated Horizontal Progress Bar Line Underneath Text */}
          <div className="w-full bg-emerald-950/40 h-2 rounded-full overflow-hidden p-0.5 border border-emerald-400/30 relative">
            <div className="h-full bg-gradient-to-r from-emerald-200 to-white rounded-full animate-progress-shrink relative">
              <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-[0_0_10px_#ffffff] ring-2 ring-emerald-300 animate-pulse" />
            </div>
          </div>
        </div>
      )}

      {/* Header Profile Summary OR Guest Login Banner */}
      {!user ? (
        <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 rounded-3xl p-8 sm:p-10 text-white shadow-xl flex flex-col items-center text-center justify-center gap-5 relative overflow-hidden">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-bold text-white border border-white/30 z-10 shadow-2xs">
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>Ưu đãi thành viên Luxora</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif-luxury text-white leading-tight z-10 max-w-xl">
            Hãy đăng nhập để nhận ưu đãi từ chúng tôi
          </h1>
          <p className="text-xs sm:text-sm text-white/90 leading-relaxed z-10 max-w-xl">
            Đăng nhập tài khoản Luxora để tự động tích điểm thưởng đổi quà, áp dụng Voucher giảm giá độc quyền và theo dõi toàn bộ lịch sử đơn hàng!
          </p>
          <div className="z-10 pt-1">
            <Link
              href="/login"
              className="bg-white text-pink-600 hover:bg-pink-50 text-xs sm:text-sm font-extrabold px-8 py-3.5 rounded-full transition-all shadow-lg hover:scale-105 flex items-center gap-2.5"
            >
              <span>Đăng nhập ngay</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="absolute -left-12 -top-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-zinc-100 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-4">
            <img
              src={user?.avatar || selectedAvatar || PRESET_AVATARS[0]}
              alt="Avatar"
              className="w-16 h-16 rounded-full object-cover ring-4 ring-pink-100 shadow-md"
            />
            <div>
              <h1 className="text-xl font-bold font-serif-luxury text-zinc-900">{user?.name || customerDetail?.name || 'Thành viên Luxora'}</h1>
              <p className="text-xs text-zinc-400">{user?.email || ''}</p>
              <span className="inline-block mt-1 bg-pink-100 text-pink-700 text-[10px] px-2.5 py-0.5 rounded-full font-bold">
                Thành viên chính thức
              </span>
            </div>
          </div>

          <div className="flex gap-2 text-xs">
            <button
              onClick={() => handleSubTabChange('orders')}
              className={`px-4 py-2 rounded-xl font-bold transition-all ${
                activeSubTab === 'orders' ? 'bg-pink-600 text-white shadow-md' : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
              }`}
            >
              Đơn hàng của tôi ({userOrders.length})
            </button>
            <button
              onClick={() => handleSubTabChange('profile')}
              className={`px-4 py-2 rounded-xl font-bold transition-all ${
                activeSubTab === 'profile' ? 'bg-pink-600 text-white shadow-md' : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
              }`}
            >
              Thông tin cá nhân
            </button>
          </div>
        </div>
      )}

      {/* Orders History Tab */}
      {activeSubTab === 'orders' && (
        <div className="bg-white rounded-3xl border border-zinc-100 p-6 space-y-4 shadow-sm">
          <h2 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-pink-600" />
            Lịch sử đơn hàng của bạn
          </h2>

          {/* Filter Bar */}
          {userOrders.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={filterCode}
                onChange={e => setFilterCode(e.target.value)}
                placeholder="🔍 Tìm theo mã đơn hàng..."
                className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:border-pink-400 transition-colors"
              />
              <select
                value={filterStatus}
                onChange={e => handleFilterStatusChange(e.target.value)}
                className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-semibold text-zinc-800 focus:outline-none focus:border-pink-400 cursor-pointer transition-colors"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="Chưa hoàn thành">Chưa hoàn thành</option>
                <option value="Hoàn thành">Hoàn thành</option>
                <option value="Hủy đơn">Hủy đơn</option>
              </select>
            </div>
          )}

          {userOrders.length === 0 ? (
            <div className="py-12 px-4 text-center space-y-4">
              <div className="w-16 h-16 bg-pink-50 text-pink-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <PackageOpen className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-zinc-900 font-serif-luxury">Bạn chưa có đơn hàng nào</h3>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                  Hãy khám phá bộ sưu tập nước hoa cao cấp của Luxora và đặt mua sản phẩm ưa thích ngay hôm nay!
                </p>
              </div>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold px-6 py-3 rounded-full transition-all shadow-md shadow-pink-500/20"
              >
                <span>Khám phá sản phẩm ngay</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-8 text-center space-y-2">
              <p className="text-xs text-zinc-500">Không tìm thấy đơn hàng phù hợp với bộ lọc.</p>
              <button
                onClick={() => { setFilterStatus(''); setFilterCode(''); }}
                className="text-xs text-pink-600 font-bold hover:underline"
              >
                Xóa bộ lọc
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map(ord => {
                const ordKey = ord._id || ord.orderCode;
                const isExpanded = !!expandedOrders[ordKey];

                return (
                  <div key={ordKey} className="p-5 rounded-3xl bg-zinc-50/80 border border-zinc-200/80 space-y-4 shadow-sm hover:border-pink-200 transition-colors">
                    {/* Card Header: Code, Status, Date & Buttons */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-zinc-200/70 pb-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-zinc-900 font-mono">#{ord.orderCode}</span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            ord.orderStatus === 'Chờ xác nhận' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                            ord.orderStatus === 'Xác nhận' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                            ord.orderStatus === 'Đóng gói' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                            ord.orderStatus === 'Đang giao' ? 'bg-cyan-100 text-cyan-700 border-cyan-200' :
                            ord.orderStatus === 'Hoàn thành' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                            'bg-rose-100 text-rose-700 border-rose-200'
                          }`}>
                            {getUserStatus(ord.orderStatus)}
                          </span>
                          <span className="text-[11px] text-zinc-500 bg-white px-2.5 py-0.5 rounded-full border border-zinc-200">
                            {String(ord.paymentMethod) === 'BankTransfer' ? 'Chuyển khoản' : ord.paymentMethod}
                          </span>
                        </div>
                        <div className="text-[11px] text-zinc-400 font-semibold flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-zinc-400" />
                          <span>{ord.createdAt}</span>
                        </div>
                      </div>

                      {/* Action Buttons & Expand Toggle */}
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        {ord.orderStatus === 'Hoàn thành' && (
                          <button
                            onClick={() => {
                              const item = ord.items[0];
                              if (item) {
                                const prodId = typeof item.product === 'string' ? item.product : item.product?._id;
                                const found = products.find(p => p._id === prodId || p.name.toLowerCase() === item.name.toLowerCase());
                                if (found) {
                                  router.push(`/product/${found._id}`);
                                } else {
                                  router.push('/products');
                                }
                              }
                            }}
                            className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white px-3.5 py-1.5 rounded-xl font-bold transition-all shadow-sm flex items-center gap-1.5"
                          >
                            <RefreshCw className="w-3.5 h-3.5" /> Mua lại
                          </button>
                        )}

                        {ord.orderStatus === 'Chờ xác nhận' && (
                          <button
                            onClick={() => {
                              updateOrderStatus(ord._id || ord.orderCode, 'Hủy đơn');
                              showToast('Đã hủy đơn hàng thành công!', 'info');
                            }}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 shadow-2xs"
                          >
                            <XCircle className="w-3.5 h-3.5 text-rose-600" /> Hủy đơn
                          </button>
                        )}

                        {ord.orderStatus === 'Hoàn thành' && (() => {
                          const item = ord.items[0];
                          const prodId = item ? (typeof item.product === 'string' ? item.product : item.product?._id) : '';
                          const isReviewed = prodId ? hasUserReviewedProduct(prodId) : false;

                          return (
                            <>
                              {isReviewed ? (
                                <button
                                  onClick={() => {
                                    const found = products.find(p => p._id === prodId || p.name.toLowerCase() === item?.name.toLowerCase());
                                    if (found) router.push(`/product/${found._id}?tab=reviews#reviews`);
                                  }}
                                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 shadow-2xs"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Đã đánh giá
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    if (prodId) addPurchasedProducts([prodId]);
                                    const found = products.find(p => p._id === prodId || p.name.toLowerCase() === item?.name.toLowerCase());
                                    if (found) {
                                      router.push(`/product/${found._id}?tab=reviews#reviews`);
                                    }
                                  }}
                                  className="bg-amber-50 hover:bg-amber-500 text-amber-700 hover:text-white border border-amber-200 hover:border-amber-500 px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 shadow-2xs"
                                >
                                  <Star className="w-3.5 h-3.5 fill-current" /> Đánh giá nhận ngay 5 điểm
                                </button>
                              )}

                              <button
                                onClick={() => setShowReturnModal(true)}
                                className="bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-200 px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 shadow-2xs"
                              >
                                <RotateCcw className="w-3.5 h-3.5 text-zinc-500" /> Trả hàng
                              </button>
                            </>
                          );
                        })()}

                        {/* Button Toggle Chi tiết đơn hàng (ChevronDown / ChevronUp) */}
                        <button
                          onClick={() => toggleOrderExpand(ordKey)}
                          className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl transition-all border shadow-2xs cursor-pointer ${
                            isExpanded
                              ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border-zinc-200'
                              : 'bg-pink-50 hover:bg-pink-100 text-pink-600 border-pink-200'
                          }`}
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="w-4 h-4" />
                              <span>Thu gọn</span>
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-4 h-4" />
                              <span>Xem chi tiết</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Summary view when collapsed */}
                    {!isExpanded && (
                      <div
                        onClick={() => toggleOrderExpand(ordKey)}
                        className="bg-white rounded-2xl p-3.5 border border-zinc-200/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 cursor-pointer hover:border-pink-300 transition-colors"
                      >
                        <div className="space-y-0.5 min-w-0">
                          <p className="text-xs font-bold text-zinc-800 truncate">
                            {ord.items.map(i => i.name).join(', ')}
                          </p>
                          <p className="text-[11px] text-zinc-400 font-medium">
                            {ord.items.length} sản phẩm • Người nhận: {ord.customerName}
                          </p>
                        </div>
                        <div className="text-right shrink-0 flex items-center gap-2">
                          <div>
                            <span className="text-[10px] text-zinc-400 block uppercase">Tổng thanh toán</span>
                            <span className="text-sm font-extrabold text-pink-600">{(ord.totalAmount || 0).toLocaleString('vi-VN')}đ</span>
                          </div>
                          <ChevronDown className="w-4 h-4 text-pink-500" />
                        </div>
                      </div>
                    )}

                    {/* Full details view when expanded */}
                    {isExpanded && (
                      <div className="space-y-4 animate-in fade-in-50 duration-200">
                        {/* PHÍA TRÊN: Thông tin đơn hàng / Sản phẩm đã đặt */}
                        <div className="bg-white rounded-2xl p-4 border border-zinc-200/80 space-y-3">
                          <button
                            type="button"
                            onClick={() => toggleSection(`${ordKey}_products`)}
                            className="w-full flex items-center justify-between font-bold text-xs text-zinc-900 uppercase tracking-wider text-pink-600 cursor-pointer select-none border-b border-zinc-100 pb-2"
                          >
                            <span className="flex items-center gap-1.5">
                              <ShoppingBag className="w-3.5 h-3.5" /> Thông tin sản phẩm ({ord.items?.length || 0})
                            </span>
                            {collapsedSections[`${ordKey}_products`] ? (
                              <ChevronDown className="w-4 h-4 text-zinc-400 hover:text-pink-600 transition-colors" />
                            ) : (
                              <ChevronUp className="w-4 h-4 text-zinc-400 hover:text-pink-600 transition-colors" />
                            )}
                          </button>

                          {!collapsedSections[`${ordKey}_products`] && (
                            <div className="space-y-3 animate-in fade-in-50 duration-200">
                              <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                                {(ord.items || []).map((item, idx) => {
                                  const prodId = typeof item.product === 'string' ? item.product : (item.product?._id || (item.product as any)?.id || '');
                                  const foundProd = products.find(p => p._id === prodId || p.slug === prodId || p.name.toLowerCase() === item.name.toLowerCase());
                                  const isItemReviewed = prodId ? hasUserReviewedProduct(prodId) : false;

                                  return (
                                    <div
                                      key={idx}
                                      onClick={() => {
                                        if (foundProd) {
                                          router.push(`/product/${foundProd._id}`);
                                        } else {
                                          router.push('/products');
                                        }
                                      }}
                                      className="flex items-center justify-between gap-3 bg-zinc-50/70 hover:bg-pink-50/50 p-2.5 rounded-xl border border-zinc-100 hover:border-pink-200 transition-all cursor-pointer group"
                                      title="Bấm để xem thông tin chi tiết sản phẩm"
                                    >
                                      <div className="flex items-center gap-3 min-w-0 flex-1">
                                        {item.image ? (
                                          <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-lg shrink-0 border border-zinc-100 group-hover:scale-105 transition-transform" />
                                        ) : (
                                          <div className="w-12 h-12 bg-zinc-200/60 rounded-lg shrink-0 flex items-center justify-center text-zinc-400">
                                            <ShoppingBag className="w-5 h-5" />
                                          </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                          <p className="font-bold text-zinc-900 text-xs truncate group-hover:text-pink-600 transition-colors">{item.name}</p>
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

                                      {/* Per-product Review Button when Order is Completed */}
                                      {ord.orderStatus === 'Hoàn thành' && (
                                        <div className="shrink-0 ml-2">
                                          {isItemReviewed ? (
                                            <button
                                              type="button"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                if (foundProd) router.push(`/product/${foundProd._id}?tab=reviews#reviews`);
                                              }}
                                              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
                                            >
                                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Đã đánh giá
                                            </button>
                                          ) : (
                                            <button
                                              type="button"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                if (prodId) addPurchasedProducts([prodId]);
                                                if (foundProd) {
                                                  router.push(`/product/${foundProd._id}?tab=reviews#reviews`);
                                                } else {
                                                  router.push('/products');
                                                }
                                              }}
                                              className="bg-amber-50 hover:bg-amber-500 text-amber-700 hover:text-white border border-amber-200 hover:border-amber-500 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
                                            >
                                              <Star className="w-3 h-3 fill-current" /> Đánh giá (+5 điểm)
                                            </button>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>

                              <div className="border-t border-zinc-100 pt-2.5 space-y-1 text-xs text-zinc-600">
                                <div className="flex justify-between">
                                  <span>Tạm tính:</span>
                                  <span className="font-semibold text-zinc-800">{(ord.subtotal || 0).toLocaleString('vi-VN')}đ</span>
                                </div>
                                {(ord.discountAmount || 0) > 0 && (
                                  <div className="flex justify-between text-pink-600">
                                    <span>Giảm giá:</span>
                                    <span className="font-semibold">-{(ord.discountAmount || 0).toLocaleString('vi-VN')}đ</span>
                                  </div>
                                )}
                                <div className="flex justify-between">
                                  <span>Phí vận chuyển:</span>
                                  <span className="font-semibold text-zinc-800">
                                    {ord.shippingFee === 0 ? (
                                      <span className="text-emerald-600 font-bold">MIỄN PHÍ</span>
                                    ) : (
                                      `${(ord.shippingFee || 0).toLocaleString('vi-VN')}đ`
                                    )}
                                  </span>
                                </div>
                                <div className="flex justify-between text-xs font-bold text-zinc-900 pt-1.5 border-t border-dashed border-zinc-200">
                                  <span>Thành tiền:</span>
                                  <span className="text-pink-600 text-sm font-extrabold">{(ord.totalAmount || 0).toLocaleString('vi-VN')}đ</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* PHÍA DƯỚI: Thông tin & Địa chỉ nhận hàng cho người mua */}
                        <div className="bg-white rounded-2xl p-4 border border-zinc-200/80 space-y-2 text-xs text-zinc-600">
                          <button
                            type="button"
                            onClick={() => toggleSection(`${ordKey}_shipping`)}
                            className="w-full flex items-center justify-between font-bold text-xs text-zinc-900 uppercase tracking-wider text-indigo-600 cursor-pointer select-none border-b border-zinc-100 pb-2"
                          >
                            <span className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5" /> Thông tin & Địa chỉ nhận hàng
                            </span>
                            {collapsedSections[`${ordKey}_shipping`] ? (
                              <ChevronDown className="w-4 h-4 text-zinc-400 hover:text-indigo-600 transition-colors" />
                            ) : (
                              <ChevronUp className="w-4 h-4 text-zinc-400 hover:text-indigo-600 transition-colors" />
                            )}
                          </button>

                          {!collapsedSections[`${ordKey}_shipping`] && (
                            <div className="space-y-2 animate-in fade-in-50 duration-200">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                                <div>
                                  <span className="text-zinc-400 block text-[10px] uppercase tracking-wider">Người nhận</span>
                                  <span className="font-bold text-zinc-900">{ord.customerName || 'N/A'}</span>
                                </div>
                                <div>
                                  <span className="text-zinc-400 block text-[10px] uppercase tracking-wider">Số điện thoại</span>
                                  <span className="font-bold text-zinc-900">{ord.customerPhone || 'N/A'}</span>
                                </div>
                                <div className="sm:col-span-2">
                                  <span className="text-zinc-400 block text-[10px] uppercase tracking-wider">Địa chỉ giao hàng</span>
                                  <span className="font-bold text-zinc-900">{ord.shippingAddress || 'N/A'}</span>
                                </div>
                                {ord.notes && (
                                  <div className="sm:col-span-2 bg-amber-50/60 border border-amber-100 rounded-xl p-2 mt-1">
                                    <span className="text-amber-700 font-medium text-[11px]">Ghi chú: {ord.notes}</span>
                                  </div>
                                )}
                              </div>

                              <div className="mt-2 pt-2 border-t border-zinc-100 flex items-center gap-1.5 text-xs text-zinc-700">
                                <Calendar className="w-3.5 h-3.5 text-pink-600 shrink-0" />
                                <span>
                                  Thời gian dự kiến nhận hàng:{' '}
                                  {ord.estimatedDeliveryDate ? (
                                    <strong className="text-pink-600 font-bold">{ord.estimatedDeliveryDate}</strong>
                                  ) : (
                                    <span className="text-zinc-400 italic">Đang cập nhật (Admin chưa xếp lịch)</span>
                                  )}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeSubTab === 'profile' && user && (
        <form onSubmit={handleSaveProfile} className="bg-white rounded-3xl border border-zinc-100 p-6 md:p-8 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
            <h2 className="text-base font-bold text-zinc-900 font-serif-luxury flex items-center gap-2">
              <User className="w-5 h-5 text-pink-600" />
              Cập nhật thông tin cá nhân & Địa chỉ nhận hàng
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
            {/* CỘT BÊN TRÁI: Thông tin cá nhân & Chọn Avatar */}
            <div className="space-y-4">
              <h3 className="font-bold text-zinc-900 text-xs uppercase tracking-wider text-pink-600 flex items-center gap-1.5">
                <User className="w-4 h-4" /> 1. Thông tin cá nhân & Ảnh đại diện
              </h3>

              {/* Chọn Avatar */}
              <div>
                <label className="font-semibold text-zinc-700 block mb-2">Ảnh đại diện (Avatar)</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <div className="flex items-center gap-4 mb-3">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="relative group cursor-pointer"
                    title="Bấm để tải ảnh từ máy tính"
                  >
                    <img
                      src={selectedAvatar || PRESET_AVATARS[0]}
                      alt="Avatar"
                      className="w-16 h-16 rounded-full object-cover ring-4 ring-pink-500/20 shadow-md group-hover:opacity-90 transition-opacity"
                    />
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white">
                      <Camera className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-pink-50 hover:bg-pink-100 text-pink-600 border border-pink-200 text-xs font-bold px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Tải ảnh từ máy tính</span>
                    </button>
                    <p className="text-[10px] text-zinc-400">Định dạng JPG, PNG, WEBP (tối đa 5MB)</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-zinc-500 block">Hoặc chọn ảnh mẫu nhanh:</span>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_AVATARS.map((ava, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => setSelectedAvatar(ava)}
                        className={`relative w-9 h-9 rounded-full overflow-hidden border-2 transition-all ${
                          selectedAvatar === ava ? 'border-pink-600 ring-2 ring-pink-300 scale-110 shadow-sm' : 'border-zinc-200 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={ava} alt={`Avatar ${idx + 1}`} className="w-full h-full object-cover" />
                        {selectedAvatar === ava && (
                          <div className="absolute inset-0 bg-pink-600/30 flex items-center justify-center text-white">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Họ và tên */}
              <div>
                <label className="font-semibold text-zinc-700 block mb-1">Họ và tên *</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={profileForm.name}
                    onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-3.5 py-2.5 focus:outline-none focus:border-pink-500 text-xs font-medium"
                  />
                  <User className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                </div>
              </div>

              {/* Email (Readonly) */}
              <div>
                <label className="font-semibold text-zinc-700 block mb-1">Email (Tài khoản)</label>
                <div className="relative">
                  <input
                    type="email"
                    readOnly
                    value={user?.email || customerDetail?.email || ''}
                    className="w-full bg-zinc-100 border border-zinc-200 rounded-xl pl-9 pr-3.5 py-2.5 text-zinc-500 text-xs font-medium cursor-not-allowed"
                  />
                  <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                </div>
              </div>

              {/* Số điện thoại */}
              <div>
                <label className="font-semibold text-zinc-700 block mb-1">Số điện thoại *</label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    pattern="[0-9]{10}"
                    title="Vui lòng nhập số điện thoại Việt Nam hợp lệ 10 chữ số"
                    value={profileForm.phone}
                    onChange={e => {
                      const onlyNumbers = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setProfileForm({ ...profileForm, phone: onlyNumbers });
                    }}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-3.5 py-2.5 focus:outline-none focus:border-pink-500 text-xs font-mono"
                  />
                  <Phone className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                </div>
              </div>
            </div>

            {/* CỘT BÊN PHẢI: Địa chỉ nhận hàng (Tỉnh/Thành, Quận/Huyện, Địa chỉ chi tiết) */}
            <div className="space-y-4">
              <h3 className="font-bold text-zinc-900 text-xs uppercase tracking-wider text-pink-600 flex items-center gap-1.5">
                <MapPin className="w-4 h-4" /> 2. Cài đặt Địa chỉ nhận hàng
              </h3>

              {/* Tỉnh / Thành phố */}
              <div>
                <label className="font-semibold text-zinc-700 block mb-1">Tỉnh / Thành phố</label>
                <div className="relative">
                  <select
                    value={selectedProvinceCode}
                    onChange={handleProvinceChange}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-3.5 py-2.5 focus:outline-none focus:border-pink-500 text-xs appearance-none cursor-pointer"
                  >
                    <option value="">
                      {profileForm.province ? `Hiển thị hiện tại: ${profileForm.province}` : '-- Chọn Tỉnh / Thành phố --'}
                    </option>
                    {provinces.map(p => (
                      <option key={p.code} value={p.code}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <MapPin className="w-4 h-4 text-zinc-400 absolute left-3 top-3 pointer-events-none" />
                </div>
                {profileForm.province && (
                  <p className="text-[10px] text-pink-600 font-semibold mt-1">
                    Đã chọn: {profileForm.province}
                  </p>
                )}
              </div>

              {/* Quận / Huyện */}
              <div>
                <label className="font-semibold text-zinc-700 block mb-1">Quận / Huyện</label>
                <div className="relative">
                  {districts.length > 0 ? (
                    <select
                      value={profileForm.district}
                      onChange={e => setProfileForm({ ...profileForm, district: e.target.value })}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-3.5 py-2.5 focus:outline-none focus:border-pink-500 text-xs appearance-none cursor-pointer"
                    >
                      <option value="">-- Chọn Quận / Huyện --</option>
                      {profileForm.district && !districts.some(d => d.name === profileForm.district) && (
                        <option value={profileForm.district}>{profileForm.district}</option>
                      )}
                      {districts.map(d => (
                        <option key={d.code} value={d.name}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      placeholder="Nhập Quận / Huyện của bạn (Ví dụ: Quận 1, Huyện Kim Bôi...)"
                      value={profileForm.district}
                      onChange={e => setProfileForm({ ...profileForm, district: e.target.value })}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-3.5 py-2.5 focus:outline-none focus:border-pink-500 text-xs"
                    />
                  )}
                  <Building className="w-4 h-4 text-zinc-400 absolute left-3 top-3 pointer-events-none" />
                </div>
                {profileForm.district && (
                  <p className="text-[10px] text-pink-600 font-semibold mt-1">
                    Đã chọn: {profileForm.district}
                  </p>
                )}
              </div>

              {/* Địa chỉ chi tiết */}
              <div>
                <label className="font-semibold text-zinc-700 block mb-1">Địa chỉ chi tiết (Số nhà, Tên đường...)</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Vd: 123 Đường Nguyễn Huệ, Phường Bến Nghé"
                    value={profileForm.detailAddress}
                    onChange={e => setProfileForm({ ...profileForm, detailAddress: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-3.5 py-2.5 focus:outline-none focus:border-pink-500 text-xs"
                  />
                  <Home className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-zinc-100 pt-4 flex justify-end">
            <button
              type="submit"
              className="bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold px-8 py-3 rounded-full transition-all shadow-md shadow-pink-500/20 uppercase tracking-wider flex items-center gap-2"
            >
              <span>Lưu thay đổi thông tin</span>
            </button>
          </div>
        </form>
      )}

      {/* Modal Trả hàng & Hỗ trợ khách hàng */}
      {showReturnModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div className="relative bg-white rounded-3xl max-w-md w-full p-6 text-center shadow-2xl animate-in zoom-in-95 duration-200 border-2 border-pink-100 space-y-5">
            <button
              onClick={() => setShowReturnModal(false)}
              className="absolute top-4 right-4 p-2 bg-zinc-100 text-zinc-500 hover:text-zinc-900 rounded-full hover:bg-zinc-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 bg-pink-50 text-pink-600 rounded-full flex items-center justify-center mx-auto shadow-inner border border-pink-100">
              <RotateCcw className="w-6 h-6" />
            </div>

            <div className="space-y-2 text-center">
              <h3 className="text-base font-extrabold text-zinc-900">Yêu cầu Trả hàng & Hoàn tiền</h3>
              <p className="text-xs text-zinc-600 leading-relaxed max-w-xs mx-auto">
                Bạn vui lòng liên hệ trực tiếp với chúng tôi qua <strong className="text-zinc-900">Facebook</strong>, <strong className="text-zinc-900">Zalo</strong>, <strong className="text-zinc-900">Telegram</strong> hoặc <strong className="text-zinc-900">Email</strong> để được hỗ trợ nhanh nhất:
              </p>
            </div>

            {/* Các icon nhỏ căn giữa */}
            <div className="flex items-center justify-center gap-2.5 pt-1 flex-wrap">
              {/* Facebook */}
              <a
                href="https://www.facebook.com/profile.php?id=61593067588915&mibextid=ZbWKwL"
                target="_blank"
                rel="noopener noreferrer"
                title="Facebook Luxora"
                className="flex items-center gap-1.5 bg-[#1877F2] hover:bg-[#166fe5] text-white text-xs font-bold py-2 px-3.5 rounded-full transition-all shadow-xs hover:scale-105"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span>Facebook</span>
              </a>

              {/* Zalo */}
              <a
                href="https://zalo.me/0932525650"
                target="_blank"
                rel="noopener noreferrer"
                title="Zalo: 0932525650"
                className="flex items-center gap-1.5 bg-[#0068FF] hover:bg-[#005cdb] text-white text-xs font-bold py-2 px-3.5 rounded-full transition-all shadow-xs hover:scale-105"
              >
                <span className="font-extrabold text-[9px] tracking-tighter bg-white text-[#0068FF] px-1 rounded-xs leading-none py-0.5">ZALO</span>
                <span>Zalo (0932.525.650)</span>
              </a>

              {/* Telegram */}
              <a
                href="https://t.me/+84932525650"
                target="_blank"
                rel="noopener noreferrer"
                title="Telegram: 0932525650"
                className="flex items-center gap-1.5 bg-[#229ED9] hover:bg-[#1d8ec4] text-white text-xs font-bold py-2 px-3.5 rounded-full transition-all shadow-xs hover:scale-105"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.56 8.16l-2.02 9.53c-.15.68-.55.84-1.12.52l-3.1-2.29-1.5 1.44c-.16.16-.3.3-.61.3l.22-3.17 5.77-5.21c.25-.22-.05-.34-.39-.12l-7.13 4.49-3.08-.96c-.67-.21-.68-.67.14-.99l12.04-4.64c.56-.2 1.05.14.88.89z"/>
                </svg>
                <span>Telegram</span>
              </a>

              {/* Email */}
              <a
                href="mailto:luxorashop.www@gmail.com"
                title="Email: luxorashop.www@gmail.com"
                className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold py-2 px-3.5 rounded-full transition-all shadow-xs hover:scale-105"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>luxorashop.www@gmail.com</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
