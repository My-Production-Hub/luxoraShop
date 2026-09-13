'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { LuxoraLogo } from './LuxoraLogo';
import { useStore } from '@/context/StoreContext';
import {
  Search,
  Heart,
  ShoppingBag,
  User,
  Sparkles,
  ChevronDown,
  LogOut,
  LayoutDashboard,
  Gift,
  ShieldCheck,
  TrendingUp,
  Menu,
  X,
  Package,
  CheckCircle2,
  Clock
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const {
    products,
    cart,
    wishlist,
    setIsCartOpen,
    setIsWishlistOpen,
    user,
    logout,
    cartSubtotal,
    orders,
    showToast
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Order Lookup State & Handler
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [matchedOrders, setMatchedOrders] = useState<any[]>([]);

  const handleOrderSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = orderSearchQuery.trim();
    if (!query) {
      showToast('Vui lòng nhập số điện thoại, tên sản phẩm hoặc mã đơn để tra cứu!', 'error');
      return;
    }

    const cleanQuery = query.toLowerCase().replace(/^#/, '');
    const cleanDigits = query.replace(/\D/g, '');

    const results = orders.filter(o => {
      if (!o) return false;
      const cleanCode = (o.orderCode || '').toLowerCase().replace(/^#/, '');
      const cleanId = (o._id || '').toLowerCase().replace(/^#/, '');
      const cleanPhone = (o.customerPhone || '').replace(/\D/g, '');
      const cleanName = (o.customerName || '').toLowerCase();
      const cleanEmail = (o.customerEmail || '').toLowerCase();

      if (cleanCode && cleanCode.includes(cleanQuery)) return true;
      if (cleanId && cleanId.includes(cleanQuery)) return true;
      if (cleanDigits && cleanDigits.length >= 3 && cleanPhone.includes(cleanDigits)) return true;
      if (cleanName.includes(cleanQuery) || cleanEmail.includes(cleanQuery)) return true;

      const hasMatchingItem = o.items.some(item => {
        const itemName = (item.name || '').toLowerCase();
        const itemScent = (item.scent || '').toLowerCase();
        return itemName.includes(cleanQuery) || itemScent.includes(cleanQuery);
      });

      return hasMatchingItem;
    });

    setMatchedOrders(results);
    setShowOrderModal(true);

    if (results.length === 0) {
      showToast(`Không tìm thấy đơn hàng nào phù hợp với "${query}"`, 'error');
    } else {
      showToast(`Tìm thấy ${results.length} đơn hàng phù hợp!`, 'success');
    }
  };

  if (pathname?.startsWith('/admin')) return null;

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const searchResults = searchQuery.trim()
    ? products.filter(
        p =>
          (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.brand || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.category || '').toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearchDropdown(false);
    }
  };

  const navLinks = [
    { label: 'Trang chủ', href: '/' },
    { label: 'Nước hoa Nam', href: '/products?category=Nước hoa nam&gender=Nam' },
    { label: 'Nước hoa Nữ', href: '/products?category=Nước hoa nữ&gender=Nữ' },
    { label: 'Body Mist', href: '/products?category=Body Mist' },
    { label: 'Lăn khử mùi', href: '/products?category=L%C4%83n+kh%E1%BB%AD+m%C3%B9i' },
    { label: 'Sáp thơm', href: '/products?category=S%C3%A1p+th%C6%A1m' },
    { label: 'Gift Set', href: '/products?category=Gift+Set' },
    { label: 'Thương hiệu', href: '/#brands' },
    { label: 'Khuyến mãi', href: '/promotions' },
    { label: 'Affiliate', href: '/affiliate', badge: 'Mới' },
    { label: 'Blog', href: '/blog' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-pink-100 shadow-sm">
      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 py-3.5 flex items-center justify-between gap-4">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden p-2 text-zinc-700 hover:text-pink-600 focus:outline-none"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Logo */}
        <LuxoraLogo size="md" />

        {/* Search Bar matching Image 2 */}
        <div className="relative flex-1 max-w-xl hidden md:block">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm, thương hiệu..."
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setShowSearchDropdown(true);
              }}
              onFocus={() => setShowSearchDropdown(true)}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-full pl-5 pr-12 py-2.5 text-sm focus:outline-none focus:border-pink-500 focus:bg-white focus:ring-2 focus:ring-pink-100 transition-all"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-zinc-400 hover:text-pink-600 transition-colors"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* Search Dropdown */}
          {showSearchDropdown && searchQuery.trim() && (
            <div
              className="absolute top-full mt-2 left-0 right-0 bg-white border border-zinc-100 rounded-2xl shadow-2xl overflow-hidden z-50 p-2"
              onMouseLeave={() => setShowSearchDropdown(false)}
            >
              {searchResults.length > 0 ? (
                <div>
                  <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider px-3 py-1.5">
                    Gợi ý sản phẩm ({searchResults.length})
                  </div>
                  {searchResults.map(prod => (
                    <div
                      key={prod._id}
                      onClick={() => {
                        router.push(`/product/${prod._id}`);
                        setShowSearchDropdown(false);
                      }}
                      className="flex items-center gap-3 p-2 hover:bg-pink-50/60 rounded-xl cursor-pointer transition-colors"
                    >
                      <img src={prod.image} alt={prod.name} className="w-10 h-10 object-cover rounded-lg" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-zinc-800 truncate">{prod.name}</div>
                        <div className="text-[11px] text-pink-600 font-bold">
                          {prod.price.toLocaleString('vi-VN')}đ
                          {prod.originalPrice && (
                            <span className="text-zinc-400 line-through text-[10px] ml-2">
                              {prod.originalPrice.toLocaleString('vi-VN')}đ
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-xs font-semibold text-rose-600 bg-rose-50/60 rounded-xl">
                  Không tìm thấy sản phẩm phù hợp
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Wishlist Icon */}
          <button
            onClick={() => setIsWishlistOpen(true)}
            className="relative p-2 text-zinc-700 hover:text-pink-600 rounded-full hover:bg-pink-50 transition-colors focus:outline-none"
            title="Sản phẩm yêu thích"
          >
            <Heart className="w-5 h-5" />
            {wishlist.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-pink-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                {wishlist.length}
              </span>
            )}
          </button>

          {/* Cart Icon & Side Drawer Trigger */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center gap-2 p-2 text-zinc-700 hover:text-pink-600 rounded-full hover:bg-pink-50 transition-colors group"
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-pink-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                  {cartCount}
                </span>
              )}
            </div>
            <div className="hidden xl:flex flex-col text-left text-xs leading-tight">
              <span className="text-[10px] text-zinc-400 font-medium">Giỏ hàng</span>
              <span className="font-bold text-pink-600">{cartSubtotal.toLocaleString('vi-VN')}đ</span>
            </div>
          </button>

          {/* User Profile / Login Dropdown */}
          <div className="relative">
            {user ? (
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-pink-50 transition-colors border border-pink-100 hover:border-pink-200 bg-zinc-50/50"
              >
                <img
                  src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt={user.name}
                  className="w-7 h-7 rounded-full object-cover ring-2 ring-pink-500"
                />
                <span className="text-xs font-semibold text-zinc-800 hidden sm:inline max-w-[140px] truncate">
                  Xin chào, <span className="text-pink-600 font-bold">{user.name}</span>
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400 hidden sm:inline" />
              </button>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 bg-pink-600 hover:bg-pink-700 text-white text-xs font-medium px-3.5 py-2 rounded-full transition-all shadow-sm shadow-pink-500/20"
              >
                <User className="w-4 h-4" />
                <span>Đăng nhập</span>
              </Link>
            )}

            {/* Dropdown Menu */}
            {showUserDropdown && user && (
              <div
                className="absolute right-0 top-full mt-2 w-56 bg-white border border-zinc-100 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2"
                onMouseLeave={() => setShowUserDropdown(false)}
              >
                <div className="px-4 py-2 border-b border-zinc-100">
                  <p className="text-xs font-bold text-zinc-800 truncate">{user.name}</p>
                  <p className="text-[11px] text-zinc-400 truncate">{user.email}</p>
                  <span className="inline-block mt-1 bg-pink-100 text-pink-700 text-[10px] px-2 py-0.5 rounded font-bold uppercase">
                    {user.role}
                  </span>
                </div>

                <Link
                  href="/account"
                  onClick={() => setShowUserDropdown(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-zinc-700 hover:bg-pink-50 hover:text-pink-600 transition-colors"
                >
                  <User className="w-4 h-4 text-zinc-400" />
                  <span>Hồ sơ cá nhân & Đơn hàng</span>
                </Link>

                <Link
                  href="/affiliate/dashboard"
                  onClick={() => setShowUserDropdown(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-zinc-700 hover:bg-pink-50 hover:text-pink-600 transition-colors"
                >
                  <TrendingUp className="w-4 h-4 text-pink-500" />
                  <span>Trang Affiliate của tôi</span>
                </Link>

                {user.role === 'admin' && (
                  <Link
                    href="/admin"
                    onClick={() => setShowUserDropdown(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-amber-600 bg-amber-50 hover:bg-amber-100 transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4 text-amber-600" />
                    <span>Trang Quản trị (Admin)</span>
                  </Link>
                )}

                <div className="border-t border-zinc-100 mt-1 pt-1">
                  <button
                    onClick={() => {
                      logout();
                      setShowUserDropdown(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Links Row matching Image 2 */}
      <nav className="bg-white border-t border-zinc-100 hidden lg:block">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between text-xs font-medium">
          <div className="flex items-center gap-6 overflow-x-auto py-2.5 scrollbar-none">
            {navLinks.map((link, idx) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={idx}
                  href={link.href}
                  className={`relative flex items-center gap-1 py-1 transition-all whitespace-nowrap ${
                    isActive
                      ? 'text-pink-600 font-bold border-b-2 border-pink-600'
                      : 'text-zinc-700 hover:text-pink-600'
                  }`}
                >
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="bg-gradient-to-r from-pink-500 to-rose-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full animate-bounce">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Order Search Input next to Blog link */}
          <div className="py-1.5 shrink-0 pl-4 border-l border-zinc-100">
            <form onSubmit={handleOrderSearchSubmit} className="flex items-center gap-1.5 bg-zinc-50 border border-zinc-200 hover:border-pink-300 rounded-full pl-3.5 pr-1.5 py-1 focus-within:border-pink-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-pink-100 transition-all shadow-2xs">
              <Package className="w-3.5 h-3.5 text-pink-600 shrink-0" />
              <input
                type="text"
                placeholder="Tra cứu đơn (SĐT/Tên SP)..."
                value={orderSearchQuery}
                onChange={e => setOrderSearchQuery(e.target.value)}
                className="w-44 xl:w-52 bg-transparent text-xs text-zinc-800 placeholder:text-zinc-400 focus:outline-none"
              />
              <button
                type="submit"
                className="bg-pink-600 hover:bg-pink-700 text-white text-[11px] font-bold px-3 py-1 rounded-full transition-colors flex items-center gap-1 shadow-2xs whitespace-nowrap"
              >
                <Search className="w-3 h-3" />
                <span>Tra cứu</span>
              </button>
            </form>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-zinc-200 bg-white p-4 space-y-3">
          <form onSubmit={handleSearchSubmit} className="relative mb-3">
            <input
              type="text"
              placeholder="Tìm sản phẩm..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-100 rounded-full px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
            <Search className="w-4 h-4 text-zinc-400 absolute right-3 top-2.5" />
          </form>

          {/* Mobile Order Search Form */}
          <form onSubmit={handleOrderSearchSubmit} className="flex items-center gap-1.5 bg-pink-50/60 border border-pink-200 rounded-xl p-2 mb-3">
            <Package className="w-4 h-4 text-pink-600 shrink-0" />
            <input
              type="text"
              placeholder="Tra cứu đơn hàng (SĐT/Tên SP)..."
              value={orderSearchQuery}
              onChange={e => setOrderSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs text-zinc-800 placeholder:text-zinc-400 focus:outline-none"
            />
            <button
              type="submit"
              className="bg-pink-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg shrink-0"
            >
              Tìm
            </button>
          </form>

          <div className="flex flex-col gap-2 text-xs font-medium text-zinc-700">
            {navLinks.map((link, idx) => (
              <Link
                key={idx}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-2 border-b border-zinc-100 flex items-center justify-between hover:text-pink-600"
              >
                <span>{link.label}</span>
                {link.badge && (
                  <span className="bg-pink-600 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Order Search Result Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-zinc-100 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/80">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center font-bold">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-zinc-900 font-serif-luxury">
                    Kết quả tra cứu đơn hàng
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Từ khóa: <span className="font-bold text-pink-600">"{orderSearchQuery}"</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowOrderModal(false)}
                className="w-8 h-8 rounded-full bg-zinc-200/60 hover:bg-zinc-200 text-zinc-600 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              {matchedOrders.length === 0 ? (
                <div className="py-10 text-center space-y-3">
                  <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <Package className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-base text-zinc-900 font-serif-luxury">
                      Không tìm thấy đơn hàng nào
                    </h4>
                    <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                      Không có đơn hàng nào khớp với số điện thoại hoặc tên sản phẩm <span className="font-bold text-zinc-700">"{orderSearchQuery}"</span>. Vui lòng kiểm tra lại thông tin đã nhập!
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-xs text-zinc-500 font-medium">
                    Tìm thấy <span className="font-bold text-pink-600">{matchedOrders.length}</span> đơn hàng trùng khớp:
                  </p>
                  {matchedOrders.map(ord => (
                    <div key={ord._id || ord.orderCode} className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3">
                      <div className="flex flex-wrap justify-between items-center gap-2 border-b border-zinc-200 pb-2.5">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-sm text-zinc-900">#{ord.orderCode}</span>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-pink-100 text-pink-700 border border-pink-200">
                              {ord.orderStatus}
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-400">{ord.createdAt}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-zinc-500 block">Tổng tiền</span>
                          <span className="font-bold text-sm text-pink-600">{ord.totalAmount?.toLocaleString('vi-VN')}đ</span>
                        </div>
                      </div>

                      {/* Customer Details */}
                      <div className="text-xs space-y-1 text-zinc-600 bg-white p-3 rounded-xl border border-zinc-100">
                        <p>👤 <span className="font-bold text-zinc-900">{ord.customerName}</span> ({ord.customerPhone})</p>
                        <p>📍 {ord.shippingAddress}</p>
                      </div>

                      {/* Items */}
                      <div className="space-y-2">
                        {ord.items?.map((item: any, i: number) => (
                          <div key={i} className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-zinc-100">
                            <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded-lg shrink-0" />
                            <div className="flex-1 min-w-0 text-xs">
                              <p className="font-bold text-zinc-800 truncate">{item.name}</p>
                              <p className="text-[11px] text-zinc-500">
                                {item.volume} {item.scent ? `• ${item.scent}` : ''} × {item.quantity}
                              </p>
                            </div>
                            <span className="font-bold text-xs text-pink-600">{(item.price * item.quantity).toLocaleString('vi-VN')}đ</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-zinc-100 bg-zinc-50/80 flex justify-end">
              <button
                onClick={() => setShowOrderModal(false)}
                className="bg-zinc-200 hover:bg-zinc-300 text-zinc-800 text-xs font-bold px-5 py-2 rounded-xl transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
