'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore, sortOrdersNewestFirst } from '@/context/StoreContext';
import { Product } from '@/types';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Boxes,
  ShoppingBag,
  Users,
  Tag,
  TrendingUp,
  Percent,
  Image as ImageIcon,
  BarChart3,
  Settings,
  Plus,
  Edit,
  Trash2,
  Lock,
  Unlock,
  CheckCircle2,
  XCircle,
  Eye,
  AlertTriangle,
  Search,
  Download,
  ShieldAlert,
  Star,
  MessageSquare,
  Send,
  ChevronDown,
  ChevronUp,
  Upload,
  X
} from 'lucide-react';

import * as Icons from 'lucide-react';

const PREDEFINED_ICONS = ['Tag', 'Star', 'Heart', 'Smile', 'Zap', 'Droplets', 'Wind', 'Flame', 'Gift', 'Shield', 'UserCheck', 'Sparkles', 'Package', 'ShoppingCart'];

const formatNumberWithDots = (val: number | string): string => {
  if (val === undefined || val === null || val === '') return '';
  const numStr = String(val).replace(/\D/g, '');
  if (!numStr) return '';
  return Number(numStr).toLocaleString('vi-VN').replace(/,/g, '.');
};

export default function AdminPage() {
  const router = useRouter();
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    orders,
    updateOrderStatus,
    vouchers,
    addVoucher,
    deleteVoucher,
    toggleVoucherStatus,
    affiliates,
    updateAffiliateStatus,
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    brands,
    addBrand,
    deleteBrand,
    customers,
    addCustomer,
    toggleCustomerStatus,
    deleteCustomer,
    showToast,
    productReviews,
    addAdminReply,
    deleteProductReview,
    inventoryLogs,
    addInventoryLog
  } = useStore();

  const [customerSearch, setCustomerSearch] = useState('');
  const [customerProviderFilter, setCustomerProviderFilter] = useState<'all' | 'google' | 'email'>('all');
  const [editingCustomer, setEditingCustomer] = useState<any | null>(null);

  // Reviews management state
  const [replyingReviewId, setReplyingReviewId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [reviewSearch, setReviewSearch] = useState('');
  const [reviewFilter, setReviewFilter] = useState<'all' | 'replied' | 'unreplied'>('all');
  const [selectedReviewModal, setSelectedReviewModal] = useState<any | null>(null);


  const [inventorySubTab, setInventorySubTab] = useState<'overview' | 'in' | 'audit'>('overview');
  const [inventorySearch, setInventorySearch] = useState('');
  const [stockInSuccessMsg, setStockInSuccessMsg] = useState<string | null>(null);
  const [stockInSubmittedAttempt, setStockInSubmittedAttempt] = useState<boolean>(false);
  interface InventoryVariantItem {
    id: string;
    volume: string;
    quantity: number | '';
    importPrice: number | '';
    sellingPrice: number | '';
  }

  const [newInventoryForm, setNewInventoryForm] = useState({
    productId: '',
    productName: '',
    brand: 'Dior',
    scent: '',
    concentration: '',
    note: '',
    image: '',
    variants: [
      { id: 'v_1', volume: '100ml', quantity: '', importPrice: '', sellingPrice: '' }
    ] as InventoryVariantItem[]
  });

  const handleAddVolumeVariant = () => {
    setStockInSubmittedAttempt(false);
    setNewInventoryForm(prev => ({
      ...prev,
      variants: [
        ...prev.variants,
        { id: 'v_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6), volume: '', quantity: '', importPrice: '', sellingPrice: '' }
      ]
    }));
  };

  const handleRemoveVolumeVariant = (id: string) => {
    setStockInSubmittedAttempt(false);
    setNewInventoryForm(prev => ({
      ...prev,
      variants: prev.variants.length > 1 ? prev.variants.filter(v => v.id !== id) : prev.variants
    }));
  };

  const handleVariantChange = (id: string, field: keyof InventoryVariantItem, val: any) => {
    setStockInSubmittedAttempt(false);
    setNewInventoryForm(prev => ({
      ...prev,
      variants: prev.variants.map(v => {
        if (v.id !== id) return v;
        const updated = { ...v, [field]: val };
        if (field === 'importPrice' && val && (!v.sellingPrice || Number(v.sellingPrice) === 0)) {
          updated.sellingPrice = Math.round(Number(val) * 1.25);
        }
        return updated;
      })
    }));
  };

  const getReservedStockForProduct = (prodId: string, prodName: string) => {
    const unfinishedOrders = orders.filter(o => 
      ['Chờ xác nhận', 'Xác nhận', 'Đóng gói', 'Đang giao'].includes(o.orderStatus || 'Chờ xác nhận')
    );
    let count = 0;
    unfinishedOrders.forEach(o => {
      o.items?.forEach(it => {
        const pId = typeof it.product === 'string' ? it.product : (it.product?._id || (it.product as any)?.id);
        if (pId === prodId || (it.name && it.name.toLowerCase() === prodName.toLowerCase())) {
          count += (it.quantity || 1);
        }
      });
    });
    return count;
  };

  const overviewProductsList = React.useMemo(() => {
    const map = new Map<string, any>();

    // 1. Add existing products
    products.forEach(p => {
      if (!p || !p.name) return;
      const key = p.name.trim().toLowerCase();
      const volsFromOptions = (p.volumeOptions || []).map((vo: any) => vo.volume).filter(Boolean);
      const allVols = Array.from(new Set([...(p.availableVolumes || []), ...volsFromOptions, p.volume].filter(Boolean)));
      map.set(key, {
        ...p,
        availableVolumes: allVols
      });
    });

    // 2. Add inventory logs that are not in products or merge volumes
    inventoryLogs.forEach((inv: any) => {
      if (!inv || !inv.productName) return;
      const key = inv.productName.trim().toLowerCase();
      const existing = map.get(key);
      if (existing) {
        if (inv.volume && (!existing.availableVolumes || !existing.availableVolumes.includes(inv.volume))) {
          existing.availableVolumes = Array.from(new Set([...(existing.availableVolumes || []), inv.volume]));
        }
      } else {
        map.set(key, {
          _id: inv.productId || inv.id || ('inv_prod_' + key),
          name: inv.productName,
          brand: inv.brand || 'Dior',
          category: 'Nước hoa Nữ',
          concentration: inv.concentration || 'EDP',
          volume: inv.volume || '100ml',
          availableVolumes: [inv.volume || '100ml'].filter(Boolean),
          availableScents: [inv.scent].filter(Boolean),
          stock: Number(inv.quantity) || 0,
          price: Number(inv.importPrice || 0) * 1.3,
          originalPrice: Number(inv.importPrice || 0) * 1.5,
          image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=600'
        });
      }
    });

    const list = Array.from(map.values());

    // Sort by latest stock import recency: products imported later (lowest inventoryLogs index) appear at top
    list.sort((a, b) => {
      const getRecency = (p: any) => {
        const logIdx = inventoryLogs.findIndex((l: any) => 
          (l.productId && (l.productId === p._id || l.productId === p.id)) || 
          (l.productName && p.name && l.productName.trim().toLowerCase() === p.name.trim().toLowerCase())
        );
        if (logIdx >= 0) return logIdx;
        const prodIdx = products.findIndex(item => item._id === p._id || item.name?.toLowerCase() === p.name?.toLowerCase());
        return prodIdx >= 0 ? 10000 + prodIdx : 99999;
      };
      return getRecency(a) - getRecency(b);
    });

    return list;
  }, [products, inventoryLogs]);

  const handleConfirmStockIn = (e: React.FormEvent) => {
    e.preventDefault();
    const isMissingBase = 
      !newInventoryForm.productName.trim() ||
      !newInventoryForm.brand.trim() ||
      !newInventoryForm.scent.trim() ||
      !newInventoryForm.note.trim() ||
      newInventoryForm.variants.length === 0;

    const isMissingVariants = newInventoryForm.variants.some(v => 
      !v.volume.trim() ||
      !v.quantity || Number(v.quantity) <= 0 ||
      !v.importPrice || Number(v.importPrice) <= 0
    );

    const isDuplicateProductInStock = overviewProductsList.some(p => p.name.trim().toLowerCase() === newInventoryForm.productName.trim().toLowerCase());

    if (isDuplicateProductInStock) {
      showToast(`Sản phẩm "${newInventoryForm.productName}" đã có trong kho! Vui lòng đổi tên mới.`, 'error');
      return;
    }

    if (isMissingBase || isMissingVariants) {
      setStockInSubmittedAttempt(true);
      return;
    }

    setStockInSubmittedAttempt(false);

    const now = new Date();
    const dateStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} ${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;

    const prodId = newInventoryForm.productId || ('prod_' + Date.now());
    const prodName = newInventoryForm.productName.trim();

    let totalQuantityAdded = 0;
    const importedVolumes: string[] = [];
    const newVolumeOptions: any[] = [];

    const generatedLogs: any[] = [];
    newInventoryForm.variants.forEach((v, idx) => {
      const volTrim = v.volume.trim();
      const qtyNum = Number(v.quantity);
      const impNum = Number(v.importPrice);
      const selNum = Number(v.sellingPrice) || Math.round(impNum * 1.25);

      totalQuantityAdded += qtyNum;
      importedVolumes.push(volTrim);
      newVolumeOptions.push({
        volume: volTrim,
        price: selNum,
        originalPrice: Math.round(selNum * 1.25)
      });

      const newLog = {
        id: `INV-${now.getFullYear()}-${Date.now().toString().slice(-4)}-${idx + 1}`,
        productId: prodId,
        productName: prodName,
        brand: newInventoryForm.brand,
        scent: newInventoryForm.scent,
        concentration: newInventoryForm.concentration,
        volume: volTrim,
        quantity: qtyNum,
        importPrice: impNum,
        sellingPrice: selNum,
        image: newInventoryForm.image || 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=600',
        date: dateStr,
        note: newInventoryForm.note.trim() || 'Nhập kho hàng'
      };

      generatedLogs.push(newLog);
    });

    addInventoryLog(generatedLogs);

    // Automatically update or create product stock in products array
    const targetProdIndex = products.findIndex(p => p._id === prodId || p.name.toLowerCase() === prodName.toLowerCase());

    if (targetProdIndex >= 0) {
      const targetProd = products[targetProdIndex];
      const existingOpts = targetProd.volumeOptions || [];
      const updatedOpts = [...existingOpts];
      newVolumeOptions.forEach(nOpt => {
        const idx = updatedOpts.findIndex(o => o.volume === nOpt.volume);
        if (idx >= 0) {
          updatedOpts[idx] = { ...updatedOpts[idx], price: nOpt.price, originalPrice: nOpt.originalPrice };
        } else {
          updatedOpts.push(nOpt);
        }
      });

      const allPrices = updatedOpts.map(o => o.price);
      const minPrice = allPrices.length > 0 ? Math.min(...allPrices) : (targetProd.price || 0);

      const updatedProd = {
        ...targetProd,
        stock: (targetProd.stock || 0) + totalQuantityAdded,
        price: minPrice,
        originalPrice: Math.round(minPrice * 1.25),
        brand: newInventoryForm.brand || targetProd.brand,
        concentration: newInventoryForm.concentration || targetProd.concentration,
        image: newInventoryForm.image || targetProd.image,
        volume: importedVolumes[0] || targetProd.volume,
        availableVolumes: Array.from(new Set([...(targetProd.availableVolumes || []), ...importedVolumes].filter(Boolean))),
        volumeOptions: updatedOpts,
        availableScents: Array.from(new Set([...(targetProd.availableScents || []), newInventoryForm.scent].filter(Boolean)))
      };
      updateProduct(updatedProd);
    } else {
      const allPrices = newVolumeOptions.map(o => o.price);
      const minPrice = allPrices.length > 0 ? Math.min(...allPrices) : 0;

      const newProd: any = {
        _id: prodId,
        name: prodName,
        slug: prodName.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '') + '-' + Date.now().toString().slice(-4),
        brand: newInventoryForm.brand || 'Dior',
        category: 'Nước hoa Nữ',
        gender: 'Unisex',
        origin: 'Pháp',
        concentration: newInventoryForm.concentration || 'EDP',
        price: minPrice,
        originalPrice: Math.round(minPrice * 1.25),
        discountPercent: 15,
        volume: importedVolumes[0] || '100ml',
        availableVolumes: importedVolumes,
        volumeOptions: newVolumeOptions,
        availableScents: [newInventoryForm.scent].filter(Boolean),
        stock: totalQuantityAdded,
        soldCount: 0,
        rating: 5.0,
        reviewCount: 0,
        image: newInventoryForm.image || 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=600',
        gallery: [newInventoryForm.image || 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=600'],
        description: `Sản phẩm nhập kho chính hãng: ${prodName}. Ghi chú: ${newInventoryForm.note.trim()}`,
        isFeatured: true
      };
      addProduct(newProd);
    }

    showToast(`Đã nhập kho thành công ${totalQuantityAdded} chai cho sản phẩm "${prodName}"!`, 'success');
    setStockInSuccessMsg(`Đã nhập kho thành công ${totalQuantityAdded} chai cho sản phẩm "${prodName}"!`);
    setTimeout(() => { setStockInSuccessMsg(null); }, 6000);

    setNewInventoryForm({
      productId: '',
      productName: '',
      brand: brands[0] || 'Dior',
      scent: '',
      concentration: '',
      note: '',
      image: '',
      variants: [
        { id: 'v_' + Date.now(), volume: '100ml', quantity: '', importPrice: '', sellingPrice: '' }
      ]
    });
  };

  type AdminTab = 'dashboard' | 'products' | 'categories' | 'brands' | 'inventory' | 'orders' | 'customers' | 'vouchers' | 'affiliates' | 'commissions' | 'banners' | 'reports' | 'system' | 'reviews';
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  const handleTabChange = (newTab: AdminTab) => {
    setActiveTab(newTab);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('luxora_admin_active_tab', newTab);
        window.history.replaceState(null, '', `/admin?tab=${newTab}`);
      } catch (e) {}
    }
  };

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab') || localStorage.getItem('luxora_admin_active_tab');
      if (tab) {
        setActiveTab(tab as any);
      }
    }
  }, []);

  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState('Tag');
  const [newCategoryFeatured, setNewCategoryFeatured] = useState(false);
  const [newBrandInput, setNewBrandInput] = useState('');



  // New Voucher Form state
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [newVoucherForm, setNewVoucherForm] = useState({
    code: '',
    name: '',
    discountType: 'fixed' as 'fixed' | 'percent',
    discountValue: 50000,
    minOrderValue: 500000,
    quantity: 100
  });

  // Customers list state
  const [customersList, setCustomersList] = useState([
    { id: 'c1', name: 'Trần Thị Mai', email: 'thimai@gmail.com', phone: '0987654321', orderCount: 5, totalSpent: 11250000, status: 'active' },
    { id: 'c2', name: 'Phạm Minh Tuấn', email: 'tuanpham@gmail.com', phone: '0918889999', orderCount: 3, totalSpent: 6450000, status: 'active' },
    { id: 'c3', name: 'Phạm Văn Hùng', email: 'spammer@gmail.com', phone: '0999999999', orderCount: 0, totalSpent: 0, status: 'locked' }
  ]);

  // System Audit Logs state
  const auditLogs = [
    { id: 'log1', admin: 'Admin Luxora', action: 'Cập nhật kho', module: 'Sản phẩm', details: 'Nhập thêm 50 chai Sauvage EDP', time: '18:45 05/08/2026' },
    { id: 'log2', admin: 'Admin Luxora', action: 'Duyệt Affiliate', module: 'Affiliate', details: 'Duyệt tài khoản NGUYEN VAN AN', time: '17:30 05/08/2026' },
    { id: 'log3', admin: 'Staff 01', action: 'Duyệt đơn hàng', module: 'Đơn hàng', details: 'Chuyển đơn #DH10086 sang Xác nhận', time: '15:10 05/08/2026' }
  ];



  const handleSaveVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVoucherForm.code.trim()) return;
    addVoucher({
      _id: 'v_' + Date.now(),
      code: newVoucherForm.code.trim().toUpperCase(),
      name: newVoucherForm.name || `Mã giảm giá ${newVoucherForm.code}`,
      discountType: newVoucherForm.discountType,
      discountValue: Number(newVoucherForm.discountValue),
      minOrderValue: Number(newVoucherForm.minOrderValue),
      quantity: Number(newVoucherForm.quantity),
      usedQuantity: 0,
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      status: 'active'
    });
    setShowVoucherModal(false);
    setNewVoucherForm({ code: '', name: '', discountType: 'fixed', discountValue: 50000, minOrderValue: 500000, quantity: 100 });
  };

  const handleToggleCustomerLock = (custId: string, status: string) => {
    const nextStatus = status === 'active' ? 'locked' : 'active';
    setCustomersList(prev => prev.map(c => c.id === custId ? { ...c, status: nextStatus } : c));
    showToast(`Đã ${nextStatus === 'locked' ? 'khóa' : 'mở khóa'} tài khoản khách hàng`, 'info');
  };

  const handleSaveEditCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;

    addCustomer({
      name: editingCustomer.name,
      email: editingCustomer.email,
      phone: editingCustomer.phone,
      province: editingCustomer.province,
      district: editingCustomer.district,
      detailAddress: editingCustomer.detailAddress,
      avatar: editingCustomer.avatar
    });

    showToast(`Đã cập nhật thông tin khách hàng ${editingCustomer.name}`, 'success');
    setEditingCustomer(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Admin Navigation Sidebar */}
        <aside className="bg-zinc-950 text-zinc-300 rounded-3xl p-5 space-y-6 shadow-xl h-fit border border-zinc-800">
          <div className="flex items-center gap-3 pb-4 border-b border-zinc-800">
            <div className="w-9 h-9 rounded-full bg-amber-400 text-zinc-950 flex items-center justify-center font-bold font-serif-luxury">
              LX
            </div>
            <div>
              <h3 className="text-xs font-bold text-white">Luxora Admin</h3>
              <p className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider">Hệ thống quản trị</p>
            </div>
          </div>

          <nav className="space-y-1 text-xs">
            <button
              onClick={() => handleTabChange('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors ${
                activeTab === 'dashboard' ? 'bg-amber-400 text-zinc-950 font-bold' : 'hover:bg-zinc-900 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" /> Tổng quan
            </button>

            <button
              onClick={() => handleTabChange('products')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors ${
                activeTab === 'products' ? 'bg-amber-400 text-zinc-950 font-bold' : 'hover:bg-zinc-900 hover:text-white'
              }`}
            >
              <Package className="w-4 h-4" /> Quản lý sản phẩm
            </button>

            <button
              onClick={() => handleTabChange('categories')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors ${
                activeTab === 'categories' ? 'bg-amber-400 text-zinc-950 font-bold' : 'hover:bg-zinc-900 hover:text-white'
              }`}
            >
              <FolderTree className="w-4 h-4 text-emerald-400" /> Quản lý Danh mục
            </button>

            <button
              onClick={() => handleTabChange('brands')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors ${
                activeTab === 'brands' ? 'bg-amber-400 text-zinc-950 font-bold' : 'hover:bg-zinc-900 hover:text-white'
              }`}
            >
              <Boxes className="w-4 h-4 text-sky-400" /> Quản lý Thương hiệu
            </button>

            <button
              onClick={() => handleTabChange('orders')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors ${
                activeTab === 'orders' ? 'bg-amber-400 text-zinc-950 font-bold' : 'hover:bg-zinc-900 hover:text-white'
              }`}
            >
              <ShoppingBag className="w-4 h-4" /> Quản lý đơn hàng
            </button>

            <button
              onClick={() => handleTabChange('vouchers')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors ${
                activeTab === 'vouchers' ? 'bg-amber-400 text-zinc-950 font-bold' : 'hover:bg-zinc-900 hover:text-white'
              }`}
            >
              <Tag className="w-4 h-4" /> Quản lý Voucher
            </button>

            <button
              onClick={() => handleTabChange('affiliates')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors ${
                activeTab === 'affiliates' ? 'bg-amber-400 text-zinc-950 font-bold' : 'hover:bg-zinc-900 hover:text-white'
              }`}
            >
              <TrendingUp className="w-4 h-4 text-pink-400" /> Quản lý Affiliate
            </button>

            <button
              onClick={() => handleTabChange('customers')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors ${
                activeTab === 'customers' ? 'bg-amber-400 text-zinc-950 font-bold' : 'hover:bg-zinc-900 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" /> Quản lý khách hàng
            </button>

            <button
              onClick={() => handleTabChange('inventory')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors ${
                activeTab === 'inventory' ? 'bg-amber-400 text-zinc-950 font-bold' : 'hover:bg-zinc-900 hover:text-white'
              }`}
            >
              <Boxes className="w-4 h-4" /> Quản lý kho hàng
            </button>

            <button
              onClick={() => handleTabChange('reviews')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors ${
                activeTab === 'reviews' ? 'bg-amber-400 text-zinc-950 font-bold' : 'hover:bg-zinc-900 hover:text-white'
              }`}
            >
              <Star className="w-4 h-4 text-amber-400" /> Quản lý đánh giá
            </button>

            <button
              onClick={() => handleTabChange('system')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors ${
                activeTab === 'system' ? 'bg-amber-400 text-zinc-950 font-bold' : 'hover:bg-zinc-900 hover:text-white'
              }`}
            >
              <ShieldAlert className="w-4 h-4" /> Nhật ký hệ thống (Audit Log)
            </button>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="lg:col-span-4 space-y-6">
          {/* 1. DASHBOARD OVERVIEW matching SRS FR23 */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <h1 className="text-xl font-bold font-serif-luxury text-zinc-900">Dashboard Quản Trị Hệ Thống</h1>

              {/* 8 Stats Metrics Cards matching SRS FR23 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-3xl border border-zinc-100 p-4 space-y-1 shadow-sm">
                  <span className="text-[11px] text-zinc-400 font-bold uppercase">Tổng doanh thu</span>
                  <div className="text-xl font-bold text-pink-600">128.500.000đ</div>
                  <span className="text-[10px] text-emerald-600 font-bold">↑ 24% so với tháng trước</span>
                </div>

                <div className="bg-white rounded-3xl border border-zinc-100 p-4 space-y-1 shadow-sm">
                  <span className="text-[11px] text-zinc-400 font-bold uppercase">Tổng đơn hàng</span>
                  <div className="text-xl font-bold text-zinc-900">482 đơn</div>
                  <span className="text-[10px] text-emerald-600 font-bold">↑ 18%</span>
                </div>

                <div className="bg-white rounded-3xl border border-zinc-100 p-4 space-y-1 shadow-sm">
                  <span className="text-[11px] text-zinc-400 font-bold uppercase">Tổng khách hàng</span>
                  <div className="text-xl font-bold text-zinc-900">1.250 người</div>
                  <span className="text-[10px] text-emerald-600 font-bold">+120 tuần này</span>
                </div>

                <div className="bg-white rounded-3xl border border-zinc-100 p-4 space-y-1 shadow-sm">
                  <span className="text-[11px] text-zinc-400 font-bold uppercase">Tổng sản phẩm</span>
                  <div className="text-xl font-bold text-zinc-900">{products.length} mặt hàng</div>
                  <span className="text-[10px] text-zinc-400 font-medium">Đồng bộ từ Frontend</span>
                </div>

                <div className="bg-white rounded-3xl border border-zinc-100 p-4 space-y-1 shadow-sm">
                  <span className="text-[11px] text-zinc-400 font-bold uppercase">Tổng Affiliate</span>
                  <div className="text-xl font-bold text-purple-600">{affiliates.length} thành viên</div>
                  <span className="text-[10px] text-amber-600 font-bold">
                    {affiliates.filter(a => a.status === 'Pending').length} chờ duyệt
                  </span>
                </div>

                <div className="bg-white rounded-3xl border border-zinc-100 p-4 space-y-1 shadow-sm">
                  <span className="text-[11px] text-zinc-400 font-bold uppercase">Doanh thu Affiliate</span>
                  <div className="text-xl font-bold text-amber-600">42.800.000đ</div>
                  <span className="text-[10px] text-amber-600 font-bold">Chiếm 33% tổng doanh thu</span>
                </div>

                <div className="bg-white rounded-3xl border border-zinc-100 p-4 space-y-1 shadow-sm">
                  <span className="text-[11px] text-zinc-400 font-bold uppercase">Hoa hồng đã trả</span>
                  <div className="text-xl font-bold text-emerald-600">5.780.000đ</div>
                  <span className="text-[10px] text-emerald-600 font-bold">12 đợt rút tiền</span>
                </div>

                <div className="bg-white rounded-3xl border border-zinc-100 p-4 space-y-1 shadow-sm">
                  <span className="text-[11px] text-zinc-400 font-bold uppercase">Mã giảm giá (Voucher)</span>
                  <div className="text-xl font-bold text-blue-600">{vouchers.length} mã đang chạy</div>
                  <span className="text-[10px] text-zinc-400 font-medium">Đồng bộ Voucher FE</span>
                </div>
              </div>

              {/* Quick Actions Shortcuts */}
              <div className="bg-white rounded-3xl border border-zinc-100 p-5 space-y-4 shadow-sm">
                <h3 className="text-sm font-bold text-zinc-900">Thao tác nhanh</h3>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => router.push('/admin/product/new')}
                    className="bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <Plus className="w-4 h-4" /> Thêm sản phẩm mới
                  </button>
                  <button
                    onClick={() => setShowVoucherModal(true)}
                    className="bg-amber-500 hover:bg-amber-600 text-zinc-950 text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5"
                  >
                    <Tag className="w-4 h-4" /> Tạo Voucher mới
                  </button>
                  <button
                    onClick={() => setActiveTab('affiliates')}
                    className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5"
                  >
                    <TrendingUp className="w-4 h-4" /> Duyệt Affiliate mới ({affiliates.filter(a => a.status === 'Pending').length})
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 2. PRODUCT MANAGEMENT CRUD */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-xl font-bold font-serif-luxury text-zinc-900">Quản lý sản phẩm</h1>
                  <p className="text-xs text-zinc-500">Đồng bộ sản phẩm hiển thị trên Frontend ({products.length} mặt hàng)</p>
                </div>
                <button
                  onClick={() => router.push('/admin/product/new')}
                  className="bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold px-4 py-2.5 rounded-full transition-all shadow-md shadow-pink-500/20 flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Thêm sản phẩm mới
                </button>
              </div>

              <div className="bg-white rounded-3xl border border-zinc-100 p-5 space-y-4 shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm min-w-[950px]">
                    <thead>
                      <tr className="border-b border-zinc-200 text-zinc-500 font-bold text-xs uppercase tracking-wider">
                        <th className="py-3 px-2">Sản phẩm</th>
                        <th className="py-3 px-2">Thương hiệu</th>
                        <th className="py-3 px-2">Giá bán</th>
                        <th className="py-3 px-2">Dung tích</th>
                        <th className="py-3 px-2">Tồn kho</th>
                        <th className="py-3 px-2 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {products.map(prod => (
                        <tr key={prod._id} className="hover:bg-zinc-50/60 transition-colors">
                          <td className="py-3.5 px-2 flex items-center gap-3 min-w-[240px]">
                            <img src={prod.image} alt="" className="w-12 h-12 object-cover rounded-xl border border-zinc-200 shrink-0" />
                            <div className="space-y-0.5">
                              <div className="font-extrabold text-base text-zinc-900 leading-snug">{prod.name}</div>
                              <div className="text-xs font-semibold text-zinc-500">{prod.category}</div>
                            </div>
                          </td>
                          <td className="py-3.5 px-2 font-bold text-sm text-zinc-800 whitespace-nowrap">{prod.brand}</td>
                          <td className="py-3.5 px-2 font-extrabold text-sm text-pink-600 whitespace-nowrap">
                            {(() => {
                              const prices = prod.volumeOptions && prod.volumeOptions.length > 0
                                ? prod.volumeOptions.map(v => v.price)
                                : [prod.price];
                              const minP = Math.min(...prices);
                              const maxP = Math.max(...prices);
                              if (minP === maxP) return `${minP.toLocaleString('vi-VN')}đ`;
                              return `${minP.toLocaleString('vi-VN')}đ – ${maxP.toLocaleString('vi-VN')}đ`;
                            })()}
                          </td>
                          <td className="py-3.5 px-2 text-xs font-bold text-zinc-700 whitespace-nowrap">
                            {prod.availableVolumes && prod.availableVolumes.length > 0
                              ? prod.availableVolumes.join(' / ')
                              : prod.volume}
                          </td>
                          <td className="py-3.5 px-2 whitespace-nowrap">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                              prod.stock <= 0 ? 'bg-rose-200 text-rose-900 border-rose-300' : prod.stock < 10 ? 'bg-rose-100 text-rose-800 border-rose-200' : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                            }`}>
                              {prod.stock <= 0 ? 'Hết hàng (0)' : prod.stock < 10 ? `Sắp hết (${prod.stock})` : `Còn hàng (${prod.stock})`}
                            </span>
                          </td>
                          <td className="py-3.5 px-2 text-right whitespace-nowrap">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => router.push(`/admin/product/new?edit=${prod._id}`)}
                                className="p-2 text-zinc-500 hover:text-pink-600 hover:bg-pink-50 rounded-xl transition-colors"
                                title="Sửa sản phẩm"
                              >
                                <Edit className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => deleteProduct(prod._id)}
                                className="p-2 text-zinc-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                                title="Xóa sản phẩm"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 3. ORDER MANAGEMENT PIPELINE */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl font-bold font-serif-luxury text-zinc-900">Quản lý đơn hàng</h1>
                <p className="text-xs text-zinc-500">Hiển thị chi tiết các đơn hàng thực tế do người dùng đặt trên website</p>
              </div>

              <div className="bg-white rounded-3xl border border-zinc-100 p-5 space-y-4 shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm min-w-[1100px]">
                    <thead>
                      <tr className="border-b border-zinc-200 text-zinc-500 font-bold text-xs uppercase tracking-wider">
                        <th className="py-3 px-2">Mã đơn</th>
                        <th className="py-3 px-2">Ngày giờ đặt</th>
                        <th className="py-3 px-2">Khách hàng & SĐT</th>
                        <th className="py-3 px-2">Sản phẩm & Tổng tiền</th>
                        <th className="py-3 px-2">Thanh toán</th>
                        <th className="py-3 px-2">Trạng thái xử lý</th>
                        <th className="py-3 px-2">Ngày nhận hàng</th>
                        <th className="py-3 px-2 text-right">Chuyển trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {orders.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="text-center py-12 text-zinc-400 text-xs font-semibold">
                            Chưa có đơn hàng nào phát sinh trên hệ thống.
                          </td>
                        </tr>
                      ) : (
                        sortOrdersNewestFirst(orders).map(ord => {
                          const toIso = (val?: string) => {
                            if (!val) return '';
                            if (val.includes('-') && val.length === 10) return val;
                            if (val.includes('/')) {
                              const parts = val.split('/');
                              if (parts.length === 3) {
                                const [d, m, y] = parts;
                                return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
                              }
                            }
                            return '';
                          };

                          const toVi = (val?: string) => {
                            if (!val) return '';
                            if (val.includes('-') && val.length === 10) {
                              const [y, m, d] = val.split('-');
                              return `${d}/${m}/${y}`;
                            }
                            return val;
                          };

                          return (
                            <tr key={ord._id || ord.orderCode} className="hover:bg-zinc-50/60 transition-colors">
                              <td className="py-3.5 px-2 font-bold text-zinc-900 font-mono text-sm whitespace-nowrap">{ord.orderCode}</td>
                              <td className="py-3.5 px-2 text-xs font-semibold text-zinc-700 whitespace-nowrap font-mono">{ord.createdAt || 'N/A'}</td>
                              <td className="py-3.5 px-2 space-y-1 min-w-[200px]">
                                <div className="font-extrabold text-base text-zinc-900">{ord.customerName}</div>
                                <div className="font-bold text-sm text-pink-600 font-mono">{ord.customerPhone}</div>
                                <div className="text-xs font-semibold text-zinc-700 leading-snug">{ord.shippingAddress}</div>
                              </td>
                              <td className="py-3.5 px-2 space-y-2 min-w-[220px]">
                                <div className="space-y-1.5">
                                  {(ord.items || []).map((it, i) => (
                                    <div key={i} className="flex flex-col items-start gap-1.5 text-sm text-zinc-900 font-semibold">
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="font-bold text-pink-600 shrink-0">{it.quantity}x</span>
                                        <span>{it.name}</span>
                                        <span className="text-xs text-zinc-500 font-normal shrink-0">({it.volume})</span>
                                      </div>
                                      {it.scent && (
                                        <span className="block text-xs text-pink-700 bg-pink-50 border border-pink-200 px-2 py-0.5 rounded-lg font-black w-fit shadow-2xs">
                                          🌸 Mùi: {it.scent}
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                                <div className="text-sm font-black text-pink-600 bg-pink-50 border border-pink-200 px-3 py-1 rounded-xl w-fit shadow-2xs">
                                  Tổng: {(ord.totalAmount || 0).toLocaleString('vi-VN')}đ
                                </div>
                              </td>
                              <td className="py-3.5 px-2 whitespace-nowrap">
                                <span className="font-extrabold text-sm text-zinc-900 block">
                                  {(ord.paymentMethod === 'BankTransfer' || String(ord.paymentMethod) === 'Chuyển khoản Ngân hàng') ? 'QR Code' : ord.paymentMethod}
                                </span>
                                <span className={`text-xs font-bold inline-block mt-0.5 ${(ord.paymentStatus === 'Paid' || ord.paymentMethod === 'BankTransfer' || String(ord.paymentMethod) === 'Chuyển khoản Ngân hàng') ? 'text-emerald-600' : 'text-amber-600'}`}>
                                  {(ord.paymentStatus === 'Paid' || ord.paymentMethod === 'BankTransfer' || String(ord.paymentMethod) === 'Chuyển khoản Ngân hàng') ? 'Đã thanh toán' : 'Chưa thanh toán'}
                                </span>
                              </td>
                              <td className="py-3.5 px-2 whitespace-nowrap">
                                <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${
                                  ord.orderStatus === 'Chờ xác nhận' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                                  ord.orderStatus === 'Xác nhận' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                  ord.orderStatus === 'Đóng gói' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                                  ord.orderStatus === 'Đang giao' ? 'bg-cyan-100 text-cyan-700 border-cyan-200' :
                                  ord.orderStatus === 'Hoàn thành' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                                  'bg-rose-100 text-rose-700 border-rose-200'
                                }`}>
                                  {ord.orderStatus}
                                </span>
                              </td>
                              <td className="py-3.5 px-2 whitespace-nowrap">
                                <input
                                  type="date"
                                  value={toIso(ord.estimatedDeliveryDate)}
                                  onChange={e => {
                                    updateOrderStatus(ord._id, ord.orderStatus, toVi(e.target.value));
                                  }}
                                  className="bg-zinc-50 border border-zinc-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-zinc-800 focus:outline-none focus:border-pink-500 cursor-pointer"
                                />
                              </td>
                              <td className="py-3.5 px-2 text-right whitespace-nowrap">
                                <select
                                  value={ord.orderStatus === 'Hủy' ? 'Hủy đơn' : ord.orderStatus}
                                  onChange={e => updateOrderStatus(ord._id || ord.orderCode, e.target.value as any, ord.estimatedDeliveryDate)}
                                  className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-1.5 text-xs font-bold text-zinc-800 focus:outline-none focus:border-pink-500 cursor-pointer"
                                >
                                  <option value="Chờ xác nhận">Chờ xác nhận</option>
                                  <option value="Xác nhận">Xác nhận</option>
                                  <option value="Đóng gói">Đóng gói</option>
                                  <option value="Đang giao">Đang giao</option>
                                  <option value="Hoàn thành">Hoàn thành</option>
                                  <option value="Hủy đơn">Hủy đơn</option>
                                </select>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* CATEGORIES MANAGEMENT */}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-xl font-bold font-serif-luxury text-zinc-900">Quản lý Danh mục Nước hoa</h1>
                  <p className="text-xs text-zinc-500">Thêm mới và quản lý các danh mục phân loại sản phẩm trên hệ thống</p>
                </div>
              </div>

              {/* Add Category Card */}
              <div className="bg-white rounded-3xl border border-zinc-100 p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="Nhập tên danh mục mới (VD: Nước hoa Xịt Phòng...)..."
                    value={newCategoryName}
                    onChange={e => setNewCategoryName(e.target.value)}
                    className="flex-1 bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-2.5 text-xs font-medium focus:outline-none focus:border-pink-500"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isFeatured"
                      checked={newCategoryFeatured}
                      onChange={e => setNewCategoryFeatured(e.target.checked)}
                      className="w-4 h-4 text-pink-600 rounded border-zinc-300 focus:ring-pink-500"
                    />
                    <label htmlFor="isFeatured" className="text-xs font-medium text-zinc-700">Nổi bật</label>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const trimmedName = newCategoryName.trim();
                      if (trimmedName) {
                        const isDuplicate = categories.some(c => c.name.toLowerCase() === trimmedName.toLowerCase());
                        if (isDuplicate) {
                          showToast(`Danh mục "${trimmedName}" đã tồn tại! Vui lòng chọn tên khác.`, 'error');
                          return;
                        }
                        addCategory({ name: trimmedName, slug: trimmedName.toLowerCase().replace(/ /g, '-'), icon: newCategoryIcon, isFeatured: newCategoryFeatured });
                        setNewCategoryName('');
                        setNewCategoryIcon('Tag');
                        setNewCategoryFeatured(false);
                      }
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2.5 rounded-2xl transition-all shadow-sm flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" /> Thêm Danh mục
                  </button>
                </div>
                
                <div>
                  <label className="text-xs font-semibold text-zinc-700 mb-2 block">Chọn Biểu tượng (Icon):</label>
                  <div className="flex flex-wrap gap-2">
                    {PREDEFINED_ICONS.map(iconName => {
                      const IconComp = (Icons as any)[iconName] || Icons.Circle;
                      const isSelected = newCategoryIcon === iconName;
                      return (
                        <button
                          key={iconName}
                          onClick={() => setNewCategoryIcon(iconName)}
                          className={`p-2 rounded-xl border flex items-center justify-center transition-all ${
                            isSelected ? 'bg-pink-100 border-pink-500 text-pink-600 scale-105 shadow-sm' : 'bg-white border-zinc-200 text-zinc-500 hover:bg-zinc-50'
                          }`}
                          title={iconName}
                        >
                          <IconComp className="w-5 h-5" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Categories Table */}
              <div className="bg-white rounded-3xl border border-zinc-100 p-5 space-y-4 shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {categories.map((cat, idx) => {
                    const CatIcon = (Icons as any)[cat.icon] || Icons.Circle;
                    return (
                      <div key={cat._id} className="flex items-center justify-between bg-zinc-50 border border-zinc-200 rounded-2xl p-3.5 hover:border-pink-200 transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center">
                            <CatIcon className="w-4 h-4" />
                          </span>
                          <div>
                            <span className="font-extrabold text-zinc-900 text-sm block">{cat.name}</span>
                            {cat.isFeatured && <span className="text-[10px] font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded-md">Nổi bật</span>}
                          </div>
                        </div>
                        <button
                          onClick={() => deleteCategory(cat._id)}
                          className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                          title="Xóa danh mục này"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* BRANDS MANAGEMENT */}
          {activeTab === 'brands' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-xl font-bold font-serif-luxury text-zinc-900">Quản lý Thương hiệu (Brands)</h1>
                  <p className="text-xs text-zinc-500">Thêm mới và quản lý danh sách các thương hiệu nước hoa nổi tiếng</p>
                </div>
              </div>

              {/* Add Brand Card */}
              <div className="bg-white rounded-3xl border border-zinc-100 p-5 shadow-sm flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Nhập tên thương hiệu mới (VD: Le Labo, Kilian...)..."
                  value={newBrandInput}
                  onChange={e => setNewBrandInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const trimmed = newBrandInput.trim();
                      if (trimmed) {
                        const isDuplicate = brands.some(b => b.toLowerCase() === trimmed.toLowerCase());
                        if (isDuplicate) {
                          showToast(`Thương hiệu "${trimmed}" đã tồn tại!`, 'error');
                          return;
                        }
                        addBrand(trimmed);
                        setNewBrandInput('');
                      }
                    }
                  }}
                  className="flex-1 bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-2.5 text-xs font-medium focus:outline-none focus:border-pink-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    const trimmed = newBrandInput.trim();
                    if (trimmed) {
                      const isDuplicate = brands.some(b => b.toLowerCase() === trimmed.toLowerCase());
                      if (isDuplicate) {
                        showToast(`Thương hiệu "${trimmed}" đã tồn tại!`, 'error');
                        return;
                      }
                      addBrand(trimmed);
                      setNewBrandInput('');
                    }
                  }}
                  className="bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold px-5 py-2.5 rounded-2xl transition-all shadow-sm flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Thêm Thương hiệu
                </button>
              </div>

              {/* Brands Grid */}
              <div className="bg-white rounded-3xl border border-zinc-100 p-5 space-y-4 shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {brands.map((b, idx) => (
                    <div key={b} className="flex items-center justify-between bg-zinc-50 border border-zinc-200 rounded-2xl p-3.5 hover:border-pink-200 transition-colors">
                      <div className="flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-xl bg-sky-100 text-sky-700 text-xs font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="font-extrabold text-zinc-900 text-sm">{b}</span>
                      </div>
                      <button
                        onClick={() => deleteBrand(b)}
                        className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                        title="Xóa thương hiệu này"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* VOUCHER MANAGEMENT */}
          {activeTab === 'vouchers' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-xl font-bold font-serif-luxury text-zinc-900">Quản lý Mã giảm giá (Vouchers)</h1>
                  <p className="text-xs text-zinc-500">Quản lý tất cả mã Voucher khuyến mãi đồng bộ với Frontend</p>
                </div>
                <button
                  onClick={() => setShowVoucherModal(true)}
                  className="bg-amber-500 hover:bg-amber-600 text-zinc-950 text-xs font-bold px-4 py-2.5 rounded-full transition-all shadow-md flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Tạo Voucher mới
                </button>
              </div>

              <div className="bg-white rounded-3xl border border-zinc-100 p-5 space-y-4 shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm min-w-[900px]">
                    <thead>
                      <tr className="border-b border-zinc-200 text-zinc-500 font-bold text-xs uppercase tracking-wider">
                        <th className="py-3 px-2">Mã Voucher</th>
                        <th className="py-3 px-2">Tên chương trình</th>
                        <th className="py-3 px-2">Mức giảm</th>
                        <th className="py-3 px-2">Đơn tối thiểu</th>
                        <th className="py-3 px-2">Đã dùng / Tổng</th>
                        <th className="py-3 px-2">Trạng thái</th>
                        <th className="py-3 px-2 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {vouchers.map(v => (
                        <tr key={v._id} className="hover:bg-zinc-50/60 transition-colors">
                          <td className="py-3.5 px-2 font-mono font-bold text-pink-600 text-base">{v.code}</td>
                          <td className="py-3.5 px-2 font-bold text-zinc-900 text-sm">{v.name}</td>
                          <td className="py-3.5 px-2 font-extrabold text-zinc-900 text-sm">
                            {v.discountType === 'percent' ? `${v.discountValue}%` : `${v.discountValue.toLocaleString('vi-VN')}đ`}
                          </td>
                          <td className="py-3.5 px-2 font-bold text-zinc-700 text-sm">{v.minOrderValue.toLocaleString('vi-VN')}đ</td>
                          <td className="py-3.5 px-2 font-semibold text-zinc-600 text-sm">{v.usedQuantity} / {v.quantity}</td>
                          <td className="py-3.5 px-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                              v.status === 'active' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-zinc-100 text-zinc-700 border-zinc-200'
                            }`}>
                              {v.status === 'active' ? 'Đang kích hoạt' : 'Tạm dừng'}
                            </span>
                          </td>
                          <td className="py-3.5 px-2 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => toggleVoucherStatus(v._id)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                                  v.status === 'active'
                                    ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                                    : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                }`}
                              >
                                {v.status === 'active' ? 'Tạm dừng' : 'Kích hoạt'}
                              </button>
                              <button
                                onClick={() => deleteVoucher(v._id)}
                                className="p-2 text-zinc-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 4. AFFILIATE APPROVAL & MANAGEMENT */}
          {activeTab === 'affiliates' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl font-bold font-serif-luxury text-zinc-900">Quản lý đối tác Affiliate</h1>
                <p className="text-xs text-zinc-500">Xem danh sách đăng ký của người dùng và thực hiện Duyệt hoặc Từ chối hồ sơ</p>
              </div>

              <div className="bg-white rounded-3xl border border-zinc-100 p-5 space-y-4 shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm min-w-[1000px]">
                    <thead>
                      <tr className="border-b border-zinc-200 text-zinc-500 font-bold text-xs uppercase tracking-wider">
                        <th className="py-3 px-2">Đối tác</th>
                        <th className="py-3 px-2">Mã giới thiệu</th>
                        <th className="py-3 px-2">Thông tin ngân hàng</th>
                        <th className="py-3 px-2">Đơn / Clicks</th>
                        <th className="py-3 px-2">Tổng hoa hồng</th>
                        <th className="py-3 px-2">Trạng thái</th>
                        <th className="py-3 px-2 text-right">Thao tác duyệt Admin</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {affiliates.map(aff => {
                        const userInfo: { name: string; email: string; phone?: string } =
                          typeof aff.user === 'object'
                            ? aff.user
                            : { name: 'Người dùng', email: String(aff.user), phone: '' };
                        return (
                          <tr key={aff._id} className="hover:bg-zinc-50/60 transition-colors">
                            <td className="py-3.5 px-2 space-y-0.5">
                              <div className="font-extrabold text-base text-zinc-900">{userInfo.name}</div>
                              <div className="text-xs text-zinc-500">{userInfo.email}</div>
                              {userInfo.phone && <div className="text-xs font-bold text-pink-600 font-mono">{userInfo.phone}</div>}
                            </td>
                            <td className="py-3.5 px-2 font-mono text-purple-600 font-bold text-base">{aff.referralCode}</td>
                            <td className="py-3.5 px-2 text-xs text-zinc-700 font-medium">
                              {aff.bankInfo ? (
                                <div className="space-y-0.5">
                                  <span className="font-bold text-zinc-900 text-sm block">{aff.bankInfo.bankName}</span>
                                  <span className="font-mono font-bold text-zinc-800">{aff.bankInfo.bankNumber}</span>
                                  <div className="text-xs text-zinc-500">{aff.bankInfo.accountName}</div>
                                </div>
                              ) : (
                                <span className="text-zinc-400 italic">Chưa cập nhật</span>
                              )}
                            </td>
                            <td className="py-3.5 px-2 text-sm text-zinc-700">
                              <span className="font-bold text-zinc-900">{aff.totalOrder} đơn</span> / {aff.totalClick} clicks
                            </td>
                            <td className="py-3.5 px-2 font-extrabold text-base text-pink-600">{aff.totalCommission.toLocaleString('vi-VN')}đ</td>
                            <td className="py-3.5 px-2">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                                aff.status === 'Approved' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                                aff.status === 'Rejected' ? 'bg-rose-100 text-rose-800 border-rose-200' :
                                aff.status === 'Locked' ? 'bg-zinc-100 text-zinc-700 border-zinc-200' : 'bg-amber-100 text-amber-800 border-amber-200'
                              }`}>
                                {aff.status === 'Approved' ? 'Đã duyệt' :
                                 aff.status === 'Rejected' ? 'Bị từ chối' :
                                 aff.status === 'Locked' ? 'Đã khóa' : 'Chờ duyệt'}
                              </span>
                            </td>
                            <td className="py-3.5 px-2 text-right">
                              {aff.status === 'Pending' ? (
                                <div className="flex justify-end gap-2">
                                  <button
                                    onClick={() => updateAffiliateStatus(aff._id, 'Approved')}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all shadow-sm flex items-center gap-1"
                                  >
                                    <CheckCircle2 className="w-4 h-4" /> Duyệt
                                  </button>
                                  <button
                                    onClick={() => updateAffiliateStatus(aff._id, 'Rejected')}
                                    className="bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all border border-rose-200"
                                  >
                                    Từ chối
                                  </button>
                                </div>
                              ) : (
                                <div className="flex justify-end gap-2">
                                  <button
                                    onClick={() => updateAffiliateStatus(aff._id, aff.status === 'Approved' ? 'Locked' : 'Approved')}
                                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                                      aff.status === 'Approved'
                                        ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                                        : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                    }`}
                                  >
                                    {aff.status === 'Approved' ? 'Khóa tài khoản' : 'Mở khóa'}
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* CUSTOMERS MANAGEMENT */}
          {activeTab === 'customers' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold font-serif-luxury text-zinc-900">Quản lý Khách hàng</h1>
                  <p className="text-xs text-zinc-500 mt-0.5">Danh sách tất cả người dùng đăng ký hoặc đăng nhập thông qua Google / Email</p>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-3xl border border-zinc-100 p-5 shadow-sm space-y-1">
                  <div className="flex items-center justify-between text-zinc-400">
                    <span className="text-xs font-semibold">Tổng khách hàng</span>
                    <Users className="w-4 h-4 text-pink-600" />
                  </div>
                  <p className="text-2xl font-bold text-zinc-900">{customers.length}</p>
                </div>

                <div className="bg-white rounded-3xl border border-zinc-100 p-5 shadow-sm space-y-1">
                  <div className="flex items-center justify-between text-zinc-400">
                    <span className="text-xs font-semibold">Đăng nhập Google</span>
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Google</span>
                  </div>
                  <p className="text-2xl font-bold text-zinc-900">
                    {customers.filter(c => c.provider === 'google').length}
                  </p>
                </div>

                <div className="bg-white rounded-3xl border border-zinc-100 p-5 shadow-sm space-y-1">
                  <div className="flex items-center justify-between text-zinc-400">
                    <span className="text-xs font-semibold">Đăng ký Email</span>
                    <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">Email</span>
                  </div>
                  <p className="text-2xl font-bold text-zinc-900">
                    {customers.filter(c => c.provider === 'email').length}
                  </p>
                </div>

                <div className="bg-white rounded-3xl border border-zinc-100 p-5 shadow-sm space-y-1">
                  <div className="flex items-center justify-between text-zinc-400">
                    <span className="text-xs font-semibold">Tài khoản khóa</span>
                    <Lock className="w-4 h-4 text-rose-500" />
                  </div>
                  <p className="text-2xl font-bold text-zinc-900">
                    {customers.filter(c => c.status === 'locked').length}
                  </p>
                </div>
              </div>

              {/* Filters & Table */}
              <div className="bg-white rounded-3xl border border-zinc-100 p-5 space-y-4 shadow-sm">
                <div className="flex flex-col sm:flex-row gap-3 justify-between">
                  <div className="relative flex-1 max-w-md">
                    <input
                      type="text"
                      placeholder="Tìm kiếm theo tên, email, SĐT khách hàng..."
                      value={customerSearch}
                      onChange={e => setCustomerSearch(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-3.5 py-2 text-xs focus:outline-none focus:border-pink-500"
                    />
                    <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                  </div>

                  <div className="flex gap-2 text-xs">
                    <button
                      onClick={() => setCustomerProviderFilter('all')}
                      className={`px-3.5 py-2 rounded-xl font-semibold transition-all ${
                        customerProviderFilter === 'all'
                          ? 'bg-zinc-900 text-white'
                          : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                      }`}
                    >
                      Tất cả ({customers.length})
                    </button>
                    <button
                      onClick={() => setCustomerProviderFilter('google')}
                      className={`px-3.5 py-2 rounded-xl font-semibold transition-all flex items-center gap-1.5 ${
                        customerProviderFilter === 'google'
                          ? 'bg-blue-600 text-white'
                          : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                      }`}
                    >
                      Google ({customers.filter(c => c.provider === 'google').length})
                    </button>
                    <button
                      onClick={() => setCustomerProviderFilter('email')}
                      className={`px-3.5 py-2 rounded-xl font-semibold transition-all flex items-center gap-1.5 ${
                        customerProviderFilter === 'email'
                          ? 'bg-purple-600 text-white'
                          : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
                      }`}
                    >
                      Email ({customers.filter(c => c.provider === 'email').length})
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm min-w-[1050px]">
                    <thead>
                      <tr className="border-b border-zinc-200 text-zinc-500 font-bold text-xs uppercase tracking-wider">
                        <th className="py-3 px-2">Khách hàng</th>
                        <th className="py-3 px-2">Email & SĐT</th>
                        <th className="py-3 px-2">Tỉnh / Thành</th>
                        <th className="py-3 px-2">Quận / Huyện</th>
                        <th className="py-3 px-2">Địa chỉ chi tiết</th>
                        <th className="py-3 px-2">Đơn hàng / Tổng chi</th>
                        <th className="py-3 px-2">Ngày tạo</th>
                        <th className="py-3 px-2">Trạng thái</th>
                        <th className="py-3 px-2 text-right">Hành động</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {customers
                        .filter(c => {
                          const matchSearch =
                            c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
                            c.email.toLowerCase().includes(customerSearch.toLowerCase()) ||
                            c.phone.includes(customerSearch);
                          const matchProvider =
                            customerProviderFilter === 'all' || c.provider === customerProviderFilter;
                          return matchSearch && matchProvider;
                        })
                        .map(c => (
                          <tr key={c.id} className="hover:bg-zinc-50/50 transition-colors">
                            <td className="py-3.5 px-2 min-w-[180px]">
                              <div className="flex items-center gap-3">
                                <img
                                  src={c.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                                  alt={c.name}
                                  className="w-10 h-10 rounded-full object-cover border border-zinc-200 shrink-0"
                                />
                                <div className="space-y-0.5">
                                  <span className="font-extrabold text-base text-zinc-900 block">{c.name}</span>
                                  <span className="text-xs text-zinc-400 font-mono">ID: {c.id}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-2 min-w-[180px]">
                              <div className="space-y-0.5">
                                <span className="font-bold text-sm text-zinc-800 block">{c.email}</span>
                                <span className="text-xs text-pink-600 font-bold font-mono">{c.phone}</span>
                              </div>
                            </td>
                            <td className="py-3.5 px-2 text-sm text-zinc-800 font-semibold">{c.province || '—'}</td>
                            <td className="py-3.5 px-2 text-sm text-zinc-800 font-semibold">{c.district || '—'}</td>
                            <td className="py-3.5 px-2 text-xs text-zinc-700 font-medium">{c.detailAddress || '—'}</td>
                            <td className="py-3.5 px-2">
                              <span className="font-bold text-zinc-900 text-sm block">{c.orderCount} đơn</span>
                              <span className="text-xs text-pink-600 font-bold">{c.totalSpent.toLocaleString('vi-VN')}đ</span>
                            </td>
                            <td className="py-3.5 px-2 text-xs font-semibold text-zinc-500 whitespace-nowrap">{c.createdAt}</td>
                            <td className="py-3.5 px-2 whitespace-nowrap">
                              {c.status === 'active' ? (
                                <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200">
                                  Hoạt động
                                </span>
                              ) : (
                                <span className="bg-rose-50 text-rose-700 text-xs font-bold px-3 py-1 rounded-full border border-rose-200">
                                  Đã khóa
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-2 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => setEditingCustomer(c)}
                                  className="p-1.5 text-zinc-500 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-colors border border-zinc-200"
                                  title="Chỉnh sửa thông tin khách hàng"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => toggleCustomerStatus(c.id)}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                                    c.status === 'active'
                                      ? 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100'
                                      : 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'
                                  }`}
                                >
                                  {c.status === 'active' ? 'Khóa' : 'Mở khóa'}
                                </button>
                                <button
                                  onClick={() => deleteCustomer(c.id)}
                                  className="p-2 text-zinc-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                                  title="Xóa khách hàng"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Modal Chỉnh sửa Khách hàng */}
              {editingCustomer && (
                <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
                  <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200 border border-zinc-100">
                    <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                      <h3 className="text-base font-bold text-zinc-900 font-serif-luxury flex items-center gap-2">
                        <Edit className="w-4 h-4 text-amber-500" />
                        Chỉnh sửa thông tin khách hàng
                      </h3>
                      <button
                        type="button"
                        onClick={() => setEditingCustomer(null)}
                        className="p-1 text-zinc-400 hover:text-zinc-700 rounded-full font-bold"
                      >
                        ✕
                      </button>
                    </div>

                    <form onSubmit={handleSaveEditCustomer} className="space-y-4 text-xs">
                      <div>
                        <label className="font-semibold text-zinc-700 block mb-1">Họ và tên *</label>
                        <input
                          type="text"
                          required
                          value={editingCustomer.name}
                          onChange={e => setEditingCustomer({ ...editingCustomer, name: e.target.value })}
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-amber-500 font-medium"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="font-semibold text-zinc-700 block mb-1">Email (Tài khoản)</label>
                          <input
                            type="email"
                            disabled
                            value={editingCustomer.email}
                            className="w-full bg-zinc-100 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-zinc-500 cursor-not-allowed font-medium"
                          />
                        </div>
                        <div>
                          <label className="font-semibold text-zinc-700 block mb-1">Số điện thoại *</label>
                          <input
                            type="tel"
                            required
                            value={editingCustomer.phone}
                            onChange={e => setEditingCustomer({ ...editingCustomer, phone: e.target.value })}
                            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-amber-500 font-mono"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="font-semibold text-zinc-700 block mb-1">Tỉnh / Thành phố</label>
                          <input
                            type="text"
                            placeholder="Vd: Thành phố Hà Nội"
                            value={editingCustomer.province || ''}
                            onChange={e => setEditingCustomer({ ...editingCustomer, province: e.target.value })}
                            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-amber-500"
                          />
                        </div>
                        <div>
                          <label className="font-semibold text-zinc-700 block mb-1">Quận / Huyện</label>
                          <input
                            type="text"
                            placeholder="Vd: Quận Cầu Giấy"
                            value={editingCustomer.district || ''}
                            onChange={e => setEditingCustomer({ ...editingCustomer, district: e.target.value })}
                            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="font-semibold text-zinc-700 block mb-1">Địa chỉ chi tiết</label>
                        <input
                          type="text"
                          placeholder="Vd: Số 123 Đường Láng..."
                          value={editingCustomer.detailAddress || ''}
                          onChange={e => setEditingCustomer({ ...editingCustomer, detailAddress: e.target.value })}
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div className="border-t border-zinc-100 pt-3 flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingCustomer(null)}
                          className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 font-bold text-zinc-700 transition-colors"
                        >
                          Hủy
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 font-bold text-white shadow-sm transition-colors"
                        >
                          Lưu thay đổi
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* INVENTORY MANAGEMENT SYSTEM */}
          {activeTab === 'inventory' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold font-serif-luxury text-zinc-900 flex items-center gap-2">
                    <Boxes className="w-5 h-5 text-amber-500" /> Quản lý kho hàng sản phẩm
                  </h1>
                  <p className="text-xs text-zinc-500">Nhập kho, quản lý số lượng tồn kho thực tế, số lượng đã giữ chờ giao và kiểm kê toàn bộ sản phẩm</p>
                </div>

                {/* Subtab Switcher */}
                <div className="flex gap-1.5 bg-zinc-100 p-1 rounded-2xl text-xs font-bold">
                  <button
                    onClick={() => setInventorySubTab('overview')}
                    className={`px-3.5 py-2 rounded-xl transition-all ${
                      inventorySubTab === 'overview' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-900'
                    }`}
                  >
                    📦 Tồn kho & Trạng thái bán
                  </button>
                  <button
                    onClick={() => setInventorySubTab('in')}
                    className={`px-3.5 py-2 rounded-xl transition-all ${
                      inventorySubTab === 'in' ? 'bg-white text-pink-600 shadow-sm' : 'text-zinc-500 hover:text-zinc-900'
                    }`}
                  >
                    📥 Nhập kho
                  </button>
                  <button
                    onClick={() => setInventorySubTab('audit')}
                    className={`px-3.5 py-2 rounded-xl transition-all ${
                      inventorySubTab === 'audit' ? 'bg-white text-purple-600 shadow-sm' : 'text-zinc-500 hover:text-zinc-900'
                    }`}
                  >
                    📋 Kiểm kê kho hàng
                  </button>
                </div>
              </div>

              {/* Inventory Key Metrics Summary */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                <div className="bg-white rounded-3xl border border-zinc-100 p-4 shadow-sm space-y-1">
                  <span className="text-[11px] text-zinc-400 font-bold uppercase">Tổng mặt hàng</span>
                  <div className="text-xl font-bold text-zinc-900">{products.length} mã SP</div>
                  <span className="text-[10px] text-zinc-400 font-semibold">Đồng bộ từ CSDL</span>
                </div>

                <div className="bg-white rounded-3xl border border-zinc-100 p-4 shadow-sm space-y-1">
                  <span className="text-[11px] text-zinc-400 font-bold uppercase">Tổng tồn kho thực tế</span>
                  <div className="text-xl font-bold text-pink-600">
                    {products.reduce((acc, p) => acc + (p.stock || 0), 0)} sản phẩm
                  </div>
                  <span className="text-[10px] text-emerald-600 font-bold">Số lượng thực lưu kho</span>
                </div>

                <div className="bg-white rounded-3xl border border-zinc-100 p-4 shadow-sm space-y-1">
                  <span className="text-[11px] text-zinc-400 font-bold uppercase">Đã giữ / Chờ giao</span>
                  <div className="text-xl font-bold text-amber-600">
                    {products.reduce((acc, p) => acc + getReservedStockForProduct(p._id, p.name), 0)} đơn SP
                  </div>
                  <span className="text-[10px] text-amber-600 font-bold">User đã mua chưa giao</span>
                </div>

                <div className="bg-white rounded-3xl border border-zinc-100 p-4 shadow-sm space-y-1">
                  <span className="text-[11px] text-zinc-400 font-bold uppercase">Khả dụng có thể bán</span>
                  <div className="text-xl font-bold text-emerald-600">
                    {products.reduce((acc, p) => {
                      const reserved = getReservedStockForProduct(p._id, p.name);
                      const avail = (p.stock || 0) - reserved;
                      return acc + (avail > 0 ? avail : 0);
                    }, 0)} chai
                  </div>
                  <span className="text-[10px] text-emerald-600 font-bold">Sẵn sàng xuất bán</span>
                </div>

                <div className="bg-white rounded-3xl border border-zinc-100 p-4 shadow-sm space-y-1 col-span-2 lg:col-span-1">
                  <span className="text-[11px] text-zinc-400 font-bold uppercase">Hết hàng / Sắp hết</span>
                  <div className="text-xl font-bold text-rose-600">
                    {products.filter(p => (p.stock || 0) <= 5).length} mặt hàng
                  </div>
                  <span className="text-[10px] text-rose-600 font-bold">Cần ưu tiên nhập bổ sung</span>
                </div>
              </div>

              {/* SUBTAB 1: TỒN KHO & TRẠNG THÁI BÁN (OVERVIEW) */}
              {inventorySubTab === 'overview' && (
                <div className="bg-white rounded-3xl border border-zinc-100 p-5 space-y-4 shadow-sm">
                  <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
                    <div className="relative flex-1 max-w-md w-full">
                      <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={inventorySearch}
                        onChange={e => setInventorySearch(e.target.value)}
                        placeholder="Tìm theo tên sản phẩm, thương hiệu, mùi hương..."
                        className="w-full pl-9 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs focus:outline-none focus:border-pink-500 font-medium"
                      />
                    </div>
                    <button
                      onClick={() => setInventorySubTab('in')}
                      className="bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      <Plus className="w-4 h-4" /> Tạo phiếu Nhập kho mới
                    </button>
                  </div>

                  <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                    <table className="w-full text-left text-sm min-w-[1100px]">
                      <thead>
                        <tr className="border-b border-zinc-200 text-zinc-500 font-bold text-xs uppercase tracking-wider sticky top-0 bg-white z-10 shadow-2xs">
                          <th className="py-3.5 px-3">Sản phẩm & Thương hiệu</th>
                          <th className="py-3.5 px-3">Phân loại (Mùi/Nồng độ/Dung tích)</th>
                          <th className="py-3.5 px-3 text-center">Tồn kho thực tế</th>
                          <th className="py-3.5 px-3 text-center">Đã giữ (Chờ giao)</th>
                          <th className="py-3.5 px-3 text-center">Có thể bán</th>
                          <th className="py-3.5 px-3 text-center">Trạng thái Kho hàng</th>
                          <th className="py-3.5 px-3 text-right">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100">
                        {overviewProductsList
                          .filter(p => {
                            const kw = inventorySearch.toLowerCase().trim();
                            return !kw || 
                              p.name.toLowerCase().includes(kw) || 
                              p.brand.toLowerCase().includes(kw) ||
                              (p.availableScents || []).some((s: string) => s.toLowerCase().includes(kw));
                          })
                          .map(p => {
                            const reserved = getReservedStockForProduct(p._id, p.name);
                            const totalStock = p.stock || 0;
                            const available = totalStock - reserved > 0 ? totalStock - reserved : 0;
                            const scentsList = p.availableScents?.join(', ') || 'Tiêu chuẩn';
                            const volumeDisplay = (p.availableVolumes && p.availableVolumes.length > 0)
                              ? p.availableVolumes.join(' / ')
                              : (p.volume || '100ml');

                            return (
                              <tr key={p._id} className="hover:bg-zinc-50/60 transition-colors">
                                <td className="py-3.5 px-3">
                                  <div className="flex items-center gap-3">
                                    <img src={p.image} alt="" className="w-11 h-11 object-cover rounded-xl border border-zinc-200 shrink-0" />
                                    <div className="space-y-0.5">
                                      <span className="font-extrabold text-sm text-zinc-900 block line-clamp-1">{p.name}</span>
                                      <span className="text-xs font-bold text-pink-600">{p.brand}</span>
                                    </div>
                                  </div>
                                </td>

                                <td className="py-3.5 px-3 space-y-1">
                                  <div className="text-xs font-bold text-pink-700 bg-pink-50 border border-pink-200 px-2.5 py-0.5 rounded-lg w-fit">
                                    🌸 Mùi: {scentsList}
                                  </div>
                                  <div className="text-xs text-zinc-500 font-semibold flex items-center gap-2">
                                    <span>Nồng độ: <strong className="text-zinc-800">{p.concentration || 'EDP'}</strong></span>
                                    <span>Dung tích: <strong className="text-pink-700 font-bold bg-pink-50/80 px-1.5 py-0.5 rounded-md border border-pink-200/50">{volumeDisplay}</strong></span>
                                  </div>
                                </td>

                                <td className="py-3.5 px-3 text-center whitespace-nowrap">
                                  <span className="font-extrabold text-base text-zinc-900">{totalStock} chai</span>
                                </td>

                                <td className="py-3.5 px-3 text-center whitespace-nowrap">
                                  <span className="font-bold text-sm text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1 rounded-xl">
                                    {reserved} chai
                                  </span>
                                </td>

                                <td className="py-3.5 px-3 text-center whitespace-nowrap">
                                  <span className="font-extrabold text-base text-emerald-600">
                                    {available} chai
                                  </span>
                                </td>

                                <td className="py-3.5 px-3 text-center whitespace-nowrap">
                                  {available > 5 ? (
                                    <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold">
                                      🟢 Còn hàng
                                    </span>
                                  ) : available > 0 ? (
                                    <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 border border-amber-200 px-3 py-1 rounded-full text-xs font-bold">
                                      ⚠️ Sắp hết ({available})
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-800 border border-rose-200 px-3 py-1 rounded-full text-xs font-bold">
                                      🚫 Hết hàng (0)
                                    </span>
                                  )}
                                </td>

                                <td className="py-3.5 px-3 text-right whitespace-nowrap">
                                  <button
                                    onClick={() => {
                                      const matchingLogs = inventoryLogs.filter((l: any) => 
                                        (l.productId && l.productId === p._id) || 
                                        (l.productName && p.name && l.productName.trim().toLowerCase() === p.name.trim().toLowerCase())
                                      );
                                      const latestLog = matchingLogs[matchingLogs.length - 1];

                                      const allVols = Array.from(new Set([
                                        ...(p.availableVolumes || []),
                                        ...(p.volumeOptions || []).map((vo: any) => vo.volume),
                                        ...matchingLogs.map((l: any) => l.volume),
                                        p.volume
                                      ].filter(Boolean)));

                                      const defaultVariants = (allVols.length > 0 ? allVols : ['100ml']).map((vol: string, idx: number) => {
                                        const vOpt = p.volumeOptions?.find((v: any) => v.volume === vol);
                                        const logForVol = [...matchingLogs].reverse().find((l: any) => l.volume === vol);

                                        const impP = logForVol?.importPrice || (vOpt?.price ? Math.round(vOpt.price * 0.8) : '');
                                        const selP = logForVol?.sellingPrice || vOpt?.price || p.price || '';
                                        const qty = logForVol?.quantity || '';

                                        return {
                                          id: 'v_' + idx + '_' + Date.now(),
                                          volume: vol,
                                          quantity: qty as any,
                                          importPrice: impP as any,
                                          sellingPrice: selP as any
                                        };
                                      });

                                      const scentVal = (p.availableScents && p.availableScents.length > 0)
                                        ? p.availableScents.join(', ')
                                        : (latestLog?.scent || 'Hoa Hồng');

                                      setNewInventoryForm({
                                        productId: p._id,
                                        productName: p.name,
                                        brand: p.brand || 'Dior',
                                        scent: p.availableScents?.[0] || 'Hoa Hồng',
                                        concentration: p.concentration || 'EDP',
                                        image: p.image || latestLog?.image || '',
                                        note: '',
                                        variants: defaultVariants
                                      });
                                      setInventorySubTab('in');
                                    }}
                                    className="bg-zinc-100 hover:bg-pink-100 text-zinc-700 hover:text-pink-600 text-xs font-bold px-3 py-1.5 rounded-xl border border-zinc-200 transition-colors flex items-center gap-1 ml-auto"
                                  >
                                    <Plus className="w-3.5 h-3.5" /> Nhập thêm kho
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SUBTAB 2: TẠO PHIẾU & LỊCH SỬ NHẬP KHO (IN) */}
              {inventorySubTab === 'in' && (
                <div className="space-y-6">
                  {/* Stock-in Form */}
                  <div className="bg-white rounded-3xl border border-zinc-100 p-6 space-y-4 shadow-sm relative">
                    <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                      <h2 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                        <Plus className="w-4 h-4 text-pink-600" /> Tạo phiếu Nhập kho hàng mới
                      </h2>
                      {stockInSuccessMsg && (
                        <div className="bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-500/20 animate-in fade-in zoom-in duration-300">
                          <CheckCircle2 className="w-4 h-4" /> Đã nhập kho thành công
                        </div>
                      )}
                    </div>

                    <form onSubmit={handleConfirmStockIn} className="space-y-4 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="font-bold text-zinc-800 block">
                              Tên sản phẩm nước hoa <span className="text-rose-500 font-bold">*</span>
                            </label>
                            {(() => {
                              const kw = (newInventoryForm.productName || '').trim().toLowerCase();
                              if (!kw) return null;
                              const isExact = overviewProductsList.some(p => p.name.trim().toLowerCase() === kw);
                              if (!isExact) return null;

                              return (
                                <span className="bg-rose-100 border border-rose-300 text-rose-700 font-extrabold text-[11px] px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs animate-in fade-in duration-200">
                                  🚫 Sản phẩm đã có trong kho
                                </span>
                              );
                            })()}
                          </div>
                          <input
                            type="text"
                            placeholder="VD: Dior Sauvage EDP..."
                            value={newInventoryForm.productName}
                            onChange={e => {
                              setStockInSubmittedAttempt(false);
                              setNewInventoryForm({ ...newInventoryForm, productName: e.target.value });
                            }}
                            className={`w-full bg-zinc-50 border rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-none transition-colors ${
                              stockInSubmittedAttempt && !newInventoryForm.productName.trim() ? 'border-2 border-rose-500 bg-rose-50/40 shadow-xs shadow-rose-200' : 'border-zinc-200 focus:border-pink-500'
                            }`}
                          />
                        </div>

                        <div>
                          <label className="font-bold text-zinc-800 block mb-1">
                            Thương hiệu <span className="text-rose-500 font-bold">*</span>
                          </label>
                          <select
                            value={newInventoryForm.brand}
                            onChange={e => {
                              setStockInSubmittedAttempt(false);
                              setNewInventoryForm({ ...newInventoryForm, brand: e.target.value });
                            }}
                            className={`w-full bg-zinc-50 border rounded-xl px-3 py-2.5 text-xs font-medium focus:outline-none transition-colors ${
                              stockInSubmittedAttempt && !newInventoryForm.brand.trim() ? 'border-2 border-rose-500 bg-rose-50/40 shadow-xs shadow-rose-200' : 'border-zinc-200 focus:border-pink-500'
                            }`}
                          >
                            {brands.map(b => (
                              <option key={b} value={b}>{b}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="font-bold text-zinc-800 block mb-1">
                            Mùi hương chính <span className="text-rose-500 font-bold">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="VD: Hoa Hồng, Gỗ Tuyết Tùng..."
                            value={newInventoryForm.scent}
                            onChange={e => {
                              setStockInSubmittedAttempt(false);
                              setNewInventoryForm({ ...newInventoryForm, scent: e.target.value });
                            }}
                            className={`w-full bg-zinc-50 border rounded-xl px-3.5 py-2.5 text-xs focus:outline-none transition-colors ${
                              stockInSubmittedAttempt && !newInventoryForm.scent.trim() ? 'border-2 border-rose-500 bg-rose-50/40 shadow-xs shadow-rose-200' : 'border-zinc-200 focus:border-pink-500'
                            }`}
                          />
                        </div>

                        <div>
                          <label className="font-bold text-zinc-800 block mb-1">
                            Nồng độ nước hoa <span className="text-zinc-400 font-normal">(Không bắt buộc)</span>
                          </label>
                          <input
                            type="text"
                            placeholder="VD: EDP, EDT, Parfum, Extrait..."
                            value={newInventoryForm.concentration}
                            onChange={e => setNewInventoryForm({ ...newInventoryForm, concentration: e.target.value })}
                            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-pink-500"
                          />
                        </div>
                      </div>

                      {/* Image Picker Block */}
                      <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-3">
                        <label className="font-extrabold text-zinc-900 block text-xs flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <ImageIcon className="w-4 h-4 text-pink-600" /> Hình ảnh sản phẩm nước hoa <span className="text-zinc-400 font-normal">(Tải ảnh từ máy, dán URL hoặc chọn mẫu)</span>
                          </span>
                          {newInventoryForm.image && (
                            <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Đã chọn ảnh
                            </span>
                          )}
                        </label>

                        <div className="flex flex-col sm:flex-row gap-4 items-start">
                          {/* Image Preview Box */}
                          <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-dashed border-zinc-300 bg-white shrink-0 flex items-center justify-center group shadow-2xs">
                            {newInventoryForm.image ? (
                              <>
                                <img src={newInventoryForm.image} alt="Preview" className="w-full h-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => setNewInventoryForm({ ...newInventoryForm, image: '' })}
                                  className="absolute top-1 right-1 bg-rose-600 text-white p-1 rounded-full opacity-90 hover:opacity-100 transition-opacity shadow-sm"
                                  title="Xóa ảnh"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </>
                            ) : (
                              <div className="text-center p-2 text-zinc-400">
                                <ImageIcon className="w-6 h-6 mx-auto mb-1 opacity-50 text-pink-600" />
                                <span className="text-[10px] block font-bold text-zinc-500">Chưa có ảnh</span>
                              </div>
                            )}
                          </div>

                          {/* Upload / URL / Sample Gallery */}
                          <div className="flex-1 space-y-2.5 w-full">
                            <div className="flex flex-wrap items-center gap-2">
                              <label className="bg-white border border-zinc-300 hover:border-pink-500 hover:text-pink-600 text-zinc-800 font-bold px-3.5 py-2 rounded-xl text-xs cursor-pointer transition-colors shadow-2xs flex items-center gap-1.5">
                                <Upload className="w-3.5 h-3.5 text-pink-600" />
                                <span>Tải ảnh từ máy tính</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={e => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    if (!file.type.startsWith('image/')) {
                                      showToast('Vui lòng chọn file hình ảnh hợp lệ', 'error');
                                      return;
                                    }
                                    const reader = new FileReader();
                                    reader.onload = (ev) => {
                                      if (ev.target?.result) {
                                        setNewInventoryForm(prev => ({ ...prev, image: ev.target!.result as string }));
                                        showToast('Đã tải ảnh từ máy tính thành công!', 'success');
                                      }
                                    };
                                    reader.readAsDataURL(file);
                                  }}
                                />
                              </label>

                              <span className="text-[11px] text-zinc-400 font-bold">HOẶC dán đường dẫn link ảnh:</span>
                            </div>

                            <input
                              type="text"
                              placeholder="Dán link ảnh tại đây (VD: https://images.unsplash.com/photo-...)"
                              value={newInventoryForm.image}
                              onChange={e => setNewInventoryForm({ ...newInventoryForm, image: e.target.value })}
                              className="w-full bg-white border border-zinc-200 rounded-xl px-3.5 py-2 text-xs font-medium focus:outline-none focus:border-pink-500"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Dynamic Volume Variants Block */}
                      <div className="bg-pink-50/40 border border-pink-200/80 rounded-2xl p-4 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-pink-200/60 pb-2">
                          <label className="font-extrabold text-xs text-zinc-900 flex items-center gap-1.5">
                            <Boxes className="w-4 h-4 text-pink-600" /> Danh sách Dung tích, Số lượng nhập, Giá nhập & Giá bán
                          </label>
                          <button
                            type="button"
                            onClick={handleAddVolumeVariant}
                            className="bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5 uppercase tracking-wider"
                          >
                            <Plus className="w-3.5 h-3.5" /> Thêm dung tích mới (+)
                          </button>
                        </div>

                        <div className="space-y-3">
                          {newInventoryForm.variants.map((variant, index) => (
                            <div key={variant.id} className="bg-white border border-zinc-200 rounded-xl p-3 shadow-2xs space-y-2 relative">
                              <div className="flex items-center justify-between text-xs font-bold text-pink-700">
                                <span>Dung tích #{index + 1}</span>
                                {newInventoryForm.variants.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveVolumeVariant(variant.id)}
                                    className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 px-2 py-0.5 rounded-lg transition-colors flex items-center gap-1 text-[11px]"
                                    title="Xóa dung tích này"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" /> Xóa dòng
                                  </button>
                                )}
                              </div>

                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <div>
                                  <label className="font-bold text-zinc-800 block mb-1 text-[11px]">
                                    Dung tích <span className="text-rose-500 font-bold">*</span>
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="VD: 100ml, 50ml..."
                                    value={variant.volume}
                                    onChange={e => handleVariantChange(variant.id, 'volume', e.target.value)}
                                    className={`w-full bg-zinc-50 border rounded-xl px-3 py-2 text-xs focus:outline-none transition-colors ${
                                      stockInSubmittedAttempt && !variant.volume.trim() ? 'border-2 border-rose-500 bg-rose-50/40 shadow-xs shadow-rose-200' : 'border-zinc-200 focus:border-pink-500'
                                    }`}
                                  />
                                </div>

                                <div>
                                  <label className="font-bold text-zinc-800 block mb-1 text-[11px]">
                                    Số lượng nhập <span className="text-rose-500 font-bold">*</span>
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="VD: 20"
                                    value={formatNumberWithDots(variant.quantity)}
                                    onChange={e => {
                                      const clean = e.target.value.replace(/\D/g, '');
                                      handleVariantChange(variant.id, 'quantity', clean ? Number(clean) : '');
                                    }}
                                    className={`w-full bg-zinc-50 border rounded-xl px-3 py-2 text-xs font-bold text-pink-600 focus:outline-none font-mono transition-colors ${
                                      stockInSubmittedAttempt && (!variant.quantity || Number(variant.quantity) <= 0) ? 'border-2 border-rose-500 bg-rose-50/40 shadow-xs shadow-rose-200' : 'border-zinc-200 focus:border-pink-500'
                                    }`}
                                  />
                                </div>

                                <div>
                                  <label className="font-bold text-zinc-800 block mb-1 text-[11px]">
                                    Giá nhập (VND) <span className="text-rose-500 font-bold">*</span>
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="VD: 1.810.000"
                                    value={formatNumberWithDots(variant.importPrice)}
                                    onChange={e => {
                                      const clean = e.target.value.replace(/\D/g, '');
                                      handleVariantChange(variant.id, 'importPrice', clean ? Number(clean) : '');
                                    }}
                                    className={`w-full bg-zinc-50 border rounded-xl px-3 py-2 text-xs font-bold text-zinc-900 focus:outline-none font-mono transition-colors ${
                                      stockInSubmittedAttempt && (!variant.importPrice || Number(variant.importPrice) <= 0) ? 'border-2 border-rose-500 bg-rose-50/40 shadow-xs shadow-rose-200' : 'border-zinc-200 focus:border-pink-500'
                                    }`}
                                  />
                                </div>

                                <div>
                                  <label className="font-bold text-emerald-700 block mb-1 text-[11px]">
                                    Giá bán (VND) <span className="text-rose-500 font-bold">*</span>
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="VD: 2.250.000"
                                    value={formatNumberWithDots(variant.sellingPrice)}
                                    onChange={e => {
                                      const clean = e.target.value.replace(/\D/g, '');
                                      handleVariantChange(variant.id, 'sellingPrice', clean ? Number(clean) : '');
                                    }}
                                    className={`w-full bg-emerald-50/60 border border-emerald-300 rounded-xl px-3 py-2 text-xs font-extrabold text-emerald-700 focus:outline-none focus:border-emerald-500 font-mono transition-colors`}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="font-bold text-zinc-800 block mb-1">
                          Ghi chú phiếu nhập kho <span className="text-rose-500 font-bold">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="VD: Nhập hàng mới từ nhà phân phối Pháp, hàng chính hãng nguyên seal..."
                          value={newInventoryForm.note}
                          onChange={e => {
                            setStockInSubmittedAttempt(false);
                            setNewInventoryForm({ ...newInventoryForm, note: e.target.value });
                          }}
                          className={`w-full bg-zinc-50 border rounded-xl px-4 py-2 text-xs focus:outline-none transition-colors ${
                            stockInSubmittedAttempt && !newInventoryForm.note.trim() ? 'border-2 border-rose-500 bg-rose-50/40 shadow-xs shadow-rose-200' : 'border-zinc-200 focus:border-pink-500'
                          }`}
                        />
                      </div>

                      {(() => {
                        const kw = (newInventoryForm.productName || '').trim().toLowerCase();
                        const isExactDuplicate = !!kw && overviewProductsList.some(p => p.name.trim().toLowerCase() === kw);

                        return (
                          <div className="flex justify-end pt-2">
                            <button
                              type="submit"
                              disabled={isExactDuplicate}
                              className={`text-xs font-bold px-6 py-3 rounded-xl transition-all flex items-center gap-1.5 uppercase tracking-wider ${
                                isExactDuplicate
                                  ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed border border-zinc-300 shadow-none hover:bg-zinc-200'
                                  : 'bg-pink-600 hover:bg-pink-700 text-white shadow-md shadow-pink-500/20'
                              }`}
                              title={isExactDuplicate ? 'Không thể bấm vì sản phẩm đã có trong kho' : 'Bấm để xác nhận nhập kho'}
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              Xác nhận Nhập kho ngay
                            </button>
                          </div>
                        );
                      })()}
                    </form>
                  </div>

                  {/* Stock-in Log Table */}
                  <div className="bg-white rounded-3xl border border-zinc-100 p-5 space-y-4 shadow-sm">
                    <h3 className="text-sm font-bold text-zinc-900">Lịch sử các đợt Nhập kho ({inventoryLogs.length} phiếu)</h3>

                    <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                      <table className="w-full text-left text-sm min-w-[1000px]">
                        <thead>
                          <tr className="border-b border-zinc-200 text-zinc-500 font-bold text-xs uppercase tracking-wider sticky top-0 bg-white z-10 shadow-2xs">
                            <th className="py-3 px-3">Mã phiếu</th>
                            <th className="py-3 px-3">Thời gian nhập</th>
                            <th className="py-3 px-3">Tên sản phẩm & Dung tích</th>
                            <th className="py-3 px-3">Thương hiệu & Mùi</th>
                            <th className="py-3 px-3 text-center">Số lượng nhập</th>
                            <th className="py-3 px-3 text-right">Giá nhập</th>
                            <th className="py-3 px-3 text-right text-emerald-700">Giá bán dự kiến</th>
                            <th className="py-3 px-3">Ghi chú</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                          {inventoryLogs.map((log: any) => (
                            <tr key={log.id} className="hover:bg-zinc-50/60 transition-colors">
                              <td className="py-3.5 px-3 font-mono font-bold text-xs text-pink-600">{log.id}</td>
                              <td className="py-3.5 px-3 font-mono text-xs text-zinc-700 whitespace-nowrap">{log.date}</td>
                              <td className="py-3.5 px-3">
                                <div className="font-extrabold text-sm text-zinc-900">{log.productName}</div>
                                {log.volume && <div className="text-xs font-bold text-zinc-500">Dung tích: {log.volume}</div>}
                              </td>
                              <td className="py-3.5 px-3">
                                <div className="font-bold text-xs text-zinc-800">{log.brand} ({log.concentration || 'EDP'})</div>
                                <div className="text-xs text-pink-700 font-semibold">🌸 {log.scent}</div>
                              </td>
                              <td className="py-3.5 px-3 text-center whitespace-nowrap">
                                <span className="font-extrabold text-base text-pink-600 bg-pink-50 border border-pink-200 px-3 py-1 rounded-xl">
                                  +{log.quantity} chai
                                </span>
                              </td>
                              <td className="py-3.5 px-3 text-right font-extrabold text-sm text-zinc-900 whitespace-nowrap">
                                {(log.importPrice || 0).toLocaleString('vi-VN')}đ
                              </td>
                              <td className="py-3.5 px-3 text-right font-extrabold text-sm text-emerald-600 whitespace-nowrap">
                                {(log.sellingPrice || Math.round((log.importPrice || 0) * 1.25)).toLocaleString('vi-VN')}đ
                              </td>
                              <td className="py-3.5 px-3 text-xs text-zinc-500 font-medium italic">{log.note}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* SUBTAB 3: KIỂM KÊ KHO HÀNG (AUDIT) */}
              {inventorySubTab === 'audit' && (
                <div className="bg-white rounded-3xl border border-zinc-100 p-5 space-y-4 shadow-sm">
                  <div className="flex justify-between items-center pb-2 border-b border-zinc-100">
                    <h2 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-purple-600" /> Bảng Kiểm kê tổng thể kho hàng ({products.length} mã mặt hàng)
                    </h2>
                    <button
                      onClick={() => showToast('Xuất báo cáo kiểm kê kho thành công!', 'success')}
                      className="bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" /> Xuất file báo cáo
                    </button>
                  </div>

                  <div className="overflow-x-auto max-h-[650px] overflow-y-auto">
                    <table className="w-full text-left text-sm min-w-[1100px]">
                      <thead>
                        <tr className="border-b border-zinc-200 text-zinc-500 font-bold text-xs uppercase tracking-wider sticky top-0 bg-white z-10 shadow-2xs">
                          <th className="py-3.5 px-3">Mã SKU / ID</th>
                          <th className="py-3.5 px-3">Sản phẩm</th>
                          <th className="py-3.5 px-3">Thương hiệu</th>
                          <th className="py-3.5 px-3">Nồng độ & Mùi hương</th>
                          <th className="py-3.5 px-3 text-center">Tồn kho thực tế</th>
                          <th className="py-3.5 px-3 text-center">Đang giữ</th>
                          <th className="py-3.5 px-3 text-center">Khả dụng</th>
                          <th className="py-3.5 px-3 text-center">Trạng thái kho</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100">
                        {[...products].sort((a, b) => {
                          const getRecency = (p: any) => {
                            const logIdx = inventoryLogs.findIndex((l: any) => 
                              (l.productId && (l.productId === p._id || l.productId === p.id)) || 
                              (l.productName && p.name && l.productName.trim().toLowerCase() === p.name.trim().toLowerCase())
                            );
                            if (logIdx >= 0) return logIdx;
                            const prodIdx = products.findIndex(item => item._id === p._id || item.name?.toLowerCase() === p.name?.toLowerCase());
                            return prodIdx >= 0 ? 10000 + prodIdx : 99999;
                          };
                          return getRecency(a) - getRecency(b);
                        }).map(p => {
                          const reserved = getReservedStockForProduct(p._id, p.name);
                          const totalStock = p.stock || 0;
                          const available = totalStock - reserved > 0 ? totalStock - reserved : 0;

                          return (
                            <tr key={p._id} className="hover:bg-zinc-50/60 transition-colors">
                              <td className="py-3.5 px-3 font-mono font-bold text-xs text-zinc-500">{p._id}</td>
                              <td className="py-3.5 px-3 font-extrabold text-sm text-zinc-900">{p.name}</td>
                              <td className="py-3.5 px-3 font-bold text-xs text-zinc-800">{p.brand}</td>
                              <td className="py-3.5 px-3 text-xs text-zinc-600">
                                <span className="font-bold text-zinc-900">{p.concentration || 'EDP'}</span> — 🌸 {p.availableScents?.join(', ') || 'Tiêu chuẩn'}
                              </td>
                              <td className="py-3.5 px-3 text-center font-extrabold text-sm text-zinc-900">{totalStock} chai</td>
                              <td className="py-3.5 px-3 text-center font-bold text-xs text-amber-600">{reserved} chai</td>
                              <td className="py-3.5 px-3 text-center font-extrabold text-sm text-emerald-600">{available} chai</td>
                              <td className="py-3.5 px-3 text-center whitespace-nowrap">
                                {available > 5 ? (
                                  <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200">
                                    Đủ kho
                                  </span>
                                ) : available > 0 ? (
                                  <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-bold border border-amber-200">
                                    Cần nhập
                                  </span>
                                ) : (
                                  <span className="bg-rose-100 text-rose-800 px-3 py-1 rounded-full text-xs font-bold border border-rose-200">
                                    Hết hàng
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 5. SYSTEM AUDIT LOGS matching SRS FR35 */}
          {activeTab === 'system' && (
            <div className="space-y-6">
              <h1 className="text-xl font-bold font-serif-luxury text-zinc-900">Nhật ký hoạt động hệ thống (Audit Log)</h1>

              <div className="bg-white rounded-3xl border border-zinc-100 p-5 space-y-4 shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm min-w-[850px]">
                    <thead>
                      <tr className="border-b border-zinc-200 text-zinc-500 font-bold text-xs uppercase tracking-wider">
                        <th className="py-3 px-2">Quản trị viên</th>
                        <th className="py-3 px-2">Phân mục</th>
                        <th className="py-3 px-2">Hành động & Chi tiết</th>
                        <th className="py-3 px-2 text-right">Thời gian</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {auditLogs.map(log => (
                        <tr key={log.id} className="hover:bg-zinc-50/60 transition-colors">
                          <td className="py-3.5 px-2 font-extrabold text-zinc-900 text-sm whitespace-nowrap">{log.admin}</td>
                          <td className="py-3.5 px-2 font-bold text-pink-600 text-xs whitespace-nowrap">
                            <span className="bg-pink-50 border border-pink-100 px-2.5 py-1 rounded-lg">[{log.module}]</span>
                          </td>
                          <td className="py-3.5 px-2 text-sm text-zinc-800 font-medium">
                            <span className="font-bold text-zinc-900">{log.action}</span>: {log.details}
                          </td>
                          <td className="py-3.5 px-2 text-right font-mono text-xs font-semibold text-zinc-500 whitespace-nowrap">{log.time}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 6. REVIEWS MANAGEMENT TAB */}
          {activeTab === 'reviews' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold font-serif-luxury text-zinc-900 flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-500 fill-current" /> Quản lý đánh giá sản phẩm
                  </h1>
                  <p className="text-xs text-zinc-500">Xem toàn bộ nhận xét của người mua và phản hồi trực tiếp từ cửa hàng</p>
                </div>
                <span className="text-xs text-zinc-500 bg-zinc-100 px-3.5 py-1.5 rounded-full font-bold shadow-2xs">
                  {Object.values(productReviews).flat().length} đánh giá
                </span>
              </div>

              {/* Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="text"
                    value={reviewSearch}
                    onChange={e => setReviewSearch(e.target.value)}
                    placeholder="Tìm theo tên khách hàng, email, sản phẩm, mùi hương, nội dung..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none focus:border-pink-500 shadow-2xs"
                  />
                </div>
                <select
                  value={reviewFilter}
                  onChange={e => setReviewFilter(e.target.value as any)}
                  className="bg-white border border-zinc-200 rounded-xl px-4 py-2.5 text-sm font-bold text-zinc-700 focus:outline-none focus:border-pink-500 shadow-2xs"
                >
                  <option value="all">Tất cả đánh giá</option>
                  <option value="unreplied">Chưa phản hồi</option>
                  <option value="replied">Đã phản hồi</option>
                </select>
              </div>

              {/* Reviews Table Card with Scroll */}
              <div className="bg-white rounded-3xl border border-zinc-100 p-5 space-y-4 shadow-sm">
                <div className="overflow-x-auto max-h-[650px] overflow-y-auto">
                  <table className="w-full text-left text-sm min-w-[1150px]">
                    <thead>
                      <tr className="border-b border-zinc-200 text-zinc-500 font-bold text-xs uppercase tracking-wider sticky top-0 bg-white z-10 shadow-2xs">
                        <th className="py-3.5 px-3">Khách hàng & Email</th>
                        <th className="py-3.5 px-3">Sản phẩm & Thông tin mua</th>
                        <th className="py-3.5 px-3 text-center">Đánh giá</th>
                        <th className="py-3.5 px-3">Nội dung nhận xét</th>
                        <th className="py-3.5 px-3 text-center">Ngày giờ đánh giá</th>
                        <th className="py-3.5 px-3">Nội dung phản hồi của Admin</th>
                        <th className="py-3.5 px-3 text-right">Hành động</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {(() => {
                        const allReviews = Object.entries(productReviews).flatMap(([productId, reviews]) =>
                          reviews.map((rev: any) => {
                            const foundProduct = products.find(p => p._id === productId || p.slug === productId || p.name.toLowerCase() === (rev.productName || '').toLowerCase());
                            const userOrder = orders.find(o => 
                              (o.customerEmail && rev.userEmail && o.customerEmail.toLowerCase() === rev.userEmail.toLowerCase()) ||
                              (o.customerName && rev.userName && o.customerName.toLowerCase() === rev.userName.toLowerCase())
                            );
                            const purchasedItem = userOrder?.items?.find(it => {
                              const pId = typeof it.product === 'string' ? it.product : (it.product?._id || (it.product as any)?.id);
                              return pId === productId || it.name?.toLowerCase() === (foundProduct?.name || rev.productName || '').toLowerCase();
                            });

                            const scent = purchasedItem?.scent || rev.scent || (foundProduct?.availableScents ? foundProduct.availableScents[0] : undefined);
                            const volume = purchasedItem?.volume || rev.volume || foundProduct?.volume || '100ml';
                            const itemPrice = purchasedItem ? (purchasedItem.price * purchasedItem.quantity) : (userOrder?.totalAmount || foundProduct?.price || 0);

                            return {
                              ...rev,
                              productId,
                              productName: foundProduct?.name || rev.productName || productId,
                              productImage: foundProduct?.image || '',
                              scent,
                              volume,
                              itemPrice,
                              userPhone: userOrder?.customerPhone || ''
                            };
                          })
                        );

                        const filtered = allReviews.filter(rev => {
                          const matchSearch = !reviewSearch || 
                            (rev.userName || '').toLowerCase().includes(reviewSearch.toLowerCase()) ||
                            (rev.userEmail || '').toLowerCase().includes(reviewSearch.toLowerCase()) ||
                            (rev.productName || '').toLowerCase().includes(reviewSearch.toLowerCase()) ||
                            (rev.scent || '').toLowerCase().includes(reviewSearch.toLowerCase()) ||
                            (rev.comment || '').toLowerCase().includes(reviewSearch.toLowerCase());
                          
                          const matchFilter = reviewFilter === 'all' ||
                            (reviewFilter === 'replied' && rev.adminReply) ||
                            (reviewFilter === 'unreplied' && !rev.adminReply);
                          
                          return matchSearch && matchFilter;
                        });

                        if (filtered.length === 0) {
                          return (
                            <tr>
                              <td colSpan={7} className="text-center py-12 text-zinc-400 text-xs font-semibold">
                                <Star className="w-8 h-8 mx-auto text-zinc-300 mb-2" />
                                Không tìm thấy đánh giá nào phù hợp.
                              </td>
                            </tr>
                          );
                        }

                        return filtered.map((rev: any, idx: number) => (
                          <React.Fragment key={rev.id || idx}>
                            <tr className={`hover:bg-zinc-50/60 transition-colors ${rev.adminReply ? 'bg-emerald-50/20' : ''}`}>
                              {/* 1. Khách hàng */}
                              <td className="py-3.5 px-3 space-y-0.5 min-w-[180px]">
                                <div className="font-extrabold text-base text-zinc-900">{rev.userName || 'Ẩn danh'}</div>
                                <div className="font-bold text-xs text-pink-600 font-mono">{rev.userEmail || 'Chưa cập nhật email'}</div>
                                {rev.userPhone && <div className="text-xs text-zinc-500 font-mono">SĐT: {rev.userPhone}</div>}
                              </td>

                              {/* 2. Sản phẩm & Thông tin mua */}
                              <td className="py-3.5 px-3 space-y-1 min-w-[240px]">
                                <div className="font-extrabold text-sm text-zinc-900 line-clamp-1">{rev.productName}</div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {rev.scent && (
                                    <span className="text-xs text-pink-700 bg-pink-50 border border-pink-200 px-2 py-0.5 rounded-lg font-black shadow-2xs">
                                      🌸 Mùi: {rev.scent}
                                    </span>
                                  )}
                                  {rev.volume && (
                                    <span className="text-xs text-zinc-500 font-semibold">({rev.volume})</span>
                                  )}
                                </div>
                                <div className="text-xs font-black text-pink-600 bg-pink-50 border border-pink-200 px-2.5 py-1 rounded-xl w-fit shadow-2xs">
                                  Tổng tiền: {(rev.itemPrice || 0).toLocaleString('vi-VN')}đ
                                </div>
                              </td>

                              {/* 3. Đánh giá */}
                              <td className="py-3.5 px-3 text-center whitespace-nowrap min-w-[120px]">
                                <div className="flex items-center justify-center gap-0.5 text-amber-400">
                                  {[1, 2, 3, 4, 5].map(i => (
                                    <Star key={i} className={`w-3.5 h-3.5 ${i <= rev.rating ? 'fill-current text-amber-400' : 'text-zinc-200'}`} />
                                  ))}
                                </div>
                                <span className="text-xs font-extrabold text-amber-600 block mt-0.5">{rev.rating} / 5 sao</span>
                              </td>

                              {/* 4. Nội dung nhận xét */}
                              <td className="py-3.5 px-3 min-w-[220px]">
                                <p className="text-xs text-zinc-800 font-medium leading-relaxed line-clamp-3">
                                  {rev.comment}
                                </p>
                              </td>

                              {/* 5. Ngày giờ đánh giá */}
                              <td className="py-3.5 px-3 text-center whitespace-nowrap min-w-[130px]">
                                <span className="font-mono text-xs font-semibold text-zinc-700 block">
                                  {rev.createdTime || rev.date || 'N/A'}
                                </span>
                              </td>

                              {/* 6. Nội dung phản hồi của Admin */}
                              <td className="py-3.5 px-3 min-w-[220px]">
                                {rev.adminReply ? (
                                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-1">
                                    <div className="flex items-center justify-between text-[10px] font-bold text-emerald-800">
                                      <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-600" /> Phản hồi từ Luxora</span>
                                      <span className="text-[9px] text-emerald-600 font-mono">{rev.adminReplyDate}</span>
                                    </div>
                                    <p className="text-xs font-medium text-emerald-950 leading-snug line-clamp-2">{rev.adminReply}</p>
                                  </div>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-xl text-xs font-bold shadow-2xs">
                                    <MessageSquare className="w-3.5 h-3.5" /> Chưa phản hồi
                                  </span>
                                )}
                              </td>

                              {/* 7. Hành động */}
                              <td className="py-3.5 px-3 text-right whitespace-nowrap min-w-[130px]">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => setSelectedReviewModal(rev)}
                                    className="p-1.5 rounded-xl bg-zinc-100 hover:bg-pink-100 text-zinc-600 hover:text-pink-600 transition-colors border border-zinc-200"
                                    title="Xem chi tiết nhận xét"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (replyingReviewId === rev.id) {
                                        setReplyingReviewId(null);
                                        setReplyText('');
                                      } else {
                                        setReplyingReviewId(rev.id);
                                        setReplyText(rev.adminReply || '');
                                      }
                                    }}
                                    className={`p-1.5 rounded-xl transition-colors border ${
                                      replyingReviewId === rev.id
                                        ? 'bg-pink-600 text-white border-pink-600'
                                        : 'bg-zinc-100 text-zinc-600 hover:bg-pink-100 hover:text-pink-600 border-zinc-200'
                                    }`}
                                    title={rev.adminReply ? 'Sửa phản hồi' : 'Viết phản hồi'}
                                  >
                                    <MessageSquare className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (confirm('Xóa đánh giá này?')) {
                                        deleteProductReview(rev.productId);
                                        showToast('Đã xóa đánh giá', 'info');
                                      }
                                    }}
                                    className="p-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors border border-rose-200"
                                    title="Xóa đánh giá"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>

                            {/* Admin Reply Inline Editor */}
                            {replyingReviewId === rev.id && (
                              <tr className="bg-pink-50/30">
                                <td colSpan={7} className="py-4 px-4">
                                  <div className="flex items-start gap-3">
                                    <div className="w-9 h-9 rounded-full bg-amber-400 text-zinc-950 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-sm font-serif-luxury">
                                      LX
                                    </div>
                                    <div className="flex-1 space-y-2">
                                      <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">
                                        Soạn thảo phản hồi cho khách hàng {rev.userName}:
                                      </label>
                                      <textarea
                                        rows={3}
                                        value={replyText}
                                        onChange={e => setReplyText(e.target.value)}
                                        placeholder="Cảm ơn bạn đã tin tưởng và ủng hộ sản phẩm của Luxora Shop..."
                                        className="w-full bg-white border border-pink-200 rounded-2xl p-3 text-xs focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
                                      />
                                      <div className="flex justify-end gap-2">
                                        <button
                                          onClick={() => {
                                            setReplyingReviewId(null);
                                            setReplyText('');
                                          }}
                                          className="bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold px-4 py-2 rounded-xl transition-all"
                                        >
                                          Hủy
                                        </button>
                                        <button
                                          onClick={() => {
                                            if (!replyText.trim()) {
                                              showToast('Vui lòng nhập nội dung phản hồi', 'error');
                                              return;
                                            }
                                            addAdminReply(rev.productId, rev.id, replyText.trim());
                                            setReplyingReviewId(null);
                                            setReplyText('');
                                          }}
                                          className="bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold px-5 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
                                        >
                                          <Send className="w-3.5 h-3.5" /> Gửi phản hồi ngay
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>


      {/* VOUCHER CREATE MODAL */}
      {showVoucherModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
              <h3 className="text-base font-bold text-zinc-900 font-serif-luxury">Tạo mã Voucher khuyến mãi mới</h3>
              <button onClick={() => setShowVoucherModal(false)} className="text-zinc-400 hover:text-zinc-800">✕</button>
            </div>

            <form onSubmit={handleSaveVoucher} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-zinc-700 block mb-1">Mã Voucher (viết hoa, không cách) *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: LUXORA50K, FREESHIP"
                  value={newVoucherForm.code}
                  onChange={e => setNewVoucherForm({ ...newVoucherForm, code: e.target.value })}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2 focus:outline-none focus:border-pink-500 uppercase font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-zinc-700 block mb-1">Tên chương trình khuyến mãi</label>
                <input
                  type="text"
                  placeholder="VD: Giảm 50K cho đơn hàng đầu tiên"
                  value={newVoucherForm.name}
                  onChange={e => setNewVoucherForm({ ...newVoucherForm, name: e.target.value })}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2 focus:outline-none focus:border-pink-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-zinc-700 block mb-1">Loại giảm giá</label>
                  <select
                    value={newVoucherForm.discountType}
                    onChange={e => setNewVoucherForm({ ...newVoucherForm, discountType: e.target.value as any })}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-2 py-2 focus:outline-none focus:border-pink-500"
                  >
                    <option value="fixed">Số tiền cố định (VND)</option>
                    <option value="percent">Phần trăm (%)</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-zinc-700 block mb-1">Mức giảm</label>
                  <input
                    type="number"
                    required
                    value={newVoucherForm.discountValue}
                    onChange={e => setNewVoucherForm({ ...newVoucherForm, discountValue: Number(e.target.value) })}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2 focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-zinc-700 block mb-1">Đơn hàng tối thiểu (VND)</label>
                  <input
                    type="number"
                    value={newVoucherForm.minOrderValue}
                    onChange={e => setNewVoucherForm({ ...newVoucherForm, minOrderValue: Number(e.target.value) })}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2 focus:outline-none focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-zinc-700 block mb-1">Số lượng phát hành</label>
                  <input
                    type="number"
                    value={newVoucherForm.quantity}
                    onChange={e => setNewVoucherForm({ ...newVoucherForm, quantity: Number(e.target.value) })}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2 focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-600 text-zinc-950 text-xs font-bold py-3 rounded-full transition-all shadow-md uppercase mt-2"
              >
                Tạo Voucher ngay
              </button>
            </form>
          </div>
        </div>
      )}

      {/* REVIEW DETAIL POPUP MODAL */}
      {selectedReviewModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 border border-zinc-100">
            <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
              <h3 className="text-base font-bold text-zinc-900 font-serif-luxury flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500 fill-current" /> Chi tiết nhận xét & Đánh giá từ khách hàng
              </h3>
              <button onClick={() => setSelectedReviewModal(null)} className="text-zinc-400 hover:text-zinc-800 text-lg font-bold">✕</button>
            </div>

            {/* Customer & Purchase Info */}
            <div className="bg-zinc-50 border border-zinc-200/80 rounded-2xl p-4 space-y-2 text-xs">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] uppercase font-bold text-zinc-400">Khách hàng:</span>
                  <p className="font-extrabold text-base text-zinc-900">{selectedReviewModal.userName}</p>
                  <p className="text-pink-600 font-mono font-bold">{selectedReviewModal.userEmail}</p>
                  {selectedReviewModal.userPhone && (
                    <p className="text-zinc-500 font-mono font-semibold">SĐT: {selectedReviewModal.userPhone}</p>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-zinc-400">Thời gian đánh giá:</span>
                  <p className="font-mono font-bold text-zinc-700 text-xs">{selectedReviewModal.createdTime || selectedReviewModal.date}</p>
                </div>
              </div>

              <div className="pt-2.5 border-t border-zinc-200 space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-zinc-400">Sản phẩm khách đã mua:</span>
                <p className="font-extrabold text-sm text-zinc-900">{selectedReviewModal.productName}</p>
                <div className="flex items-center gap-2 flex-wrap pt-0.5">
                  {selectedReviewModal.scent && (
                    <span className="text-xs text-pink-700 bg-pink-50 border border-pink-200 px-2.5 py-0.5 rounded-lg font-black shadow-2xs">
                      🌸 Mùi hương: {selectedReviewModal.scent}
                    </span>
                  )}
                  {selectedReviewModal.volume && (
                    <span className="text-xs text-zinc-600 font-bold">Dung tích: {selectedReviewModal.volume}</span>
                  )}
                  <span className="text-xs font-black text-pink-600 bg-pink-50 border border-pink-200 px-3 py-1 rounded-xl ml-auto shadow-2xs">
                    Tổng tiền: {(selectedReviewModal.itemPrice || 0).toLocaleString('vi-VN')}đ
                  </span>
                </div>
              </div>
            </div>

            {/* Review Content */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Mức độ hài lòng:</span>
                <div className="flex items-center gap-1 text-amber-400">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star key={i} className={`w-4 h-4 ${i <= selectedReviewModal.rating ? 'fill-current text-amber-400' : 'text-zinc-200'}`} />
                  ))}
                  <span className="text-xs font-black text-amber-600 ml-1">{selectedReviewModal.rating} / 5 sao</span>
                </div>
              </div>

              <div className="bg-pink-50/40 border border-pink-100 rounded-2xl p-4 space-y-1">
                <span className="text-[10px] uppercase font-bold text-pink-600">Nội dung nhận xét chi tiết:</span>
                <p className="text-xs text-zinc-800 leading-relaxed font-medium whitespace-pre-wrap">{selectedReviewModal.comment}</p>
              </div>
            </div>

            {/* Admin Response Section inside Modal */}
            <div className="space-y-2 pt-2 border-t border-zinc-100">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 flex items-center justify-between">
                <span>Phản hồi từ Luxora Shop:</span>
                {selectedReviewModal.adminReplyDate && (
                  <span className="text-[10px] font-mono text-emerald-600 font-bold">{selectedReviewModal.adminReplyDate}</span>
                )}
              </label>
              
              <textarea
                rows={3}
                defaultValue={selectedReviewModal.adminReply || ''}
                id="modalReplyInput"
                placeholder="Nhập câu trả lời phản hồi cho nhận xét của khách hàng..."
                className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl p-3 text-xs focus:outline-none focus:border-pink-500 focus:bg-white transition-all font-medium"
              />

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setSelectedReviewModal(null)}
                  className="bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold px-4 py-2 rounded-xl transition-all"
                >
                  Đóng
                </button>
                <button
                  onClick={() => {
                    const replyInput = (document.getElementById('modalReplyInput') as HTMLTextAreaElement)?.value || '';
                    if (!replyInput.trim()) {
                      showToast('Vui lòng nhập nội dung phản hồi', 'error');
                      return;
                    }
                    addAdminReply(selectedReviewModal.productId, selectedReviewModal.id, replyInput.trim());
                    setSelectedReviewModal(null);
                  }}
                  className="bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold px-5 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" /> Lưu & Gửi phản hồi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
