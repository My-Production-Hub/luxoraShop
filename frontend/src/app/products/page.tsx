'use client';

import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { ProductCard } from '@/components/ProductCard';
import { SlidersHorizontal, Search, RefreshCw, X, ChevronLeft, ChevronRight, Star } from 'lucide-react';

function ProductsContent() {
  const searchParams = useSearchParams();
  const { products, wishlist, categories: storeCategories, brands: storeBrands } = useStore();

  const queryCategory = searchParams.get('category') || '';
  const queryBrand = searchParams.get('brand') || '';
  const queryGender = searchParams.get('gender') || '';
  const querySearch = searchParams.get('search') || '';
  const isWishlistOnly = searchParams.get('wishlist') === 'true';

  // Filters State
  const [searchKeyword, setSearchKeyword] = useState<string>(querySearch);
  const [selectedCategory, setSelectedCategory] = useState<string>(queryCategory);
  const [selectedBrand, setSelectedBrand] = useState<string>(queryBrand);
  const [selectedGender, setSelectedGender] = useState<string>(queryGender);
  const [selectedVolume, setSelectedVolume] = useState<string>('');
  const [selectedOrigin, setSelectedOrigin] = useState<string>('');
  const [selectedConcentration, setSelectedConcentration] = useState<string>('');
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(Infinity);
  const [minRating, setMinRating] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 12;

  React.useEffect(() => {
    if (queryCategory || queryBrand || queryGender || querySearch) {
      setSelectedCategory(queryCategory);
      setSelectedBrand(queryBrand);
      let g = queryGender;
      if (!g && queryCategory) {
        const catLower = queryCategory.toLowerCase();
        if (catLower.includes('nam')) g = 'Nam';
        else if (catLower.includes('nữ')) g = 'Nữ';
      }
      setSelectedGender(g);
      setSearchKeyword(querySearch);
    } else if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('luxora_products_saved_filters');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.category) setSelectedCategory(parsed.category);
          if (parsed.brand) setSelectedBrand(parsed.brand);
          if (parsed.gender) setSelectedGender(parsed.gender);
          if (parsed.search) setSearchKeyword(parsed.search);
          if (parsed.volume) setSelectedVolume(parsed.volume);
        }
      } catch (e) {}
    }
  }, [queryCategory, queryBrand, queryGender, querySearch]);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('luxora_products_saved_filters', JSON.stringify({
          category: selectedCategory,
          brand: selectedBrand,
          gender: selectedGender,
          search: searchKeyword,
          volume: selectedVolume
        }));
      } catch (e) {}
    }
  }, [selectedCategory, selectedBrand, selectedGender, searchKeyword, selectedVolume]);

  // Dynamic filter options from store data
  const brands = storeBrands;
  const genders = ['Nam', 'Nữ', 'Unisex'];
  const volumes = useMemo(() => Array.from(new Set(products.flatMap(p => p.availableVolumes || [p.volume]).filter(Boolean))).sort(), [products]);
  const origins = useMemo(() => Array.from(new Set(products.map(p => p.origin).filter(Boolean))).sort(), [products]);
  const concentrations = useMemo(() => Array.from(new Set(products.map(p => p.concentration).filter(Boolean))).sort(), [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      if (isWishlistOnly && !wishlist.includes(p._id)) return false;
      const kw = searchKeyword.trim().toLowerCase();
      if (kw && !(p.name || '').toLowerCase().includes(kw) && !(p.brand || '').toLowerCase().includes(kw) && !(p.category || '').toLowerCase().includes(kw)) return false;
      
      if (selectedCategory) {
        const pCat = (p.category || '').toLowerCase();
        const selCat = selectedCategory.toLowerCase();
        if (selCat === 'nước hoa nam' || selCat.includes('nam')) {
          if (pCat !== selCat && !(p.gender === 'Nam' && pCat.includes('nước hoa'))) return false;
        } else if (selCat === 'nước hoa nữ' || selCat.includes('nữ')) {
          if (pCat !== selCat && !(p.gender === 'Nữ' && pCat.includes('nước hoa'))) return false;
        } else if (pCat !== selCat) {
          return false;
        }
      }

      if (selectedBrand && (p.brand || '') !== selectedBrand) return false;
      if (selectedGender && (p.gender || '') !== selectedGender && (p.gender || '') !== 'Unisex') return false;
      if (selectedVolume && (p.volume || '') !== selectedVolume && !p.availableVolumes?.includes(selectedVolume)) return false;
      if (selectedOrigin && (p.origin || '') !== selectedOrigin) return false;
      if (selectedConcentration && (p.concentration || '') !== selectedConcentration) return false;
      if ((p.price || 0) < minPrice || (p.price || 0) > maxPrice) return false;
      if ((p.rating || 0) < minRating) return false;
      return true;
    });
  }, [
    products, wishlist, isWishlistOnly, querySearch, searchKeyword,
    selectedCategory, selectedBrand, selectedGender, selectedVolume,
    selectedOrigin, selectedConcentration, minPrice, maxPrice, minRating
  ]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [
    isWishlistOnly, querySearch, searchKeyword,
    selectedCategory, selectedBrand, selectedGender, selectedVolume,
    selectedOrigin, selectedConcentration, minPrice, maxPrice, minRating
  ]);

  const totalPages = Math.ceil(filteredProducts.length / PAGE_SIZE);
  const pagedProducts = filteredProducts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const resetFilters = () => {
    setSearchKeyword('');
    setSelectedCategory('');
    setSelectedBrand('');
    setSelectedGender('');
    setSelectedVolume('');
    setSelectedOrigin('');
    setSelectedConcentration('');
    setMinPrice(0);
    setMaxPrice(Infinity);
    setMinRating(0);
    setCurrentPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-zinc-200">
        <div>
          <h1 className="text-2xl font-bold font-serif-luxury text-zinc-900">
            {isWishlistOnly ? 'Danh sách sản phẩm yêu thích' : 'Bộ sưu tập sản phẩm Luxora'}
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Hiển thị <span className="font-bold text-pink-600">{filteredProducts.length}</span> sản phẩm phù hợp
          </p>
        </div>

        {(selectedCategory || selectedBrand || selectedGender || selectedVolume || selectedOrigin || selectedConcentration || searchKeyword || minPrice > 0 || maxPrice < Infinity || minRating > 0) && (
          <button
            onClick={resetFilters}
            className="text-xs text-rose-600 hover:bg-rose-50 px-3 py-1.5 rounded-full border border-rose-200 font-medium flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Xóa tất cả bộ lọc
          </button>
        )}
      </div>

      {/* Main Grid: Sidebar Filters & Product Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Filter Sidebar */}
        <aside className="bg-white rounded-3xl border border-zinc-100 p-5 space-y-6 shadow-sm h-fit">
          <div className="flex items-center gap-2 text-sm font-bold text-zinc-900 pb-3 border-b border-zinc-100">
            <SlidersHorizontal className="w-4 h-4 text-pink-600" />
            <span>Bộ lọc sản phẩm</span>
          </div>

          {/* Tất cả sản phẩm button */}
          <button
            onClick={resetFilters}
            className={`w-full text-left text-xs px-3 py-2.5 rounded-xl font-bold transition-colors flex items-center gap-2 ${
              !selectedCategory && !selectedBrand && !selectedGender && !selectedVolume && !selectedOrigin && !selectedConcentration && !searchKeyword && minPrice === 0 && maxPrice === Infinity && minRating === 0
                ? 'bg-pink-600 text-white shadow-md shadow-pink-500/20'
                : 'bg-zinc-50 text-zinc-700 hover:bg-zinc-100'
            }`}
          >
            <span className="text-base">🛍️</span> Tất cả sản phẩm
            <span className="ml-auto text-[10px] font-normal opacity-70">{products.length}</span>
          </button>

          {/* Search keyword input */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Từ khóa</h3>
            <div className="relative">
              <input
                type="text"
                placeholder="Nhập tên sản phẩm..."
                value={searchKeyword}
                onChange={e => setSearchKeyword(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-8 py-2 text-xs focus:outline-none focus:border-pink-500 focus:bg-white"
              />
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-2.5" />
              {searchKeyword && (
                <button
                  onClick={() => setSearchKeyword('')}
                  className="absolute right-2.5 top-2.5 text-zinc-400 hover:text-rose-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Khoảng giá (Nằm ngay dưới Từ khóa) */}
          <div className="space-y-2 pt-3 border-t border-zinc-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Khoảng giá</h3>
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: 'Dưới 500k', min: 0, max: 500000 },
                { label: '500k – 1tr', min: 500000, max: 1000000 },
                { label: '1tr – 2tr', min: 1000000, max: 2000000 },
                { label: '2tr – 5tr', min: 2000000, max: 5000000 },
                { label: 'Trên 5tr', min: 5000000, max: 50000000 },
              ].map((range, idx) => {
                const isActive = minPrice === range.min && maxPrice === range.max;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      if (isActive) {
                        setMinPrice(0);
                        setMaxPrice(Infinity);
                      } else {
                        setMinPrice(range.min);
                        setMaxPrice(range.max);
                      }
                    }}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                      isActive
                        ? 'border-pink-600 bg-pink-50 text-pink-600 font-bold'
                        : 'border-zinc-200 text-zinc-600 hover:border-zinc-300'
                    }`}
                  >
                    {range.label}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                placeholder="Từ"
                value={minPrice > 0 ? minPrice.toLocaleString('vi-VN') : ''}
                onChange={e => {
                  const val = Number(e.target.value.replace(/\D/g, ''));
                  setMinPrice(isNaN(val) ? 0 : val);
                }}
                className="w-full min-w-0 flex-1 bg-zinc-50 border border-zinc-200 rounded-lg px-2 py-1.5 text-xs text-center focus:outline-none focus:border-pink-500"
              />
              <span className="text-zinc-400 text-xs flex-shrink-0">–</span>
              <input
                type="text"
                placeholder="Đến"
                value={maxPrice < Infinity ? maxPrice.toLocaleString('vi-VN') : ''}
                onChange={e => {
                  const val = Number(e.target.value.replace(/\D/g, ''));
                  setMaxPrice(isNaN(val) || val === 0 ? Infinity : val);
                }}
                className="w-full min-w-0 flex-1 bg-zinc-50 border border-zinc-200 rounded-lg px-2 py-1.5 text-xs text-center focus:outline-none focus:border-pink-500"
              />
            </div>
          </div>

          {/* Đánh giá theo sao (Star Rating) */}
          <div className="space-y-2 pt-3 border-t border-zinc-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Đánh giá theo sao</h3>
            <div className="space-y-1">
              {[
                { label: 'Tất cả đánh giá', rating: 0 },
                { label: '5 Sao (Tuyệt vời)', rating: 5 },
                { label: 'Từ 4 Sao trở lên', rating: 4 },
                { label: 'Từ 3 Sao trở lên', rating: 3 }
              ].map(item => {
                const isActive = minRating === item.rating;
                return (
                  <button
                    key={item.rating}
                    onClick={() => setMinRating(isActive ? 0 : item.rating)}
                    className={`w-full text-left text-xs px-2.5 py-1.5 rounded-xl transition-colors flex items-center justify-between ${
                      isActive
                        ? 'bg-amber-50 text-amber-800 font-bold border border-amber-200 shadow-2xs'
                        : 'text-zinc-700 hover:bg-zinc-50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      {item.rating > 0 ? (
                        <div className="flex items-center text-amber-400">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < item.rating ? 'fill-amber-400 text-amber-400' : 'fill-zinc-200 text-zinc-200'
                              }`}
                            />
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs">⭐</span>
                      )}
                      <span>{item.label}</span>
                    </div>
                    {isActive && item.rating > 0 && (
                      <span className="text-[10px] font-extrabold text-amber-600 bg-white px-2 py-0.5 rounded-full border border-amber-200">
                        Đang chọn
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 1. Danh mục */}
          <div className="space-y-2 pt-3 border-t border-zinc-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Danh mục</h3>
            <div className="space-y-1">
              {storeCategories.map((cat) => {
                const active = selectedCategory.toLowerCase().trim() === cat.name.toLowerCase().trim();
                return (
                  <button
                    key={cat._id}
                    onClick={() => setSelectedCategory(active ? '' : cat.name)}
                    className={`w-full text-left text-xs px-3 py-2 rounded-xl transition-colors flex items-center justify-between ${
                      active
                        ? 'bg-pink-50 text-pink-600 font-bold border border-pink-200 shadow-2xs'
                        : 'text-zinc-700 hover:bg-zinc-50'
                    }`}
                  >
                    <span>{cat.name}</span>
                    {active && <X className="w-3.5 h-3.5 text-pink-600" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Thương hiệu */}
          <div className="space-y-2 pt-3 border-t border-zinc-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Thương hiệu</h3>
            <div className="flex flex-wrap gap-1.5">
              {brands.map((b, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedBrand(selectedBrand === b ? '' : b)}
                  className={`text-xs px-3 py-1 rounded-xl border transition-all ${
                    selectedBrand === b
                      ? 'border-pink-600 bg-pink-50 text-pink-600 font-bold'
                      : 'border-zinc-200 text-zinc-600 hover:border-zinc-300'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Giới tính */}
          <div className="space-y-2 pt-3 border-t border-zinc-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Giới tính</h3>
            <div className="flex gap-2">
              {genders.map((g, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedGender(selectedGender === g ? '' : g)}
                  className={`flex-1 text-xs py-1.5 rounded-xl border text-center font-medium transition-all ${
                    selectedGender === g
                      ? 'border-pink-600 bg-pink-600 text-white font-bold'
                      : 'border-zinc-200 text-zinc-700 hover:border-zinc-300'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Dung tích */}
          <div className="space-y-2 pt-3 border-t border-zinc-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Dung tích</h3>
            <div className="flex flex-wrap gap-1.5">
              {volumes.map((v, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedVolume(selectedVolume === v ? '' : v)}
                  className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                    selectedVolume === v
                      ? 'border-pink-600 bg-pink-50 text-pink-600 font-bold'
                      : 'border-zinc-200 text-zinc-600'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* 5. Nồng độ hương */}
          <div className="space-y-2 pt-3 border-t border-zinc-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Nồng độ hương</h3>
            <div className="flex flex-wrap gap-1.5">
              {concentrations.map((c, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedConcentration(selectedConcentration === c ? '' : c)}
                  className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                    selectedConcentration === c
                      ? 'border-pink-600 bg-pink-50 text-pink-600 font-bold'
                      : 'border-zinc-200 text-zinc-600'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Right Product Grid */}
        <main className="lg:col-span-3 space-y-6">
          {pagedProducts.length === 0 ? (
            <div className="bg-white rounded-3xl border border-zinc-100 p-12 text-center space-y-3">
              <p className="text-sm font-bold text-zinc-800">Không tìm thấy sản phẩm nào</p>
              <p className="text-xs text-zinc-400">Hãy thử thay đổi hoặc xóa bớt tiêu chí bộ lọc</p>
              <button
                onClick={resetFilters}
                className="bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold px-5 py-2.5 rounded-full transition-all shadow-sm"
              >
                Xóa tất cả bộ lọc
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {pagedProducts.map(prod => (
                  <ProductCard key={prod._id} product={prod} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="w-9 h-9 flex items-center justify-center rounded-full border border-zinc-200 text-zinc-600 hover:border-pink-500 hover:text-pink-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-9 h-9 flex items-center justify-center rounded-full text-xs font-bold transition-all ${
                        page === currentPage
                          ? 'bg-pink-600 text-white shadow-md shadow-pink-500/20'
                          : 'border border-zinc-200 text-zinc-600 hover:border-pink-500 hover:text-pink-600'
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="w-9 h-9 flex items-center justify-center rounded-full border border-zinc-200 text-zinc-600 hover:border-pink-500 hover:text-pink-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              <p className="text-center text-[11px] text-zinc-400">
                Trang {currentPage}/{totalPages} &mdash; Hiển thị {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filteredProducts.length)} / {filteredProducts.length} sản phẩm
              </p>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <React.Suspense fallback={<div className="text-center py-12 text-xs text-zinc-500">Đang tải sản phẩm...</div>}>
      <ProductsContent />
    </React.Suspense>
  );
}
