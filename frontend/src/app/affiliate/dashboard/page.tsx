'use client';

import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import {
  LayoutDashboard,
  Link as LinkIcon,
  ShoppingBag,
  DollarSign,
  CreditCard,
  BarChart3,
  Image as ImageIcon,
  Share2,
  Copy,
  QrCode,
  Download,
  CheckCircle2,
  Clock,
  XCircle,
  HelpCircle,
  Settings,
  ArrowUpRight,
  LogOut,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export default function AffiliateDashboardPage() {
  const { user, affiliateData, products, showToast } = useStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'links' | 'orders' | 'commission' | 'withdraw' | 'banners'>('overview');

  // Generator State
  const [selectedProduct, setSelectedProduct] = useState<string>(products[0]?._id || '');
  const [generatedLink, setGeneratedLink] = useState<string>(
    `https://luxora.vn/product/${products[0]?._id || 'prod1'}?ref=${affiliateData?.referralCode || 'AFF12345'}`
  );
  const [showQR, setShowQR] = useState(false);

  // Withdraw Modal State
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('2000000');

  const aff = affiliateData || {
    referralCode: 'AFF12345',
    referralLink: 'https://luxora.vn/?ref=AFF12345',
    status: 'Approved',
    totalClick: 1248,
    totalOrder: 136,
    totalCommission: 8230000,
    availableBalance: 2450000,
    pendingBalance: 3210000,
    paidBalance: 5780000,
    bankInfo: { bankName: 'MBBank', bankNumber: '999988887777', accountName: 'NGUYEN VAN AN' }
  };

  const recentOrders = [
    { code: '#DH10086', date: '08/05/2026', customer: 'Trần Thị Mai', amount: 2450000, comm: 367500, status: 'Chờ duyệt' },
    { code: '#DH10085', date: '08/05/2026', customer: 'Lê Hoàng Nam', amount: 1850000, comm: 277500, status: 'Chờ duyệt' },
    { code: '#DH10084', date: '07/05/2026', customer: 'Phạm Thu Hương', amount: 3290000, comm: 493500, status: 'Đã duyệt' },
    { code: '#DH10083', date: '07/05/2026', customer: 'Nguyễn Minh Anh', amount: 1650000, comm: 247500, status: 'Đã duyệt' },
    { code: '#DH10082', date: '06/05/2026', customer: 'Đỗ Quang Huy', amount: 2250000, comm: 337500, status: 'Đã thanh toán' }
  ];

  const marketingBanners = [
    { id: 'b1', name: 'Banner Hương thơm nâng tầm phong cách 1920x1080', img: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600' },
    { id: 'b2', name: 'Poster Flash Sale Giảm 50% Luxora 1080x1350', img: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600' },
    { id: 'b3', name: 'Hình sản phẩm Miss Dior Blooming Bouquet HD', img: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=600' }
  ];

  const handleCopyLink = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('Đã sao chép đường dẫn giới thiệu!', 'success');
  };

  const handleGenerateLink = (prodId: string) => {
    setSelectedProduct(prodId);
    setGeneratedLink(`https://luxora.vn/product/${prodId}?ref=${aff.referralCode}`);
  };

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(withdrawAmount);
    if (val < 500000) {
      showToast('Số tiền rút tối thiểu là 500.000đ', 'error');
      return;
    }
    if (val > aff.availableBalance) {
      showToast('Số dư khả dụng không đủ', 'error');
      return;
    }
    aff.availableBalance -= val;
    setShowWithdrawModal(false);
    showToast(`Đã gửi yêu cầu rút ${val.toLocaleString('vi-VN')}đ thành công!`, 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Sidebar Navigation matching Image 3 bottom left */}
        <aside className="bg-white rounded-3xl border border-zinc-100 p-5 space-y-6 shadow-sm h-fit">
          {/* User Brief */}
          <div className="flex items-center gap-3 pb-4 border-b border-zinc-100">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
              alt="Avatar"
              className="w-10 h-10 rounded-full object-cover ring-2 ring-pink-500"
            />
            <div className="min-w-0">
              <h3 className="text-xs font-bold text-zinc-900 truncate">{user?.name || 'Thành viên Affiliate'}</h3>
              <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                Thành viên Affiliate
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-1 text-xs">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors ${
                activeTab === 'overview' ? 'bg-pink-50 text-pink-600 font-bold' : 'text-zinc-700 hover:bg-zinc-50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Tổng quan</span>
            </button>

            <button
              onClick={() => setActiveTab('links')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors ${
                activeTab === 'links' ? 'bg-pink-50 text-pink-600 font-bold' : 'text-zinc-700 hover:bg-zinc-50'
              }`}
            >
              <LinkIcon className="w-4 h-4" />
              <span>Link Affiliate & QR</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors ${
                activeTab === 'orders' ? 'bg-pink-50 text-pink-600 font-bold' : 'text-zinc-700 hover:bg-zinc-50'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Đơn hàng</span>
            </button>

            <button
              onClick={() => setActiveTab('commission')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors ${
                activeTab === 'commission' ? 'bg-pink-50 text-pink-600 font-bold' : 'text-zinc-700 hover:bg-zinc-50'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              <span>Lịch sử hoa hồng</span>
            </button>

            <button
              onClick={() => setActiveTab('banners')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors ${
                activeTab === 'banners' ? 'bg-pink-50 text-pink-600 font-bold' : 'text-zinc-700 hover:bg-zinc-50'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>Công cụ quảng bá</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="lg:col-span-4 space-y-6">
          {/* TAB 1: OVERVIEW matching Image 3 bottom left */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Header greeting */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-xl font-bold font-serif-luxury text-zinc-900">
                    Chào mừng trở lại, {user?.name || 'Thành viên Affiliate'}!
                  </h1>
                  <p className="text-xs text-zinc-500">Thống kê hiệu suất giới thiệu 7 ngày qua</p>
                </div>
                <button
                  onClick={() => setShowWithdrawModal(true)}
                  className="bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold px-5 py-2.5 rounded-full transition-all shadow-md shadow-pink-500/20"
                >
                  Yêu cầu rút tiền
                </button>
              </div>

              {/* 4 Metrics Cards matching Image 3 bottom left */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-b from-blue-50 to-white rounded-3xl border border-blue-100 p-4 space-y-2">
                  <span className="text-[11px] font-semibold text-blue-700">Nhấp chuột</span>
                  <div className="text-2xl font-bold text-zinc-900">{aff.totalClick.toLocaleString('vi-VN')}</div>
                  <span className="text-[10px] font-bold text-emerald-600">↑ 18.5% so với tuần trước</span>
                </div>

                <div className="bg-gradient-to-b from-amber-50 to-white rounded-3xl border border-amber-100 p-4 space-y-2">
                  <span className="text-[11px] font-semibold text-amber-700">Đơn hàng</span>
                  <div className="text-2xl font-bold text-zinc-900">{aff.totalOrder}</div>
                  <span className="text-[10px] font-bold text-emerald-600">↑ 12.3% so với tuần trước</span>
                </div>

                <div className="bg-gradient-to-b from-pink-50 to-white rounded-3xl border border-pink-100 p-4 space-y-2">
                  <span className="text-[11px] font-semibold text-pink-700">Hoa hồng (chờ duyệt)</span>
                  <div className="text-xl font-bold text-pink-600">{aff.pendingBalance.toLocaleString('vi-VN')}đ</div>
                  <span className="text-[10px] font-bold text-emerald-600">↑ 15.7%</span>
                </div>

                <div className="bg-gradient-to-b from-emerald-50 to-white rounded-3xl border border-emerald-100 p-4 space-y-2">
                  <span className="text-[11px] font-semibold text-emerald-700">Hoa hồng đã thanh toán</span>
                  <div className="text-xl font-bold text-emerald-600">{aff.paidBalance.toLocaleString('vi-VN')}đ</div>
                  <span className="text-[10px] font-bold text-emerald-600">↑ 20.2%</span>
                </div>
              </div>

              {/* Performance Graph Placeholder & Recent Orders matching Image 3 bottom left */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 bg-white rounded-3xl border border-zinc-100 p-5 space-y-4 shadow-sm">
                  <h3 className="text-sm font-bold text-zinc-900">Biểu đồ hiệu quả giới thiệu</h3>
                  <div className="h-48 bg-zinc-50 rounded-2xl border border-dashed border-zinc-200 flex items-center justify-center text-xs text-zinc-400">
                    [ Line Chart Visualization: Clicks & Orders ]
                  </div>
                </div>

                <div className="bg-white rounded-3xl border border-zinc-100 p-5 space-y-4 shadow-sm">
                  <h3 className="text-sm font-bold text-zinc-900">Tỷ lệ đơn hàng</h3>
                  <div className="h-48 bg-pink-50/40 rounded-2xl border border-pink-100 flex flex-col items-center justify-center text-center p-4">
                    <div className="text-2xl font-bold text-pink-600">60%</div>
                    <span className="text-xs text-zinc-600 font-semibold mt-1">Đã giao thành công</span>
                    <span className="text-[10px] text-zinc-400 mt-2">20% Hoàn tiền | 10% Đang xử lý</span>
                  </div>
                </div>
              </div>

              {/* Recent Orders Table matching Image 3 bottom left */}
              <div className="bg-white rounded-3xl border border-zinc-100 p-5 space-y-4 shadow-sm">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-zinc-900">Đơn hàng gần đây</h3>
                  <button onClick={() => setActiveTab('orders')} className="text-xs text-pink-600 font-semibold">
                    Xem tất cả đơn hàng →
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-zinc-100 text-zinc-400 font-medium">
                        <th className="py-2.5">Mã đơn</th>
                        <th className="py-2.5">Ngày</th>
                        <th className="py-2.5">Khách hàng</th>
                        <th className="py-2.5">Giá trị đơn</th>
                        <th className="py-2.5">Hoa hồng</th>
                        <th className="py-2.5">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {recentOrders.map(ord => (
                        <tr key={ord.code} className="hover:bg-pink-50/30">
                          <td className="py-3 font-bold text-zinc-900">{ord.code}</td>
                          <td className="py-3 text-zinc-500">{ord.date}</td>
                          <td className="py-3 text-zinc-800 font-medium">{ord.customer}</td>
                          <td className="py-3 text-zinc-900">{ord.amount.toLocaleString('vi-VN')}đ</td>
                          <td className="py-3 font-bold text-pink-600">{ord.comm.toLocaleString('vi-VN')}đ</td>
                          <td className="py-3">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              ord.status === 'Đã duyệt'
                                ? 'bg-emerald-100 text-emerald-700'
                                : ord.status === 'Đã thanh toán'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}>
                              {ord.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LINK AFFILIATE & QR GENERATOR matching Image 3 bottom right */}
          {activeTab === 'links' && (
            <div className="space-y-6">
              <h1 className="text-xl font-bold font-serif-luxury text-zinc-900">Tạo Link Affiliate & QR Code</h1>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Link Generator Box */}
                <div className="bg-white rounded-3xl border border-zinc-100 p-6 space-y-4 shadow-sm">
                  <h3 className="text-sm font-bold text-zinc-900">Link giới thiệu tổng quan của bạn</h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={aff.referralLink}
                      className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2 text-xs font-mono text-zinc-800"
                    />
                    <button
                      onClick={() => handleCopyLink(aff.referralLink)}
                      className="bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5"
                    >
                      <Copy className="w-3.5 h-3.5" /> Sao chép
                    </button>
                  </div>

                  <div className="pt-4 border-t border-zinc-100 space-y-3">
                    <h3 className="text-sm font-bold text-zinc-900">Tạo Link giới thiệu theo sản phẩm</h3>
                    <select
                      value={selectedProduct}
                      onChange={e => handleGenerateLink(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-pink-500"
                    >
                      {products.map(p => (
                        <option key={p._id} value={p._id}>{p.name} - {p.price.toLocaleString('vi-VN')}đ</option>
                      ))}
                    </select>

                    <div className="flex gap-2 pt-2">
                      <input
                        type="text"
                        readOnly
                        value={generatedLink}
                        className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2 text-xs font-mono text-zinc-800"
                      />
                      <button
                        onClick={() => handleCopyLink(generatedLink)}
                        className="bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5"
                      >
                        <Copy className="w-3.5 h-3.5" /> Sao chép
                      </button>
                    </div>
                  </div>

                  {/* Social Share Buttons matching Image 3 bottom right */}
                  <div className="pt-4 border-t border-zinc-100 space-y-2">
                    <label className="text-xs font-bold text-zinc-800 block">Chia sẻ nhanh lên mạng xã hội</label>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <button className="bg-blue-600 text-white px-3 py-1.5 rounded-xl font-medium">Facebook</button>
                      <button className="bg-blue-500 text-white px-3 py-1.5 rounded-xl font-medium">Zalo</button>
                      <button className="bg-zinc-900 text-white px-3 py-1.5 rounded-xl font-medium">TikTok</button>
                      <button className="bg-rose-600 text-white px-3 py-1.5 rounded-xl font-medium">Email</button>
                    </div>
                  </div>
                </div>

                {/* QR Code Box matching Image 3 bottom right */}
                <div className="bg-white rounded-3xl border border-zinc-100 p-6 space-y-4 shadow-sm text-center">
                  <h3 className="text-sm font-bold text-zinc-900">Mã QR Code giới thiệu</h3>
                  <div className="w-44 h-44 bg-white border-2 border-pink-200 rounded-2xl p-3 mx-auto flex items-center justify-center shadow-md">
                    <QrCode className="w-full h-full text-zinc-800" />
                  </div>
                  <p className="text-xs text-zinc-500">Khách hàng quét mã QR sẽ tự động ghi nhận hoa hồng cho bạn.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MARKETING BANNERS matching Image 3 bottom right */}
          {activeTab === 'banners' && (
            <div className="space-y-6">
              <h1 className="text-xl font-bold font-serif-luxury text-zinc-900">Tài nguyên quảng bá & Banner</h1>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {marketingBanners.map(b => (
                  <div key={b.id} className="bg-white rounded-3xl border border-zinc-100 p-4 space-y-3 shadow-sm">
                    <img src={b.img} alt={b.name} className="w-full h-44 object-cover rounded-2xl" />
                    <h4 className="text-xs font-bold text-zinc-900 leading-snug">{b.name}</h4>
                    <button
                      onClick={() => showToast('Đang tải xuống banner chất lượng cao...', 'success')}
                      className="w-full bg-pink-50 hover:bg-pink-600 text-pink-600 hover:text-white text-xs font-bold py-2 rounded-xl transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" /> Tải xuống Banner
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Withdrawal Request Modal matching SRS FR21 & Image 3 */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
              <h3 className="text-base font-bold text-zinc-900 font-serif-luxury">Yêu cầu rút hoa hồng</h3>
              <button onClick={() => setShowWithdrawModal(false)} className="text-zinc-400 hover:text-zinc-800">✕</button>
            </div>

            <div className="bg-pink-50 p-3 rounded-2xl text-xs space-y-1">
              <div className="flex justify-between">
                <span>Số dư khả dụng:</span>
                <span className="font-bold text-pink-600">{aff.availableBalance.toLocaleString('vi-VN')}đ</span>
              </div>
              <div className="flex justify-between text-[11px] text-zinc-500">
                <span>Ngân hàng nhận:</span>
                <span>{aff.bankInfo.bankName} - {aff.bankInfo.bankNumber}</span>
              </div>
            </div>

            <form onSubmit={handleWithdrawSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-zinc-700 block mb-1">Số tiền muốn rút (Tối thiểu 500.000đ)</label>
                <input
                  type="number"
                  required
                  value={withdrawAmount}
                  onChange={e => setWithdrawAmount(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-pink-500 font-bold text-sm text-pink-600"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold py-3 rounded-full transition-all shadow-md shadow-pink-500/20 uppercase"
              >
                Xác nhận rút tiền
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
