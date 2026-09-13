'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { Product } from '@/types';
import {
  ArrowLeft,
  Upload,
  X,
  Plus,
  Sparkles,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Heading,
  CheckCircle2,
  Trash2,
  Image as ImageIcon,
  AlertTriangle,
  Zap,
  Boxes,
  ChevronDown,
  Search
} from 'lucide-react';

const formatNumberWithDots = (val: number | string): string => {
  if (val === undefined || val === null || val === '') return '';
  const numStr = String(val).replace(/\D/g, '');
  if (!numStr) return '';
  return Number(numStr).toLocaleString('vi-VN');
};

const parseNumberFromDots = (valStr: string): number => {
  const clean = valStr.replace(/\D/g, '');
  return clean ? Number(clean) : 0;
};

function NewProductPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  const { addProduct, updateProduct, products, inventoryLogs, showToast, brands, categories } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const stockDropdownRef = useRef<HTMLDivElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [volumeErrorMsg, setVolumeErrorMsg] = useState<string | null>(null);
  const [showStockDropdown, setShowStockDropdown] = useState(false);

  // Combined stock options from products and inventoryLogs
  const stockItems = React.useMemo(() => {
    const map = new Map<string, {
      name: string;
      brand: string;
      concentration: string;
      volume: string;
      quantity: number;
      scent: string;
      importPrice?: number;
      price?: number;
      originalPrice?: number;
      category?: string;
      gender?: 'Nam' | 'Nữ' | 'Unisex';
      origin?: string;
      image?: string;
      rawVolumes?: string[];
    }>();

    // 1. Add items from products
    products.forEach(p => {
      if (!p || !p.name) return;
      const vols = (p.availableVolumes && p.availableVolumes.length > 0)
        ? p.availableVolumes.join(' / ')
        : (p.volume || '100ml');

      map.set(p.name.toLowerCase().trim(), {
        name: p.name,
        brand: p.brand || '',
        concentration: p.concentration || '',
        volume: vols,
        rawVolumes: p.availableVolumes || [p.volume || '100ml'],
        quantity: p.stock || 0,
        scent: p.availableScents?.join(', ') || '',
        price: p.price,
        originalPrice: p.originalPrice,
        category: p.category,
        gender: (p.gender as any) || 'Unisex',
        origin: p.origin || 'Pháp',
        image: p.image
      });
    });

    // 2. Add/merge items from inventoryLogs
    inventoryLogs.forEach((inv: any) => {
      if (!inv || !inv.productName) return;
      const key = inv.productName.toLowerCase().trim();
      const existing = map.get(key);
      if (existing) {
        const rawVols = Array.from(new Set([...((existing as any).rawVolumes || []), inv.volume].filter(Boolean)));
        map.set(key, {
          ...existing,
          brand: inv.brand || existing.brand,
          concentration: inv.concentration || existing.concentration,
          volume: rawVols.join(' / '),
          rawVolumes: rawVols,
          scent: inv.scent || existing.scent,
          importPrice: inv.importPrice || existing.importPrice
        });
      } else {
        map.set(key, {
          name: inv.productName,
          brand: inv.brand || 'Dior',
          concentration: inv.concentration || 'EDP',
          volume: inv.volume || '100ml',
          rawVolumes: [inv.volume || '100ml'].filter(Boolean),
          quantity: Number(inv.quantity) || 0,
          scent: inv.scent || '',
          importPrice: inv.importPrice || 0,
          origin: 'Pháp',
          gender: 'Unisex'
        });
      }
    });

    const list = Array.from(map.values());
    list.sort((a: any, b: any) => {
      const getRecency = (p: any) => {
        const logIdx = inventoryLogs.findIndex((l: any) => 
          (l.productName && p.name && l.productName.trim().toLowerCase() === p.name.trim().toLowerCase())
        );
        if (logIdx >= 0) return logIdx;
        const prodIdx = products.findIndex((item: any) => item.name?.toLowerCase() === p.name?.toLowerCase());
        return prodIdx >= 0 ? 10000 + prodIdx : 99999;
      };
      return getRecency(a) - getRecency(b);
    });

    return list;
  }, [products, inventoryLogs]);

  // Form State — starts with sensible defaults for new product, filled via useEffect for edit mode
  const [formData, setFormData] = useState({
    name: '',
    brand: 'Dior',
    category: 'Nước hoa Nữ',
    gender: 'Nữ' as 'Nam' | 'Nữ' | 'Unisex',
    origin: 'Pháp',
    concentration: 'EDP',
    originalPrice: 2800000,
    discountPercent: 15,
    calculatedPrice: 2380000,
    stock: 50,
    volume: '100ml',
    availableVolumes: ['100ml'] as string[],
    topNotes: '',
    middleNotes: '',
    baseNotes: '',
    styleBenefits: '',
    isFlashSale: false,
    flashSaleEndTime: ''
  });

  // Filtered list based on typed name
  const filteredStockItems = React.useMemo(() => {
    const kw = (formData.name || '').toLowerCase().trim();
    if (!kw) return stockItems;
    return stockItems.filter(item => 
      item.name.toLowerCase().includes(kw) ||
      item.brand.toLowerCase().includes(kw) ||
      item.scent.toLowerCase().includes(kw) ||
      item.concentration.toLowerCase().includes(kw) ||
      item.volume.toLowerCase().includes(kw)
    );
  }, [stockItems, formData.name]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (stockDropdownRef.current && !stockDropdownRef.current.contains(event.target as Node)) {
        setShowStockDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectStockItem = (item: typeof stockItems[0]) => {
    // 1. Gather all volumes available for this product
    const vols = (item.rawVolumes && item.rawVolumes.length > 0)
      ? item.rawVolumes
      : (item.volume ? item.volume.split('/').map(v => v.trim()).filter(Boolean) : ['100ml']);

    const firstVol = vols[0] || '100ml';

    // 2. Parse scents
    const itemScents = item.scent ? item.scent.split(',').map(s => s.trim()).filter(Boolean) : [];

    // 3. Find matching inventory logs to get exact selling prices per volume
    const matchingLogs = inventoryLogs.filter((l: any) =>
      (l.productName && item.name && l.productName.trim().toLowerCase() === item.name.trim().toLowerCase())
    );

    // 4. Build volumePriceDetails map with discount = 0% and calculatedPrice = originalPrice
    const newVolDetails: Record<string, { originalPrice: number; discountPercent: number; calculatedPrice: number; flashSalePrice?: number }> = {};

    vols.forEach(vol => {
      const logForVol = [...matchingLogs].reverse().find((l: any) => l.volume === vol);
      const selPrice = logForVol?.sellingPrice || (logForVol?.importPrice ? Math.round(logForVol.importPrice * 1.25) : (item.price || 2250000));
      
      newVolDetails[vol] = {
        originalPrice: selPrice,
        discountPercent: 0, // Default 0% discount as requested
        calculatedPrice: selPrice // Equal to originalPrice
      };
    });

    const firstVolPrice = newVolDetails[firstVol]?.calculatedPrice || item.price || 2250000;

    // 5. Update form state
    setFormData(prev => ({
      ...prev,
      name: item.name,
      brand: item.brand || prev.brand || brands[0] || 'Dior',
      category: item.category || prev.category || categories[0]?.name || 'Nước hoa Nữ',
      gender: item.gender || prev.gender || 'Unisex',
      origin: item.origin || prev.origin || 'Pháp',
      concentration: item.concentration || prev.concentration || 'EDP',
      volume: firstVol,
      availableVolumes: vols,
      stock: item.quantity > 0 ? item.quantity : (prev.stock || 50),
      originalPrice: firstVolPrice,
      calculatedPrice: firstVolPrice,
      discountPercent: 0
    }));

    if (itemScents.length > 0) {
      setScents(itemScents);
    }

    if (item.image && images.length === 0) {
      setImages([item.image]);
    }

    setVolumePriceDetails(prev => ({
      ...prev,
      ...newVolDetails
    }));

    setShowStockDropdown(false);
    showToast(`Đã tự động điền Tồn kho (${item.quantity} chai), Tên, Brand, Nồng độ, Xuất xứ, Dung tích (${vols.join(', ')}), Mùi & Giá bán cho "${item.name}"!`, 'success');
  };

  // Volume List & Prices State
  const [allVolumeList, setAllVolumeList] = useState<string[]>(['30ml', '50ml', '90ml', '100ml', '200ml']);
  const [newVolumeInput, setNewVolumeInput] = useState<string>('');

  const handleAddCustomVolume = () => {
    const trimmed = newVolumeInput.trim();
    if (!trimmed) return;
    const formatted = trimmed.toLowerCase().includes('ml') ? trimmed : `${trimmed}ml`;
    if (!allVolumeList.includes(formatted)) {
      setAllVolumeList(prev => [...prev, formatted]);
      setFormData(prev => ({
        ...prev,
        availableVolumes: [...prev.availableVolumes, formatted]
      }));
      setVolumePriceDetails(prev => ({
        ...prev,
        [formatted]: { originalPrice: 2800000, discountPercent: 15, calculatedPrice: 2380000 }
      }));
    }
    setNewVolumeInput('');
  };

  const handleRemoveVolume = (volToRemove: string) => {
    setAllVolumeList(prev => prev.filter(v => v !== volToRemove));
    setFormData(prev => ({
      ...prev,
      availableVolumes: prev.availableVolumes.filter(v => v !== volToRemove)
    }));
  };

  const [volumePriceDetails, setVolumePriceDetails] = useState<Record<string, { originalPrice: number; discountPercent: number; calculatedPrice: number; flashSalePrice?: number }>>({
    '100ml': { originalPrice: 2800000, discountPercent: 15, calculatedPrice: 2380000 }
  });

  const updateVolumeOriginalPrice = (vol: string, orig: number) => {
    setVolumePriceDetails(prev => {
      const current = prev[vol] || { originalPrice: 2800000, discountPercent: 20, calculatedPrice: 2240000 };
      const disc = current.discountPercent;
      const calc = Math.round(orig * (1 - disc / 100));
      return {
        ...prev,
        [vol]: { ...current, originalPrice: orig, discountPercent: disc, calculatedPrice: calc }
      };
    });
  };

  const updateVolumeFlashSalePrice = (vol: string, fsp: number) => {
    setVolumePriceDetails(prev => {
      const current = prev[vol] || { originalPrice: 2800000, discountPercent: 20, calculatedPrice: 2240000 };
      return {
        ...prev,
        [vol]: { ...current, flashSalePrice: fsp }
      };
    });
  };

  const updateVolumeDiscountPercent = (vol: string, disc: number) => {
    setVolumePriceDetails(prev => {
      const current = prev[vol] || { originalPrice: 2800000, discountPercent: 20, calculatedPrice: 2240000 };
      const orig = current.originalPrice;
      const calc = Math.round(orig * (1 - disc / 100));
      return {
        ...prev,
        [vol]: { ...current, originalPrice: orig, discountPercent: disc, calculatedPrice: calc }
      };
    });
  };

  const updateVolumeCalculatedPrice = (vol: string, calc: number) => {
    setVolumePriceDetails(prev => {
      const current = prev[vol] || { originalPrice: 2800000, discountPercent: 20, calculatedPrice: 2240000 };
      const orig = current.originalPrice;
      const disc = orig > 0 ? Math.round(((orig - calc) / orig) * 100) : 0;
      return {
        ...prev,
        [vol]: { ...current, originalPrice: orig, discountPercent: disc, calculatedPrice: calc }
      };
    });
  };

  // Clean Fragrance Scents State & Handlers
  const [scents, setScents] = useState<string[]>([]);
  const [newScentInput, setNewScentInput] = useState('');

  const handleAddScentTag = () => {
    const trimmed = newScentInput.trim();
    if (trimmed && !scents.includes(trimmed)) {
      setScents(prev => [...prev, trimmed]);
      setNewScentInput('');
    }
  };

  const handleRemoveScentTag = (scentToRemove: string) => {
    setScents(prev => prev.filter(s => s !== scentToRemove));
  };

  // Multi-Image Upload State
  const [images, setImages] = useState<string[]>([]);

  // Rich Text Description HTML State
  const [descriptionHtml, setDescriptionHtml] = useState<string>('');

  // ——— Single unified useEffect: handles new mode init + edit mode prefill ———
  useEffect(() => {
    if (!editId) {
      // New product: init empty editor placeholder & set default brand/category
      if (editorRef.current && !editorRef.current.innerHTML) {
        editorRef.current.innerHTML = '';
      }
      setFormData(prev => ({
        ...prev,
        brand: prev.brand || brands[0] || 'Dior',
        category: prev.category || categories[0]?.name || 'Nước hoa Nữ'
      }));
      return;
    }
    // Edit mode: prefill all fields from product
    const rawEditId = editId ? decodeURIComponent(editId) : '';
    const prod = products.find(p =>
      p._id === editId ||
      p._id === rawEditId ||
      p.slug === editId ||
      p.slug === rawEditId ||
      (p as any).id === editId ||
      p.name === rawEditId ||
      p.slug === rawEditId.toLowerCase()
    );
    if (!prod) return;

    setFormData({
      name: prod.name || '',
      brand: prod.brand || '',
      category: prod.category || '',
      gender: (prod.gender as any) || 'Nữ',
      origin: prod.origin || '',
      concentration: prod.concentration || '',
      originalPrice: prod.originalPrice || prod.price || 0,
      discountPercent: prod.discountPercent || 0,
      calculatedPrice: prod.price || 0,
      stock: prod.stock || 0,
      volume: prod.volume || '',
      availableVolumes: (prod.availableVolumes && prod.availableVolumes.length > 0) ? prod.availableVolumes : [prod.volume || '100ml'],
      topNotes: prod.fragranceNotes?.top || '',
      middleNotes: prod.fragranceNotes?.middle || '',
      baseNotes: prod.fragranceNotes?.base || '',
      styleBenefits: prod.benefits || '',
      isFlashSale: prod.isFlashSale || false,
      flashSaleEndTime: prod.flashSaleEndTime || ''
    });

    // Prefill volume prices from product or construct fallback details
    const details: Record<string, { originalPrice: number; discountPercent: number; calculatedPrice: number; flashSalePrice?: number }> = {};
    const vols = (prod.availableVolumes && prod.availableVolumes.length > 0) ? prod.availableVolumes : [prod.volume || '100ml'];

    vols.forEach(vol => {
      const vo = prod.volumeOptions?.find(v => v.volume === vol);
      const orig = vo?.originalPrice || prod.originalPrice || prod.price || 0;
      const calc = vo?.price || prod.price || 0;
      const disc = orig > 0 ? Math.round(((orig - calc) / orig) * 100) : (prod.discountPercent || 0);
      details[vol] = {
        originalPrice: orig,
        calculatedPrice: calc,
        discountPercent: disc,
        flashSalePrice: vo?.flashSalePrice || prod.flashSalePrice
      };
    });
    setVolumePriceDetails(details);
    setAllVolumeList(prev => {
      const merged = [...prev];
      vols.forEach(v => { if (!merged.includes(v)) merged.push(v); });
      return merged;
    });

    // Prefill scents from availableScents or fragranceNotes
    if (prod.availableScents) {
      setScents(prod.availableScents);
    } else if (prod.fragranceNotes) {
      const notes = [prod.fragranceNotes.top, prod.fragranceNotes.middle, prod.fragranceNotes.base]
        .map(n => (n || '').trim())
        .filter(Boolean);
      setScents(notes);
    } else {
      setScents([]);
    }

    // Prefill images
    if (prod.gallery && prod.gallery.length > 0) {
      setImages(prod.gallery);
    } else if (prod.image) {
      setImages([prod.image]);
    }

    // Prefill rich text editor
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.innerHTML = prod.description || '';
        setDescriptionHtml(prod.description || '');
      }
    }, 50);
  }, [editId, products]);

  // Handle Price & Discount auto calculations
  const handleOriginalPriceChange = (val: number) => {
    const orig = Math.max(0, val);
    const disc = formData.discountPercent;
    const finalP = Math.round(orig * (1 - disc / 100));
    setFormData(prev => ({
      ...prev,
      originalPrice: orig,
      calculatedPrice: finalP
    }));
  };

  const handleDiscountPercentChange = (val: number) => {
    const disc = Math.min(100, Math.max(0, val));
    const orig = formData.originalPrice;
    const finalP = Math.round(orig * (1 - disc / 100));
    setFormData(prev => ({
      ...prev,
      discountPercent: disc,
      calculatedPrice: finalP
    }));
  };

  const handleCalculatedPriceChange = (val: number) => {
    const finalP = Math.max(0, val);
    const orig = formData.originalPrice;
    let disc = 0;
    if (orig > 0 && finalP < orig) {
      disc = Math.round(((orig - finalP) / orig) * 100);
    }
    setFormData(prev => ({
      ...prev,
      calculatedPrice: finalP,
      discountPercent: disc
    }));
  };

  // Image Upload Handling (Multiple files from computer)
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) {
        showToast(`File ${file.name} không phải định dạng hình ảnh`, 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImages(prev => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });

    showToast(`Đã tải lên ${files.length} hình ảnh từ máy tính`, 'success');
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, idx) => idx !== index));
    showToast('Đã xóa hình ảnh khỏi danh sách', 'info');
  };

  // Rich Text Editor Command Execution
  const formatDoc = (cmd: string, val: string | undefined = undefined) => {
    document.execCommand(cmd, false, val);
    if (editorRef.current) {
      setDescriptionHtml(editorRef.current.innerHTML);
    }
  };

  // Volume checkboxes handling
  const toggleAvailableVolume = (vol: string) => {
    setFormData(prev => {
      const exists = prev.availableVolumes.includes(vol);
      const updated = exists
        ? prev.availableVolumes.filter(v => v !== vol)
        : [...prev.availableVolumes, vol];
      return { ...prev, availableVolumes: updated };
    });

    setVolumePriceDetails(prev => {
      if (!prev[vol]) {
        return {
          ...prev,
          [vol]: { originalPrice: 2800000, discountPercent: 15, calculatedPrice: 2380000 }
        };
      }
      return prev;
    });
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      showToast('Vui lòng nhập tên sản phẩm', 'error');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    let finalImages = [...images];
    if (finalImages.length === 0) {
      finalImages = ['https://images.unsplash.com/photo-1541643600914-78b084683601?w=800'];
      setImages(finalImages);
      showToast('Đã áp dụng hình ảnh sang trọng mặc định cho sản phẩm', 'info');
    }

    const finalStock = Number(formData.stock) > 0 ? Number(formData.stock) : 50;

    let selectedVolumes = formData.availableVolumes;
    if (!selectedVolumes || selectedVolumes.length === 0) {
      selectedVolumes = ['100ml'];
      setFormData(prev => ({ ...prev, availableVolumes: ['100ml'] }));
    }

    // Ensure all selected volumes have valid pricing details
    const updatedDetails = { ...volumePriceDetails };
    selectedVolumes.forEach(vol => {
      if (!updatedDetails[vol] || !updatedDetails[vol].calculatedPrice || updatedDetails[vol].calculatedPrice <= 0) {
        updatedDetails[vol] = {
          originalPrice: 2800000,
          discountPercent: 15,
          calculatedPrice: 2380000
        };
      }
    });
    setVolumePriceDetails(updatedDetails);
    setVolumeErrorMsg(null);

    const descText = editorRef.current?.innerHTML && editorRef.current.innerHTML.trim() !== ''
      ? editorRef.current.innerHTML
      : `${formData.name.trim()} - Dòng nước hoa cao cấp chính hãng mang đến phong cách sang trọng và hương thơm quyến rũ lâu phai.`;

    const volumeOpts = selectedVolumes.map(vol => {
      const detail = updatedDetails[vol] || { originalPrice: 2800000, discountPercent: 15, calculatedPrice: 2380000 };
      return {
        volume: vol,
        price: detail.calculatedPrice || 2380000,
        originalPrice: detail.originalPrice || 2800000,
        flashSalePrice: detail.flashSalePrice,
        stock: (detail as any)?.stock !== undefined ? Number((detail as any).stock) : Math.round(finalStock / selectedVolumes.length)
      };
    });

    const pricesList = volumeOpts.map(v => v.price);
    const minP = pricesList.length > 0 ? Math.min(...pricesList) : 2380000;
    const minOrigP = volumeOpts.length > 0 ? (volumeOpts.find(v => v.price === minP)?.originalPrice || Math.round(minP * 1.25)) : 2800000;

    const productData: Product = {
      _id: editId || ('prod_' + Date.now()),
      name: formData.name.trim(),
      slug: formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '') + '-' + Date.now(),
      brand: formData.brand || brands[0] || 'Dior',
      category: formData.category || categories[0]?.name || 'Nước hoa Nữ',
      gender: formData.gender || 'Nữ',
      origin: formData.origin || 'Pháp',
      concentration: formData.concentration || 'EDP',
      price: minP,
      originalPrice: minOrigP,
      discountPercent: minOrigP > 0 ? Math.round(((minOrigP - minP) / minOrigP) * 100) : 15,
      volume: formData.volume || (selectedVolumes[0] || '100ml'),
      availableVolumes: selectedVolumes,
      volumeOptions: volumeOpts,
      availableScents: scents.length > 0 ? scents : ['Quyến rũ', 'Sang trọng'],
      stock: finalStock,
      soldCount: editId ? (products.find(p => p._id === editId)?.soldCount || 0) : 0,
      rating: editId ? (products.find(p => p._id === editId)?.rating || 5.0) : 5.0,
      reviewCount: editId ? (products.find(p => p._id === editId)?.reviewCount || 0) : 0,
      image: finalImages[0],
      gallery: finalImages,
      description: descText,
      ingredients: 'Alcohol, Parfum (Fragrance), Aqua (Water), Limonene, Linalool.',
      benefits: formData.styleBenefits || 'Tỏa hương lôi cuốn 8-12 tiếng. Phong cách kiều diễm, sang trọng.',
      fragranceNotes: {
        top: formData.topNotes || 'Hương đầu thơm mát',
        middle: formData.middleNotes || 'Hương giữa nồng nàn',
        base: formData.baseNotes || 'Hương cuối lưu hương bền lâu'
      },
      isFeatured: true,
      isFlashSale: formData.isFlashSale,
      flashSaleEndTime: formData.isFlashSale ? formData.flashSaleEndTime : undefined
    };

    setIsSaving(true);
    if (editId) {
      updateProduct(productData);
      showToast(`Đã cập nhật thành công sản phẩm "${productData.name}"!`, 'success');
    } else {
      addProduct(productData);
      showToast(`Đã lưu & xuất bản thành công sản phẩm "${productData.name}"!`, 'success');
    }

    setTimeout(() => {
      router.push('/admin?tab=products');
    }, 500);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/admin?tab=products')}
            className="p-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-full transition-colors"
            title="Quay lại Quản lý sản phẩm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold font-serif-luxury text-zinc-900">
              {editId ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
            </h1>
            <p className="text-xs text-zinc-500">
              {editId ? 'Cập nhật thông tin sản phẩm nước hoa' : 'Tạo thông tin sản phẩm nước hoa đồng bộ lên trang bán hàng'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push('/admin?tab=products')}
            className="px-4 py-2 text-xs font-bold text-zinc-600 hover:bg-zinc-100 rounded-xl transition-all"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSaving}
            className={`text-white text-xs font-bold px-6 py-2.5 rounded-full transition-all shadow-md flex items-center gap-2 uppercase tracking-wider ${
              isSaving
                ? 'bg-emerald-500 shadow-emerald-400/30'
                : 'bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 shadow-pink-500/25'
            }`}
          >
            <CheckCircle2 className={`w-4 h-4 ${isSaving ? 'animate-bounce' : ''}`} />
            {isSaving ? (editId ? 'Đang cập nhật...' : 'Đang lưu...') : (editId ? 'Cập nhật sản phẩm' : 'Lưu & Xuất bản')}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-6 text-xs">
        {/* SECTION 1: BASIC INFORMATION */}
        <div className="bg-white rounded-3xl border border-zinc-100 p-6 space-y-4 shadow-sm">
          <h2 className="text-sm font-bold text-zinc-900 border-b border-zinc-100 pb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-pink-600" /> Thông tin cơ bản
          </h2>

          <div className="space-y-3">
            <div className="relative" ref={stockDropdownRef}>
              <label className="font-bold text-zinc-800 block mb-1.5 flex items-center justify-between">
                <span>Tên sản phẩm nước hoa <span className="text-rose-500 font-bold">*</span></span>
                <span className="text-[11px] text-pink-600 font-semibold">💡 Chọn từ danh sách Bảng tồn kho hoặc gõ chữ đầu để tìm kiếm</span>
              </label>

              {/* Direct Select Menu from Inventory Stock Items */}
              <div className="mb-2">
                <select
                  value=""
                  onChange={e => {
                    const selectedName = e.target.value;
                    if (!selectedName) return;
                    const matched = stockItems.find(s => s.name === selectedName);
                    if (matched) handleSelectStockItem(matched);
                  }}
                  className="w-full bg-pink-50/80 border border-pink-200 text-pink-950 font-bold rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-pink-500 shadow-2xs cursor-pointer"
                >
                  <option value="">-- Click chọn tên sản phẩm đã Nhập kho ({stockItems.length} mặt hàng) --</option>
                  {stockItems.map((item, idx) => (
                    <option key={idx} value={item.name}>
                      📦 {item.name} — Tồn kho: {item.quantity} chai — {item.brand} ({item.volume})
                    </option>
                  ))}
                </select>
              </div>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Gõ chữ đầu tên sản phẩm để chọn từ kho (VD: Miss Dior, Sauvage...)"
                  value={formData.name}
                  onFocus={() => setShowStockDropdown(true)}
                  onChange={e => {
                    setFormData({ ...formData, name: e.target.value });
                    setShowStockDropdown(true);
                  }}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-none focus:border-pink-500 focus:bg-white transition-all pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowStockDropdown(!showStockDropdown)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-pink-600 p-1 transition-colors"
                  title="Xem danh sách sản phẩm trong kho"
                >
                  <ChevronDown className={`w-4 h-4 transition-transform ${showStockDropdown ? 'rotate-180 text-pink-600' : ''}`} />
                </button>
              </div>

              {/* Badge notification if product already exists in stock */}
              {(() => {
                const kw = (formData.name || '').trim().toLowerCase();
                if (!kw) return null;
                const matched = stockItems.find(s => s.name.trim().toLowerCase() === kw) ||
                                stockItems.find(s => s.name.trim().toLowerCase().includes(kw) || kw.includes(s.name.trim().toLowerCase()));
                if (!matched) return null;
                const isExact = matched.name.trim().toLowerCase() === kw;

                return (
                  <div className="mt-2 p-2.5 bg-amber-50/90 border border-amber-300 rounded-2xl flex flex-wrap items-center justify-between gap-2 shadow-xs animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="inline-flex items-center gap-1.5 bg-amber-500 text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider shrink-0 shadow-2xs">
                        <Boxes className="w-3.5 h-3.5" /> Sản phẩm đã có trong kho
                      </span>
                      <span className="text-xs text-amber-950 font-bold truncate">
                        <strong>{matched.name}</strong> — Tồn kho hiện tại: <strong className="text-pink-600 font-extrabold">{matched.quantity} chai</strong> ({matched.volume})
                      </span>
                    </div>
                    {!isExact && (
                      <button
                        type="button"
                        onClick={() => handleSelectStockItem(matched)}
                        className="text-xs bg-white border border-amber-300 hover:bg-amber-100 text-amber-950 font-bold px-2.5 py-1 rounded-xl shrink-0 transition-colors shadow-2xs flex items-center gap-1"
                      >
                        <span>Tự động điền dữ liệu:</span>
                        <span className="text-pink-600 font-extrabold">{matched.name}</span>
                      </button>
                    )}
                  </div>
                );
              })()}

              {/* Auto-suggest Dropdown List from Inventory Stock */}
              {showStockDropdown && (
                <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-zinc-200 rounded-2xl shadow-xl z-50 max-h-64 overflow-y-auto divide-y divide-zinc-100 animate-in fade-in duration-200">
                  <div className="p-2.5 bg-pink-50/60 text-[11px] font-bold text-zinc-700 uppercase tracking-wider flex items-center justify-between border-b border-pink-100 sticky top-0 bg-white/95 backdrop-blur-xs z-10">
                    <span className="flex items-center gap-1.5 text-pink-600">
                      <Boxes className="w-4 h-4" /> Danh sách Tồn kho ({filteredStockItems.length} sản phẩm)
                    </span>
                    <span className="text-[10px] text-zinc-500 font-normal">Click sản phẩm để tự động điền</span>
                  </div>

                  {filteredStockItems.length === 0 ? (
                    <div className="p-4 text-center text-xs text-zinc-400 italic">
                      Không tìm thấy sản phẩm trùng khớp trong bảng tồn kho
                    </div>
                  ) : (
                    filteredStockItems.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectStockItem(item)}
                        className="w-full text-left px-3.5 py-2.5 hover:bg-pink-50/80 transition-colors flex items-center justify-between gap-3 group"
                      >
                        <div className="space-y-0.5 min-w-0 flex-1">
                          <div className="font-extrabold text-xs text-zinc-900 group-hover:text-pink-600 truncate flex items-center gap-1.5">
                            <span>📦</span> {item.name}
                          </div>
                          <div className="text-[11px] text-zinc-500 flex flex-wrap items-center gap-2 font-medium">
                            <span className="font-bold text-pink-600">{item.brand}</span>
                            <span>• Nồng độ: <strong className="text-zinc-700">{item.concentration}</strong></span>
                            <span>• Dung tích: <strong className="text-zinc-700">{item.volume}</strong></span>
                            {item.scent && <span className="text-pink-700 font-semibold">🌸 Mùi: {item.scent}</span>}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="inline-block bg-pink-100 text-pink-700 font-extrabold text-[11px] px-2.5 py-1 rounded-xl border border-pink-200">
                            Tồn kho: {item.quantity} chai
                          </span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div>
                <label className="font-bold text-zinc-800 block mb-1">Thương hiệu *</label>
                <select
                  required
                  value={formData.brand}
                  onChange={e => setFormData({ ...formData, brand: e.target.value })}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-pink-500"
                >
                  {brands.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-zinc-800 block mb-1">Danh mục *</label>
                <select
                  required
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-pink-500"
                >
                  {categories.map(c => (
                    <option key={c._id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-zinc-800 block mb-1">Giới tính *</label>
                <select
                  required
                  value={formData.gender}
                  onChange={e => setFormData({ ...formData, gender: e.target.value as any })}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-pink-500"
                >
                  <option value="Nữ">Nữ</option>
                  <option value="Nam">Nam</option>
                  <option value="Unisex">Unisex</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-zinc-800 block mb-1">
                  Nồng độ <span className="text-zinc-400 font-normal">(Không bắt buộc)</span>
                </label>
                <input
                  type="text"
                  placeholder="VD: EDP, EDT, Extrait... (Có thể bỏ trống)"
                  value={formData.concentration}
                  onChange={e => setFormData({ ...formData, concentration: e.target.value })}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-pink-500"
                />
              </div>

              <div>
                <label className="font-bold text-zinc-800 block mb-1">Xuất xứ (Quốc gia) *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Pháp, Ý, Mỹ..."
                  value={formData.origin}
                  onChange={e => setFormData({ ...formData, origin: e.target.value })}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-pink-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: PRICING & DISCOUNT CALCULATOR */}
        <div className="bg-white rounded-3xl border border-zinc-100 p-6 space-y-4 shadow-sm">
          <h2 className="text-sm font-bold text-zinc-900 border-b border-zinc-100 pb-3">
            Giá bán & Khuyến mãi (% Giảm Giá) theo từng Dung tích
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-3 border-b border-zinc-100">
            <div>
              <label className="font-bold text-zinc-800 block mb-1">Số lượng kho hàng (Stock) *</label>
              <input
                type="number"
                required
                min={1}
                value={formData.stock}
                onChange={e => setFormData({ ...formData, stock: Number(e.target.value) })}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-none focus:border-pink-500"
              />
            </div>

            <div>
              <label className="font-bold text-zinc-800 block mb-1">Các dung tích có sẵn</label>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {allVolumeList.map(vol => {
                  const selected = formData.availableVolumes.includes(vol);
                  return (
                    <div
                      key={vol}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        selected
                          ? 'bg-pink-600 text-white border-pink-600 shadow-sm'
                          : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:border-pink-300'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => toggleAvailableVolume(vol)}
                        className="focus:outline-none"
                      >
                        {vol}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveVolume(vol);
                        }}
                        className={`p-0.5 rounded-lg transition-colors ml-0.5 ${
                          selected
                            ? 'hover:bg-pink-700 text-pink-200 hover:text-white'
                            : 'hover:bg-zinc-200 text-zinc-400 hover:text-rose-600'
                        }`}
                        title={`Xóa dung tích ${vol}`}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}

                {/* Inline Input + (+) Add New Volume Button */}
                <div className="inline-flex items-center gap-1.5">
                  <input
                    type="text"
                    placeholder="VD: 15ml, 250ml..."
                    value={newVolumeInput}
                    onChange={e => setNewVolumeInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomVolume();
                      }
                    }}
                    className="w-28 bg-zinc-50 border border-zinc-200 rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-pink-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomVolume}
                    className="bg-pink-600 hover:bg-pink-700 text-white font-bold px-2.5 py-1.5 rounded-xl text-xs flex items-center gap-1 shadow-xs transition-all"
                    title="Thêm dung tích mới (+)"
                  >
                    <Plus className="w-3.5 h-3.5" /> Thêm (+)
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Volume-Specific Price Boxes (Giá gốc, % Giảm giá, Giá bán) */}
          <div className="space-y-4">
            <label className="font-bold text-zinc-800 text-xs block">
              Bảng thiết lập Giá gốc, % Giảm giá & Giá khuyến mãi riêng cho từng Dung tích đã chọn
            </label>

            {volumeErrorMsg && (
              <div className="bg-rose-50 border-2 border-rose-300 text-rose-700 p-4 rounded-2xl flex items-center gap-3 text-xs font-bold shadow-md">
                <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                <span className="flex-1">{volumeErrorMsg}</span>
              </div>
            )}

            {formData.availableVolumes.map(vol => {
              const detail = volumePriceDetails[vol] || { originalPrice: 0, discountPercent: 0, calculatedPrice: 0 };
              return (
                <div key={vol} className="bg-pink-50/30 border border-pink-200/60 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-pink-100 pb-2">
                    <span className="font-bold text-pink-700 text-xs flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-pink-500" /> Cấu hình Giá cho Dung tích: <span className="text-sm font-extrabold text-pink-600">{vol}</span>
                    </span>
                  </div>

                  <div className={`grid grid-cols-1 sm:grid-cols-${formData.isFlashSale ? '4' : '3'} gap-3`}>
                    <div>
                      <label className="font-bold text-zinc-800 block mb-1">Giá gốc niêm yết (VND)</label>
                      <input
                        type="text"
                        required
                        value={formatNumberWithDots(detail.originalPrice)}
                        onChange={e => updateVolumeOriginalPrice(vol, parseNumberFromDots(e.target.value))}
                        className="w-full bg-white border border-zinc-200 rounded-xl px-3.5 py-2 text-xs font-bold text-zinc-900 focus:outline-none focus:border-pink-500"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-pink-600 block mb-1">Phần trăm giảm giá (%)</label>
                      <div className="relative">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={detail.discountPercent}
                          onChange={e => updateVolumeDiscountPercent(vol, Number(e.target.value))}
                          className="w-full bg-pink-50/50 border border-pink-200 rounded-xl px-3.5 py-2 text-xs font-extrabold text-pink-600 focus:outline-none focus:border-pink-500"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-pink-600 font-bold">%</span>
                      </div>
                    </div>

                    <div>
                      <label className="font-bold text-emerald-600 block mb-1">Giá bán ra (VND)</label>
                      <input
                        type="text"
                        required
                        value={formatNumberWithDots(detail.calculatedPrice)}
                        onChange={e => updateVolumeCalculatedPrice(vol, parseNumberFromDots(e.target.value))}
                        className="w-full bg-emerald-50/50 border border-emerald-200 rounded-xl px-3.5 py-2 text-xs font-extrabold text-emerald-700 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    {formData.isFlashSale && (
                      <div>
                        <label className="font-bold text-amber-600 block mb-1">Giá Flash Sale (VND) *</label>
                        <input
                          type="text"
                          required={formData.isFlashSale}
                          value={formatNumberWithDots(detail.flashSalePrice || 0)}
                          onChange={e => updateVolumeFlashSalePrice(vol, parseNumberFromDots(e.target.value))}
                          className="w-full bg-amber-50/50 border border-amber-200 rounded-xl px-3.5 py-2 text-xs font-extrabold text-amber-700 focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION FLASH SALE */}
        <div className="bg-white rounded-3xl border border-zinc-100 p-6 space-y-4 shadow-sm">
          <h2 className="text-sm font-bold text-zinc-900 border-b border-zinc-100 pb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500 fill-current" /> Cấu hình Flash Sale
          </h2>
          
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-3">
              <label className="font-bold text-zinc-800 text-xs cursor-pointer" onClick={() => setFormData({ ...formData, isFlashSale: !formData.isFlashSale })}>
                Tham gia Flash Sale
              </label>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, isFlashSale: !formData.isFlashSale })}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  formData.isFlashSale ? 'bg-amber-500' : 'bg-zinc-300'
                }`}
              >
                <span
                  className={`absolute top-1/2 -translate-y-1/2 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    formData.isFlashSale ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {formData.isFlashSale && (
              <div>
                <label className="font-bold text-zinc-800 text-xs block mb-1">Giờ kết thúc Flash Sale *</label>
                <input
                  type="datetime-local"
                  required={formData.isFlashSale}
                  value={formData.flashSaleEndTime || ''}
                  onChange={e => setFormData({ ...formData, flashSaleEndTime: e.target.value })}
                  className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-1.5 text-xs font-medium focus:outline-none focus:border-amber-500"
                />
              </div>
            )}
          </div>
        </div>

        {/* SECTION 3: MULTI-IMAGE FILE UPLOAD FROM COMPUTER */}
        <div className="bg-white rounded-3xl border border-zinc-100 p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-zinc-900">Hình ảnh sản phẩm (Nhiều ảnh từ máy tính)</h2>
              <p className="text-[11px] text-zinc-400">Tải lên nhiều hình ảnh rõ nét của chai nước hoa, vỏ hộp và góc ảnh khác</p>
            </div>
            <span className="text-xs font-bold text-pink-600 bg-pink-50 px-3 py-1 rounded-full border border-pink-100">
              Đã chọn {images.length} ảnh
            </span>
          </div>

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            multiple
            accept="image/*"
            className="hidden"
          />

          {/* Drag & Drop / Upload Trigger Box */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-pink-300 hover:border-pink-500 bg-pink-50/20 hover:bg-pink-50/50 rounded-2xl p-8 text-center cursor-pointer transition-all space-y-2 group"
          >
            <div className="w-12 h-12 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
              <Upload className="w-6 h-6" />
            </div>
            <h4 className="text-xs font-bold text-zinc-800">Nhấp vào đây để chọn nhiều hình ảnh từ máy tính</h4>
            <p className="text-[11px] text-zinc-400">Hỗ trợ JPG, PNG, WEBP, GIF (Tải lên nhiều file cùng lúc)</p>
          </div>

          {/* Image Previews Grid */}
          {images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 pt-2">
              {images.map((img, idx) => (
                <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-zinc-200 group shadow-xs">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  {idx === 0 && (
                    <span className="absolute top-2 left-2 bg-pink-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow z-10">
                      Ảnh chính
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-2 right-2 p-1.5 bg-black/60 text-white hover:bg-rose-600 rounded-full transition-colors z-10"
                    title="Xóa ảnh này"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION 4: WYSIWYG RICH TEXT EDITOR FOR DESCRIPTION */}
        <div className="bg-white rounded-3xl border border-zinc-100 p-6 space-y-4 shadow-sm">
          <h2 className="text-sm font-bold text-zinc-900 border-b border-zinc-100 pb-3">
            Mô tả chi tiết sản phẩm (Trình soạn thảo như Word)
          </h2>

          {/* Word-like Formatting Toolbar */}
          <div className="flex flex-wrap items-center gap-1.5 bg-zinc-100 p-2 rounded-2xl border border-zinc-200">
            <button
              type="button"
              onClick={() => formatDoc('bold')}
              className="p-2 hover:bg-white text-zinc-700 rounded-xl transition-all font-bold"
              title="In đậm (Bold)"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => formatDoc('italic')}
              className="p-2 hover:bg-white text-zinc-700 rounded-xl transition-all"
              title="In nghiêng (Italic)"
            >
              <Italic className="w-4 h-4" />
            </button>

            <div className="w-px h-5 bg-zinc-300 mx-1" />

            <button
              type="button"
              onClick={() => formatDoc('insertUnorderedList')}
              className="p-2 hover:bg-white text-zinc-700 rounded-xl transition-all"
              title="Danh sách dấu chấm"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => formatDoc('insertOrderedList')}
              className="p-2 hover:bg-white text-zinc-700 rounded-xl transition-all"
              title="Danh sách số"
            >
              <ListOrdered className="w-4 h-4" />
            </button>

            <div className="w-px h-5 bg-zinc-300 mx-1" />

            <button
              type="button"
              onClick={() => formatDoc('formatBlock', '<h3>')}
              className="px-2.5 py-1 text-xs font-bold hover:bg-white text-zinc-700 rounded-xl transition-all"
              title="Tiêu đề H3"
            >
              H3
            </button>
            <button
              type="button"
              onClick={() => formatDoc('formatBlock', '<h4>')}
              className="px-2.5 py-1 text-xs font-bold hover:bg-white text-zinc-700 rounded-xl transition-all"
              title="Tiêu đề H4"
            >
              H4
            </button>
            <button
              type="button"
              onClick={() => formatDoc('removeFormat')}
              className="px-2.5 py-1 text-[11px] font-semibold text-zinc-500 hover:bg-white rounded-xl transition-all"
              title="Xóa định dạng"
            >
              Clear
            </button>
          </div>

          {/* Content Editable Area (Fixed Height + Vertical Scrollbar) */}
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={() => {
              if (editorRef.current) {
                setDescriptionHtml(editorRef.current.innerHTML);
              }
            }}
            className="w-full h-48 max-h-48 overflow-y-auto bg-zinc-50 border border-zinc-200 focus:border-pink-500 focus:bg-white rounded-2xl p-4 text-xs text-zinc-800 leading-relaxed focus:outline-none transition-all shadow-inner"
          />
        </div>

        {/* SECTION 5: FRAGRANCE NOTES & STYLE */}
        <div className="bg-white rounded-3xl border border-zinc-100 p-6 space-y-4 shadow-sm">
          <h2 className="text-sm font-bold text-zinc-900 border-b border-zinc-100 pb-3">
            Tầng Hương & Phong Cách Sang Trọng
          </h2>

          <div className="space-y-4">
            {/* Clean Fragrance Scent Tags Selector + (+) Add Button */}
            <div className="space-y-2 pb-3 border-b border-zinc-100">
              <label className="font-bold text-zinc-800 text-xs block">
                Tùy chọn Mùi hương sản phẩm (Người dùng chọn khi mua)
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {scents.map((scent, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-pink-50 border border-pink-200 text-pink-700 text-xs font-bold rounded-xl shadow-2xs"
                  >
                    <Sparkles className="w-3 h-3 text-pink-500" />
                    {scent}
                    <button
                      type="button"
                      onClick={() => handleRemoveScentTag(scent)}
                      className="text-pink-400 hover:text-rose-600 transition-colors ml-0.5"
                      title="Xóa mùi hương này"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}

                {/* Inline Input + (+) Add Button */}
                <div className="inline-flex items-center gap-1.5">
                  <input
                    type="text"
                    placeholder="Nhập mùi hương mới..."
                    value={newScentInput}
                    onChange={e => setNewScentInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddScentTag();
                      }
                    }}
                    className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-pink-500 w-48"
                  />
                  <button
                    type="button"
                    onClick={handleAddScentTag}
                    className="bg-pink-600 hover:bg-pink-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 shadow-xs transition-all"
                    title="Thêm mùi hương (+)"
                  >
                    <Plus className="w-4 h-4" /> Thêm (+)
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="font-bold text-zinc-800 block mb-1">Phong cách & Cảm nhận độc đáo</label>
              <textarea
                rows={2}
                placeholder="VD: Tỏa hương lôi cuốn 8-12 tiếng. Phong cách kiều diễm, sang trọng."
                value={formData.styleBenefits}
                onChange={e => setFormData({ ...formData, styleBenefits: e.target.value })}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-xs focus:outline-none focus:border-pink-500"
              />
            </div>
          </div>
        </div>

        {/* Bottom Save Action */}
        <div className="flex justify-end gap-3 pt-4 border-t border-zinc-200">
          <button
            type="button"
            onClick={() => router.push('/admin?tab=products')}
            className="px-6 py-3 rounded-full text-xs font-bold text-zinc-600 hover:bg-zinc-100 transition-all"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className={`text-white text-xs font-bold px-8 py-3 rounded-full transition-all shadow-lg flex items-center gap-2 uppercase tracking-wider ${
              isSaving
                ? 'bg-emerald-500 shadow-emerald-400/30 scale-105'
                : 'bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 shadow-pink-500/25'
            }`}
          >
            {isSaving ? (
              <>
                <CheckCircle2 className="w-4 h-4 animate-bounce" />
                {editId ? 'Cập nhật thành công!' : 'Lưu thành công!'}
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                {editId ? 'Cập nhật sản phẩm' : 'Lưu & Xuất bản sản phẩm'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
export default function NewProductPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <NewProductPageInner />
    </Suspense>
  );
}
